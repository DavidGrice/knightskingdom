import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import LoadingComponent from '../../../../../Common/LoadingComponent/LoadingComponent';

const GameEngine = ({ mapData }) => {
  const mountRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const selectedObject = useRef(null);
  const isDragging = useRef(false);
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  const createSkyBoxCube = (scene) => {
    const skyboxGeometry = new THREE.BoxGeometry(600, 600, 600);
    const texLoader = new THREE.CubeTextureLoader();
    const texturePaths = mapData.skyBoxes.map((skyBox) => [skyBox.filePath]);
    const texture = texLoader.load(
      texturePaths,
      () => console.log('Skybox textures loaded successfully'),
      undefined,
      (error) => console.error('Error loading skybox textures:', error)
    );
    const skyboxMaterial = new THREE.MeshBasicMaterial({
      envMap: texture,
      side: THREE.BackSide
    });
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    skybox.position.set(0, 0, 0);
    skybox.isMovable = false;
    scene.add(skybox);
  };

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040);
    ambientLight.intensity = 50;
    scene.add(ambientLight);
    createSkyBoxCube(scene);

    const loader = new GLTFLoader();
loader.load(
  mapData.filePath,
  (gltf) => {
    const map = gltf.scene;
    map.isMovable = false;
    scene.add(map);
    setModelLoaded(true);
  },
  undefined,
  (error) => {
    console.error('An error occurred while loading the map:', error);
    fetch(mapData.filePath)
      .then(response => response.text())
      .then(text => console.log('Map file content:', text))
      .catch(fetchError => console.error('Error fetching map file:', fetchError));
  }
);

mapData.models.forEach((model) => {
  
  loader.load(
    model.filePath,
    (gltf) => {
      const modelGroup = new THREE.Group();
      modelGroup.add(gltf.scene);
      modelGroup.name = model.name; // Set the name based on model data
      modelGroup.isMovable = false; // Set isMovable based on model data
      // modelGroup.position.set(model.position.x, model.position.y, model.position.z);
      // const box = new THREE.Box3().setFromObject(modelGroup);
      // const boxHelper = new THREE.Box3Helper(box, 0xffff00);
      // boxHelper.isMovable = true;
      // boxHelper.children.push(modelGroup);
      // boxHelper.children.isMovable = false;
      // boxHelper.visible = true;
      // Create a bounding box for the model
      const box = new THREE.Box3().setFromObject(modelGroup);
      const boxSize = new THREE.Vector3();
      box.getSize(boxSize);
      // Create a transparent box
      const boxGeometry = new THREE.BoxGeometry(boxSize.x*2, boxSize.y*2, boxSize.z*2);
      const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.5, wireframe: true });
      const transparentBox = new THREE.Mesh(boxGeometry, boxMaterial);
      transparentBox.children.push(modelGroup);
      transparentBox.isMovable = true;
      transparentBox.children.isMovable = false;
      transparentBox.transparentBox = transparentBox;
      
      // Position the transparent box
      transparentBox.position.set(model.position.x, model.position.y, model.position.z);

      // Add the group to the scene
      scene.add(transparentBox);
    },
    undefined,
    (error) => {
      console.error(`An error occurred while loading the model at ${model.filePath}:`, error);
    }
  );

});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.enablePan = false;
controls.enableDamping = false;
controls.enableRotate = false;
camera.position.z = 10;
camera.position.y = 5;

const onMouseDown = (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    if (intersectedObject.isMovable) {
      selectedObject.current = intersectedObject;
      isDragging.current = true;
    }
  }
};

const onMouseMove = (event) => {
  if (!isDragging.current) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(scene, true);
  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    if (intersectedObject.isMovable) {
      const intersectionPoint = intersects[0].point;

      // Update the x and z coordinates, keep the y coordinate unchanged
      selectedObject.current.position.set(
        intersectionPoint.x,
        selectedObject.current.position.y,
        intersectionPoint.z
      );
      selectedObject.current.children[0].position.set(
        intersectionPoint.x,
        selectedObject.current.position.y,
        intersectionPoint.z
      );

      // // Update the position of the model relative to the transparent box
      // selectedObject.current.children[0].position.set(0, 0, 0);
    }
  }
};

const onMouseUp = () => {
  isDragging.current = false;
  selectedObject.current = null;
};

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const animate = () => {
      if (!modelLoaded) {
        requestAnimationFrame(animate);
        return;
      }
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [mapData, modelLoaded]);

  return (
    <>
      <div ref={mountRef} style={{ display: loading ? 'none' : 'block' }} />
    </>
  );
};

export default GameEngine;