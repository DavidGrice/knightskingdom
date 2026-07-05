/**
 * Scale-invariant assertions for authentication layout.
 * All measurements normalize viewport pixels → 800×600 canvas space via scale.
 */

import fs from 'fs';
import path from 'path';

const MENU_CANVAS_W = 800;
const MENU_CANVAS_H = 600;

/** Mirror of menuScaleModes.computeMenuScale for Node tests (no bundler aliases). */
export const computeExpectedMenuScale = (viewportWidth, viewportHeight) => {
  const margin = 16;
  const scale = Math.min(
    (viewportWidth - margin * 2) / MENU_CANVAS_W,
    (viewportHeight - margin * 2) / MENU_CANVAS_H,
  );
  return Math.max(0.5, Math.min(scale, 2));
};

/** @param {number} screenPx @param {number} scale */
export const toCanvasPx = (screenPx, scale) => screenPx / scale;

/**
 * Measure auth layout in canvas coordinates.
 * @param {import('puppeteer').Page} page
 */
export const measureAuthLayout = async (page) => {
  return page.evaluate(() => {
    const stage = document.querySelector('[data-testid="menu-stage"]');
    const scaler = document.querySelector('[data-testid="menu-scaler"]');
    const rows = [...document.querySelectorAll('[data-testid="profile-row"]')];
    const stageR = stage?.getBoundingClientRect();
    const scaleRaw = scaler
      ? getComputedStyle(scaler).getPropertyValue('--msl-scale').trim()
      : '1';
    const scale = Number(scaleRaw) || 1;

    if (!stageR) {
      return { scale, rows: [], corners: null, typography: null };
    }

    const rowData = rows.map((row) => {
      const r = row.getBoundingClientRect();
      const sprite = row.querySelector('img.profileSprite, img[class*="profileSprite"]')
        ?? row.querySelector('img');
      const nameEl = row.querySelector('input') ?? row.querySelector('[class*="profileDiv"]');
      const sr = sprite?.getBoundingClientRect();
      const nr = nameEl?.getBoundingClientRect();
      const nameStyle = nameEl ? getComputedStyle(nameEl) : null;
      return {
        canvas: {
          x: (r.x - stageR.x) / scale,
          y: (r.y - stageR.y) / scale,
          w: r.width / scale,
          h: r.height / scale,
        },
        name: nameEl
          ? {
            text: nameEl.value ?? nameEl.textContent ?? '',
            canvasX: (nr.x - r.x) / scale,
            fontSize: parseFloat(nameStyle?.fontSize ?? '0'),
            scrollWidth: nameEl.scrollWidth,
            clientWidth: nameEl.clientWidth,
            maxLength: nameEl.maxLength > 0 ? nameEl.maxLength : null,
            tag: nameEl.tagName.toLowerCase(),
          }
          : null,
      };
    });

    const checkImg = document.querySelector('[data-testid="menu-corner-checkmark"] img');
    const trashImg = document.querySelector('[data-testid="menu-corner-trash"] img');
    const c = checkImg?.getBoundingClientRect();
    const t = trashImg?.getBoundingClientRect();

    const corners = c && t
      ? {
        checkCenterX: (c.x + c.width / 2 - stageR.x) / scale,
        trashCenterX: (t.x + t.width / 2 - stageR.x) / scale,
        checkSize: c.width / scale,
        trashSize: t.width / scale,
        stageWidth: stageR.width / scale,
      }
      : null;

    const inputEl = document.querySelector('[data-testid="profile-row"] input');
    const labelEl = document.querySelector('[class*="profileDiv"]');
    const inputStyle = inputEl ? getComputedStyle(inputEl) : null;
    const labelStyle = labelEl ? getComputedStyle(labelEl) : null;

    return {
      scale,
      scaleMode: document.querySelector('[data-testid="menu-root"]')?.getAttribute('data-scale-mode'),
      rows: rowData,
      corners,
      typography: inputStyle && labelStyle
        ? {
          inputFontSize: parseFloat(inputStyle.fontSize),
          labelFontSize: parseFloat(labelStyle.fontSize),
        }
        : null,
    };
  });
};

/**
 * @param {ReturnType<typeof buildAuthLayoutContract>} contract
 * @param {Awaited<ReturnType<typeof measureAuthLayout>>} measured
 * @param {object} [opts]
 */
export const assertAuthLayoutContract = (contract, measured, opts = {}) => {
  const tol = opts.tolerance ?? 12;
  const gapTol = opts.gapTolerance ?? 3;
  const errors = [];

  if (measured.scaleMode !== contract.scaleMode) {
    errors.push(`scaleMode: got "${measured.scaleMode}", want "${contract.scaleMode}"`);
  }

  if (measured.rows.length < 1) {
    errors.push('No profile rows found');
    return errors;
  }

  const { profileList: pl, corners: c, nameField: nf, canvas } = contract;

  for (const row of measured.rows) {
    if (Math.abs(row.canvas.w - pl.rowWidth) > tol) {
      errors.push(`Row width drift: ${row.canvas.w.toFixed(1)} (want ${pl.rowWidth})`);
    }
    if (Math.abs(row.canvas.h - pl.rowHeight) > tol) {
      errors.push(`Row height drift: ${row.canvas.h.toFixed(1)} (want ${pl.rowHeight})`);
    }
  }

  const first = measured.rows[0];
  const expectedLeft = (canvas.width - pl.rowWidth) / 2;
  if (Math.abs(first.canvas.x - expectedLeft) > tol) {
    errors.push(`List left drift: ${first.canvas.x.toFixed(1)} (want ~${expectedLeft})`);
  }
  const listCenter = first.canvas.x + pl.rowWidth / 2;
  if (Math.abs(listCenter - canvas.width / 2) > tol) {
    errors.push(`List center drift: ${listCenter.toFixed(1)} (want ${canvas.width / 2})`);
  }

  if (measured.rows.length >= 2) {
    const gap = measured.rows[1].canvas.y - measured.rows[0].canvas.y - pl.rowHeight;
    if (Math.abs(gap - pl.gap) > gapTol) {
      errors.push(`Row gap drift: ${gap.toFixed(1)} (want ${pl.gap})`);
    }
  }

  const last = measured.rows[measured.rows.length - 1];
  const lastBottom = last.canvas.y + last.canvas.h;
  const trashZoneTop = canvas.height - contract.safeZone.bottom;
  if (lastBottom > trashZoneTop + tol) {
    errors.push(`Stack overlaps trash zone: bottom=${lastBottom.toFixed(0)} (max ~${trashZoneTop})`);
  }

  if (measured.corners) {
    const { checkCenterX, trashCenterX, checkSize, trashSize, stageWidth } = measured.corners;
    if (Math.abs(checkCenterX - c.checkmark.x) > tol) {
      errors.push(`Checkmark X drift: ${checkCenterX.toFixed(0)} (want ${c.checkmark.x})`);
    }
    const rightInset = stageWidth - trashCenterX;
    if (Math.abs(checkCenterX - c.insetX) > tol) {
      errors.push(`Checkmark inset drift: ${checkCenterX.toFixed(0)} (want ${c.insetX})`);
    }
    if (Math.abs(rightInset - c.insetX) > tol) {
      errors.push(`Trash inset drift: ${rightInset.toFixed(0)} (want ${c.insetX})`);
    }
    if (Math.abs(checkSize - trashSize) > 2) {
      errors.push(`Corner button size mismatch: ${checkSize.toFixed(0)} vs ${trashSize.toFixed(0)}`);
    }
  }

  const inputRow = measured.rows.find((r) => r.name?.tag === 'input');
  const labelRow = measured.rows.find((r) => r.name?.tag !== 'input' && r.name?.text);
  if (inputRow?.name && labelRow?.name) {
    if (Math.abs(inputRow.name.fontSize - labelRow.name.fontSize) > 0.5) {
      errors.push(
        `Typography mismatch: input ${inputRow.name.fontSize}px vs label ${labelRow.name.fontSize}px`,
      );
    }
    if (Math.abs(inputRow.name.fontSize - nf.fontSize) > 0.5) {
      errors.push(`Input font drift: ${inputRow.name.fontSize}px (want ${nf.fontSize})`);
    }
    if (inputRow.name.maxLength !== nf.maxLength) {
      errors.push(`maxLength: ${inputRow.name.maxLength} (want ${nf.maxLength})`);
    }
  }

  return errors;
};

/** @param {object} payload */
export const writeAuthLayoutArtifact = (payload, filename = 'auth-layout-contract.json') => {
  const outDir = path.join(process.cwd(), 'testing', 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, filename);
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  return file;
};