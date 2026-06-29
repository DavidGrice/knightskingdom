import * as THREE from 'three';

const _position = new THREE.Vector3();
const _lookAt = new THREE.Vector3();
const _faceForward = new THREE.Vector3();

/** Tuned for archer_with_box2.glb — head_back local space */
export const ARCHER_RIG_OFFSETS = {
  firstPersonEye: { x: 0, y: 0.1, z: 0.02 },
  thirdPerson: { x: 0, y: 0.4, z: 0 },
  thirdPersonDistance: 4.2,
  thirdPersonHeight: 0.15,
  lookAtHeight: 0.22,
  firstLookAhead: 10,
};

const getFaceForward = (head, target) => {
  head.getWorldDirection(target);
  target.negate();
  return target;
};

export class DriveCameraRig {
  constructor(champRoot, offsets = ARCHER_RIG_OFFSETS) {
    this.champRoot = champRoot;
    this.offsets = offsets;
    this.headBack = champRoot.getObjectByName('head_back');
    this.lastLookAt = new THREE.Vector3();

    this.firstPerson = new THREE.Object3D();
    this.firstPerson.name = 'rig_first_person';
    this.thirdPerson = new THREE.Object3D();
    this.thirdPerson.name = 'rig_third_person';
    this.lookAt = new THREE.Object3D();
    this.lookAt.name = 'rig_look_at';

    const anchor = this.headBack ?? champRoot;
    const { firstPersonEye, thirdPerson } = offsets;

    this.firstPerson.position.set(firstPersonEye.x, firstPersonEye.y, firstPersonEye.z);
    this.thirdPerson.position.set(thirdPerson.x, thirdPerson.y, thirdPerson.z);
    this.lookAt.position.set(0, offsets.lookAtHeight, 0);

    anchor.add(this.firstPerson);
    anchor.add(this.thirdPerson);
    anchor.add(this.lookAt);
  }

  applyToCamera(camera, view) {
    const head = this.headBack;
    if (!head) {
      return false;
    }

    if (view === 'third') {
      head.getWorldPosition(_position);
      getFaceForward(head, _faceForward);
      _position.addScaledVector(_faceForward, this.offsets.thirdPersonDistance);
      _position.y += this.offsets.thirdPersonHeight;
      camera.position.copy(_position);
      this.lookAt.getWorldPosition(_lookAt);
      _lookAt.y += this.offsets.lookAtHeight * 0.5;
    } else {
      this.firstPerson.getWorldPosition(_position);
      getFaceForward(head, _faceForward);
      camera.position.copy(_position);
      _lookAt.copy(_position).addScaledVector(_faceForward, this.offsets.firstLookAhead);
    }

    this.lastLookAt.copy(_lookAt);
    camera.lookAt(_lookAt);
    camera.updateMatrixWorld();
    return true;
  }

  dispose() {
    this.firstPerson.parent?.remove(this.firstPerson);
    this.thirdPerson.parent?.remove(this.thirdPerson);
    this.lookAt.parent?.remove(this.lookAt);
  }
}