import * as THREE from 'three';
import { EdgesGeometry, LineBasicMaterial, LineSegments } from 'three';

const SELECTION_SKIP_NAMES = new Set(['transparentBox', 'wireframe']);

/**
 * Bounds of visible content, excluding selection helpers.
 * @param {import('three').Object3D} root
 */
export const computeContentBounds = (root) => {
  const bounds = new THREE.Box3();
  let hasContent = false;

  root.updateMatrixWorld(true);
  root.traverse((child) => {
    if (SELECTION_SKIP_NAMES.has(child.name)) {
      return;
    }
    if (!child.isMesh) {
      return;
    }
    const childBounds = new THREE.Box3().setFromObject(child);
    if (!childBounds.isEmpty()) {
      bounds.union(childBounds);
      hasContent = true;
    }
  });

  if (!hasContent) {
    bounds.setFromObject(root);
  }

  return bounds;
};

const applySelectionBoxGeometry = (hitbox, size, centerLocal) => {
  hitbox.position.copy(centerLocal);
  hitbox.geometry?.dispose();
  // size is measured in world units but the geometry lives in the parent's
  // local space -- OBJ/MTL model roots are scaled (MM_TO_WORLD_SCALE), so
  // without this the box renders 10x too small on warehouse models.
  const worldScale = hitbox.parent
    ? hitbox.parent.getWorldScale(new THREE.Vector3())
    : new THREE.Vector3(1, 1, 1);
  hitbox.geometry = new THREE.BoxGeometry(
    Math.max(size.x / Math.max(Math.abs(worldScale.x), 1e-6), 1e-4),
    Math.max(size.y / Math.max(Math.abs(worldScale.y), 1e-6), 1e-4),
    Math.max(size.z / Math.max(Math.abs(worldScale.z), 1e-6), 1e-4),
  );

  const wireframe = hitbox.getObjectByName('wireframe');
  if (wireframe) {
    wireframe.position.set(0, 0, 0);
    wireframe.geometry?.dispose();
    wireframe.geometry = new EdgesGeometry(hitbox.geometry);
  }
};

/**
 * Attach or refresh a centered selection hitbox + wireframe on `root`.
 * @param {import('three').Object3D} root
 * @param {{ visible?: boolean, wireframeVisible?: boolean }} [options]
 */
export const attachSelectionBox = (root, options = {}) => {
  const bounds = computeContentBounds(root);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  root.worldToLocal(center);

  let hitbox = root.userData?.transparentBox;
  if (!hitbox) {
    const transparentMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0.08,
      transparent: true,
      depthWrite: false,
    });
    hitbox = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), transparentMaterial);
    hitbox.name = 'transparentBox';
    hitbox.isMovable = true;
    hitbox.isRotatable = true;
    hitbox.isPaintable = true;
    hitbox.isDeletable = true;

    const lineMaterial = new LineBasicMaterial({ color: 0xffffff });
    const wireframe = new LineSegments(new THREE.EdgesGeometry(hitbox.geometry), lineMaterial);
    wireframe.name = 'wireframe';
    wireframe.isMovable = true;
    wireframe.isRotatable = true;
    wireframe.isPaintable = true;
    wireframe.isDeletable = true;
    wireframe.visible = false;
    wireframe.position.set(0, 0, 0);
    hitbox.add(wireframe);
    root.add(hitbox);
    root.userData.transparentBox = hitbox;
  }

  applySelectionBoxGeometry(hitbox, size, center);

  if (options.visible !== undefined) {
    hitbox.visible = options.visible;
  }
  if (options.wireframeVisible !== undefined) {
    const wireframe = hitbox.getObjectByName('wireframe');
    if (wireframe) {
      wireframe.visible = options.wireframeVisible;
    }
  }

  return hitbox;
};

/**
 * Recompute selection box after move/rotate.
 * @param {import('three').Object3D} root
 */
export const updateSelectionBox = (root) => {
  if (!root?.userData?.transparentBox) {
    return null;
  }
  return attachSelectionBox(root);
};

/**
 * Shift child content so XZ center sits on the group origin (rotation pivot).
 * @param {import('three').Object3D} group
 */
export const centerGroupContentsXZ = (group) => {
  const bounds = computeContentBounds(group);
  if (bounds.isEmpty()) {
    return;
  }
  const center = bounds.getCenter(new THREE.Vector3());
  group.children.forEach((child) => {
    if (SELECTION_SKIP_NAMES.has(child.name)) {
      return;
    }
    child.position.x -= center.x;
    child.position.z -= center.z;
  });
};