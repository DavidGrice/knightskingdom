import * as THREE from 'three';

const vector3ToPlain = (v) => ({ x: v.x, y: v.y, z: v.z });

const eulerToPlain = (e) => ({ x: e.x, y: e.y, z: e.z });

const PLAYABLE_MODEL_IDS = new Set(['ARCHER']);

export const isPlayableModelEntry = (entry) => PLAYABLE_MODEL_IDS.has(entry?.modelId);

export const applyCameraFromState = (camera, cameraState) => {
  if (!camera || !cameraState?.position) {
    return;
  }

  camera.position.set(cameraState.position.x, cameraState.position.y, cameraState.position.z);
  if (cameraState.rotation) {
    camera.rotation.set(cameraState.rotation.x, cameraState.rotation.y, cameraState.rotation.z);
  }
  if (typeof cameraState.zoom === 'number') {
    camera.zoom = cameraState.zoom;
    camera.updateProjectionMatrix();
  }
};

const applyColorToModel = (root, colorHex) => {
  if (!colorHex || !root) {
    return;
  }

  root.userData.color = colorHex;
  const color = new THREE.Color(parseInt(colorHex, 16));
  root.traverse((child) => {
    if (child.isMesh && child.isPaintable && child.material?.color) {
      child.material.color.set(color);
    }
  });
};

export const applySavedSceneToThree = (scene, camera, savedScene, { restorePlayable } = {}) => {
  if (!savedScene) {
    return;
  }

  applyCameraFromState(camera, savedScene.camera);

  const mapModelUpdates = [];
  const playableEntries = [];

  (savedScene.models || []).forEach((entry) => {
    if (isPlayableModelEntry(entry)) {
      playableEntries.push(entry);
      return;
    }
    mapModelUpdates.push(entry);
  });

  mapModelUpdates.forEach((entry) => {
    const target = scene.children.find(
      (child) =>
        child.isModel &&
        (child.name === entry.modelId || child.userData?.modelId === entry.modelId),
    );

    if (!target) {
      return;
    }

    if (entry.position) {
      target.position.set(entry.position.x, entry.position.y, entry.position.z);
    }
    if (entry.rotation) {
      target.rotation.set(entry.rotation.x, entry.rotation.y, entry.rotation.z);
    }
    applyColorToModel(target, entry.color);
  });

  playableEntries.forEach((entry) => {
    restorePlayable?.(entry);
  });
};

export const createEmptySceneState = (climate = 'SUNNY') => ({
  models: [],
  camera: {
    position: { x: 0, y: 5, z: 10 },
    rotation: { x: 0, y: 0, z: 0 },
    zoom: 1,
  },
  climate,
});

export const serializeSceneFromThree = (scene, camera, climate) => {
  const models = [];

  scene.children.forEach((child) => {
    if (!child.isModel && !child.userData?.isPlayableModel) {
      return;
    }

    models.push({
      id: child.uuid,
      modelId: child.userData?.modelId || child.name || 'unknown',
      position: vector3ToPlain(child.position),
      rotation: eulerToPlain(child.rotation),
      color: child.userData?.color || null,
    });
  });

  return {
    models,
    camera: {
      position: vector3ToPlain(camera.position),
      rotation: eulerToPlain(camera.rotation),
      zoom: camera.zoom,
    },
    climate: climate || 'SUNNY',
  };
};

export const createSnapshotEntry = (imageDataUrl, scene) => ({
  id: Date.now(),
  imageDataUrl,
  scene,
  createdAt: new Date().toISOString(),
});