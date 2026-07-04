import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MapLoader, MapPlacementsLoader, ModelLoader, CreationLoader, SkyBoxLoader, ClimateLoader } from './Loaders/index';
import { animateWeatherSystems } from './Loaders/ClimateLoader';
import { applySavedSceneToThree, serializeSceneFromThree } from '../../context/sceneSchema';
import { disposeObject3D, removeSceneChildrenExcept } from './sceneDispose';
import { CameraController } from './CameraController';

export class GameEngineCore {
  /** @param {object} [settings] resolved profile settings (lib/gameSettings.js) */
  constructor(settings = {}) {
    this.settings = settings;
    this.scene = new THREE.Scene();
    // near=0.3 (was 0.1): depth precision scales with the near plane, and
    // 0.1 left the far half of a ~200-unit map with less resolution than
    // the gap between the terrain's stacked base planes (z-fighting at
    // distance). Nothing legitimately approaches the camera within 0.3.
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.3, 1000);
    this.frontCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.3, 1000);
    this.backCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.3, 1000);
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      alpha: false,
      antialias: settings.antialias ?? false,
    });
    if (settings.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    this.controls = null;
    this.mountNode = null;
    this.animationFrameId = null;
    this.frameCallbacks = new Set();
    this.unregisterWeatherCallback = null;
    this.loadedMapId = null;
    this.mapData = null;
    this.climateMode = 'SUNNY';
    this.climateParticleSystem = null;
    this.climateInitialized = false;
    this.cameraController = new CameraController(this);

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
    this.renderer.setPixelRatio(
      this.settings.useDevicePixelRatio ? window.devicePixelRatio : 1,
    );
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    mountNode.appendChild(this.renderer.domElement);
    // Dev/test-only: lets testing/ scripts and manual debugging inspect the
    // live scene graph without a bespoke introspection API.
    window.__gameScene = this.scene;
    window.__gameCamera = this.camera;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableDamping = false;
    // Orbit/look-around enabled so the whole map -- including the castle
    // across the water -- is reachable (previously rotate was off, which is
    // what "the camera won't let me reach the far side" was). Capability
    // map, chosen so nothing is lost and LEFT stays free for the game tools
    // (move/rotate/paint/delete all use left-mousedown; their handler
    // disables controls mid-drag):
    //   LEFT   -> game tools (OrbitControls ignores it)
    //   RIGHT  -> orbit/look-around (new)
    //   MIDDLE -> pan (moved off RIGHT)
    //   wheel  -> zoom (unchanged)
    this.controls.enableRotate = true;
    this.controls.mouseButtons = {
      LEFT: null,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    this.controls.maxPolarAngle = Math.PI * 0.495; // stay above the ground plane
    this.camera.position.set(0, 5, 10);
    window.__gameControls = this.controls;

    window.addEventListener('resize', this.handleResize);
    this.unregisterWeatherCallback = this.registerFrameCallback(() => {
      animateWeatherSystems(this.scene);
    });
    this.animationFrameId = requestAnimationFrame(this.animate);

    return this.renderer.domElement;
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.cameraController.update();
    this.controls?.update();
    this.frameCallbacks.forEach((callback) => callback());
    this.renderer.render(this.scene, this.camera);
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setClimate(mapData, climateMode, { force = false } = {}) {
    if (!mapData) {
      return;
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
    this.cameraController.clearSubjects();
    this.loadedMapId = mapData.id;
    this.mapData = mapData;

    MapLoader(mapData, this.scene, (_loaded, transform) => {
      MapPlacementsLoader(mapData, transform, this.scene, {
        includeBulk: this.settings.fullPlacements ?? true,
      });
      ModelLoader(
        'preload',
        null,
        null,
        mapData,
        this.scene,
        () => onReady?.(),
        this.cameraController,
      );
    });
  }

  hydrateFromSaved(hydrationScene, mapData, { customCreations } = {}) {
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
          this.cameraController,
        );
      },
      restoreCreation: (entry) => {
        CreationLoader(
          'restore',
          entry,
          entry,
          this.scene,
          customCreations,
        );
      },
    });

    if (hydrationScene.climate) {
      this.setClimate(mapData, hydrationScene.climate, { force: true });
    }
  }

  captureFrame() {
    if (!this.mountNode) {
      return null;
    }
    this.renderer.render(this.scene, this.camera);
    try {
      const dataUrl = this.renderer.domElement.toDataURL('image/png');
      return dataUrl && dataUrl.length > 100 ? dataUrl : null;
    } catch (error) {
      console.error('captureFrame failed:', error);
      return null;
    }
  }

  getSceneState() {
    return serializeSceneFromThree(this.scene, this.camera, this.climateMode);
  }

  dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.unregisterWeatherCallback) {
      this.unregisterWeatherCallback();
      this.unregisterWeatherCallback = null;
    }
    this.frameCallbacks.clear();
    this.cameraController.clearSubjects();
    this.cameraController.exitDrive();
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