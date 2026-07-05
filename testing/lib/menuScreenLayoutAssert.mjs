/**
 * Layout contract assertions for MAIN_MENU, OPTIONS, and CREDITS screens.
 * Measurements normalize viewport pixels → 800×600 canvas via --msl-scale.
 */

import fs from 'fs';
import path from 'path';

const CANVAS_W = 800;
const CANVAS_H = 600;

/** @param {import('puppeteer').Page} page */
const readStageContext = async (page) => page.evaluate(() => {
  const stage = document.querySelector('[data-testid="menu-stage"]');
  const scaler = document.querySelector('[data-testid="menu-scaler"]');
  const scale = Number(getComputedStyle(scaler).getPropertyValue('--msl-scale').trim()) || 1;
  const stageR = stage?.getBoundingClientRect();
  return { scale, stageR };
});

const toCanvasRect = (stageR, scale, r) => ({
  x: (r.x - stageR.x) / scale,
  y: (r.y - stageR.y) / scale,
  w: r.width / scale,
  h: r.height / scale,
  cx: (r.x + r.width / 2 - stageR.x) / scale,
  cy: (r.y + r.height / 2 - stageR.y) / scale,
});

/** @param {import('puppeteer').Page} page */
export const measureMainMenuButtons = async (page) => {
  const { scale, stageR } = await readStageContext(page);
  if (!stageR) {
    return { scale, buttons: [] };
  }

  const buttons = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('[class*="menuButton"] img')];
    return nodes.map((img) => {
      const r = img.getBoundingClientRect();
      return { alt: img.getAttribute('alt') || '', x: r.x, y: r.y, w: r.width, h: r.height };
    });
  });

  return {
    scale,
    buttons: buttons.map((b) => ({
      alt: b.alt,
      ...toCanvasRect(stageR, scale, { x: b.x, y: b.y, width: b.w, height: b.h }),
    })),
  };
};

/** @param {import('puppeteer').Page} page */
export const measureOptionsLayout = async (page) => {
  const { scale, stageR } = await readStageContext(page);
  if (!stageR) {
    return { scale, rows: [], help: null, corner: null };
  }

  const data = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('[class*="optionRow"]')].map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });
    const corner = document.querySelector('[data-testid="menu-corner-trash"]');
    const help = document.querySelector('[class*="optionsHelpBin"]')
      ?? document.querySelector('[class*="helpComponent"]');
    const cornerR = corner?.getBoundingClientRect();
    const helpR = help?.getBoundingClientRect();
    return { rows, cornerR, helpR };
  });

  return {
    scale,
    rows: data.rows.map((r) => toCanvasRect(stageR, scale, {
      x: r.x, y: r.y, width: r.w, height: r.h,
    })),
    corner: data.cornerR
      ? toCanvasRect(stageR, scale, data.cornerR)
      : null,
    help: data.helpR
      ? toCanvasRect(stageR, scale, data.helpR)
      : null,
  };
};

/** @param {import('puppeteer').Page} page */
export const measureCreditsLayout = async (page) => {
  const { scale, stageR } = await readStageContext(page);
  if (!stageR) {
    return { scale, panel: null, tracks: 0, scrollDuration: null };
  }

  const data = await page.evaluate(() => {
    const panel = document.querySelector('[data-testid="credits-scroll-panel"]');
    const scroll = panel?.querySelector('[class*="textScroll"]');
    const tracks = panel
      ? panel.querySelectorAll('[data-credits-track], [class*="textScrollTrack"]').length
      : 0;
    const panelR = panel?.getBoundingClientRect();
    const duration = scroll
      ? getComputedStyle(scroll).getPropertyValue('--credits-scroll-duration').trim()
      : '';
    const title = document.querySelector('[class*="creditsTitle"]');
    const titleR = title?.getBoundingClientRect();
    return { panelR, tracks, duration, titleR };
  });

  return {
    scale,
    panel: data.panelR
      ? toCanvasRect(stageR, scale, data.panelR)
      : null,
    tracks: data.tracks,
    scrollDuration: data.duration || null,
    title: data.titleR
      ? toCanvasRect(stageR, scale, data.titleR)
      : null,
  };
};

/**
 * @param {typeof import('../../src/Components/Common/MenuStageLayout/menuStageMetrics.js').MENU_SCREEN_METRICS.MAIN_MENU} metrics
 */
export const assertMainMenuContract = (metrics, measured, opts = {}) => {
  const tol = opts.tolerance ?? 24;
  const gapTol = opts.gapTolerance ?? 6;
  const errors = [];
  const { buttonStack } = metrics;

  const expectedAlts = ['Start', 'Change Player', 'Options', 'Credits', 'Quit'];
  if (measured.buttons.length !== expectedAlts.length) {
    errors.push(`Expected ${expectedAlts.length} menu buttons, got ${measured.buttons.length}`);
    return errors;
  }

  for (const alt of expectedAlts) {
    if (!measured.buttons.some((b) => b.alt === alt)) {
      errors.push(`Missing menu button: ${alt}`);
    }
  }

  for (const btn of measured.buttons) {
    if (Math.abs(btn.cx - buttonStack.centerX) > tol) {
      errors.push(`${btn.alt} center X: ${btn.cx.toFixed(1)} (want ${buttonStack.centerX})`);
    }
  }

  const sorted = [...measured.buttons].sort((a, b) => a.y - b.y);
  for (let i = 1; i < sorted.length; i += 1) {
    const gap = sorted[i].y - (sorted[i - 1].y + sorted[i - 1].h);
    if (Math.abs(gap - buttonStack.gap) > gapTol) {
      errors.push(
        `Gap ${sorted[i - 1].alt}→${sorted[i].alt}: ${gap.toFixed(1)}px (want ${buttonStack.gap})`,
      );
    }
  }

  return errors;
};

/**
 * @param {ReturnType<import('../../src/Components/Common/MenuStageLayout/optionsLayoutMath.js').buildOptionsLayoutContract>} contract
 * @param {typeof import('../../src/Components/Common/MenuStageLayout/menuStageMetrics.js').MENU_SCREEN_METRICS.OPTIONS} metrics
 */
export const assertOptionsContract = (contract, metrics, measured, opts = {}) => {
  const tol = opts.tolerance ?? 22;
  const errors = [];
  const { optionStack } = metrics;

  if (measured.rows.length !== optionStack.rowCount) {
    errors.push(`Expected ${optionStack.rowCount} option rows, got ${measured.rows.length}`);
  }

  for (const row of measured.rows) {
    if (Math.abs(row.cx - optionStack.centerX) > tol) {
      errors.push(`Option row center X: ${row.cx.toFixed(1)} (want ${optionStack.centerX})`);
      break;
    }
  }

  if (measured.rows.length >= 2) {
    const sorted = [...measured.rows].sort((a, b) => a.y - b.y);
    const gap = sorted[1].y - (sorted[0].y + sorted[0].h);
    if (Math.abs(gap - optionStack.gap) > 8) {
      errors.push(`Option row gap: ${gap.toFixed(1)} (want ${optionStack.gap})`);
    }
  }

  if (!measured.corner) {
    errors.push('Options Richard corner slot (menu-corner-trash) not found');
  } else {
    const expectedCenterY = CANVAS_H - contract.corner.bottom - (measured.corner.h / 2);
    if (Math.abs(measured.corner.cy - expectedCenterY) > tol) {
      errors.push(
        `Help corner Y: ${measured.corner.cy.toFixed(1)} (want ~${expectedCenterY.toFixed(1)})`,
      );
    }
    if (Math.abs(measured.corner.cx - contract.corner.x) > tol) {
      errors.push(
        `Help corner X: ${measured.corner.cx.toFixed(1)} (want ${contract.corner.x})`,
      );
    }
  }

  if (measured.help) {
    if (Math.abs(measured.help.w - contract.bin.width) > tol) {
      errors.push(`Help bin width: ${measured.help.w.toFixed(1)} (want ${contract.bin.width})`);
    }
    if (Math.abs(measured.help.h - contract.bin.height) > tol) {
      errors.push(`Help bin height: ${measured.help.h.toFixed(1)} (want ${contract.bin.height})`);
    }
  } else {
    errors.push('Options help bin element not found');
  }

  return errors;
};

/**
 * @param {ReturnType<import('../../src/Components/Common/MenuStageLayout/creditsLayoutMath.js').buildCreditsLayoutContract>} contract
 */
export const assertCreditsContract = (contract, measured, opts = {}) => {
  const tol = opts.tolerance ?? 16;
  const errors = [];
  const { scrollPanel } = contract;

  if (!measured.panel) {
    errors.push('credits-scroll-panel not found');
    return errors;
  }

  if (Math.abs(measured.panel.x - scrollPanel.left) > tol) {
    errors.push(`Scroll panel left: ${measured.panel.x.toFixed(1)} (want ${scrollPanel.left})`);
  }
  if (Math.abs(measured.panel.y - scrollPanel.top) > tol) {
    errors.push(`Scroll panel top: ${measured.panel.y.toFixed(1)} (want ${scrollPanel.top})`);
  }
  if (Math.abs(measured.panel.w - scrollPanel.width) > tol) {
    errors.push(`Scroll panel width: ${measured.panel.w.toFixed(1)} (want ${scrollPanel.width})`);
  }
  if (Math.abs(measured.panel.h - scrollPanel.height) > tol) {
    errors.push(`Scroll panel height: ${measured.panel.h.toFixed(1)} (want ${scrollPanel.height})`);
  }

  if (measured.tracks !== 2) {
    errors.push(`Expected 2 credits scroll tracks, got ${measured.tracks}`);
  }

  if (!measured.scrollDuration || measured.scrollDuration === '34s' || measured.scrollDuration === '36s') {
    errors.push(`Credits scroll duration not synced: "${measured.scrollDuration}"`);
  } else {
    const sec = parseFloat(measured.scrollDuration);
    if (!Number.isFinite(sec) || sec < 18) {
      errors.push(`Credits scroll duration too short: ${measured.scrollDuration}`);
    }
  }

  if (measured.title && measured.panel) {
    const titleMid = measured.title.cy;
    if (titleMid < measured.panel.y || titleMid > measured.panel.y + measured.panel.h) {
      errors.push('Credits title not inside scroll panel');
    }
  }

  return errors;
};

export const writeScreenLayoutArtifact = (payload, filename) => {
  const outDir = path.join(process.cwd(), 'testing', 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, filename);
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  return file;
};