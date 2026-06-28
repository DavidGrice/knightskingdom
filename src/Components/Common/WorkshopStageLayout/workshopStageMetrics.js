/**
 * Pixel anchors on the 800×600 workshop canvas (background.png).
 * All floating panels and toolbar slots are measured from the top-left of this stage.
 *
 * @typedef {{ x: number, y: number, width: number, height: number }} Rect
 */

export const WORKSHOP_CANVAS = { width: 800, height: 600 };

export const WORKSHOP_STAGE_METRICS = {
  canvas: WORKSHOP_CANVAS,
  topBar: { height: 103 },
  bottomBar: { height: 126 },
  /** Toolbar slots on overlay_top (783×103 stretched to 800px) */
  toolbar: {
    bucketButton: { x: 35, y: 5, width: 45, height: 63 },
    saveButton: { x: 130, y: 13, width: 56, height: 58 },
    middleTools: { x: 366, y: 19, width: 310, height: 65 },
    leaveButton: { x: 691, y: 5, width: 91, height: 72 },
  },
  /** Drop-down panels anchored to the stage (not viewport %) */
  bucketPanel: { x: 35, y: 103, width: 238, height: 556 },
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
  const { bucketPanel, palettePanel, canvas, topBar, bottomBar } = WORKSHOP_STAGE_METRICS;

  return {
    '--wsl-canvas-w': `${canvas.width}px`,
    '--wsl-canvas-h': `${canvas.height}px`,
    '--wsl-top-bar-h': `${topBar.height}px`,
    '--wsl-bottom-bar-h': `${bottomBar.height}px`,
    '--wsl-bucket-x': `${bucketPanel.x}px`,
    '--wsl-bucket-y': `${bucketPanel.y}px`,
    '--wsl-bucket-w': `${bucketPanel.width}px`,
    '--wsl-bucket-h': `${bucketPanel.height}px`,
    '--wsl-palette-x': `${palettePanel.x}px`,
    '--wsl-palette-y': `${palettePanel.y}px`,
    '--wsl-palette-w': `${palettePanel.width}px`,
    '--wsl-palette-h': `${palettePanel.height}px`,
  };
};