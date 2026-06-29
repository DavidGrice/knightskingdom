/**
 * Pixel anchors on the 800×600 workshop canvas (background.png).
 * All floating panels and toolbar slots are measured from the top-left of this stage.
 *
 * Measured landmarks (see grok/analyze-workshop-images.mjs):
 *   - background red panel: x≈16, width≈234 (drop_down 238px sits here)
 *   - black viewport: x≈250–800 (3D area; top overlay slot is over this region)
 *   - legacy bucket left 29.15% (=233px) aligned to red panel RIGHT edge — wrong
 *
 * @typedef {{ x: number, y: number, width: number, height: number }} Rect
 */

export const WORKSHOP_CANVAS = { width: 800, height: 600 };

export const WORKSHOP_STAGE_METRICS = {
  canvas: WORKSHOP_CANVAS,
  topBar: { height: 103 },
  bottomBar: { height: 126 },
  /** Legacy offset before 800×600 canvas scaler; keep 0 inside fixed canvas */
  barOffsetX: 0,
  /** Toolbar slots on overlay_top (783×103 stretched to 800px) */
  toolbar: {
    bucketButton: { x: 195, y: 5, width: 45, height: 63 },
    saveButton: { x: 248, y: 13, width: 56, height: 58 },
    saveGap: 8,
    middleTools: { x: 366, y: 19, width: 310, height: 65 },
    leaveButton: { x: 691, y: 5, width: 91, height: 72 },
  },
  /** Brick bucket holder — left column; y pushed down below top bar overlap */
  bucketPanel: { x: 0, y: 44, width: 238, height: 556 },
  /** color_mixer_board 196×196; legacy right 29.2% → x=370 on 800px canvas */
  palettePanel: { x: 370, y: 60, width: 196, height: 196 },
  /** Optional world name plaque on the background art — hidden until positioned */
  worldTitle: { x: 400, y: 88, visible: false },
};

/** @param {Rect} rect */
export const rectToStyle = ({ x, y, width, height }) => ({
  left: `${x}px`,
  top: `${y}px`,
  width: `${width}px`,
  height: `${height}px`,
});

/** CSS custom properties applied on the 800px stage wrapper */
export const workshopStageToCssVars = () => {
  const {
    bucketPanel,
    palettePanel,
    canvas,
    topBar,
    bottomBar,
    barOffsetX,
    toolbar,
  } = WORKSHOP_STAGE_METRICS;

  const saveRight = toolbar.bucketButton.x
    + toolbar.bucketButton.width
    + toolbar.saveGap
    + toolbar.saveButton.width;
  const middleGap = toolbar.middleTools.x - saveRight;

  return {
    '--wsl-canvas-w': `${canvas.width}px`,
    '--wsl-canvas-h': `${canvas.height}px`,
    '--wsl-top-bar-h': `${topBar.height}px`,
    '--wsl-bottom-bar-h': `${bottomBar.height}px`,
    '--wsl-bar-offset-x': `${barOffsetX}px`,
    '--wsl-bucket-x': `${bucketPanel.x}px`,
    '--wsl-bucket-y': `${bucketPanel.y}px`,
    '--wsl-bucket-w': `${bucketPanel.width}px`,
    '--wsl-bucket-h': `${bucketPanel.height}px`,
    '--wsl-palette-x': `${palettePanel.x}px`,
    '--wsl-palette-y': `${palettePanel.y}px`,
    '--wsl-palette-w': `${palettePanel.width}px`,
    '--wsl-palette-h': `${palettePanel.height}px`,
    '--wsl-toolbar-bucket-x': `${toolbar.bucketButton.x}px`,
    '--wsl-toolbar-bucket-y': `${toolbar.bucketButton.y}px`,
    '--wsl-toolbar-save-y': `${toolbar.saveButton.y}px`,
    '--wsl-toolbar-save-gap': `${toolbar.saveGap}px`,
    '--wsl-toolbar-middle-gap': `${middleGap}px`,
  };
};