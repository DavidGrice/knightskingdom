/**
 * The game's authentic paint palette, recovered from the extracted global
 * runtime palette (public/models/textures/creator2000.pal -- the same
 * table the exporter's LITCOLS "glit" materials index; read at
 * find('PALT')+16 exactly like resources/model_files/tools/
 * export_textured.py, verified 40/40 against the warehouse MTLs' Kd
 * values).
 *
 * Palette entries 16..83 are seventeen 4-shade ramps (bright -> dark),
 * one per LEGO colour. The paint UI's 14 splats map 1:1 onto 14 ramps
 * (rose/pink/lavender are minifig-only). Shades[2] is the tone the
 * exported warehouse models overwhelmingly carry (e.g. red glit022
 * #B80000 x55, black glit038 #101010 x80), so painting with it makes a
 * painted model match the unpainted library models pixel-for-pixel.
 *
 * Regenerate/verify: scratchpad script palette_analysis2.py from the
 * 2026-07-04 session, or re-derive from creator2000.pal as described
 * above.
 */

// ramp: [brightest, bright, standard(model tone), dark] -- glit indices base..base+3
export const PAINT_RAMPS = {
  yellow: { base: 16, shades: ['FFD428', 'FECE0B', 'EAC000', 'CAA100'] },
  red: { base: 20, shades: ['F80000', 'D80000', 'B80000', '980000'] },
  blue: { base: 24, shades: ['001ED8', '0019B8', '00169E', '00117E'] },
  darkGreen: { base: 28, shades: ['20A015', '108614', '006C13', '006110'] },
  white: { base: 32, shades: ['FFFFFF', 'E0E0E0', 'D0D0D0', 'C0C0C0'] },
  black: { base: 36, shades: ['303030', '202020', '101010', '000000'] },
  gray: { base: 40, shades: ['9F9F9F', '8F8F8F', '807F7F', '6F6F6F'] },
  silver: { base: 44, shades: ['6F695C', '5B5548', '474134', '332D20'] },
  green: { base: 48, shades: ['00B879', '009864', '007650', '005839'] },
  beige: { base: 60, shades: ['E3D777', 'DDC763', 'D6B74F', 'CFA73A'] },
  gold: { base: 64, shades: ['E4FD3A', 'E3F801', 'CFFB01', 'B7D801'] },
  brown: { base: 72, shades: ['975F29', '7A4D22', '5C3B1B', '3E2913'] },
  orange: { base: 76, shades: ['F89B00', 'F88C00', 'F87D00', 'F86D00'] },
  purple: { base: 80, shades: ['C645B2', 'B33CA0', '9F338E', '8B2A7C'] },
};

const MODEL_TONE = 2;

/** name -> hex actually applied when painting (no leading #). */
export const PAINT_COLORS = Object.fromEntries(
  Object.entries(PAINT_RAMPS).map(([name, ramp]) => [name, ramp.shades[MODEL_TONE]]),
);

/**
 * The workshop colour-mixer's 8 pastel splats have no counterpart in the
 * LITCOLS ramp block; these are sampled from the splats' own original UI
 * art (dominant mid-tone), so what you click is what you get. Lower
 * provenance than PAINT_COLORS -- refine if their palette indices are
 * ever identified.
 */
export const WORKSHOP_PASTELS = {
  lightWhite: 'A08261',
  lightGreen: '6C772A',
  lightYellow: 'C4962C',
  lightMajGreen: '22C022',
  lightBlue: '6A9EAC',
  lightPurple: '74608F',
  lightRed: 'C84927',
  lightBrown: 'CE7B27',
};
