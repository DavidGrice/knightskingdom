'use client';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { WorkshopEngineCore } from './WorkshopEngineCore';
import { WorkshopModes } from './workshopModes';
import { resolveBrickRecipe, recipeHeight } from './brickCatalog';
import { getOrientedStuds } from './brickCollision';
import { clampBrickCenterToExport } from './studGrid';
import {
  findBrickFromIntersects,
  findBrickHitFromIntersects,
  findPaintBrickFromIntersects,
  setBrickWireframeVisible,
} from './workshopInteraction';
import styles from './WorkshopEngine.module.css';

const WorkshopEngine = forwardRef(({
  mode,
  selectedBrickId,
  showBucket,
  color,
  workshopDraft,
}, ref) => {
  const mountRef = useRef(null);
  const coreRef = useRef(null);
  const canvasRef = useRef(null);
  const modeRef = useRef(mode);
  const selectedBrickIdRef = useRef(selectedBrickId);
  const showBucketRef = useRef(showBucket);
  const colorRef = useRef(color);
  const selectedObject = useRef(null);
  const dragGroup = useRef([]);
  const isDragging = useRef(false);
  const verticalDragStart = useRef({ clientY: 0, brickY: 0 });
  const shiftVerticalDragActive = useRef(false);
  const mouse = useRef(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());
  const hasHydratedRef = useRef(false);
  const [engineReady, setEngineReady] = useState(false);

  modeRef.current = mode;
  selectedBrickIdRef.current = selectedBrickId;
  showBucketRef.current = showBucket;
  colorRef.current = color;

  useImperativeHandle(ref, () => ({
    clearAllBricks: () => coreRef.current?.clearAllBricks(),
    setDefaultColor: (hex) => coreRef.current?.setDefaultColor(hex),
    getBrickInstances: () => coreRef.current?.getBrickInstances({ forExport: true }) ?? [],
    loadBrickInstances: (instances) => coreRef.current?.loadBrickInstances(instances),
    captureFrame: () => coreRef.current?.captureFrame() ?? null,
  }), []);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) {
      return undefined;
    }

    const core = new WorkshopEngineCore();
    coreRef.current = core;
    canvasRef.current = core.mount(mountNode);
    setEngineReady(true);

    return () => {
      core.dispose();
      coreRef.current = null;
      canvasRef.current = null;
      hasHydratedRef.current = false;
      setEngineReady(false);
    };
  }, []);

  useEffect(() => {
    const core = coreRef.current;
    if (!engineReady || !core || hasHydratedRef.current) {
      return;
    }
    const instances = workshopDraft?.brickInstances;
    if (instances?.length) {
      core.loadBrickInstances(instances);
    }
    hasHydratedRef.current = true;
  }, [engineReady, workshopDraft]);

  useEffect(() => {
    coreRef.current?.setDefaultColor(color);
  }, [color]);

  useEffect(() => {
    const core = coreRef.current;
    const canvas = canvasRef.current;
    if (!core || !canvas) {
      return undefined;
    }

    const { camera } = core;

    const setMouseFromEvent = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const raycast = () => {
      raycaster.current.setFromCamera(mouse.current, camera);
      return raycaster.current.intersectObjects(core.getRaycastTargets(), true);
    };

    const raycastBuildPlate = () => {
      const hits = raycast();
      return hits.find((hit) => hit.object.name === 'BuildPlate') ?? null;
    };

    const onMouseClick = (event) => {
      if (modeRef.current !== WorkshopModes.ADDING) {
        return;
      }
      if (!showBucketRef.current || !selectedBrickIdRef.current) {
        return;
      }
      event.preventDefault();
      setMouseFromEvent(event);

      const hits = raycast();
      const stackHit = findBrickHitFromIntersects(hits);
      if (stackHit) {
        core.stackBrickOn(
          selectedBrickIdRef.current,
          stackHit.brick,
          colorRef.current,
          stackHit.point,
        );
        return;
      }

      const plateHit = raycastBuildPlate();
      if (!plateHit) {
        return;
      }
      core.addBrick(selectedBrickIdRef.current, plateHit.point, colorRef.current);
    };

    const onMouseDown = (event) => {
      event.preventDefault();
      setMouseFromEvent(event);
      const intersects = raycast();
      if (intersects.length === 0) {
        return;
      }

      const currentMode = modeRef.current;

      switch (currentMode) {
        case WorkshopModes.MOVING: {
          const hitBrick = findBrickFromIntersects(intersects);
          if (hitBrick) {
            const group = core.getBrickMoveGroup(hitBrick);
            selectedObject.current = hitBrick;
            dragGroup.current = group;
            isDragging.current = true;
            verticalDragStart.current = {
              clientY: event.clientY,
              brickY: hitBrick.position.y,
            };
            shiftVerticalDragActive.current = event.shiftKey;
            group.forEach((brick) => setBrickWireframeVisible(brick, true));
          }
          break;
        }
        case WorkshopModes.ROTATING: {
          const brick = findBrickFromIntersects(intersects);
          if (brick) {
            const rotated = core.rotateBrick(brick);
            if (rotated) {
              setBrickWireframeVisible(brick, true);
            }
          }
          break;
        }
        case WorkshopModes.PAINTING: {
          const brick = findPaintBrickFromIntersects(intersects);
          if (brick) {
            setBrickWireframeVisible(brick, true);
            core.paintBrickRoot(brick, colorRef.current);
          }
          break;
        }
        case WorkshopModes.DELETING: {
          const brick = findBrickFromIntersects(intersects);
          if (brick) {
            core.removeBrick(brick);
          }
          break;
        }
        case WorkshopModes.DUPLICATING: {
          const brick = findBrickFromIntersects(intersects);
          if (brick) {
            const duplicate = core.duplicateBrick(brick);
            if (duplicate) {
              setBrickWireframeVisible(duplicate, true);
            }
          }
          break;
        }
        default:
          break;
      }
    };

    const VERTICAL_DRAG_PIXELS_PER_STEP = 16;

    const onMouseMove = (event) => {
      if (modeRef.current !== WorkshopModes.MOVING || !isDragging.current || !selectedObject.current) {
        return;
      }
      event.preventDefault();
      const brick = selectedObject.current;

      if (event.shiftKey) {
        if (!shiftVerticalDragActive.current) {
          verticalDragStart.current = {
            clientY: event.clientY,
            brickY: brick.position.y,
          };
          shiftVerticalDragActive.current = true;
        }
        const brickHeight = recipeHeight(resolveBrickRecipe(brick.userData.brickId));
        const deltaY = verticalDragStart.current.clientY - event.clientY;
        const heightSteps = Math.round(deltaY / VERTICAL_DRAG_PIXELS_PER_STEP);
        const targetY = Math.max(0, verticalDragStart.current.brickY + heightSteps * brickHeight);
        core.tryMoveBrickGroup(brick, {
          x: brick.position.x,
          y: targetY,
          z: brick.position.z,
        });
        return;
      }

      shiftVerticalDragActive.current = false;
      setMouseFromEvent(event);
      const plateHit = raycastBuildPlate();
      if (!plateHit) {
        return;
      }
      const { w, d } = getOrientedStuds(brick);
      const clamped = clampBrickCenterToExport(plateHit.point.x, plateHit.point.z, w, d);
      core.tryMoveBrickGroup(brick, {
        x: clamped.x,
        y: brick.position.y,
        z: clamped.z,
      });
    };

    const endDrag = () => {
      if (selectedObject.current) {
        const brick = selectedObject.current;
        core.moveBrickRoot(brick, brick.position);
        dragGroup.current.forEach((groupBrick) => setBrickWireframeVisible(groupBrick, false));
      }
      isDragging.current = false;
      shiftVerticalDragActive.current = false;
      dragGroup.current = [];
      selectedObject.current = null;
    };

    const onMouseUp = (event) => {
      event.preventDefault();
      endDrag();
    };

    const onWindowMouseUp = () => {
      endDrag();
    };

    const removeListeners = () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('click', onMouseClick);
      window.removeEventListener('mouseup', onWindowMouseUp);
    };

    removeListeners();

    switch (mode) {
      case WorkshopModes.ADDING:
        canvas.addEventListener('click', onMouseClick, false);
        break;
      case WorkshopModes.MOVING:
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mouseup', onWindowMouseUp);
        break;
      case WorkshopModes.ROTATING:
      case WorkshopModes.PAINTING:
      case WorkshopModes.DELETING:
      case WorkshopModes.DUPLICATING:
        canvas.addEventListener('mousedown', onMouseDown);
        break;
      default:
        break;
    }

    return () => {
      removeListeners();
      endDrag();
    };
  }, [mode, selectedBrickId, showBucket, color]);

  return <div ref={mountRef} className={styles.engineMount} />;
});

WorkshopEngine.displayName = 'WorkshopEngine';

export default WorkshopEngine;