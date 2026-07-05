import * as THREE from 'three';

/**
 * Per-piece paint targeting.
 *
 * Painting colors only the single mesh the user clicked (an arm, a helmet, one
 * brick), not the whole model. To persist that across save/reload we need a
 * STABLE key per mesh: the model is rebuilt from the same asset, so the mesh
 * graph -- and therefore a traversal index over the paintable meshes -- is
 * identical every load. That index is the key. `paintedMeshes` is an
 * `{ [index]: colorHex }` map stored on the root's userData.
 *
 * Selection helpers (the invisible `transparentBox` hitbox and its
 * `wireframe`) are excluded here no matter how their flags are set, so paint
 * can never tint the white selection box.
 */

const isSelectionHelper = (obj) => obj.name === 'transparentBox' || obj.name === 'wireframe';

const isPaintableMesh = (obj) => obj.isMesh && obj.isPaintable && !isSelectionHelper(obj);

const setMeshColor = (mesh, color) => {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  mats.forEach((m) => {
    if (m?.color) {
      m.color.set(color);
    }
  });
};

/** Visit each paintable mesh of a model root in stable order, with its index. */
export const forEachPaintableMesh = (root, cb) => {
  let index = 0;
  root.traverse((child) => {
    if (isPaintableMesh(child)) {
      cb(child, index);
      index += 1;
    }
  });
};

/** Is this object a paintable mesh (not a selection helper)? */
export const isPaintTarget = (obj) => Boolean(obj) && isPaintableMesh(obj);

/** Stable index of `target` among a root's paintable meshes (-1 if absent). */
export const paintableMeshIndex = (root, target) => {
  let result = -1;
  forEachPaintableMesh(root, (mesh, index) => {
    if (mesh === target) {
      result = index;
    }
  });
  return result;
};

/** Paint one mesh (handles single- and multi-material meshes). */
export const paintMesh = (mesh, colorHex) => {
  setMeshColor(mesh, new THREE.Color(parseInt(colorHex, 16)));
};

/** Re-apply a saved `{ index: colorHex }` map to a freshly loaded model. */
export const applyPaintedMeshes = (root, paintedMeshes) => {
  if (!paintedMeshes || !root) {
    return;
  }
  forEachPaintableMesh(root, (mesh, index) => {
    const hex = paintedMeshes[index];
    if (hex) {
      setMeshColor(mesh, new THREE.Color(parseInt(hex, 16)));
    }
  });
};
