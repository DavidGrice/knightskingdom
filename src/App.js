import React from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Archer from './models/archer.gltf';
import Right from './background/mountains/right.bmp';
import Left from './background/mountains/left.bmp';
import Top from './background/mountains/top.bmp';
import Bot from './background/mountains/bot.bmp';
import Front from './background/mountains/front.bmp';
import Back from './background/mountains/back.bmp';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { modelLoaded: false };
    this.mountRef = React.createRef();
  }

  componentDidMount() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.mountRef.current.appendChild(renderer.domElement);
    
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

    const backgroundloader = new THREE.CubeTextureLoader();
    const texture = backgroundloader.load([
      Right, // positive x
      Left, // negative x
      Top, // positive y
      Bot, // negative y
      Front, // positive z
      Back  // negative z
    ]);
    scene.background = texture;

    const skyboxGeometry = new THREE.BoxGeometry(50, 50, 50);
    const skyboxMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    scene.add(skybox);

    const loader = new GLTFLoader();
    loader.load(
      Archer,
      (gltf) => {
        scene.add( gltf.scene);
        this.setState({ modelLoaded: true });
      },
      (error) => {
        console.log(error);
      }
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 10;

    const animate = () => {
      if (!this.state.modelLoaded) {
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
  }

  render() {
    return <div ref={this.mountRef} />;
  }
}

export default App;