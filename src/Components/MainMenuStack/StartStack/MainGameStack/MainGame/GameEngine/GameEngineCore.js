import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MapLoader, ModelLoader, SkyBoxLoader, ClimateLoader } from './Loaders/index';
import { applySavedSceneToThree, serializeSceneFromThree } from '../../context/sceneSchema';
import { disposeObject3D, removeSceneChildrenExcept } from './sceneDispose';

export class GameEngineCore {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.frontCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.backCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.controls = null;
    this.mountNode = null;
    this.animationFrameId = null;
    this.frameCallbacks = new Set();
    this.unregisterClimateCallback = null;
    this.loadedMapId = null;
    this.mapData = null;
    this.climateMode = 'SUNNY';
    this.climateParticleSystem = null;
    this.climateInitialized = false;

    this.handleResize = this.handleResize.bind(this);
    this.animate = this.animate.bind(this);
    this.registerFrameCallback = this.registerFrameCallback.bind(this);
  }

  registerFrameCallback(callback) {
    this.frameCallbacks.add(callback);
    return () => {
      this.frameCallbacks.delete(callback);
    };
  }

  mount(mountNode) {
    this.mountNode = mountNode;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    mountNode.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = true;
    this.controls.enablePan = false;
    this.controls.enableDamping = false;
    this.controls.enableRotate = false;
    this.camera.position.set(0, 5, 10);

    window.addEventListener('resize', this.handleResize);
    this.animationFrameId = requestAnimationFrame(this.animate);

    return this.renderer.domElement;
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.controls?.update();
    this.frameCallbacks.forEach((callback) => callback());
    this.renderer.render(this.scene, this.camera);
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  clearClimateFrameCallback() {
    if (this.unregisterClimateCallback) {
      this.unregisterClimateCallback();
      this.unregisterClimateCallback = null;
    }
  }

  setClimate(mapData, climateMode, { force = false } = {}) {
    if (!mapData) {
      return;
    }

    if (this.unregisterClimateCallback) {
      this.unregisterClimateCallback();
      this.unregisterClimateCallback = null;
    }

    SkyBoxLoader(mapData, this.scene, climateMode);
    this.climateParticleSystem = ClimateLoader(
      climateMode,
      this.scene,
      force || this.climateInitialized,
      this.climateParticleSystem,
      (system) => {
        this.climateParticleSystem = system;
      },
      (callback) => {
        this.unregisterClimateCallback = this.registerFrameCallback(callback);
      },
    );
    this.climateMode = climateMode;
    this.climateInitialized = true;
    this.mapData = mapData;
  }

  loadWorld(mapData, { onReady } = {}) {
    if (!mapData) {
      onReady?.();
      return;
    }

    if (this.loadedMapId === mapData.id) {
      onReady?.();
      return;
    }

    removeSceneChildrenExcept(this.scene);
    this.loadedMapId = mapData.id;
    this.mapData = mapData;

    MapLoader(mapData, this.scene, () => {
      ModelLoader(
        'preload',
        null,
        null,
        mapData,
        this.scene,
        () => onReady?.(),
        this.registerFrameCallback,
      );
    });
  }

  hydrateFromSaved(hydrationScene, mapData) {
    if (!hydrationScene) {
      return;
    }

    applySavedSceneToThree(this.scene, this.camera, hydrationScene, {
      restorePlayable: (entry) => {
        ModelLoader(
          'restore',
          entry.modelId,
          entry,
          null,
          this.scene,
          null,
          this.registerFrameCallback,
        );
      },
    });

    if (hydrationScene.climate) {
      this.setClimate(mapData, hydrationScene.climate, { force: true });
    }
  }

  captureFrame() {
    return this.renderer.domElement.toDataURL('image/png');
  }

  getSceneState() {
    return serializeSceneFromThree(this.scene, this.camera, this.climateMode);
  }

  dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.clearClimateFrameCallback();
    this.frameCallbacks.clear();
    window.removeEventListener('resize', this.handleResize);
    this.controls?.dispose();
    this.controls = null;

    [...this.scene.children].forEach((child) => {
      this.scene.remove(child);
      disposeObject3D(child);
    });

    if (this.mountNode?.contains(this.renderer.domElement)) {
      this.mountNode.removeChild(this.renderer.domElement);
    }

    this.renderer.dispose();
    this.mountNode = null;
    this.loadedMapId = null;
    this.mapData = null;
    this.climateParticleSystem = null;
    this.climateInitialized = false;
  }
}