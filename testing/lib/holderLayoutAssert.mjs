/**
 * Canvas-normalized measurements for holder panels, Richard help, and footer trays.
 * Mirrors authLayoutAssert — viewport px → 800×600 canvas via --msl-scale.
 */

import fs from 'fs';
import path from 'path';

const MENU_CANVAS_W = 800;

/** @param {import('puppeteer').Page} page */
export const readCanvasScale = async (page) => page.evaluate(() => {
  const scaler = document.querySelector('[data-testid="menu-scaler"]');
  if (!scaler) {
    return null;
  }
  const raw = getComputedStyle(scaler).getPropertyValue('--msl-scale').trim();
  return raw ? Number(raw) : 1;
});

/**
 * Measure panel shell (MenuPanelShell or World panel) in canvas coordinates.
 * @param {import('puppeteer').Page} page
 */
export const measureHolderPanel = async (page) => page.evaluate(() => {
  const stage = document.querySelector('[data-testid="menu-stage"]');
  const scaler = document.querySelector('[data-testid="menu-scaler"]');
  const panel = document.querySelector('[data-testid="menu-panel-shell"]')
    ?? document.querySelector('[data-testid="world-panel-shell"]');
  const holder = document.querySelector('[data-testid="menu-panel-holder"]')
    ?? panel;

  const scaleRaw = scaler
    ? getComputedStyle(scaler).getPropertyValue('--msl-scale').trim()
    : '1';
  const scale = Number(scaleRaw) || 1;
  const stageR = stage?.getBoundingClientRect();
  const panelR = panel?.getBoundingClientRect();
  const holderR = holder?.getBoundingClientRect();

  if (!stageR || !panelR) {
    return { scale, panel: null, holder: null, layoutScale: null };
  }

  const stageStyle = getComputedStyle(stage);
  const singleScale = stageStyle.getPropertyValue('--single-header-layout-scale').trim();
  const startScale = stageStyle.getPropertyValue('--start-world-layout-scale').trim();

  const toCanvas = (r) => ({
    x: (r.x - stageR.x) / scale,
    y: (r.y - stageR.y) / scale,
    w: r.width / scale,
    h: r.height / scale,
    cx: (r.x + r.width / 2 - stageR.x) / scale,
    cy: (r.y + r.height / 2 - stageR.y) / scale,
  });

  return {
    scale,
    layoutScale: Number(singleScale || startScale) || null,
    holderCenter: {
      x: parseFloat(stageStyle.getPropertyValue('--msl-holder-cx')) || null,
      y: parseFloat(stageStyle.getPropertyValue('--msl-holder-cy')) || null,
    },
    panel: toCanvas(panelR),
    holder: holderR ? toCanvas(holderR) : null,
  };
});

/** @param {import('puppeteer').Page} page */
export const measureHolderAnchors = async (page) => page.evaluate(() => {
  const stage = document.querySelector('[data-testid="menu-stage"]');
  const gridRoot = document.querySelector('[class*="HolderGridLayout_gridRoot"]');
  const scaler = document.querySelector('[data-testid="menu-scaler"]');
  const scale = Number(getComputedStyle(scaler).getPropertyValue('--msl-scale').trim()) || 1;
  const stageR = stage?.getBoundingClientRect();
  const gridR = gridRoot?.getBoundingClientRect();

  if (!stageR || !gridR) {
    return { scale, help: null, footer: null, grid: null };
  }

  const gridOffset = {
    x: (gridR.x - stageR.x) / scale,
    y: (gridR.y - stageR.y) / scale,
  };

  const helpEl = document.querySelector('[class*="helpComponentHolder"]');
  const footerEl = document.querySelector('[class*="lowerContent"]');
  const helpR = helpEl?.getBoundingClientRect();
  const footerR = footerEl?.getBoundingClientRect();

  const toCanvasPoint = (r) => ({
    cx: (r.x + r.width / 2 - stageR.x) / scale,
    cy: (r.y + r.height / 2 - stageR.y) / scale,
  });

  const toCanvasRect = (r) => ({
    x: (r.x - stageR.x) / scale,
    y: (r.y - stageR.y) / scale,
    w: r.width / scale,
    h: r.height / scale,
    cx: (r.x + r.width / 2 - stageR.x) / scale,
    cy: (r.y + r.height / 2 - stageR.y) / scale,
  });

  return {
    scale,
    grid: {
      x: gridOffset.x,
      y: gridOffset.y,
      w: gridR.width / scale,
      h: gridR.height / scale,
    },
    help: helpR ? toCanvasPoint(helpR) : null,
    footer: footerR ? toCanvasRect(footerR) : null,
  };
});

/**
 * @param {ReturnType<import('../src/Components/Common/MenuStageLayout/singleHeaderLayoutMath.js').buildSingleHeaderLayoutContract>} contract
 * @param {Awaited<ReturnType<typeof measureHolderPanel>>} measured
 */
export const assertSingleHeaderPanelContract = (contract, measured, opts = {}) => {
  const tol = opts.tolerance ?? 18;
  const errors = [];

  if (!measured.panel) {
    errors.push('Panel shell not found');
    return errors;
  }

  if (measured.layoutScale != null && Math.abs(measured.layoutScale - contract.layoutScale) > 0.02) {
    errors.push(
      `layoutScale: got ${measured.layoutScale}, want ${contract.layoutScale}`,
    );
  }

  const { scaledPanel, holderCenter } = contract;
  if (Math.abs(measured.panel.cx - holderCenter.x) > tol) {
    errors.push(`Panel center X: ${measured.panel.cx.toFixed(1)} (want ${holderCenter.x})`);
  }
  if (Math.abs(measured.panel.cy - holderCenter.y) > tol) {
    errors.push(`Panel center Y: ${measured.panel.cy.toFixed(1)} (want ${holderCenter.y})`);
  }
  if (Math.abs(measured.panel.w - scaledPanel.width) > tol) {
    errors.push(`Panel width: ${measured.panel.w.toFixed(1)} (want ${scaledPanel.width})`);
  }
  if (scaledPanel.height != null && Math.abs(measured.panel.h - scaledPanel.height) > tol) {
    errors.push(`Panel height: ${measured.panel.h.toFixed(1)} (want ${scaledPanel.height})`);
  }

  return errors;
};

/**
 * @param {ReturnType<import('../src/Components/Common/MenuStageLayout/startLayoutMath.js').buildStartLayoutContract>} contract
 * @param {Awaited<ReturnType<typeof measureHolderPanel>>} measured
 */
export const assertStartWorldPanelContract = (contract, measured, opts = {}) => {
  const tol = opts.tolerance ?? 22;
  const errors = [];

  if (!measured.panel) {
    errors.push('World panel shell not found');
    return errors;
  }

  if (measured.layoutScale != null && Math.abs(measured.layoutScale - contract.layoutScale) > 0.02) {
    errors.push(
      `start layoutScale: got ${measured.layoutScale}, want ${contract.layoutScale}`,
    );
  }

  const { scaledPanel, holderCenter } = contract;
  if (Math.abs(measured.panel.cx - holderCenter.x) > tol) {
    errors.push(`World panel center X: ${measured.panel.cx.toFixed(1)} (want ${holderCenter.x})`);
  }
  if (Math.abs(measured.panel.cy - holderCenter.y) > tol) {
    errors.push(`World panel center Y: ${measured.panel.cy.toFixed(1)} (want ${holderCenter.y})`);
  }
  if (Math.abs(measured.panel.w - scaledPanel.width) > tol) {
    errors.push(`World panel width: ${measured.panel.w.toFixed(1)} (want ${scaledPanel.width})`);
  }
  if (Math.abs(measured.panel.h - scaledPanel.totalHeight) > tol) {
    errors.push(
      `World panel height: ${measured.panel.h.toFixed(1)} (want ${scaledPanel.totalHeight})`,
    );
  }

  return errors;
};

/**
 * Assert help + footer anchors against holderGridMetrics variant (native holder px).
 * @param {import('../../src/Components/Common/HolderGridLayout/holderGridMetrics.js').HolderVariant} variant
 * @param {Awaited<ReturnType<typeof measureHolderAnchors>>} measured
 * @param {number} layoutScale — display scale applied to panel (0.72 for single-header / start)
 */
export const assertHolderAnchorContract = (variant, measured, layoutScale = 1, opts = {}) => {
  const tol = opts.tolerance ?? 20;
  const errors = [];

  if (!measured.grid) {
    errors.push('Holder grid root not found');
    return errors;
  }

  const panelOffset = measured.grid;
  const scale = layoutScale;

  if (variant.help && measured.help) {
    const expectedCx = panelOffset.x + variant.help.x * scale;
    const expectedCy = panelOffset.y + variant.help.y * scale;
    if (Math.abs(measured.help.cx - expectedCx) > tol) {
      errors.push(`Help X: ${measured.help.cx.toFixed(1)} (want ~${expectedCx.toFixed(1)})`);
    }
    if (Math.abs(measured.help.cy - expectedCy) > tol) {
      errors.push(`Help Y: ${measured.help.cy.toFixed(1)} (want ~${expectedCy.toFixed(1)})`);
    }
  }

  if (variant.footer && measured.footer) {
    const f = variant.footer;
    const expectedX = panelOffset.x + f.left * scale;
    const expectedW = f.width * scale;
    const expectedH = f.height * scale;

    if (Math.abs(measured.footer.x - expectedX) > tol) {
      errors.push(`Footer left: ${measured.footer.x.toFixed(1)} (want ~${expectedX.toFixed(1)})`);
    }
    if (Math.abs(measured.footer.w - expectedW) > tol) {
      errors.push(`Footer width: ${measured.footer.w.toFixed(1)} (want ~${expectedW.toFixed(1)})`);
    }
    if (Math.abs(measured.footer.h - expectedH) > tol) {
      errors.push(`Footer height: ${measured.footer.h.toFixed(1)} (want ~${expectedH.toFixed(1)})`);
    }

    if ('top' in f) {
      const expectedY = panelOffset.y + f.top * scale;
      if (Math.abs(measured.footer.y - expectedY) > tol) {
        errors.push(`Footer top: ${measured.footer.y.toFixed(1)} (want ~${expectedY.toFixed(1)})`);
      }
    } else if ('bottom' in f) {
      const gridBottom = panelOffset.y + variant.bodyHeight * scale;
      const expectedY = gridBottom - f.bottom * scale - expectedH;
      if (Math.abs(measured.footer.y - expectedY) > tol) {
        errors.push(`Footer top (from bottom): ${measured.footer.y.toFixed(1)} (want ~${expectedY.toFixed(1)})`);
      }
    }
  }

  return errors;
};

/** @param {object} payload */
export const writeHolderLayoutArtifact = (payload, filename) => {
  const outDir = path.join(process.cwd(), 'testing', 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, filename);
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  return file;
};

export const filterConsoleErrors = (errors) => (
  errors.filter((e) => !e.includes('favicon.ico'))
);