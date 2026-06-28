const vector3ToPlain = (v) => ({ x: v.x, y: v.y, z: v.z });

const eulerToPlain = (e) => ({ x: e.x, y: e.y, z: e.z });

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