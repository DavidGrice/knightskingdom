import { useEffect, useRef, useState, useImperativeHandle, forwardRef, startTransition } from 'react';
import * as THREE from 'three';
import { useGameLoading } from '@/lib/context/GameLoadingProvider';
import { ModelLoader } from './Loaders/index';
import { Modes } from './GameEngineResourceStack/index';
import { serializeSceneFromThree } from '../../context/sceneSchema';
import { GameEngineCore } from './GameEngineCore';
import { disposeObject3D } from './sceneDispose';

const DRAG_SMOOTHING = 0.35;
const THIRD_PERSON_DISTANCE = 4.5;
const THIRD_PERSON_HEIGHT = 0.45;
const FIRST_PERSON_EYE_LIFT = 0.14;
const FIRST_PERSON_LOOK_AHEAD = 12;
const _lookTarget = new THREE.Vector3();
const _worldPos = new THREE.Vector3();
const _forward = new THREE.Vector3();

const promoteWireframeToBox = (node) => {
  if (node?.name === 'wireframe' && node.parent?.isMovable) {
    return node.parent;
  }
  return node;
};

const findInteractableTarget = (object, flag) => {
  let node = object;
  while (node) {
    if (node[flag]) {
      return promoteWireframeToBox(node);
    }
    node = node.parent;
  }
  return null;
};

const findMovableFromIntersects = (intersects) => {
  for (const intersect of intersects) {
    const parent = intersect.object.parent;
    if (parent?.isMovable) {
      return promoteWireframeToBox(parent);
    }
    const movable = findInteractableTarget(intersect.object, 'isMovable');
    if (movable) {
      return movable;
    }
  }
  return null;
};

const resolveDriveTarget = (scene) => {
  let defaultTarget = null;
  let playable = null;
  let archer = null;
  let fallback = null;

  scene.traverse((child) => {
    if (!child.userData?.frontCameraHelper || !child.userData?.backCameraHelper) {
      return;
    }
    if (!child.getObjectByName('head_back')) {
      return;
    }
    if (child.userData.isDefaultDriveTarget) {
      defaultTarget = child;
    } else if (child.userData.isPlayableModel) {
      playable = playable ?? child;
    } else if (child.name === 'Archer') {
      archer = archer ?? child;
    } else if (!fallback) {
      fallback = child;
    }
  });

  return defaultTarget ?? playable ?? archer ?? fallback;
};

/**
 * Drive cameras:
 * - "back" button: 3rd-person — in front of the champ, looking at them (matches drive UI icon)
 * - "front" button: 1st-person — through the champ's eyes, looking forward
 */
const applyDriveCameraView = (core, driveRoot, cameraType) => {
  const { camera, controls } = core;
  const headBack = driveRoot.getObjectByName('head_back');
  if (!headBack) {
    return;
  }

  headBack.getWorldPosition(_worldPos);
  driveRoot.getWorldDirection(_forward);

  if (cameraType === 'back') {
    _worldPos.addScaledVector(_forward, THIRD_PERSON_DISTANCE);
    _worldPos.y += THIRD_PERSON_HEIGHT;
    camera.position.copy(_worldPos);
    headBack.getWorldPosition(_lookTarget);
    _lookTarget.y += 0.25;
  } else {
    _worldPos.y += FIRST_PERSON_EYE_LIFT;
    camera.position.copy(_worldPos);
    _lookTarget.copy(_worldPos).addScaledVector(_forward, FIRST_PERSON_LOOK_AHEAD);
  }

  camera.lookAt(_lookTarget);
  camera.updateMatrixWorld();

  if (controls) {
    controls.target.copy(_lookTarget);
    controls.update();
  }
};

const GameEngine = forwardRef(({
  mapData, hydrationScene, color, mode, activeCamera, isFollowing, addModel,
  selectedClimateMode, climateNeedsUpdating, setClimateNeedsUpdating,
  cameraNeedsReset, setCameraNeedsReset, isClimateOpen, onSceneChange,
}, ref) => {
  const mountRef = useRef(null);
  const coreRef = useRef(null);
  const canvasRef = useRef(null);
  const hasHydratedRef = useRef(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const selectedObject = useRef(null);
  const isDragging = useRef(false);
  const mouse = useRef(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());
  const originalCameraPosition = useRef(null);
  const originalCameraQuaternion = useRef(null);
  const driveTargetRef = useRef(null);
  const modeRef = useRef(mode);
  const activeCameraRef = useRef(activeCamera);
  const onSceneChangeRef = useRef(onSceneChange);
  const setCameraNeedsResetRef = useRef(setCameraNeedsReset);
  const unregisterDriveFollowRef = useRef(null);

  modeRef.current = mode;
  activeCameraRef.current = activeCamera;
  onSceneChangeRef.current = onSceneChange;
  setCameraNeedsResetRef.current = setCameraNeedsReset;

  useImperativeHandle(ref, () => ({
    captureFrame: () => coreRef.current?.captureFrame() ?? null,
    getSceneState: () => coreRef.current?.getSceneState(),
  }), []);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) {
      return undefined;
    }

    const core = new GameEngineCore();
    coreRef.current = core;
    canvasRef.current = core.mount(mountNode);

    return () => {
      core.dispose();
      coreRef.current = null;
      canvasRef.current = null;
      setAssetsReady(false);
      hasHydratedRef.current = false;
    };
  }, []);

  const mapId = mapData?.id;

  const { stopLoading } = useGameLoading();

  useEffect(() => {
    if (assetsReady) {
      stopLoading('world-assets');
      stopLoading('navigation');
    }
  }, [assetsReady, stopLoading]);

  useEffect(() => {
    const core = coreRef.current;
    if (!core || !mapData || mapId == null) {
      return;
    }

    hasHydratedRef.current = false;
    setAssetsReady(false);
    core.setClimate(mapData, selectedClimateMode);
    core.loadWorld(mapData, {
      onReady: () => setAssetsReady(true),
    });
    // Climate changes after load are handled by the climateNeedsUpdating effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload world only when map id changes
  }, [mapId]);

  useEffect(() => {
    const core = coreRef.current;
    if (!core || !mapData || !climateNeedsUpdating) {
      return;
    }

    core.setClimate(mapData, selectedClimateMode, { force: true });
    startTransition(() => {
      setClimateNeedsUpdating(false);
    });

    if (onSceneChangeRef.current) {
      startTransition(() => {
        onSceneChangeRef.current(core.getSceneState());
      });
    }
  }, [
    climateNeedsUpdating,
    selectedClimateMode,
    mapData,
    setClimateNeedsUpdating,
  ]);

  useEffect(() => {
    const core = coreRef.current;
    if (!core || !assetsReady || !hydrationScene || hasHydratedRef.current) {
      return;
    }

    core.hydrateFromSaved(hydrationScene, mapData);
    hasHydratedRef.current = true;
  }, [assetsReady, hydrationScene, mapData]);

  useEffect(() => {
    const core = coreRef.current;
    const canvas = canvasRef.current;
    if (!core || !canvas) {
      return undefined;
    }

    const { scene, camera } = core;

    const updateSceneState = () => {
      if (!onSceneChangeRef.current) {
        return;
      }
      const sceneState = serializeSceneFromThree(scene, camera, selectedClimateMode);
      startTransition(() => {
        onSceneChangeRef.current(sceneState);
      });
    };

    const setControlsEnabled = (enabled) => {
      if (core.controls) {
        core.controls.enabled = enabled;
      }
    };

    const hideWireframe = (object) => {
      const wireframe = object.getObjectByName('wireframe');
      if (wireframe) {
        wireframe.visible = false;
      }
    };

    const showWireframe = (object) => {
      const wireframe = object.getObjectByName('wireframe');
      if (wireframe) {
        wireframe.visible = true;
      }
    };

    const setMouseFromEvent = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onMouseClick = (event) => {
      if (modeRef.current !== Modes.ADDING) {
        return;
      }
      event.preventDefault();
      setMouseFromEvent(event);
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      if (intersects.length === 0 || addModel === 'NONE') {
        return;
      }
      ModelLoader(
        'add',
        addModel,
        intersects[0].point,
        null,
        scene,
        null,
        core.registerFrameCallback.bind(core),
      );
      updateSceneState();
    };

    const onMouseDown = (event) => {
      event.preventDefault();
      setMouseFromEvent(event);
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      if (intersects.length === 0) {
        return;
      }

      const hitObject = intersects[0].object;
      const intersectedObject = hitObject.parent;
      const currentMode = modeRef.current;

      switch (currentMode) {
        case Modes.MOVING: {
          const movable = findMovableFromIntersects(intersects);
          if (movable) {
            selectedObject.current = movable;
            isDragging.current = true;
            movable.visible = true;
            setControlsEnabled(false);
          }
          break;
        }
        case Modes.ROTATING: {
          const rotatable = findInteractableTarget(hitObject, 'isRotatable')
            ?? (intersectedObject?.isRotatable ? intersectedObject : null);
          if (rotatable) {
            hideWireframe(rotatable);
            selectedObject.current = rotatable;
            rotatable.parent.rotateY(Math.PI / 2);
            showWireframe(rotatable);
            updateSceneState();
          }
          break;
        }
        case Modes.PAINTING: {
          const filteredIntersects = intersects.filter(
            (intersect) => intersect.object.name !== 'transparentBox'
              && intersect.object.name !== 'wireframe',
          );
          if (filteredIntersects.length > 0) {
            const paintObject = filteredIntersects[0].object;
            if (paintObject.isPaintable) {
              hideWireframe(paintObject);
              selectedObject.current = paintObject;
              paintObject.material.color.set(new THREE.Color(parseInt(color, 16)));
              showWireframe(paintObject);
              updateSceneState();
            }
          }
          break;
        }
        case Modes.DELETING:
          if (intersectedObject?.isDeletable) {
            scene.remove(intersectedObject.parent);
            disposeObject3D(intersectedObject.parent);
            updateSceneState();
          }
          break;
        default:
          break;
      }
    };

    const onMouseMove = (event) => {
      if (modeRef.current !== Modes.MOVING || !isDragging.current || !selectedObject.current) {
        return;
      }

      event.preventDefault();
      setMouseFromEvent(event);
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      if (intersects.length === 0) {
        return;
      }

      const intersectionPoint = intersects[0].point;
      const modelRoot = selectedObject.current.parent;
      if (!modelRoot) {
        return;
      }

      modelRoot.position.x += (intersectionPoint.x - modelRoot.position.x) * DRAG_SMOOTHING;
      modelRoot.position.z += (intersectionPoint.z - modelRoot.position.z) * DRAG_SMOOTHING;
    };

    const endDrag = () => {
      if (!selectedObject.current?.isMovable) {
        return;
      }
      isDragging.current = false;
      selectedObject.current.visible = false;
      selectedObject.current = null;
      setControlsEnabled(true);
      updateSceneState();
    };

    const onMouseUp = (event) => {
      event.preventDefault();
      endDrag();
    };

    const onWindowMouseUp = () => {
      endDrag();
    };

    const removeAllEventListeners = () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('click', onMouseClick);
      window.removeEventListener('mouseup', onWindowMouseUp);
    };

    removeAllEventListeners();

    switch (mode) {
      case Modes.ADDING:
        canvas.addEventListener('click', onMouseClick, false);
        break;
      case Modes.MOVING:
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mouseup', onWindowMouseUp);
        break;
      case Modes.ROTATING:
      case Modes.PAINTING:
      case Modes.DELETING:
      case Modes.ACTION:
        canvas.addEventListener('mousedown', onMouseDown);
        break;
      case Modes.DRIVING:
        break;
      default:
        setControlsEnabled(true);
        break;
    }

    return () => {
      removeAllEventListeners();
      setControlsEnabled(true);
    };
  }, [mode, color, addModel, assetsReady, selectedClimateMode]);

  useEffect(() => {
    const core = coreRef.current;
    if (!core) {
      return undefined;
    }

    const { scene, camera } = core;

    const saveOriginalCamera = () => {
      if (!originalCameraPosition.current && !originalCameraQuaternion.current) {
        originalCameraPosition.current = camera.position.clone();
        originalCameraQuaternion.current = camera.quaternion.clone();
      }
    };

    const restoreOriginalCamera = () => {
      if (originalCameraPosition.current && originalCameraQuaternion.current) {
        camera.position.copy(originalCameraPosition.current);
        camera.quaternion.copy(originalCameraQuaternion.current);
        if (core.controls) {
          core.controls.target.set(0, 0, 0);
          core.controls.update();
        }
      }
      originalCameraPosition.current = null;
      originalCameraQuaternion.current = null;
      driveTargetRef.current = null;
      if (core.controls) {
        core.controls.enabled = true;
      }
    };

    if (cameraNeedsReset) {
      restoreOriginalCamera();
      startTransition(() => {
        setCameraNeedsResetRef.current(false);
      });
    }

    unregisterDriveFollowRef.current?.();
    unregisterDriveFollowRef.current = null;

    if (mode === Modes.DRIVING && isFollowing && assetsReady) {
      driveTargetRef.current = null;
      const driveTarget = resolveDriveTarget(scene);
      if (driveTarget) {
        driveTargetRef.current = driveTarget;
        saveOriginalCamera();
        if (core.controls) {
          core.controls.enabled = false;
        }
        const cameraType = activeCamera ?? 'back';
        applyDriveCameraView(core, driveTarget, cameraType);
        unregisterDriveFollowRef.current = core.registerFrameCallback(() => {
          if (modeRef.current !== Modes.DRIVING || !driveTargetRef.current) {
            return;
          }
          applyDriveCameraView(
            core,
            driveTargetRef.current,
            activeCameraRef.current ?? 'back',
          );
        });
      }
    } else if (mode !== Modes.DRIVING && core.controls) {
      core.controls.enabled = true;
    }

    return () => {
      unregisterDriveFollowRef.current?.();
      unregisterDriveFollowRef.current = null;
    };
  }, [mode, isFollowing, activeCamera, assetsReady, cameraNeedsReset]);

  return <div ref={mountRef} />;
});

GameEngine.displayName = 'GameEngine';

export default GameEngine;