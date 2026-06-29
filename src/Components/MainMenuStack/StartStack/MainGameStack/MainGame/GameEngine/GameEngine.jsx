import { useEffect, useRef, useState, useImperativeHandle, forwardRef, startTransition } from 'react';
import * as THREE from 'three';
import { useGameLoading } from '@/lib/context/GameLoadingProvider';
import { ModelLoader } from './Loaders/index';
import { Modes } from './GameEngineResourceStack/index';
import { serializeSceneFromThree } from '../../context/sceneSchema';
import { GameEngineCore } from './GameEngineCore';
import { disposeObject3D } from './sceneDispose';

const DRAG_SMOOTHING = 0.28;
const _lookTarget = new THREE.Vector3();
const _planeHit = new THREE.Vector3();
const _dragPlane = new THREE.Plane();

const findModelRoot = (object, scene) => {
  let node = object;
  while (node?.parent && node.parent !== scene) {
    node = node.parent;
  }
  return node;
};

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

const findMovableTarget = (object) => findInteractableTarget(object, 'isMovable');

const findMovableFromIntersects = (intersects) => {
  for (const intersect of intersects) {
    const movable = findMovableTarget(intersect.object);
    if (movable) {
      return movable;
    }
  }
  return null;
};

const findDriveRoot = (object) => {
  let node = object;
  while (node) {
    if (node.userData?.frontCameraHelper && node.userData?.backCameraHelper) {
      return node;
    }
    node = node.parent;
  }
  return null;
};

const resolveDriveTarget = (scene) => {
  let fallback = null;
  scene.traverse((child) => {
    if (!child.userData?.frontCameraHelper || !child.userData?.backCameraHelper) {
      return;
    }
    if (child.userData.isPlayableModel) {
      fallback = child;
    } else if (!fallback) {
      fallback = child;
    }
  });
  return fallback;
};

const applyDriveCameraView = (core, driveRoot, cameraType) => {
  const { camera, controls } = core;
  const frontHelper = driveRoot.userData.frontCameraHelper;
  const backHelper = driveRoot.userData.backCameraHelper;
  const headBack = driveRoot.getObjectByName('head_back');
  if (!frontHelper || !backHelper || !headBack) {
    return;
  }

  const viewHelper = cameraType === 'front' ? frontHelper : backHelper;
  viewHelper.getWorldPosition(camera.position);
  headBack.getWorldPosition(_lookTarget);
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
  const dragRootRef = useRef(null);
  const dragPlaneYRef = useRef(0);
  const dragPosRef = useRef({ x: 0, z: 0 });
  const unregisterDragSmoothRef = useRef(null);
  const unregisterDriveFollowRef = useRef(null);

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

    if (onSceneChange) {
      startTransition(() => {
        onSceneChange(core.getSceneState());
      });
    }
  }, [
    climateNeedsUpdating,
    selectedClimateMode,
    mapData,
    setClimateNeedsUpdating,
    onSceneChange,
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
    if (!core) {
      return undefined;
    }

    const { scene, camera } = core;

    const updateSceneState = () => {
      if (!onSceneChange) {
        return;
      }
      const sceneState = serializeSceneFromThree(scene, camera, selectedClimateMode);
      startTransition(() => {
        onSceneChange(sceneState);
      });
    };

    const clearCameraReset = () => {
      startTransition(() => {
        setCameraNeedsReset(false);
      });
    };

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
      driveTargetRef.current = null;
    };

    const stopDragSmooth = () => {
      unregisterDragSmoothRef.current?.();
      unregisterDragSmoothRef.current = null;
    };

    const startDragSmooth = () => {
      stopDragSmooth();
      unregisterDragSmoothRef.current = core.registerFrameCallback(() => {
        if (!isDragging.current || !dragRootRef.current) {
          return;
        }
        const root = dragRootRef.current;
        const target = dragPosRef.current;
        root.position.x += (target.x - root.position.x) * DRAG_SMOOTHING;
        root.position.z += (target.z - root.position.z) * DRAG_SMOOTHING;
      });
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

    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const setMouseFromEvent = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onMouseClick = (event) => {
      event.preventDefault();
      setMouseFromEvent(event);
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      if (intersects.length > 0 && mode === Modes.ADDING) {
        if (addModel === 'NONE') {
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
      }
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

      switch (mode) {
        case Modes.MOVING: {
          const movable = findMovableFromIntersects(intersects);
          if (movable) {
            selectedObject.current = movable;
            const root = findModelRoot(movable, scene);
            dragRootRef.current = root;
            dragPlaneYRef.current = root.position.y;
            dragPosRef.current = { x: root.position.x, z: root.position.z };
            isDragging.current = true;
            movable.visible = true;
            startDragSmooth();
          }
          break;
        }
        case Modes.ROTATING: {
          const rotatable = findInteractableTarget(hitObject, 'isRotatable');
          if (rotatable) {
            hideWireframe(rotatable);
            selectedObject.current = rotatable;
            rotatable.parent.rotateY(Math.PI / 2);
            showWireframe(rotatable);
          }
          break;
        }
        case Modes.PAINTING: {
          const filteredIntersects = intersects.filter(
            (intersect) => intersect.object.name !== 'transparentBox' && intersect.object.name !== 'wireframe',
          );
          if (filteredIntersects.length > 0) {
            const paintObject = filteredIntersects[0].object;
            if (paintObject.isPaintable) {
              hideWireframe(paintObject);
              selectedObject.current = paintObject;
              paintObject.material.color.set(new THREE.Color(parseInt(color, 16)));
              showWireframe(paintObject);
            }
          }
          break;
        }
        case Modes.DELETING:
          if (intersectedObject.isDeletable) {
            scene.remove(intersectedObject.parent);
            disposeObject3D(intersectedObject.parent);
          }
          break;
        case Modes.DRIVING: {
          const driveRoot = findDriveRoot(hitObject) ?? resolveDriveTarget(scene);
          if (driveRoot) {
            saveOriginalCamera();
            driveTargetRef.current = driveRoot;
            applyDriveCameraView(core, driveRoot, activeCamera ?? 'back');
          }
          break;
        }
        default:
          break;
      }

      updateSceneState();
    };

    const onMouseMove = (event) => {
      if (mode !== Modes.MOVING || !isDragging.current || !dragRootRef.current) {
        return;
      }

      event.preventDefault();
      setMouseFromEvent(event);
      raycaster.current.setFromCamera(mouse.current, camera);
      _dragPlane.set(new THREE.Vector3(0, 1, 0), -dragPlaneYRef.current);
      if (raycaster.current.ray.intersectPlane(_dragPlane, _planeHit)) {
        dragPosRef.current.x = _planeHit.x;
        dragPosRef.current.z = _planeHit.z;
      }
    };

    const onMouseUp = (event) => {
      event.preventDefault();
      if (selectedObject.current?.isMovable) {
        isDragging.current = false;
        stopDragSmooth();
        dragRootRef.current = null;
        selectedObject.current.visible = false;
        selectedObject.current = null;
        updateSceneState();
      }
    };

    const removeAllEventListeners = () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('click', onMouseClick);
    };

    removeAllEventListeners();

    if (cameraNeedsReset) {
      restoreOriginalCamera();
      clearCameraReset();
    }

    unregisterDriveFollowRef.current?.();
    if (mode === Modes.DRIVING && isFollowing) {
      const driveTarget = driveTargetRef.current ?? resolveDriveTarget(scene);
      if (driveTarget) {
        driveTargetRef.current = driveTarget;
        saveOriginalCamera();
        applyDriveCameraView(core, driveTarget, activeCamera ?? 'back');
        unregisterDriveFollowRef.current = core.registerFrameCallback(() => {
          if (!driveTargetRef.current) {
            return;
          }
          applyDriveCameraView(core, driveTargetRef.current, activeCamera ?? 'back');
        });
      }
    }

    switch (mode) {
      case Modes.ADDING:
        canvas.addEventListener('click', onMouseClick, false);
        break;
      case Modes.MOVING:
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        break;
      case Modes.ROTATING:
      case Modes.PAINTING:
      case Modes.DELETING:
      case Modes.ACTION:
        canvas.addEventListener('mousedown', onMouseDown);
        break;
      case Modes.DRIVING:
        canvas.addEventListener('mousedown', onMouseDown);
        break;
      default:
        break;
    }

    return () => {
      removeAllEventListeners();
      stopDragSmooth();
      unregisterDriveFollowRef.current?.();
      unregisterDriveFollowRef.current = null;
    };
  }, [
    mode,
    color,
    addModel,
    activeCamera,
    isFollowing,
    assetsReady,
    cameraNeedsReset,
    selectedClimateMode,
    setCameraNeedsReset,
    onSceneChange,
  ]);

  return <div ref={mountRef} />;
});

GameEngine.displayName = 'GameEngine';

export default GameEngine;