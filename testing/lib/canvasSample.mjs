/**
 * Sample main-game WebGL canvas luminance (requires preserveDrawingBuffer: true).
 * @param {import('puppeteer').Page} page
 */
export const sampleCanvasLuminance = async (page) => page.evaluate(() => {
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    return { error: 'no-canvas' };
  }
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) {
    return { error: 'no-webgl' };
  }

  const w = canvas.width;
  const h = canvas.height;
  const pixels = new Uint8Array(w * h * 4);
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  let sum = 0;
  let dark = 0;
  const total = w * h;
  for (let i = 0; i < pixels.length; i += 4) {
    const lum = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    sum += lum;
    if (lum < 12) {
      dark += 1;
    }
  }

  return {
    width: w,
    height: h,
    avgLum: sum / total,
    darkRatio: dark / total,
  };
});