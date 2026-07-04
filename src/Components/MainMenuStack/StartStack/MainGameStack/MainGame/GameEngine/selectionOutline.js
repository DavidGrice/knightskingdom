/**
 * Selection helpers for the main game's model interactions (move/rotate/
 * paint/delete). Every mode resolves its target through findModelRoot so
 * the behaviour is identical for GLB models (Archer), warehouse OBJ/MTL
 * models, map placements, and grouped custom creations.
 */

const isSelectionHelperName = (name) => name === 'transparentBox' || name === 'wireframe';

/**
 * three.js raycasts IGNORE `visible`, so the hidden selection boxes are
 * still hit -- and a box encloses its whole model (and overlaps neighbours
 * standing close), swallowing rays meant for actual geometry. Modes that
 * target what the user aimed at (paint, add-placement, drag ground hits)
 * must resolve against real mesh hits only. Grab-style modes (move/rotate/
 * delete) deliberately keep box hits as a generous grab target.
 * @param {Array<{ object: import('three').Object3D }>} intersects
 */
export const filterOutSelectionHelpers = (intersects) => intersects.filter(
  (intersect) => !isSelectionHelperName(intersect.object.name),
);

/**
 * Walk up from a raycast hit to the model's root: the node ModelLoader /
 * MapPlacementsLoader / CreationLoader configured (isModel flag, or a
 * creation/model id in userData). Never resolves to the scene.
 * @param {import('three').Object3D | null | undefined} object
 * @returns {import('three').Object3D | null}
 */
export const findModelRoot = (object) => {
  let node = object;
  while (node && !node.isScene) {
    if (node.isModel || node.userData?.creationId || node.userData?.modelId) {
      return node;
    }
    node = node.parent;
  }
  return null;
};

/**
 * First model root among raycast intersects that has the given interaction
 * flag (e.g. 'isMovable', 'isRotatable', 'isDeletable') set on it.
 * @param {Array<{ object: import('three').Object3D }>} intersects
 * @param {string} flag
 */
export const findModelRootFromIntersects = (intersects, flag) => {
  for (const intersect of intersects) {
    const root = findModelRoot(intersect.object);
    if (root && (!flag || root[flag])) {
      return root;
    }
  }
  return null;
};

/** True if `object` is `root` or one of its descendants. */
export const isInSubtree = (object, root) => {
  let node = object;
  while (node) {
    if (node === root) {
      return true;
    }
    node = node.parent;
  }
  return false;
};

/**
 * Show/hide the white selection outline used while moving models in the main game.
 * @param {import('three').Object3D | null | undefined} selectionBox
 */
export const showSelectionOutline = (selectionBox) => {
  if (!selectionBox) {
    return;
  }
  selectionBox.visible = true;
  const wireframe = selectionBox.getObjectByName('wireframe');
  if (wireframe) {
    wireframe.visible = true;
  }
};

/**
 * @param {import('three').Object3D | null | undefined} selectionBox
 */
export const hideSelectionOutline = (selectionBox) => {
  if (!selectionBox) {
    return;
  }
  const wireframe = selectionBox.getObjectByName('wireframe');
  if (wireframe) {
    wireframe.visible = false;
  }
  selectionBox.visible = false;
};

/**
 * Resolve a raycast target to its model root and that root's selection box.
 * moveRoot is always a configured model root (never the scene), so drags and
 * rotations can only ever transform an actual model.
 * @param {import('three').Object3D | null | undefined} movable
 */
export const resolveMoveSelection = (movable) => {
  const root = findModelRoot(
    // A hit on the box/wireframe helper still belongs to its model root.
    movable && isSelectionHelperName(movable.name) ? movable.parent : movable,
  );
  if (!root) {
    return { selectionBox: null, moveRoot: null };
  }
  return {
    selectionBox: root.userData?.transparentBox ?? null,
    moveRoot: root,
  };
};
