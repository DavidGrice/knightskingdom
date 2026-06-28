import holderStyles from './HolderGridLayout.module.css';
import { HOLDER_VARIANTS } from './holderGridMetrics';

const resolveVariant = (variantOrKey) => (
  typeof variantOrKey === 'string' ? HOLDER_VARIANTS[variantOrKey] : variantOrKey
);

/** @param {import('./holderGridMetrics').HolderVariant} variant */
export const variantToLayoutVars = (variant) => ({
  '--hgl-body-w': `${variant.bodyWidth}px`,
  '--hgl-body-h': `${variant.bodyHeight}px`,
  '--hgl-grid-left': `${variant.gridLeft}px`,
  '--hgl-grid-top': `${variant.gridTop}px`,
  '--hgl-cell-w': `${variant.width}px`,
  '--hgl-cell-h': `${variant.height}px`,
  '--hgl-gap-x': `${variant.x}px`,
  '--hgl-gap-y': `${variant.y}px`,
  '--hgl-up-x': `${variant.upArrow.x}px`,
  '--hgl-up-y': `${variant.upArrow.y}px`,
  '--hgl-down-x': `${variant.downArrow.x}px`,
  '--hgl-down-y': `${variant.downArrow.y}px`,
  '--hgl-help-x': `${variant.help.x}px`,
  '--hgl-help-y': `${variant.help.y}px`,
});

/**
 * Build PaginatedGrid style map from a holder layout variant.
 * @param {import('./holderGridMetrics').HolderVariant | keyof typeof HOLDER_VARIANTS} variantOrKey
 * @param {Record<string, string>} [overrides] - optional extra classes keyed by PaginatedGrid slot
 */
export const createHolderGridStyles = (variantOrKey, overrides = {}) => {
  const variant = resolveVariant(variantOrKey);

  const base = {
    gridRoot: holderStyles.gridRoot,
    upArrowHolder: holderStyles.upArrowHolder,
    upArrow: holderStyles.upArrow,
    body: holderStyles.body,
    item: holderStyles.item,
    highlightedImage: holderStyles.highlightedImage,
    downArrowHolder: holderStyles.downArrowHolder,
    downArrow: holderStyles.downArrow,
    helpComponentHolder: holderStyles.helpComponentHolder,
    lowerContent: holderStyles.lowerContent,
    iconComponentHolder: holderStyles.iconComponentHolder,
    rootLayoutStyle: variantToLayoutVars(variant),
    variant,
  };

  return Object.entries(overrides).reduce((acc, [key, className]) => {
    if (className) {
      acc[key] = `${acc[key] || holderStyles[key] || ''} ${className}`.trim();
    }
    return acc;
  }, { ...base });
};

export const footerPositionStyle = (variantOrKey) => {
  const { footer } = resolveVariant(variantOrKey);
  if (!footer) {
    return undefined;
  }
  if ('top' in footer) {
    return {
      left: `${footer.left}px`,
      top: `${footer.top}px`,
      width: `${footer.width}px`,
      height: `${footer.height}px`,
      gap: `${footer.gap}px`,
    };
  }
  return {
    left: `${footer.left}px`,
    bottom: `${footer.bottom}px`,
    width: `${footer.width}px`,
    height: `${footer.height}px`,
    gap: `${footer.gap}px`,
  };
};

export default createHolderGridStyles;