import soundManifest from './soundManifest.generated.json';

/**
 * Character -> sound-bank mapping, ported from
 * resources/model_files/tools/associate_sounds.py (the authoritative
 * name-convention matcher). Bank ids resolve to public URLs via
 * soundManifest.generated.json (built by
 * resources/model_pipeline/copy_sound_assets.mjs).
 *
 * A spawned character's identity is available at runtime from its three.js
 * root: `root.name` (e.g. "SCL M/F : QL01" -> SCL code QL) or
 * `root.userData.modelId` (e.g. "minifigqueenleonora01" -> "queen").
 */

// Object-name SCL code -> character key (associate_sounds.py SCL_CODES).
const SCL_CODES = {
  KL: 'kingleo', QL: 'queen', PS: 'princess', RS: 'richard',
  CB: 'cedric', W: 'weezil', GB: 'gilbert', JM: 'john',
};

// modelId substring -> character key (for the "minifig<char>NN" ids).
const MODELID_KEYS = [
  ['kingleo', 'kingleo'], ['queenleonora', 'queen'], ['princessstorm', 'princess'],
  ['richardstrong', 'richard'], ['cedricbull', 'cedric'], ['gilbertbad', 'gilbert'],
  ['johnmayne', 'john'], ['weezil', 'weezil'], ['skeleton', 'skeleton'],
];

// character key -> bank ids [Collision, Greeting, Random, (War Cry)].
const CHARACTERS = {
  kingleo: [17, 42, 43],
  queen: [10, 34, 35],
  princess: [46, 47, 48],
  richard: [11, 36, 37, 50],
  cedric: [15, 44, 45, 53],
  weezil: [14, 38, 39],
  gilbert: [16, 40, 41],
  john: [7, 30, 31],
  skeleton: [49],
  boy: [70, 71, 72],
  girl: [73, 74, 75],
};

const MINIFIG_COMMON = [32, 33]; // Step, Fart

const SCL_MF_RE = /SCL M\/F\s*:\s*([A-Z]+)\d*/i;

const characterKey = (root) => {
  const m = SCL_MF_RE.exec(root?.name || '');
  if (m && SCL_CODES[m[1].toUpperCase()]) {
    return SCL_CODES[m[1].toUpperCase()];
  }
  const modelId = (root?.userData?.modelId || '').toLowerCase();
  const hit = MODELID_KEYS.find(([sub]) => modelId.includes(sub));
  if (hit) {
    return hit[1];
  }
  // Any other minifig -> generic minifig (common sounds only).
  return /minifig|scl m\/f/i.test(`${modelId} ${root?.name || ''}`) ? 'minifig' : null;
};

const urlsFor = (ids) => ids.map((id) => soundManifest[id]).filter(Boolean);

/**
 * Ambient sound URLs for a spawned model root -- the character's Greeting +
 * Random voice clips plus the common Step/Fart. Returns [] for non-minifig
 * objects (so the scheduler naturally skips props/terrain). Collision and
 * War Cry are event-driven, excluded from ambient random playback.
 * @param {import('three').Object3D} root
 * @returns {string[]}
 */
export const ambientSoundsForModel = (root) => {
  const key = characterKey(root);
  if (!key) {
    return [];
  }
  if (key === 'minifig') {
    return urlsFor(MINIFIG_COMMON);
  }
  const ids = CHARACTERS[key] || [];
  // Skip Collision (index 0); keep Greeting/Random (1,2) + commons.
  const ambient = ids.slice(1, 3);
  return urlsFor([...ambient, ...MINIFIG_COMMON]);
};
