import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Archer from './MainGameResourceStack/models/archer.gltf';
import Right from './MainGameResourceStack/skyboxes/mountains/right.bmp';
import Left from './MainGameResourceStack/skyboxes/mountains/left.bmp';
import Top from './MainGameResourceStack/skyboxes/mountains/top.bmp';
import Bot from './MainGameResourceStack/skyboxes/mountains/bot.bmp';
import Front from './MainGameResourceStack/skyboxes/mountains/front.bmp';
import Back from './MainGameResourceStack/skyboxes/mountains/back.bmp';

const GameEngine = ({ navigateToStartMenu, map }) => {
  const mountRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    const createSkyBoxCube = () => {
      const skyboxGeometry = new THREE.BoxGeometry(50, 50, 50);
      const l = new THREE.CubeTextureLoader();
      const texture = l.load([
        Right, // positive x
        Left, // negative x
        Top, // positive y
        Bot, // negative y
        Front, // positive z
        Back  // negative z
      ]);
      const skyboxMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
      const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
      scene.add(skybox);
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 'lightblue', side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    scene.add(plane);

    // Add an emissive sphere
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({ color: 'white', emissive: 'red' });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.y = 0.5; // position the sphere above the plane
    scene.add(sphere);

    createSkyBoxCube();

    const loader = new GLTFLoader();
    loader.load(
      Archer,
      (gltf) => {
        scene.add(gltf.scene);
        setModelLoaded(true);
      },
      (error) => {
        console.log(error);
      }
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 10;

    const animate = () => {
      if (!modelLoaded) {
        // If the model isn't loaded yet, schedule the next frame.
        requestAnimationFrame(animate);
        return;
      }

      // Update the scene and schedule the next frame.
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup function
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [modelLoaded]);

  return (
    <div ref={mountRef} />
  );
}

export default GameEngine;