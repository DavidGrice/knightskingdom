import { Modes } from './GameEngineResourceStack/index';
import { DriveCameraRig } from './DriveCameraRig';
import { getDriveCameraProfile } from './driveCameraProfiles';

export class CameraController {
  constructor(core) {
    this.core = core;
    this.subjects = new Map();
    this.defaultDriveId = null;
    this.activeDriveId = null;
    this.driveView = 'third';
    this.isDriveActive = false;
    this.savedOrbitState = null;
  }

  clearSubjects() {
    this.subjects.forEach(({ rig }) => rig.dispose());
    this.subjects.clear();
    this.defaultDriveId = null;
    this.activeDriveId = null;
  }

  registerSubject(champRoot, driveId, { isDefault = false, profileId } = {}) {
    if (!champRoot.getObjectByName('head_back')) {
      return;
    }

    const profile = getDriveCameraProfile(
      profileId ?? champRoot.userData.driveCameraProfileId,
    );
    const rig = new DriveCameraRig(champRoot, profile);
    champRoot.userData.driveId = driveId;
    champRoot.userData.driveCameraProfileId = profile.id;
    this.subjects.set(driveId, { rig, root: champRoot, profileId: profile.id });

    if (isDefault) {
      this.defaultDriveId = driveId;
    } else if (!this.defaultDriveId) {
      this.defaultDriveId = driveId;
    }
  }

  syncFromReact({
    mode,
    isFollowing,
    driveView,
    cameraNeedsReset,
    assetsReady,
  }) {
    if (cameraNeedsReset) {
      this.exitDrive();
      return { consumedReset: true };
    }

    const shouldDrive = mode === Modes.DRIVING && isFollowing && assetsReady;

    if (shouldDrive && !this.isDriveActive) {
      this.enterDrive(driveView ?? 'third');
    } else if (!shouldDrive && this.isDriveActive) {
      this.exitDrive();
    } else if (shouldDrive) {
      this.driveView = driveView ?? 'third';
      if (this.activeDriveId) {
        this.applyDriveView();
      }
    }

    return { consumedReset: false };
  }

  enterDrive(view = 'third') {
    if (!this.savedOrbitState) {
      const { camera, controls } = this.core;
      this.savedOrbitState = {
        position: camera.position.clone(),
        quaternion: camera.quaternion.clone(),
        target: controls?.target.clone() ?? null,
      };
    }

    this.isDriveActive = true;
    this.driveView = view;
    this.activeDriveId = null;

    if (this.core.controls) {
      this.core.controls.enabled = true;
    }
  }

  selectSubject(driveId) {
    if (!this.isDriveActive || !this.subjects.has(driveId)) {
      return false;
    }

    this.activeDriveId = driveId;

    if (this.core.controls) {
      this.core.controls.enabled = false;
    }

    this.applyDriveView();
    return true;
  }

  exitDrive() {
    if (this.savedOrbitState) {
      const { camera, controls } = this.core;
      camera.position.copy(this.savedOrbitState.position);
      camera.quaternion.copy(this.savedOrbitState.quaternion);
      if (controls && this.savedOrbitState.target) {
        controls.target.copy(this.savedOrbitState.target);
        controls.enabled = true;
        controls.update();
      } else if (controls) {
        controls.enabled = true;
      }
      this.savedOrbitState = null;
    } else if (this.core.controls) {
      this.core.controls.enabled = true;
    }

    this.isDriveActive = false;
    this.activeDriveId = null;
  }

  applyDriveView() {
    if (!this.isDriveActive || !this.activeDriveId) {
      return;
    }

    const subject = this.subjects.get(this.activeDriveId);
    if (!subject) {
      return;
    }

    const applied = subject.rig.applyToCamera(this.core.camera, this.driveView);
    if (applied && this.core.controls) {
      this.core.controls.target.copy(subject.rig.lastLookAt);
      this.core.controls.update();
    }
  }

  update() {
    if (!this.isDriveActive || !this.activeDriveId) {
      return;
    }
    this.applyDriveView();
  }
}