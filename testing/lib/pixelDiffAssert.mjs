/**
 * PNG pixel diff for menu visual baselines — uses sharp (already in the Next.js tree).
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const MENU_BASELINE_DIR = path.join(
  process.cwd(),
  'testing',
  'menu',
  'baselines',
  'desktop-1280',
);

export const VISUAL_DIFF_DIR = path.join(process.cwd(), 'testing', 'output', 'visual-diffs');

const CHANNEL_THRESHOLD = 6;

/** @param {string} filePath */
export const readPngRaw = async (filePath) => {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
};

/**
 * @param {string} actualPath
 * @param {string} baselinePath
 * @param {{ maxDiffRatio?: number, maxDiffPixels?: number, channelThreshold?: number }} [opts]
 */
export const comparePngFiles = async (actualPath, baselinePath, opts = {}) => {
  const maxDiffRatio = opts.maxDiffRatio ?? 0.01;
  const maxDiffPixels = opts.maxDiffPixels ?? 400;
  const channelThreshold = opts.channelThreshold ?? CHANNEL_THRESHOLD;

  if (!fs.existsSync(baselinePath)) {
    return {
      pass: false,
      reason: 'missing-baseline',
      diffPixels: Infinity,
      totalPixels: 0,
      ratio: 1,
    };
  }

  const actual = await readPngRaw(actualPath);
  const baseline = await readPngRaw(baselinePath);

  if (actual.width !== baseline.width || actual.height !== baseline.height) {
    return {
      pass: false,
      reason: 'size-mismatch',
      diffPixels: Infinity,
      totalPixels: actual.width * actual.height,
      ratio: 1,
      actualSize: `${actual.width}x${actual.height}`,
      baselineSize: `${baseline.width}x${baseline.height}`,
    };
  }

  let diffPixels = 0;
  const diffData = Buffer.alloc(actual.data.length);
  const { data: a, width, height } = actual;
  const b = baseline.data;

  for (let i = 0; i < a.length; i += 4) {
    const dr = Math.abs(a[i] - b[i]);
    const dg = Math.abs(a[i + 1] - b[i + 1]);
    const db = Math.abs(a[i + 2] - b[i + 2]);
    const da = Math.abs(a[i + 3] - b[i + 3]);
    const changed = dr > channelThreshold
      || dg > channelThreshold
      || db > channelThreshold
      || da > channelThreshold;

    if (changed) {
      diffPixels += 1;
      diffData[i] = 255;
      diffData[i + 1] = 0;
      diffData[i + 2] = 0;
      diffData[i + 3] = 255;
    } else {
      diffData[i] = b[i];
      diffData[i + 1] = b[i + 1];
      diffData[i + 2] = b[i + 2];
      diffData[i + 3] = b[i + 3];
    }
  }

  const totalPixels = width * height;
  const ratio = diffPixels / totalPixels;
  const pass = diffPixels <= maxDiffPixels || ratio <= maxDiffRatio;

  return {
    pass,
    diffPixels,
    totalPixels,
    ratio,
    diffData,
    width,
    height,
  };
};

/** @param {object} result */
export const writeDiffImage = async (result, outPath) => {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(result.diffData, {
    raw: { width: result.width, height: result.height, channels: 4 },
  }).png().toFile(outPath);
};

/**
 * Compare actual capture to baseline; optionally refresh baseline.
 * @param {{ label: string, actualPath: string, baselinePath: string, updateBaselines?: boolean }} cfg
 */
export const assertVisualBaseline = async (cfg) => {
  const { label, actualPath, baselinePath, updateBaselines = false } = cfg;

  if (updateBaselines) {
    fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
    fs.copyFileSync(actualPath, baselinePath);
    return { label, updated: true };
  }

  const result = await comparePngFiles(actualPath, baselinePath);
  if (result.pass) {
    return { label, diffPixels: result.diffPixels, ratio: result.ratio };
  }

  const diffPath = path.join(VISUAL_DIFF_DIR, `${label}-diff.png`);
  if (result.diffData) {
    await writeDiffImage(result, diffPath);
  }

  const detail = result.reason === 'missing-baseline'
    ? 'baseline missing — run TEST_UPDATE_BASELINES=1'
    : result.reason === 'size-mismatch'
      ? `size ${result.actualSize} vs baseline ${result.baselineSize}`
      : `${result.diffPixels}/${result.totalPixels} px (${(result.ratio * 100).toFixed(2)}%)`;

  throw new Error(`${label}: visual diff failed — ${detail} (diff: ${diffPath})`);
};