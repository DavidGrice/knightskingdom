import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import LoadingComponent from '../../../../../Common/LoadingComponent/LoadingComponent';
import { MapLoader, ModelLoader, SkyBoxLoader, ClimateLoader } from './Loaders/index';
import { Modes } from './GameEngineResourceStack/index';

const GameEngine = ({ 
                      mapData, 
                      color, 
                      mode, 
                      activeCamera, 
                      isFollowing, 
                      addModel, 
                      selectedClimateMode, 
                      climateNeedsUpdating, 
                      setClimateNeedsUpdating, 
                      cameraNeedsReset, 
                      setCameraNeedsReset,
                      isClimateOpen 
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

  useEffect(() => {
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
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
        if (mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [mapData]);

  useEffect(() => {
    if (cameraNeedsReset) {
      restoreOriginalCamera();
      setCameraNeedsReset(false);
    }
    if (isClimateOpen && climateNeedsUpdating) {
      ClimateLoader(selectedClimateMode, scene, climateNeedsUpdating, currentSystem, setCurrentSystem);
      setClimateNeedsUpdating(false);
      SkyBoxLoader(mapData, scene, selectedClimateMode);
    }
    const onMouseOver = (event) => {
      event.preventDefault();
      if (mode === Modes.NONE || mode === Modes.MOVING) return;
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
    };

    const onMouseClick = (event) => {
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
            // console.log(intersect, 'add');
            const position = intersect.point;
            ModelLoader('add', addModel, position, null, scene);
            break;
          default:
            break;
        }
      }
    };

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

    const onMouseDown = (event) => {
      event.preventDefault();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        console.log(intersects[0].object.parent, 'down');
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
            // console.log(intersectedObject, 'move');
            if (intersectedObject.isMovable) {
              // hideWireframe(intersectedObject);
              selectedObject.current = intersectedObject;
              isDragging.current = true;
              intersectedObject.visible = true;
            }
            break;
          case Modes.ROTATING:
            if (intersectedObject.isRotatable) {
              // console.log(intersectedObject, 'rotate');
              hideWireframe(intersectedObject);
              selectedObject.current = intersectedObject;
              const angle = Math.PI / 2;
              intersectedObject.parent.rotateY(angle);
              showWireframe(intersectedObject);
            }
            break;
          case Modes.PAINTING:
            const filteredIntersects = intersects.filter(intersect => intersect.object.name !== "transparentBox" && intersect.object.name !== "wireframe");
              console.log(intersectedObject, 'paint');
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
            // if (intersectedObject.name === "transparentBox") {
            //   const filteredIntersects = intersects.filter(intersect => intersect.object.name !== "transparentBox");
            //   if (filteredIntersects.length > 0) {
            //     const fileteredIntersectedObject = filteredIntersects[0].object;
            //     if (fileteredIntersectedObject.isPaintable) {
            //       selectedObject.current = fileteredIntersectedObject;
            //       const newColor = new THREE.Color(parseInt(color, 16));
            //       fileteredIntersectedObject.material.color.set(newColor);
            //     }
            //   }
            // }
            break;
          case Modes.DELETING:
            if (intersectedObject.isDeletable) {
              // console.log(intersectedObject, 'delete');
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
            // console.log(intersectedObject, 'action');
            break;
          case Modes.DRIVING:
            if (intersectedObject.isDriveable) {
              console.log(intersectedObject.parent.userData.frontCameraHelper, 'drive');
              saveOriginalCamera();
              setCameraViews(intersectedObject, activeCamera);
            }
            break;
          default:
            break;
        }
      }
    };

    const onMouseMove = (event) => {
      event.preventDefault();
      if (mode === Modes.NONE || mode === Modes.PAINTING) return;
      if (!isDragging.current) return;

      switch (mode) {
        case Modes.MOVING:
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(scene.children, true);
          // console.log(intersects, 'move');
          if (intersects.length > 0) {
            const intersectionPoint = intersects[0].point;
            selectedObject.current.parent.position.set(intersectionPoint.x, selectedObject.current.position.y, intersectionPoint.z);
            selectedObject.current.parent.userData.frontCameraHelper.position.set(intersectionPoint.x, selectedObject.current.position.y, intersectionPoint.z);
            selectedObject.current.parent.userData.backCameraHelper.position.set(intersectionPoint.x, selectedObject.current.position.y, intersectionPoint.z);
            // if (selectedObject.current.children.length > 0) {
            //   selectedObject.current.parent.children.position.set(intersectionPoint.x, selectedObject.current.position.y, intersectionPoint.z);
            // }
          }
          break;
        default:
          break;
      }
    };

    const onMouseUp = (event) => {
      event.preventDefault();
      if (selectedObject.current && selectedObject.current.isMovable) {
        isDragging.current = false;
        selectedObject.current.visible = false;
        selectedObject.current = null;
      }
    };

    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('click', onMouseClick, false);

    return () => {
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('click', onMouseClick);
    };
  }, [mode, color, mapData, scene, camera, renderer, raycaster, mouse, activeCamera, selectedClimateMode, climateNeedsUpdating, currentSystem, cameraNeedsReset, isClimateOpen]);

  return (
    <div ref={mountRef}>{loading && <LoadingComponent />}</div>
  );
};

export default GameEngine;