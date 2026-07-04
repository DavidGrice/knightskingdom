import { useEffect, useRef, useState, useImperativeHandle, forwardRef, startTransition } from 'react';
import * as THREE from 'three';
import { useGameLoading } from '@/lib/context/GameLoadingProvider';
import { ModelLoader, CreationLoader } from './Loaders/index';
import { isCreationModelId } from '@/api/customCreations';
import { Modes } from './GameEngineResourceStack/index';
import { serializeSceneFromThree } from '../../context/sceneSchema';
import { GameEngineCore } from './GameEngineCore';
import { disposeModelInstance } from './sceneDispose';
import { updateSelectionBox } from '../../WorkShop/WorkshopEngine/BrickFactory';
import {
  filterOutSelectionHelpers,
  findModelRoot,
  findModelRootFromIntersects,
  hideSelectionOutline,
  isInSubtree,
  resolveMoveSelection,
  showSelectionOutline,
} from './selectionOutline';

const DRAG_SMOOTHING = 0.35;

const placementBounds = new THREE.Box3();
const groundProbe = new THREE.Raycaster();

/**
 * Placement point for ADDING when the click landed on an existing model:
 * instead of that model's surface (which left the new model floating at
 * the hit height), step to the model's nearest free side -- left/right/
 * front/behind, chosen from where on the model the user clicked -- and
 * drop to the terrain there.
 */
const adjacentGroundPoint = (scene, hitRoot, hitPoint) => {
  placementBounds.setFromObject(hitRoot);
  const center = placementBounds.getCenter(new THREE.Vector3());
  const size = placementBounds.getSize(new THREE.Vector3());

  const dx = hitPoint.x - center.x;
  const dz = hitPoint.z - center.z;
  const clearance = Math.min(size.x, size.z) * 0.35 + 0.5;
  const point = center.clone();
  if (Math.abs(dx) >= Math.abs(dz)) {
    point.x += (Math.sign(dx) || 1) * (size.x / 2 + clearance);
  } else {
    point.z += (Math.sign(dz) || 1) * (size.z / 2 + clearance);
  }

  // terrain height at the chosen spot; fall back to the clicked model's feet
  point.y = placementBounds.min.y;
  const mapRoot = scene.getObjectByName('GameMap');
  if (mapRoot) {
    groundProbe.set(
      new THREE.Vector3(point.x, placementBounds.max.y + 100, point.z),
      new THREE.Vector3(0, -1, 0),
    );
    const ground = groundProbe.intersectObject(mapRoot, true)
      .find((intersect) => intersect.object.visible);
    if (ground) {
      point.y = ground.point.y;
    }
  }
  return point;
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
  customCreations, settings,
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

    // Settings are renderer-construction level (antialias etc.); the host
    // remounts this component (key=settings.rendererKey) when they change,
    // so reading them once at mount is correct.
    const core = new GameEngineCore(settings ?? {});
    coreRef.current = core;
    canvasRef.current = core.mount(mountNode);

    return () => {
      core.dispose();
      coreRef.current = null;
      canvasRef.current = null;
      setAssetsReady(false);
      hasHydratedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- settings applied via remount, not re-run
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
      // Selection boxes are raycastable despite being invisible; placing on
      // a box surface left new models floating in the air.
      const intersects = filterOutSelectionHelpers(
        raycaster.current.intersectObjects(scene.children, true),
      );
      if (intersects.length === 0 || addModel === 'NONE') {
        return;
      }

      // Clicking terrain places at the click; clicking an existing model
      // places beside it on the ground instead of on top of it.
      let placementPoint = intersects[0].point;
      const hitRoot = findModelRoot(intersects[0].object);
      if (hitRoot) {
        placementPoint = adjacentGroundPoint(scene, hitRoot, placementPoint);
      }

      if (isCreationModelId(addModel)) {
        CreationLoader(
          'add',
          addModel,
          placementPoint,
          scene,
          customCreationsRef.current,
        );
      } else {
        ModelLoader(
          'add',
          addModel,
          placementPoint,
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

      const currentMode = modeRef.current;

      switch (currentMode) {
        case Modes.MOVING: {
          const movable = findModelRootFromIntersects(intersects, 'isMovable');
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
          const rotatable = findModelRootFromIntersects(intersects, 'isRotatable')
            ?? findModelRootFromIntersects(intersects, 'isMovable');
          const { selectionBox, moveRoot: root } = resolveMoveSelection(rotatable);
          if (root) {
            root.rotateY(Math.PI / 2);
            updateSelectionBox(root);
            if (selectionBox) {
              showSelectionOutline(selectionBox);
              window.setTimeout(() => hideSelectionOutline(selectionBox), 350);
            }
            updateSceneState();
          }
          break;
        }
        case Modes.PAINTING: {
          // Paint the whole model -- arms, helmet, every part -- exactly
          // like restore-time color application (sceneSchema), and record
          // the color so it persists through save/restore. Resolve from
          // real geometry hits only: the invisible selection boxes are
          // still raycastable and (being whole-model-sized, overlapping
          // neighbours) would repaint whichever box the ray meets first
          // rather than the model the user actually clicked.
          const paintRoot = findModelRootFromIntersects(
            filterOutSelectionHelpers(intersects),
            'isPaintable',
          );
          if (paintRoot) {
            const paintColor = new THREE.Color(parseInt(color, 16));
            paintRoot.userData.color = color;
            paintRoot.traverse((child) => {
              if (child.name === 'transparentBox' || child.name === 'wireframe') {
                return;
              }
              if (child.isMesh && child.isPaintable && child.material?.color) {
                child.material.color.set(paintColor);
              }
            });
            const box = paintRoot.userData?.transparentBox;
            if (box) {
              showSelectionOutline(box);
              window.setTimeout(() => hideSelectionOutline(box), 350);
            }
            updateSceneState();
          }
          break;
        }
        case Modes.DELETING: {
          const deletable = findModelRootFromIntersects(intersects, 'isDeletable');
          if (deletable) {
            const driveId = deletable.userData?.driveId;
            if (driveId) {
              core.cameraController.unregisterSubject(driveId);
            }
            scene.remove(deletable);
            disposeModelInstance(deletable);
            updateSceneState();
          }
          break;
        }
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
      const modelRoot = moveRoot.current;
      if (!modelRoot) {
        return;
      }

      // Follow real surfaces only: ignore the dragged model itself (else it
      // chases a point on its own geometry and creeps toward the camera)
      // and every selection helper (raycastable despite being invisible --
      // dragging across a neighbour's box would pop the model onto it).
      const intersects = filterOutSelectionHelpers(
        raycaster.current.intersectObjects(scene.children, true),
      );
      const groundHit = intersects.find(
        (intersect) => !isInSubtree(intersect.object, modelRoot),
      );
      if (!groundHit) {
        return;
      }

      modelRoot.position.x += (groundHit.point.x - modelRoot.position.x) * DRAG_SMOOTHING;
      modelRoot.position.z += (groundHit.point.z - modelRoot.position.z) * DRAG_SMOOTHING;
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