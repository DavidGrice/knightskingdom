/**
 * Per-model drive camera profiles.
 *
 * Different GLB champs can have different baked orientations. Do not assume
 * Object3D.getWorldDirection() (-Z) is horizontal forward — e.g. archer_with_box2
 * bakes a quaternion where -Z points mostly up (+Y). For that asset, horizontal
 * facing comes from chest_front local +X projected onto the XZ plane.
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
      'Baked part quaternion points -Z upward, not forward. Use chest_front +X on XZ plane for facing.',
    facing: {
      strategy: 'meshLocalAxis',
      sourceMesh: 'chest_front',
      fallbackMeshes: ['head_front', 'head_back'],
      localAxis: 'posX',
      flattenY: true,
    },
    anchors: {
      headFront: 'head_front',
      headBack: 'head_back',
    },
    offsets: {
      thirdPersonDistance: 4.5,
      thirdPersonHeight: 0.55,
      firstLookAhead: 12,
      eyeFrontBlend: 0.38,
      lookAtHeightBoost: 0.2,
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
    },
    offsets: {
      thirdPersonDistance: 4.5,
      thirdPersonHeight: 0.5,
      firstLookAhead: 12,
      eyeFrontBlend: 0.35,
      lookAtHeightBoost: 0.2,
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