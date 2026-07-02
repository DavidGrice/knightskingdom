import * as THREE from 'three';

export const disposeMaterial = (material) => {
  if (!material) {
    return;
  }

  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
    return;
  }

  material.dispose?.();

  Object.values(material).forEach((value) => {
    if (value instanceof THREE.Texture) {
      value.dispose();
    }
  });
};

export const disposeObject3D = (object) => {
  if (!object) {
    return;
  }

  object.traverse?.((child) => {
    child.geometry?.dispose?.();
    disposeMaterial(child.material);
  });
};

const PRESERVED_WORLD_ROOT_NAMES = new Set(['SkyBox', 'systemLight', 'SNOW', 'RAIN', 'FOGGY', 'WINDY']);

export const isPreservedWorldRoot = (object) => PRESERVED_WORLD_ROOT_NAMES.has(object.name);

export const removeSceneChildrenExcept = (scene, preservePredicate = isPreservedWorldRoot) => {
  const toRemove = scene.children.filter((child) => !preservePredicate(child));
  toRemove.forEach((child) => {
    scene.remove(child);
    disposeObject3D(child);
  });
};

export const removeSceneObjectByName = (scene, name) => {
  const existing = scene.getObjectByName(name);
  if (!existing) {
    return null;
  }

  scene.remove(existing);
  disposeObject3D(existing);
  return existing;
};