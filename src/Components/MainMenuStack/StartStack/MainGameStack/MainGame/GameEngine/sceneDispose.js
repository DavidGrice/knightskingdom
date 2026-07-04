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

const disposeMaterialKeepTextures = (material) => {
  if (!material) {
    return;
  }
  if (Array.isArray(material)) {
    material.forEach(disposeMaterialKeepTextures);
    return;
  }
  material.dispose?.();
};

/**
 * Dispose a single deleted model instance without harming its siblings.
 * OBJ/MTL instances (objMtlLoader) share geometry and textures with the
 * cached template and every other clone of the same model -- disposing
 * those would break/hitch the siblings -- but own their material objects
 * (per-instance clones), which are safe to dispose. Anything else (GLB
 * loads own everything) gets the full dispose.
 * @param {import('three').Object3D | null | undefined} root
 */
export const disposeModelInstance = (root) => {
  if (!root) {
    return;
  }

  if (!root.userData?.sharedGeometry) {
    disposeObject3D(root);
    return;
  }

  root.traverse?.((child) => {
    // Selection-box helpers are created per instance -- always dispose.
    if (child.name === 'transparentBox' || child.name === 'wireframe') {
      child.geometry?.dispose?.();
      disposeMaterial(child.material);
      return;
    }
    if (root.userData?.ownsMaterials) {
      disposeMaterialKeepTextures(child.material);
    }
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