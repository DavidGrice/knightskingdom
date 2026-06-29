import * as THREE from 'three';

const _position = new THREE.Vector3();
const _lookAt = new THREE.Vector3();
const _faceForward = new THREE.Vector3();
const _headFrontPos = new THREE.Vector3();
const _headBackPos = new THREE.Vector3();
const _center = new THREE.Vector3();

/** Tuned for archer_with_box2.glb */
export const ARCHER_RIG_OFFSETS = {
  thirdPersonDistance: 4.5,
  thirdPersonHeight: 0.55,
  firstLookAhead: 12,
  eyeFrontBlend: 0.38,
};

/**
 * Archer parts share a baked quaternion where -Z points mostly up, not forward.
 * Horizontal facing comes from the chest_front mesh +X axis (see probe-archer-axes.mjs).
 */
const getFaceForward = (champRoot, target) => {
  const chestFront = champRoot.getObjectByName('chest_front');
  const headFront = champRoot.getObjectByName('head_front');
  const source = chestFront ?? headFront ?? champRoot.getObjectByName('head_back');

  if (!source) {
    return null;
  }

  source.updateWorldMatrix(true, false);
  target.set(1, 0, 0).transformDirection(source.matrixWorld);
  target.y = 0;

  if (target.lengthSq() < 1e-6) {
    source.getWorldDirection(target);
    target.y = 0;
  }

  if (target.lengthSq() < 1e-6) {
    return null;
  }

  target.normalize();
  return target;
};

const getHeadCenter = (champRoot, target) => {
  const headFront = champRoot.getObjectByName('head_front');
  const headBack = champRoot.getObjectByName('head_back');

  if (headFront && headBack) {
    headFront.getWorldPosition(_headFrontPos);
    headBack.getWorldPosition(_headBackPos);
    target.copy(_headFrontPos).lerp(_headBackPos, 0.5);
    return target;
  }

  if (headBack) {
    headBack.getWorldPosition(target);
  } else if (headFront) {
    headFront.getWorldPosition(target);
  }
  return target;
};

const getEyePosition = (champRoot, blend, target) => {
  const headFront = champRoot.getObjectByName('head_front');
  const headBack = champRoot.getObjectByName('head_back');

  if (headFront && headBack) {
    headFront.getWorldPosition(_headFrontPos);
    headBack.getWorldPosition(_headBackPos);
    target.copy(_headFrontPos).lerp(_headBackPos, 1 - blend);
    return target;
  }

  getHeadCenter(champRoot, target);
  return target;
};

export class DriveCameraRig {
  constructor(champRoot, offsets = ARCHER_RIG_OFFSETS) {
    this.champRoot = champRoot;
    this.offsets = offsets;
    this.lastLookAt = new THREE.Vector3();
  }

  applyToCamera(camera, view) {
    if (!getFaceForward(this.champRoot, _faceForward)) {
      return false;
    }

    getHeadCenter(this.champRoot, _center);

    if (view === 'third') {
      _position.copy(_center);
      _position.addScaledVector(_faceForward, this.offsets.thirdPersonDistance);
      _position.y += this.offsets.thirdPersonHeight;
      camera.position.copy(_position);
      _lookAt.copy(_center);
      _lookAt.y += 0.2;
    } else {
      getEyePosition(this.champRoot, this.offsets.eyeFrontBlend, _position);
      camera.position.copy(_position);
      _lookAt.copy(_position).addScaledVector(_faceForward, this.offsets.firstLookAhead);
    }

    this.lastLookAt.copy(_lookAt);
    camera.lookAt(_lookAt);
    camera.updateMatrixWorld();
    return true;
  }

  dispose() {
    // Rig uses live mesh transforms — no scene nodes to remove.
  }
}