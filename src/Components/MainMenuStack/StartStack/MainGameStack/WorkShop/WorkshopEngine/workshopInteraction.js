const SKIP_PICK_NAMES = new Set(['wireframe', 'transparentBox']);
const SKIP_SCENE_NAMES = new Set(['BuildPlate', 'ExportBounds', 'GridHelper']);

const isGridHit = (object) => {
  let node = object;
  while (node) {
    if (node.type === 'GridHelper' || node.name === 'GridHelper') {
      return true;
    }
    node = node.parent;
  }
  return false;
};

/**
 * Resolve a raycast hit to the brick root (via selection box or mesh).
 * @param {THREE.Object3D | null | undefined} object
 */
export const resolveBrickFromHit = (object) => {
  let node = object;
  while (node) {
    if (node.name === 'wireframe' && node.parent?.parent?.isBrick) {
      return node.parent.parent;
    }
    if (node.name === 'transparentBox' && node.parent?.isBrick) {
      return node.parent;
    }
    if (node.isBrick) {
      return node;
    }
    node = node.parent;
  }
  return null;
};

/**
 * @param {Array<{ object: THREE.Object3D }>} intersects
 */
export const findBrickFromIntersects = (intersects = []) => {
  for (const intersect of intersects) {
    if (SKIP_SCENE_NAMES.has(intersect.object?.name) || isGridHit(intersect.object)) {
      continue;
    }
    const brick = resolveBrickFromHit(intersect.object);
    if (brick) {
      return brick;
    }
  }
  return null;
};

/**
 * Paint hits skip invisible hitboxes; prefer visible brick meshes.
 * @param {Array<{ object: THREE.Object3D }>} intersects
 */
export const findPaintBrickFromIntersects = (intersects = []) => {
  const filtered = intersects.filter(
    (intersect) => !SKIP_PICK_NAMES.has(intersect.object?.name),
  );
  return findBrickFromIntersects(filtered.length ? filtered : intersects);
};

export const setBrickWireframeVisible = (brick, visible) => {
  const box = brick?.userData?.transparentBox;
  const wireframe = box?.getObjectByName('wireframe');
  if (wireframe) {
    wireframe.visible = visible;
  }
};