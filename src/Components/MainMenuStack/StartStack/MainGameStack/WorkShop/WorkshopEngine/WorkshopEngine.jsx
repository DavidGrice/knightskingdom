'use client';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import * as THREE from 'three';
import { WorkshopEngineCore } from './WorkshopEngineCore';
import { WorkshopModes } from './workshopModes';
import { snapXZToStud } from './studGrid';
import styles from './WorkshopEngine.module.css';

const DRAG_SMOOTHING = 0.4;

const findBrickRoot = (object) => {
  let node = object;
  while (node) {
    if (node.isBrick) {
      return node;
    }
    node = node.parent;
  }
  return null;
};

const WorkshopEngine = forwardRef(({
  mode,
  selectedBrickId,
  color,
}, ref) => {
  const mountRef = useRef(null);
  const coreRef = useRef(null);
  const canvasRef = useRef(null);
  const modeRef = useRef(mode);
  const selectedBrickIdRef = useRef(selectedBrickId);
  const colorRef = useRef(color);
  const selectedObject = useRef(null);
  const isDragging = useRef(false);
  const mouse = useRef(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());

  modeRef.current = mode;
  selectedBrickIdRef.current = selectedBrickId;
  colorRef.current = color;

  useImperativeHandle(ref, () => ({
    clearAllBricks: () => coreRef.current?.clearAllBricks(),
    setDefaultColor: (hex) => coreRef.current?.setDefaultColor(hex),
    getBrickInstances: () => coreRef.current?.getBrickInstances() ?? [],
  }), []);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) {
      return undefined;
    }

    const core = new WorkshopEngineCore();
    coreRef.current = core;
    canvasRef.current = core.mount(mountNode);

    return () => {
      core.dispose();
      coreRef.current = null;
      canvasRef.current = null;
    };
  }, []);

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
      return raycaster.current.intersectObjects(core.getRaycastTargets(), false);
    };

    const raycastBuildPlate = () => {
      const hits = raycast();
      return hits.find((hit) => hit.object.name === 'BuildPlate') ?? null;
    };

    const onMouseClick = (event) => {
      if (modeRef.current !== WorkshopModes.ADDING) {
        return;
      }
      event.preventDefault();
      setMouseFromEvent(event);
      const plateHit = raycastBuildPlate();
      if (!plateHit || !selectedBrickIdRef.current) {
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

      const brick = findBrickRoot(intersects[0].object);
      const currentMode = modeRef.current;

      switch (currentMode) {
        case WorkshopModes.MOVING:
          if (brick) {
            selectedObject.current = brick;
            isDragging.current = true;
          }
          break;
        case WorkshopModes.ROTATING:
          if (brick) {
            core.rotateBrick(brick);
          }
          break;
        case WorkshopModes.PAINTING:
          if (brick) {
            core.paintBrickRoot(brick, colorRef.current);
          }
          break;
        case WorkshopModes.DELETING:
          if (brick) {
            core.removeBrick(brick);
          }
          break;
        case WorkshopModes.DUPLICATING:
          if (brick) {
            core.duplicateBrick(brick);
          }
          break;
        default:
          break;
      }
    };

    const onMouseMove = (event) => {
      if (modeRef.current !== WorkshopModes.MOVING || !isDragging.current || !selectedObject.current) {
        return;
      }
      event.preventDefault();
      setMouseFromEvent(event);
      const plateHit = raycastBuildPlate();
      if (!plateHit) {
        return;
      }
      const point = plateHit.point;
      const brick = selectedObject.current;
      brick.position.x += (point.x - brick.position.x) * DRAG_SMOOTHING;
      brick.position.z += (point.z - brick.position.z) * DRAG_SMOOTHING;
    };

    const endDrag = () => {
      if (selectedObject.current) {
        const snapped = snapXZToStud(
          selectedObject.current.position.x,
          selectedObject.current.position.z,
        );
        selectedObject.current.position.x = snapped.x;
        selectedObject.current.position.z = snapped.z;
      }
      isDragging.current = false;
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
  }, [mode, selectedBrickId, color]);

  return <div ref={mountRef} className={styles.engineMount} />;
});

WorkshopEngine.displayName = 'WorkshopEngine';

export default WorkshopEngine;