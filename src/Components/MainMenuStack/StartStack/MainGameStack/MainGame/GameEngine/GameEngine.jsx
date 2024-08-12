import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import LoadingComponent from '../../../../../Common/LoadingComponent/LoadingComponent';
import { MapLoader, ModelLoader, SkyBoxLoader } from './Loaders/index';
import { type } from '@testing-library/user-event/dist/type';

const Modes = {
  NONE: 'NONE',
  MOVING: 'MOVING',
  ROTATING: 'ROTATING',
  PAINTING: 'PAINTING',
  DELETING: 'DELETING',
  ACTION: 'ACTION',
  DRIVING: 'DRIVING',
  PLAYING: 'PLAYING',
};

const GameEngine = ({ mapData, color, mode, activeCamera, isFollowing }) => {
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

  useEffect(() => {
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
      renderer.setSize(window.innerWidth, window.innerHeight);

      const ambientLight = new THREE.AmbientLight(0x404040);
      ambientLight.intensity = 50;
      scene.add(ambientLight);

      if (!modelsLoaded.current) {
        SkyBoxLoader(mapData, scene);
        MapLoader(mapData, scene, () => setModelLoaded(true));
        ModelLoader(mapData, scene);
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

  // Handle hover functionality
  // Handle different modes
  useEffect(() => {
    if (!isFollowing) {
      restoreOriginalCamera();
    }
    const onMouseOver = (event) => {
      event.preventDefault();
      if (mode === Modes.NONE || mode === Modes.MOVING) return;
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        selectedObject.current = intersectedObject;
      } else {
        selectedObject.current = null;
      }
    };
  
    const onMouseDown = (event) => {
      event.preventDefault();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      const transparentBox = scene.userData.transparentBox;
      const filteredIntersects = intersects.filter(intersect => intersect.object !== transparentBox);
      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const fileteredIntersectedObject = filteredIntersects[0].object;
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
            console.log(intersectedObject, 'move');
            if (intersectedObject.isMovable) {
              selectedObject.current = intersectedObject;
              isDragging.current = true;
              intersectedObject.visible = true;
            }
            break;
          case Modes.ROTATING:
            if (intersectedObject.isRotatable) {
              console.log(intersectedObject, 'rotate');
              selectedObject.current = intersectedObject;
              const angle = Math.PI / 2;
              intersectedObject.parent.rotateY(angle);
            }
            break;
          case Modes.PAINTING:
            if (fileteredIntersectedObject.isPaintable) {
              selectedObject.current = fileteredIntersectedObject;
              const newColor = new THREE.Color(parseInt(color, 16));
              fileteredIntersectedObject.material.color.set(newColor);
            }
            break;
            case Modes.DELETING:
              if (intersectedObject.isDeletable) {
                console.log(intersectedObject, 'delete');
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
              console.log(intersectedObject, 'action');
              break;
            case Modes.DRIVING:
              // Position the front and back cameras relative to the selected object
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
          if (intersects.length > 0) {
            const intersectionPoint = intersects[0].point;
            selectedObject.current.parent.position.set(intersectionPoint.x, selectedObject.current.position.y, intersectionPoint.z);
            if (selectedObject.current.children.length > 0) {
              selectedObject.current.children.position.set(intersectionPoint.x, selectedObject.current.position.y, intersectionPoint.z);
            }
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
  
    return () => {
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [mode, color, mapData, scene, camera, renderer, raycaster, mouse, activeCamera]);
  
  return (
  <div ref={mountRef}>{loading && <LoadingComponent />}
  </div>
  )
};

export default GameEngine;