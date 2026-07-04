import { defaultProfileOptions } from '@/services/userService';

/**
 * Resolve a profile's Options-menu selections (services/userService.js
 * defaultProfileOptions schema: brickQuality, renderer, dialogue, music)
 * into concrete engine settings. Until now those four options were saved
 * per profile but consumed by nothing; this is the single translation
 * point, so the Options menu keeps the original game's four switches and
 * each maps to a bundle of modern renderer behaviour:
 *
 *   renderer  hardware -> antialias + device pixel ratio + shadows
 *             software -> the "retro" path: no AA, 1x, no shadows
 *   brickQuality  low  -> also skips the bulk per-part map placements
 *                         (100+ draggable objects per map) and shadows
 *   music/dialogue     -> gate music playback / help-bubble UI
 *
 * Renderer-construction settings (antialias) can't change on a live
 * WebGLRenderer -- rendererKey changes when they do, so hosts can key the
 * engine component off it and remount.
 */
export const resolveGameSettings = (profile) => {
  const options = { ...defaultProfileOptions, ...(profile?.options || {}) };
  const hardware = options.renderer !== 'software';
  const quality = options.brickQuality || 'medium';

  return {
    options,
    antialias: hardware,
    useDevicePixelRatio: hardware,
    shadows: hardware && quality !== 'low',
    fullPlacements: quality !== 'low',
    musicEnabled: options.music !== 'off',
    helpEnabled: options.dialogue !== 'off',
    rendererKey: hardware ? 'hw' : 'sw',
  };
};
