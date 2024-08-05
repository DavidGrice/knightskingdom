// src/components/MainMenuStack/StartStack/MainGameStack/MainGame/GameEngine/GameEngine.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Archer from './GameEngineResourceStack/models/archer.gltf';
import Right from './GameEngineResourceStack/skyboxes/mountains/right.bmp';
import Left from './GameEngineResourceStack/skyboxes/mountains/left.bmp';
import Top from './GameEngineResourceStack/skyboxes/mountains/top.bmp';
import Bot from './GameEngineResourceStack/skyboxes/mountains/bot.bmp';
import Front from './GameEngineResourceStack/skyboxes/mountains/front.bmp';
import Back from './GameEngineResourceStack/skyboxes/mountains/back.bmp';

const GameEngine = ({ navigateToStartMenu, map }) => {
  const mountRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

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

    createSkyBoxCube();

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      // Clean up resources
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
      // scene.dispose();
    };
  }, []);

  return <div ref={mountRef}></div>;
};

export default GameEngine;