/**
 * Logical 800×600 layout + optional 2× assets in public/auth-hd/ (gitignored locally).
 * Browser uses 1x webpack import when 2x is missing (404 → falls back to src).
 */

export const AUTH_HD_BASE = '/auth-hd';

/** @param {string | { src?: string }} mod — webpack static import */
export const assetUrl = (mod) => {
  if (!mod) {
    return '';
  }
  if (typeof mod === 'string') {
    return mod;
  }
  return mod.src ?? String(mod);
};

/**
 * @param {string | { src?: string }} x1
 * @param {string} [hdPath] — e.g. `/auth-hd/page_2.png`
 */
export const hiDpiImgProps = (x1, hdPath) => {
  const src = assetUrl(x1);
  if (!hdPath) {
    return { src };
  }
  return {
    src,
    srcSet: `${src} 1x, ${hdPath} 2x`,
  };
};

/**
 * CSS background with optional 2× from public/auth-hd/
 * @param {string | { src?: string }} x1
 * @param {string} [hdFile] — e.g. `background.png`
 */
export const hiDpiBackgroundImage = (x1, hdFile) => {
  const u1 = assetUrl(x1);
  if (!hdFile) {
    return `url(${u1})`;
  }
  const u2 = `${AUTH_HD_BASE}/${hdFile}`;
  return `image-set(url("${u1}") 1x, url("${u2}") 2x)`;
};