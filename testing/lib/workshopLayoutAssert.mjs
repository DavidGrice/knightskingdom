/**
 * Layout assertions for WorkshopStageLayout — 800×600 canvas + 800px toolbar anchor.
 */
import fs from 'fs';
import path from 'path';

export const WORKSHOP_CANVAS_SIZE = { width: 800, height: 600 };

/** Mirror useWorkshopCanvasScale — letterbox scale without margin. */
export const computeExpectedWorkshopScale = (viewportWidth, viewportHeight) => Math.min(
  viewportWidth / WORKSHOP_CANVAS_SIZE.width,
  viewportHeight / WORKSHOP_CANVAS_SIZE.height,
);

/** @param {import('puppeteer').Page} page */
export const readWorkshopScale = async (page) => page.evaluate(() => {
  const scaler = document.querySelector('[data-testid="workshop-scaler"]');
  if (!scaler) {
    return null;
  }
  const raw = getComputedStyle(scaler).getPropertyValue('--wsl-scale').trim();
  return raw ? Number(raw) : 1;
});

/** @param {import('puppeteer').Page} page */
export const assertWorkshopChromePresent = async (page) => {
  const root = await page.$('[data-testid="workshop-root"]');
  const scaler = await page.$('[data-testid="workshop-scaler"]');
  const top = await page.$('[data-testid="game-shell-top"][data-mode="workshop"]');
  const bottom = await page.$('[data-testid="game-shell-bottom"][data-mode="workshop"]');
  const toolbar = await page.$('[data-testid="workshop-toolbar-top"]');

  if (!root || !scaler || !top || !bottom || !toolbar) {
    throw new Error('Workshop chrome incomplete (root/scaler/toolbars)');
  }

  const scale = await readWorkshopScale(page);
  if (!scale || scale <= 0) {
    throw new Error(`Invalid --wsl-scale: ${scale}`);
  }

  const viewport = page.viewport();
  const expectedScale = computeExpectedWorkshopScale(viewport.width, viewport.height);
  if (Math.abs(scale - expectedScale) > 0.02) {
    throw new Error(
      `--wsl-scale ${scale.toFixed(3)} != expected ${expectedScale.toFixed(3)}`,
    );
  }

  return { scale };
};

/**
 * Measure toolbar + panels against WORKSHOP_STAGE_METRICS coordinate spaces.
 * @param {import('puppeteer').Page} page
 */
export const measureWorkshopLayout = async (page) => page.evaluate(() => {
  const toLocal = (el, origin) => {
    const r = el.getBoundingClientRect();
    const o = origin.getBoundingClientRect();
    return {
      x: r.x - o.x,
      y: r.y - o.y,
      w: r.width,
      h: r.height,
      cx: r.x + r.width / 2 - o.x,
      cy: r.y + r.height / 2 - o.y,
    };
  };

  const top = document.querySelector('[data-testid="game-shell-top"]');
  const scaler = document.querySelector('[data-testid="workshop-scaler"]');
  const bucket = document.querySelector('[data-testid="workshop-bucket-panel"]');
  const palette = document.querySelector('[data-testid="workshop-palette-panel"]');
  const bucketBtn = document.querySelector('[data-testid="workshop-toolbar-bucket"]');
  const saveBtn = document.querySelector('[data-testid="workshop-toolbar-save"]');

  const scale = Number(getComputedStyle(scaler).getPropertyValue('--wsl-scale').trim()) || 1;
  const scalerR = scaler?.getBoundingClientRect();

  const toCanvas = (el) => {
    if (!el || !scalerR) {
      return null;
    }
    const r = el.getBoundingClientRect();
    return {
      x: (r.x - scalerR.x) / scale,
      y: (r.y - scalerR.y) / scale,
      w: r.width / scale,
      h: r.height / scale,
    };
  };

  const bucketLayer = document.querySelector('[data-testid="workshop-bucket-layer"]');
  const bucketOrigin = bucketLayer || top;

  return {
    scale,
    toolbar: {
      bucket: top && bucketBtn ? toLocal(bucketBtn, top) : null,
      save: top && saveBtn ? toLocal(saveBtn, top) : null,
      barHeight: top?.getBoundingClientRect().height ?? null,
    },
    bucketPanel: bucket && bucketOrigin ? toLocal(bucket, bucketOrigin) : null,
    palettePanel: toCanvas(palette),
  };
});

/** @param {object} metrics @param {object} measured @param {{ tolerance?: number }} [opts] */
export const assertWorkshopLayoutContract = (metrics, measured, opts = {}) => {
  const tol = opts.tolerance ?? 6;
  const errors = [];

  const expectedVal = (expected, key) => {
    if (key === 'w') {
      return expected?.w ?? expected?.width;
    }
    if (key === 'h') {
      return expected?.h ?? expected?.height;
    }
    return expected?.[key];
  };

  const near = (label, actual, expected, keys) => {
    for (const key of keys) {
      const exp = expectedVal(expected, key);
      if (actual?.[key] == null || exp == null) {
        errors.push(`${label}: missing ${key}`);
        continue;
      }
      if (Math.abs(actual[key] - exp) > tol) {
        errors.push(
          `${label}.${key}: got ${actual[key].toFixed(1)}, expected ${exp} (±${tol})`,
        );
      }
    }
  };

  near('toolbar.bucket', measured.toolbar?.bucket, metrics.toolbar.bucketButton, ['x', 'y', 'w', 'h']);
  near('toolbar.save', measured.toolbar?.save, metrics.toolbar.saveButton, ['y', 'w', 'h']);

  if (measured.toolbar?.barHeight != null) {
    if (Math.abs(measured.toolbar.barHeight - metrics.topBar.height) > tol) {
      errors.push(
        `topBar.height: got ${measured.toolbar.barHeight}, expected ${metrics.topBar.height}`,
      );
    }
  }

  if (measured.bucketPanel) {
    near('bucketPanel', measured.bucketPanel, metrics.bucketPanel, ['x', 'y', 'w', 'h']);
  }

  if (measured.palettePanel) {
    near('palettePanel', measured.palettePanel, metrics.palettePanel, ['x', 'y', 'w', 'h']);
  }

  return errors;
};

/** @param {object} payload */
export const writeWorkshopLayoutArtifact = (payload, filename) => {
  const outDir = path.join(process.cwd(), 'testing', 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, filename);
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  return file;
};