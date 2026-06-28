import { useEffect, useRef, useState, useImperativeHandle, forwardRef, startTransition } from 'react';
import * as THREE from 'three';
import LoadingComponent from '../../../../../Common/LoadingComponent/LoadingComponent';
import { ModelLoader } from './Loaders/index';
import { Modes } from './GameEngineResourceStack/index';
import { serializeSceneFromThree } from '../../context/sceneSchema';
import { GameEngineCore } from './GameEngineCore';
import { disposeObject3D } from './sceneDispose';

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
  const [loading] = useState(false);
  const selectedObject = useRef(null);
  const isDragging = useRef(false);
  const mouse = useRef(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());
  const originalCameraPosition = useRef(null);
  const originalCameraQuaternion = useRef(null);

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

  useEffect(() => {
    const core = coreRef.current;
    if (!core || !mapData) {
      return;
    }

    hasHydratedRef.current = false;
    setAssetsReady(false);
    core.setClimate(mapData, selectedClimateMode);
    core.loadWorld(mapData, {
      onReady: () => setAssetsReady(true),
    });
  }, [mapData?.id]);

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

    const { scene, camera, frontCamera, backCamera } = core;

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

    const onMouseClick = (event) => {
      if (event.target !== canvasRef.current) {
        return;
      }

      event.preventDefault();
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
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
      if (event.target !== canvasRef.current) {
        return;
      }

      event.preventDefault();
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      if (intersects.length === 0) {
        return;
      }

      const intersectedObject = intersects[0].object.parent;
      const setCameraViews = (driveObject, cameraType) => {
        const frontCameraHelper = driveObject.parent.userData.frontCameraHelper;
        const backCameraHelper = driveObject.parent.userData.backCameraHelper;
        if (cameraType === 'back') {
          camera.position.copy(frontCameraHelper.getWorldPosition(new THREE.Vector3()));
          backCamera.position.copy(backCameraHelper.getWorldPosition(new THREE.Vector3()));
        } else {
          camera.position.copy(backCameraHelper.getWorldPosition(new THREE.Vector3()));
          backCamera.position.copy(frontCameraHelper.getWorldPosition(new THREE.Vector3()));
        }
      };

      switch (mode) {
        case Modes.MOVING:
          if (intersectedObject.isMovable) {
            selectedObject.current = intersectedObject;
            isDragging.current = true;
            intersectedObject.visible = true;
          }
          break;
        case Modes.ROTATING:
          if (intersectedObject.isRotatable) {
            hideWireframe(intersectedObject);
            selectedObject.current = intersectedObject;
            intersectedObject.parent.rotateY(Math.PI / 2);
            showWireframe(intersectedObject);
          }
          break;
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
        case Modes.DRIVING:
          if (intersectedObject.isDriveable) {
            saveOriginalCamera();
            setCameraViews(intersectedObject, activeCamera);
          }
          break;
        default:
          break;
      }

      updateSceneState();
    };

    const onMouseMove = (event) => {
      if (event.target !== canvasRef.current || mode !== Modes.MOVING || !isDragging.current) {
        return;
      }

      event.preventDefault();
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      if (intersects.length > 0 && selectedObject.current) {
        const intersectionPoint = intersects[0].point;
        selectedObject.current.parent.position.set(
          intersectionPoint.x,
          selectedObject.current.position.y,
          intersectionPoint.z,
        );
        selectedObject.current.parent.userData.frontCameraHelper.position.set(
          intersectionPoint.x,
          selectedObject.current.position.y,
          intersectionPoint.z,
        );
        selectedObject.current.parent.userData.backCameraHelper.position.set(
          intersectionPoint.x,
          selectedObject.current.position.y,
          intersectionPoint.z,
        );
      }
    };

    const onMouseUp = (event) => {
      if (event.target !== canvasRef.current) {
        return;
      }

      event.preventDefault();
      if (selectedObject.current?.isMovable) {
        isDragging.current = false;
        selectedObject.current.visible = false;
        selectedObject.current = null;
        updateSceneState();
      }
    };

    const removeAllEventListeners = () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('click', onMouseClick);
    };

    removeAllEventListeners();

    if (cameraNeedsReset) {
      restoreOriginalCamera();
      clearCameraReset();
    }

    switch (mode) {
      case Modes.ADDING:
        window.addEventListener('click', onMouseClick, false);
        break;
      case Modes.MOVING:
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        break;
      case Modes.ROTATING:
      case Modes.PAINTING:
      case Modes.DELETING:
      case Modes.ACTION:
        window.addEventListener('mousedown', onMouseDown);
        break;
      case Modes.DRIVING:
        window.addEventListener('mousedown', onMouseDown);
        break;
      default:
        break;
    }

    return () => {
      removeAllEventListeners();
    };
  }, [
    mode,
    color,
    addModel,
    activeCamera,
    cameraNeedsReset,
    selectedClimateMode,
    setCameraNeedsReset,
    onSceneChange,
  ]);

  return (
    <div ref={mountRef}>
      {loading && <LoadingComponent />}
    </div>
  );
});

GameEngine.displayName = 'GameEngine';

export default GameEngine;