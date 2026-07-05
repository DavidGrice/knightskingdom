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
import { computeContentBounds } from '../../WorkShop/WorkshopEngine/selectionBox';
import { STUD } from '../../WorkShop/WorkshopEngine/studGrid';
import { ambientSoundsForModel } from '../../shared/characterSounds';
import { playSfx } from '../../shared/audioManager';
import { isPaintTarget, paintMesh, paintableMeshIndex } from '../../shared/paintTargets';
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
// Vertical (shift-drag) sensitivity: world units of Y per pixel of mouse
// travel, mirroring the workshop's shift+drag lift.
const VERTICAL_WORLD_PER_PIXEL = 0.03;
// Collision tolerance so face-touching (stacked bricks, edge-tiled plates)
// isn't a false collision -- matches the workshop's overlap epsilon idea.
const COLLISION_EPS = 0.05;
// Grid models snap to on release/placement (the workshop stud grid).
const snapToGrid = (v) => Math.round(v / STUD) * STUD;

const placementBounds = new THREE.Box3();
const groundProbe = new THREE.Raycaster();

// Scratch objects reused across rotation/collision math (no per-frame alloc.)
const centerBefore = new THREE.Vector3();
const centerAfter = new THREE.Vector3();
const candidateBox = new THREE.Box3();
const dragDelta = new THREE.Vector3();

/** Rotate a model 90deg about its content center so it spins in place
 *  instead of swinging around its off-origin pivot. */
const rotateAroundCenter = (root) => {
  computeContentBounds(root).getCenter(centerBefore);
  root.rotateY(Math.PI / 2);
  root.updateMatrixWorld(true);
  computeContentBounds(root).getCenter(centerAfter);
  root.position.add(centerBefore.sub(centerAfter));
  root.updateMatrixWorld(true);
};

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
  // Drag state for shift-vertical + collision (captured at grab).
  const verticalAnchor = useRef({ clientY: 0, rootY: 0 });
  const shiftVerticalActive = useRef(false);
  const dragContentBox = useRef(new THREE.Box3());
  const dragStartRootPos = useRef(new THREE.Vector3());
  const otherModelBounds = useRef([]);
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

    // Capture the dragged model's content box (== the white wireframe box:
    // both come from computeContentBounds) + every OTHER movable model's
    // box once at grab time. `wasOverlapping` lets objects that spawned
    // already touching still separate (only NEW overlaps block). Full 3D
    // AABB: a character above a plate (disjoint in Y) never blocks, so
    // plates collide with plates while characters still move freely over
    // them -- no ground-plate special-casing needed. COLLISION_EPS shrinks
    // the box so face-touching (stacked/edge-tiled) isn't a false collision.
    const captureCollisionState = (root) => {
      dragContentBox.current.copy(computeContentBounds(root));
      dragStartRootPos.current.copy(root.position);
      const shrunk = dragContentBox.current.clone().expandByScalar(-COLLISION_EPS);
      // Ground plates collide only with other ground plates; everything else
      // (characters, props, buildings) collides only among itself. This is
      // what lets plates stop each other while a character standing on a
      // plate is never blocked by it.
      const draggedIsPlate = Boolean(root.userData?.isGroundPlate);
      const others = [];
      scene.children.forEach((child) => {
        if (child === root || !child.isModel || !child.isMovable) {
          return;
        }
        if (Boolean(child.userData?.isGroundPlate) !== draggedIsPlate) {
          return;
        }
        const box = computeContentBounds(child).clone();
        others.push({ box, wasOverlapping: shrunk.intersectsBox(box) });
      });
      otherModelBounds.current = others;
    };

    // Would the dragged model at absolute position (x,y,z) create a NEW
    // overlap? Translates the grab-time content box by the total delta from
    // the grab position (shrunk by the epsilon).
    const wouldCollideAt = (x, y, z) => {
      const start = dragStartRootPos.current;
      candidateBox.copy(dragContentBox.current)
        .translate(dragDelta.set(x - start.x, y - start.y, z - start.z))
        .expandByScalar(-COLLISION_EPS);
      return otherModelBounds.current.some(
        (entry) => !entry.wasOverlapping && candidateBox.intersectsBox(entry.box),
      );
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
      // Snap the placement to the grid (keep Y from the terrain/adjacency).
      placementPoint = placementPoint.clone();
      placementPoint.x = snapToGrid(placementPoint.x);
      placementPoint.z = snapToGrid(placementPoint.z);

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
            // Shift-drag vertical anchor + collision snapshot.
            verticalAnchor.current = { clientY: event.clientY, rootY: root.position.y };
            shiftVerticalActive.current = event.shiftKey;
            captureCollisionState(root);
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
            rotateAroundCenter(root);
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
          // Paint only the ONE piece the user clicked (an arm, a helmet, one
          // brick), not the whole model. Resolve from real geometry hits only:
          // the invisible selection boxes are still raycastable and would
          // otherwise swallow the click. The painted piece is recorded by its
          // stable mesh index so it survives save/restore (see paintTargets).
          const filtered = filterOutSelectionHelpers(intersects);
          const hitMesh = filtered.find((i) => isPaintTarget(i.object))?.object;
          const paintRoot = hitMesh
            ? findModelRootFromIntersects(filtered, 'isPaintable')
            : null;
          if (hitMesh && paintRoot) {
            paintMesh(hitMesh, color);
            const index = paintableMeshIndex(paintRoot, hitMesh);
            if (index >= 0) {
              paintRoot.userData.paintedMeshes = {
                ...(paintRoot.userData.paintedMeshes || {}),
                [index]: color,
              };
            }
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
      const modelRoot = moveRoot.current;
      if (!modelRoot) {
        return;
      }

      // Shift + drag = vertical (up/down), mirroring the workshop. Freeze
      // X/Z; re-baseline on the first shifted frame so pressing Shift
      // mid-drag works.
      if (event.shiftKey) {
        if (!shiftVerticalActive.current) {
          verticalAnchor.current = { clientY: event.clientY, rootY: modelRoot.position.y };
          shiftVerticalActive.current = true;
        }
        const deltaY = (verticalAnchor.current.clientY - event.clientY) * VERTICAL_WORLD_PER_PIXEL;
        const targetY = Math.max(0, verticalAnchor.current.rootY + deltaY);
        if (!wouldCollideAt(modelRoot.position.x, targetY, modelRoot.position.z)) {
          modelRoot.position.y = targetY;
        }
        return;
      }
      shiftVerticalActive.current = false;

      setMouseFromEvent(event);
      raycaster.current.setFromCamera(mouse.current, camera);
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

      const nextX = modelRoot.position.x + (groundHit.point.x - modelRoot.position.x) * DRAG_SMOOTHING;
      const nextZ = modelRoot.position.z + (groundHit.point.z - modelRoot.position.z) * DRAG_SMOOTHING;
      // Block a move that would newly overlap another model.
      if (!wouldCollideAt(nextX, modelRoot.position.y, nextZ)) {
        modelRoot.position.x = nextX;
        modelRoot.position.z = nextZ;
      }
    };

    const endDrag = () => {
      if (!selectedObject.current) {
        return;
      }
      // Snap XZ to the grid on release (dragging stays smooth). Keep the
      // pre-snap position if the snapped spot would overlap a neighbour.
      const root = moveRoot.current;
      if (root) {
        const snapX = snapToGrid(root.position.x);
        const snapZ = snapToGrid(root.position.z);
        if (!wouldCollideAt(snapX, root.position.y, snapZ)) {
          root.position.x = snapX;
          root.position.z = snapZ;
        }
        updateSelectionBox(root);
      }
      isDragging.current = false;
      shiftVerticalActive.current = false;
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

  // Ambient character sounds: once the world's assets are ready, play a
  // random voice clip from a random on-map character at a randomized
  // interval (~8-20s), mirroring the original's random-interval chatter.
  // Gated by the profile's soundEffects option. One clip at a time.
  useEffect(() => {
    const core = coreRef.current;
    if (!core || !assetsReady || !settings?.soundEffectsEnabled) {
      return undefined;
    }
    const { scene } = core;
    let timer = null;
    let audio = null;
    let stopped = false;

    const playOne = () => {
      const speakers = scene.children.filter(
        (child) => child.isModel && child.visible && ambientSoundsForModel(child).length > 0,
      );
      if (speakers.length === 0) {
        return;
      }
      const root = speakers[Math.floor(Math.random() * speakers.length)];
      const sounds = ambientSoundsForModel(root);
      const url = sounds[Math.floor(Math.random() * sounds.length)];
      // Through the shared audioManager as fire-and-forget SFX: it never
      // touches the music element, so a voice clip can't stop the music.
      audio?.pause();
      audio = playSfx(url, { volume: 0.6 });
    };

    const scheduleNext = () => {
      const delay = 8000 + Math.random() * 12000;
      timer = window.setTimeout(() => {
        if (stopped) {
          return;
        }
        playOne();
        scheduleNext();
      }, delay);
    };
    scheduleNext();

    return () => {
      stopped = true;
      if (timer) {
        window.clearTimeout(timer);
      }
      audio?.pause();
      audio = null;
    };
  }, [assetsReady, settings?.soundEffectsEnabled]);

  return <div ref={mountRef} />;
});

GameEngine.displayName = 'GameEngine';

export default GameEngine;