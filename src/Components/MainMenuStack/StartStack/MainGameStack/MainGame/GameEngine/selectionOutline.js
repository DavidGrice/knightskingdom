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
 * Resolve grouped creations to their ensemble hitbox; GLB models use their transparentBox.
 * @param {import('three').Object3D | null | undefined} movable
 */
export const resolveMoveSelection = (movable) => {
  if (!movable) {
    return { selectionBox: null, moveRoot: null };
  }

  let node = movable;
  while (node) {
    if (node.userData?.transparentBox && (node.userData?.creationId || node.isModel)) {
      return {
        selectionBox: node.userData.transparentBox,
        moveRoot: node,
      };
    }
    node = node.parent;
  }

  if (movable.name === 'transparentBox') {
    return { selectionBox: movable, moveRoot: movable.parent ?? null };
  }

  const selectionBox = movable.userData?.transparentBox ?? movable;
  return {
    selectionBox,
    moveRoot: movable.parent ?? null,
  };
};