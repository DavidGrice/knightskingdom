import holderStyles from './HolderGridLayout.module.css';
import { HOLDER_VARIANTS } from './holderGridMetrics';

const resolveVariant = (variantOrKey) => (
  typeof variantOrKey === 'string' ? HOLDER_VARIANTS[variantOrKey] : variantOrKey
);

/**
 * Build PaginatedGrid style map from a holder layout variant.
 * @param {import('./holderGridMetrics').HolderVariant | keyof typeof HOLDER_VARIANTS} variantOrKey
 * @param {Record<string, string>} [overrides] - optional extra classes keyed by PaginatedGrid slot
 */
export const createHolderGridStyles = (variantOrKey, overrides = {}) => {
  const variant = resolveVariant(variantOrKey);
  const variantClass = holderStyles[variant.className];

  const base = {
    gridRoot: `${holderStyles.gridRoot} ${variantClass}`.trim(),
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