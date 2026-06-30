import * as THREE from 'three';
import { getDriveCameraProfile } from './driveCameraProfiles';

const _position = new THREE.Vector3();
const _lookAt = new THREE.Vector3();
const _faceForward = new THREE.Vector3();
const _headUp = new THREE.Vector3();
const _headFrontPos = new THREE.Vector3();
const _headBackPos = new THREE.Vector3();
const _box = new THREE.Box3();

const LOCAL_AXIS_VECTORS = {
  posX: new THREE.Vector3(1, 0, 0),
  negX: new THREE.Vector3(-1, 0, 0),
  posY: new THREE.Vector3(0, 1, 0),
  negY: new THREE.Vector3(0, -1, 0),
  posZ: new THREE.Vector3(0, 0, 1),
  negZ: new THREE.Vector3(0, 0, -1),
};

const findMesh = (champRoot, names = []) => {
  for (const name of names) {
    if (!name) {
      continue;
    }
    const mesh = champRoot.getObjectByName(name);
    if (mesh) {
      return mesh;
    }
  }
  return null;
};

const getMeshBBoxCenter = (mesh, target) => {
  if (!mesh) {
    return null;
  }
  mesh.updateWorldMatrix(true, false);
  _box.setFromObject(mesh);
  _box.getCenter(target);
  return target;
};

const resolveFacingSource = (champRoot, facing) => {
  if (facing.strategy === 'meshLocalAxis') {
    return findMesh(champRoot, [
      facing.sourceMesh,
      ...(facing.fallbackMeshes ?? []),
    ]);
  }
  return champRoot;
};

const getFaceForward = (champRoot, profile, target) => {
  const { facing } = profile;

  if (facing.strategy === 'meshCenterPair') {
    const fromMesh = findMesh(champRoot, [
      facing.fromMesh,
      ...(facing.fallbackFromMeshes ?? []),
    ]);
    const toMesh = findMesh(champRoot, [
      facing.toMesh,
      ...(facing.fallbackToMeshes ?? []),
    ]);

    if (!fromMesh || !toMesh) {
      return null;
    }

    getMeshBBoxCenter(toMesh, _headFrontPos);
    getMeshBBoxCenter(fromMesh, _headBackPos);
    target.copy(_headFrontPos).sub(_headBackPos);
  } else if (facing.strategy === 'meshLocalAxis') {
    const source = resolveFacingSource(champRoot, facing);
    if (!source) {
      return null;
    }

    const axis = LOCAL_AXIS_VECTORS[facing.localAxis ?? 'posX'];
    if (!axis) {
      return null;
    }

    source.updateWorldMatrix(true, false);
    target.copy(axis).transformDirection(source.matrixWorld);
  } else {
    champRoot.getWorldDirection(target);
    if (facing.negate) {
      target.negate();
    }
  }

  if (facing.flattenY !== false) {
    target.y = 0;
  }

  if (target.lengthSq() < 1e-6) {
    return null;
  }

  target.normalize();

  if (facing.sign) {
    target.multiplyScalar(facing.sign);
  }

  return target;
};

const getHeadCenter = (champRoot, anchors, target) => {
  const headFront = findMesh(champRoot, [anchors.headFront]);
  const headBack = findMesh(champRoot, [anchors.headBack]);

  if (headFront && headBack) {
    getMeshBBoxCenter(headFront, _headFrontPos);
    getMeshBBoxCenter(headBack, _headBackPos);
    target.copy(_headFrontPos).lerp(_headBackPos, 0.5);
    return target;
  }

  if (headBack && getMeshBBoxCenter(headBack, target)) {
    return target;
  }
  if (headFront && getMeshBBoxCenter(headFront, target)) {
    return target;
  }

  champRoot.getWorldPosition(target);
  return target;
};

const getThirdPersonLookAt = (champRoot, anchors, target) => {
  const lookMesh = findMesh(champRoot, [
    anchors.thirdPersonLookAt,
    anchors.headFront,
    anchors.chestFront,
    anchors.headBack,
  ]);

  if (lookMesh && getMeshBBoxCenter(lookMesh, target)) {
    return target;
  }

  return getHeadCenter(champRoot, anchors, target);
};

const getEyePosition = (champRoot, anchors, offsets, faceForward, target) => {
  const headFront = findMesh(champRoot, [anchors.headFront]);
  const headBack = findMesh(champRoot, [anchors.headBack]);
  const head = headFront ?? headBack;

  if (!head) {
    return getHeadCenter(champRoot, anchors, target);
  }

  if (offsets.eyeBehindFace != null || offsets.eyeForwardOffset != null) {
    const eyeMesh = headFront ?? head;
    if (!getMeshBBoxCenter(eyeMesh, target)) {
      return getHeadCenter(champRoot, anchors, target);
    }
    if (offsets.eyeBehindFace != null) {
      target.addScaledVector(faceForward, -offsets.eyeBehindFace);
    }
    if (offsets.eyeForwardOffset != null) {
      target.addScaledVector(faceForward, offsets.eyeForwardOffset);
    }
    return target;
  }

  head.updateWorldMatrix(true, false);
  getMeshBBoxCenter(head, target);

  _headUp.set(0, 1, 0).transformDirection(head.matrixWorld);
  target.addScaledVector(_headUp, offsets.eyeHeightLift ?? 0);

  if (offsets.eyeForwardInset) {
    target.addScaledVector(faceForward, offsets.eyeForwardInset);
  }

  return target;
};

export class DriveCameraRig {
  constructor(champRoot, profile) {
    this.champRoot = champRoot;
    this.profile = profile ?? getDriveCameraProfile(champRoot.userData.driveCameraProfileId);
    this.lastLookAt = new THREE.Vector3();
  }

  applyToCamera(camera, view) {
    if (!getFaceForward(this.champRoot, this.profile, _faceForward)) {
      return false;
    }

    const { offsets, anchors } = this.profile;

    if (view === 'third') {
      getHeadCenter(this.champRoot, anchors, _lookAt);
      _lookAt.y += offsets.lookAtHeightBoost ?? 0;
      _position.copy(_lookAt).addScaledVector(
        _faceForward,
        offsets.thirdPersonDistance * (offsets.thirdPersonDistanceSign ?? -1),
      );
      _position.y += offsets.thirdPersonHeight ?? 0;
      camera.position.copy(_position);
    } else {
      getEyePosition(this.champRoot, anchors, offsets, _faceForward, _position);
      camera.position.copy(_position);
      _lookAt.copy(_position).addScaledVector(_faceForward, offsets.firstLookAhead);
      if (offsets.levelFirstPersonPitch) {
        _lookAt.y = _position.y;
      }
    }

    this.lastLookAt.copy(_lookAt);
    camera.lookAt(_lookAt);
    camera.updateMatrixWorld();
    return true;
  }

  dispose() {
    // Rig reads live mesh transforms — no owned scene nodes.
  }
}