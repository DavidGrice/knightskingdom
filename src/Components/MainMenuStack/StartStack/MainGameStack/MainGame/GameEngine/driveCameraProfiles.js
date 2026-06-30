/**
 * Per-model drive camera profiles.
 *
 * Different GLB champs can have different baked orientations. Do not assume
 * Object3D.getWorldDirection() (-Z) or mesh local ±X is horizontal forward.
 * Example: archer_with_box2 bakes a quaternion where -Z points mostly up (+Y).
 * For that asset, horizontal facing is chest_front bbox center minus
 * chest_back bbox center, flattened to the XZ plane.
 *
 * Camera anchors use mesh bounding-box centers in world space, so drive views
 * follow the champ wherever it is placed — not relative to scene 0,0,0.
 *
 * When adding a new driveable model:
 * 1. Add a profile here (or reuse ARCHER if the rig matches).
 * 2. Set gltf.scene.userData.driveCameraProfileId on load (ModelLoader does this).
 * 3. Tune offsets after in-game verification.
 */

export const DRIVE_CAMERA_PROFILES = {
  ARCHER: {
    id: 'ARCHER',
    label: 'Archer minifig (archer_with_box2.glb)',
    notes:
      'Face forward = normalize(chest_front center - chest_back center) on XZ. Not local ±X or -Z.',
    facing: {
      strategy: 'meshCenterPair',
      fromMesh: 'chest_back',
      toMesh: 'chest_front',
      flattenY: true,
    },
    anchors: {
      headFront: 'head_front',
      headBack: 'head_back',
      chestFront: 'chest_front',
      chestBack: 'chest_back',
      thirdPersonLookAt: 'head_front',
    },
    offsets: {
      thirdPersonDistance: 4.5,
      thirdPersonDistanceSign: -1,
      thirdPersonHeight: 0.1,
      firstLookAhead: 14,
      eyeForwardOffset: 0.2,
      lookAtHeightBoost: 0,
      levelFirstPersonPitch: true,
    },
  },

  /** Fallback for models without a dedicated profile yet. */
  DEFAULT: {
    id: 'DEFAULT',
    label: 'Generic drive target',
    notes: 'Uses champ root -Z flattened to XZ. Replace with a tuned profile when adding new models.',
    facing: {
      strategy: 'rootWorldDirection',
      flattenY: true,
      negate: false,
    },
    anchors: {
      headFront: 'head_front',
      headBack: 'head_back',
      thirdPersonLookAt: 'head_front',
    },
    offsets: {
      thirdPersonDistance: 6,
      thirdPersonHeight: 0.3,
      firstLookAhead: 12,
      eyeHeightLift: 0.3,
      lookAtHeightBoost: 0.2,
      levelFirstPersonPitch: true,
    },
  },
};

const PROFILE_ALIASES = {
  Archer: 'ARCHER',
  ARCHER: 'ARCHER',
};

/**
 * Resolve a drive camera profile from model metadata on load.
 * @param {string | undefined} modelKey - e.g. 'ARCHER' from bucket/add
 * @param {string | undefined} modelName - e.g. 'Archer' from map preload
 */
export const resolveDriveCameraProfile = (modelKey, modelName) => {
  const alias = PROFILE_ALIASES[modelKey] ?? PROFILE_ALIASES[modelName];
  if (alias && DRIVE_CAMERA_PROFILES[alias]) {
    return DRIVE_CAMERA_PROFILES[alias];
  }
  return DRIVE_CAMERA_PROFILES.DEFAULT;
};

export const getDriveCameraProfile = (profileId) => (
  DRIVE_CAMERA_PROFILES[profileId] ?? DRIVE_CAMERA_PROFILES.DEFAULT
);