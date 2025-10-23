import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import LoadingComponent from '../../../../../Common/LoadingComponent/LoadingComponent';
import { MapLoader, ModelLoader, SkyBoxLoader, ClimateLoader } from './Loaders/index';
import { Modes } from './GameEngineResourceStack/index';

const GameEngine = ({ 
                      mapData, color, mode, activeCamera, isFollowing, addModel, 
                      selectedClimateMode, climateNeedsUpdating, setClimateNeedsUpdating, 
                      cameraNeedsReset, setCameraNeedsReset, isClimateOpen, setIntermediateMapData
                    }) => {
  const mountRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const selectedObject = useRef(null);
  const isDragging = useRef(false);
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const modelsLoaded = useRef(false); // Track if models are loaded
  const [originalCameraPosition, setOriginalCameraPosition] = useState(null);
  const [originalCameraQuaternion, setOriginalCameraQuaternion] = useState(null);
  const [climateLoaded, setClimateLoaded] = useState(false);
  const [currentSystem, setCurrentSystem] = useState(null);
  const canvasRef = useRef(null);

  const saveOriginalCamera = () => {
    if (!originalCameraPosition && !originalCameraQuaternion) {
      setOriginalCameraPosition(camera.position.clone());
      setOriginalCameraQuaternion(camera.quaternion.clone());
    }
  };

  const restoreOriginalCamera = () => {
    if (originalCameraPosition && originalCameraQuaternion) {
      camera.position.copy(originalCameraPosition);
      camera.quaternion.copy(originalCameraQuaternion);
    }
  };

  // Initialize scene, camera, and renderer
  const scene = useRef(new THREE.Scene()).current;
  const camera = useRef(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)).current;
  const frontCamera = useRef(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)).current;
  const backCamera = useRef(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)).current;
  const renderer = useRef(new THREE.WebGLRenderer()).current;
  // const updateClimate = SkyBoxLoader(mapData, scene, selectedClimateMode);
  canvasRef.current = renderer.domElement;
  // Apply styles to the canvas
  // if (canvasRef.current) {
  //   canvasRef.current.style.border = '2px solid black';
  //   canvasRef.current.style.borderRadius = '10px';
  //   canvasRef.current.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  // }

  useEffect(() => {
    const mountNode = mountRef.current;
  
    if (mountNode) {
      mountNode.appendChild(renderer.domElement);
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (!climateLoaded) {
        SkyBoxLoader(mapData, scene, selectedClimateMode);
        ClimateLoader(selectedClimateMode, scene);
        setClimateLoaded(true);
      }
      if (!modelsLoaded.current) {
        MapLoader(mapData, scene, () => setModelLoaded(true));
        ModelLoader('preload', null, null, mapData, scene);
        modelsLoaded.current = true; // Mark models as loaded
      }
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = true;
      controls.enablePan = false;
      controls.enableDamping = false;
      controls.enableRotate = false;
      camera.position.z = 10;
      camera.position.y = 5;
  
      const animate = () => {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };
      animate();
  
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
  
      window.addEventListener('resize', handleResize);
  
      return () => {
        window.removeEventListener('resize', handleResize);
        mountNode.removeChild(renderer.domElement);
      };
    }
    }, [camera, climateLoaded, mapData, renderer, scene, selectedClimateMode]);

  

  useEffect(() => {
    const updateIntermediateMapData = () => {
      const newIntermediateMapData = [];

      scene.children.forEach((child) => {
        newIntermediateMapData.push({ child: child });
      });

      const cameraData = {
        position: camera.position,
        quaternion: camera.quaternion,
        rotation: camera.rotation,
        far: camera.far,
        near: camera.near,
        scale: camera.scale,
        zoom: camera.zoom,
      };

      newIntermediateMapData.push({ camera: cameraData });
      setIntermediateMapData(newIntermediateMapData);
    };

    //region Event Listeners
    const onMouseOver = (event) => {
      if (event.target !== canvasRef.current) {
        return;
    }
      event.preventDefault();
      if (mode === Modes.NONE || mode === Modes.MOVING) return;
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        console.log(mouse, 'over');
    };

    const onMouseClick = (event) => {
      if (event.target !== canvasRef.current) {
          return;
      }

      event.preventDefault();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
          const intersect = intersects[0];
          switch (mode) {
              case Modes.ADDING:
                  if (addModel === 'NONE') {
                      return;
                  }
                  const position = intersect.point;
                  ModelLoader('add', addModel, position, null, scene);
                  updateIntermediateMapData();
                  break;
              default:
                  break;
          }
      }
    };

    const onMouseDown = (event) => {
      if (event.target !== canvasRef.current) {
        return;
    }
      event.preventDefault();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
          const intersectedObject = intersects[0].object.parent;
          const setCameraViews = (intersectedObject, activeCamera) => {
              const frontCameraHelper = intersectedObject.parent.userData.frontCameraHelper;
              const backCameraHelper = intersectedObject.parent.userData.backCameraHelper;
              if (activeCamera === 'back') {
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
                      const angle = Math.PI / 2;
                      intersectedObject.parent.rotateY(angle);
                      showWireframe(intersectedObject);
                  }
                  break;
              case Modes.PAINTING:
                  const filteredIntersects = intersects.filter(intersect => intersect.object.name !== "transparentBox" && intersect.object.name !== "wireframe");
                  if (filteredIntersects.length > 0) {
                      const fileteredIntersectedObject = filteredIntersects[0].object;
                      if (fileteredIntersectedObject.isPaintable) {
                          hideWireframe(fileteredIntersectedObject);
                          selectedObject.current = fileteredIntersectedObject;
                          const newColor = new THREE.Color(parseInt(color, 16));
                          fileteredIntersectedObject.material.color.set(newColor);
                          showWireframe(fileteredIntersectedObject);
                      }
                  }
                  break;
              case Modes.DELETING:
                  if (intersectedObject.isDeletable) {
                      scene.remove(intersectedObject.parent);
                      intersectedObject.traverse((child) => {
                          if (child.geometry) child.geometry.dispose();
                          if (child.material) {
                              if (Array.isArray(child.material)) {
                                  child.material.forEach((material) => material.dispose());
                              } else {
                                  child.material.dispose();
                              }
                          }
                      });
                  }
                  break;
              case Modes.ACTION:
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
      }
      updateIntermediateMapData();
    };

    const onMouseMove = (event) => {
      if (event.target !== canvasRef.current) {
        return;
    }
      event.preventDefault();
      if (mode === Modes.NONE || mode === Modes.PAINTING) return;
      if (!isDragging.current) return;

      switch (mode) {
          case Modes.MOVING:
              mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
              mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
              raycaster.setFromCamera(mouse, camera);
              const intersects = raycaster.intersectObjects(scene.children, true);
              if (intersects.length > 0) {
                  const intersectionPoint = intersects[0].point;
                  selectedObject.current.parent.position.set(intersectionPoint.x, selectedObject.current.position.y, intersectionPoint.z);
                  selectedObject.current.parent.userData.frontCameraHelper.position.set(intersectionPoint.x, selectedObject.current.position.y, intersectionPoint.z);
                  selectedObject.current.parent.userData.backCameraHelper.position.set(intersectionPoint.x, selectedObject.current.position.y, intersectionPoint.z);
              }
              break;
          default:
              break;
      }
    };

    const onMouseUp = (event) => {
      if (event.target !== canvasRef.current) {
        return;
    }
      event.preventDefault();
      if (selectedObject.current && selectedObject.current.isMovable) {
          isDragging.current = false;
          selectedObject.current.visible = false;
          selectedObject.current = null;
          updateIntermediateMapData();
      }
    };

    const removeAllEventListeners = () => {
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('click', onMouseClick);
  };
    //endregion

    //region Helper Functions
    const hideWireframe = (object) => {
      const wireframe = object.getObjectByName("wireframe");
      if (wireframe) {
        wireframe.visible = false;
      }
    };
    
    const showWireframe = (object) => {
      const wireframe = object.getObjectByName("wireframe");
      if (wireframe) {
        wireframe.visible = true;
      }
    };
    //endregion
    removeAllEventListeners();
  
    if (cameraNeedsReset) {
      restoreOriginalCamera();
      setCameraNeedsReset(false);
    }
    if (isClimateOpen && climateNeedsUpdating) {
      ClimateLoader(selectedClimateMode, scene, climateNeedsUpdating, currentSystem, setCurrentSystem);
      setClimateNeedsUpdating(false);
      SkyBoxLoader(mapData, scene, selectedClimateMode);
      updateIntermediateMapData();
    }
    // Add necessary event listeners based on the current mode
    switch (mode) {
      case Modes.NONE:
        break;
      case Modes.ADDING:
        window.addEventListener('click', onMouseClick, false);
        if (cameraNeedsReset) {
          restoreOriginalCamera();
          setCameraNeedsReset(false);
        }
        break;
      case Modes.MOVING:
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        if (cameraNeedsReset) {
          restoreOriginalCamera();
          setCameraNeedsReset(false);
        }
        break;
      case Modes.ROTATING:
        window.addEventListener('mousedown', onMouseDown);
        if (cameraNeedsReset) {
          restoreOriginalCamera();
          setCameraNeedsReset(false);
        }
        break;
      case Modes.PAINTING:
        window.addEventListener('mousedown', onMouseDown);
        if (cameraNeedsReset) {
          restoreOriginalCamera();
          setCameraNeedsReset(false);
        }
        break;
      case Modes.DELETING:
        window.addEventListener('mousedown', onMouseDown);
        if (cameraNeedsReset) {
          restoreOriginalCamera();
          setCameraNeedsReset(false);
        }
        break;
      case Modes.ACTION:
        window.addEventListener('mousedown', onMouseDown);
        if (cameraNeedsReset) {
          restoreOriginalCamera();
          setCameraNeedsReset(false);
        }
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
    mode, color, mapData, scene, camera, renderer, raycaster, mouse, activeCamera, 
    selectedClimateMode, climateNeedsUpdating, currentSystem, cameraNeedsReset, 
    isClimateOpen, setCameraNeedsReset, setClimateNeedsUpdating, setIntermediateMapData
  ]);

  return (
    <div ref={mountRef}>
      {loading && <LoadingComponent />}
    </div>
  );
};

export default GameEngine;