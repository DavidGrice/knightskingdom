import { useEffect, useRef, useState, useImperativeHandle, forwardRef, startTransition } from 'react';
import * as THREE from 'three';
import { useGameLoading } from '@/lib/context/GameLoadingProvider';
import { ModelLoader, CreationLoader } from './Loaders/index';
import { isCreationModelId } from '@/api/customCreations';
import { Modes } from './GameEngineResourceStack/index';
import { serializeSceneFromThree } from '../../context/sceneSchema';
import { GameEngineCore } from './GameEngineCore';
import { disposeObject3D } from './sceneDispose';
import {
  hideSelectionOutline,
  resolveMoveSelection,
  showSelectionOutline,
} from './selectionOutline';

const DRAG_SMOOTHING = 0.35;

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

const findDriveIdFromObject = (object) => {
  let node = object;
  while (node) {
    if (node.userData?.driveId) {
      return node.userData.driveId;
    }
    node = node.parent;
  }
  return null;
};

const findDriveIdFromIntersects = (intersects) => {
  for (const intersect of intersects) {
    const driveId = findDriveIdFromObject(intersect.object);
    if (driveId) {
      return driveId;
    }
  }
  return null;
};

const GameEngine = forwardRef(({
  mapData, hydrationScene, color, mode, driveView, isFollowing, addModel,
  customCreations,
  selectedClimateMode, climateNeedsUpdating, setClimateNeedsUpdating,
  cameraNeedsReset, setCameraNeedsReset, isClimateOpen, onSceneChange,
}, ref) => {
  const mountRef = useRef(null);
  const coreRef = useRef(null);
  const canvasRef = useRef(null);
  const hasHydratedRef = useRef(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const selectedObject = useRef(null);
  const moveRoot = useRef(null);
  const isDragging = useRef(false);
  const mouse = useRef(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());
  const modeRef = useRef(mode);
  const customCreationsRef = useRef(customCreations);
  const onSceneChangeRef = useRef(onSceneChange);
  const setCameraNeedsResetRef = useRef(setCameraNeedsReset);

  modeRef.current = mode;
  customCreationsRef.current = customCreations;
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

    core.hydrateFromSaved(hydrationScene, mapData, {
      customCreations: customCreationsRef.current,
    });
    hasHydratedRef.current = true;
  }, [assetsReady, hydrationScene, mapData, customCreations]);

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
      if (isCreationModelId(addModel)) {
        CreationLoader(
          'add',
          addModel,
          intersects[0].point,
          scene,
          customCreationsRef.current,
        );
      } else {
        ModelLoader(
          'add',
          addModel,
          intersects[0].point,
          null,
          scene,
          null,
          core.cameraController,
        );
      }
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
          const { selectionBox, moveRoot: root } = resolveMoveSelection(movable);
          if (selectionBox && root) {
            selectedObject.current = selectionBox;
            moveRoot.current = root;
            isDragging.current = true;
            showSelectionOutline(selectionBox);
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
        case Modes.DRIVING: {
          const driveId = findDriveIdFromIntersects(intersects);
          if (driveId) {
            core.cameraController.selectSubject(driveId);
          }
          break;
        }
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
      const modelRoot = moveRoot.current;
      if (!modelRoot) {
        return;
      }

      modelRoot.position.x += (intersectionPoint.x - modelRoot.position.x) * DRAG_SMOOTHING;
      modelRoot.position.z += (intersectionPoint.z - modelRoot.position.z) * DRAG_SMOOTHING;
    };

    const endDrag = () => {
      if (!selectedObject.current) {
        return;
      }
      isDragging.current = false;
      hideSelectionOutline(selectedObject.current);
      selectedObject.current = null;
      moveRoot.current = null;
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
        canvas.addEventListener('mousedown', onMouseDown);
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

    const { consumedReset } = core.cameraController.syncFromReact({
      mode,
      isFollowing,
      driveView,
      cameraNeedsReset,
      assetsReady,
    });

    if (consumedReset) {
      startTransition(() => {
        setCameraNeedsResetRef.current(false);
      });
    }

    return undefined;
  }, [mode, isFollowing, driveView, assetsReady, cameraNeedsReset]);

  return <div ref={mountRef} />;
});

GameEngine.displayName = 'GameEngine';

export default GameEngine;