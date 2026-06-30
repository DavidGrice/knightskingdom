import * as THREE from 'three';
import { disposeObject3D } from '../../MainGame/GameEngine/sceneDispose';
import { createBrickSync, paintBrick } from './BrickFactory';
import { resolveBrickRecipe, recipeHeight } from './brickCatalog';
import {
  BRICK_HEIGHT,
  BUILD_PLATE_SIZE,
  EXPORT_HALF,
  EXPORT_PLATE_SIZE,
  clampXZToExportBounds,
  isWithinExportBounds,
  snapPositionToStud,
  snapXZToStud,
  STUD,
} from './studGrid';

export class WorkshopEngineCore {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111111);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.mountNode = null;
    this.animationFrameId = null;
    this.bricksGroup = new THREE.Group();
    this.bricksGroup.name = 'WorkshopBricks';
    this.buildPlate = null;
    this.defaultColor = 'c91a09';

    this.handleResize = this.handleResize.bind(this);
    this.animate = this.animate.bind(this);
  }

  mount(mountNode) {
    this.mountNode = mountNode;
    this.scene.add(this.bricksGroup);
    this.#buildEnvironment();
    this.handleResize();
    mountNode.appendChild(this.renderer.domElement);
    window.addEventListener('resize', this.handleResize);
    this.animationFrameId = requestAnimationFrame(this.animate);
    return this.renderer.domElement;
  }

  #buildEnvironment() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    const key = new THREE.DirectionalLight(0xffffff, 0.85);
    key.position.set(10, 18, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);

    const fill = new THREE.DirectionalLight(0xaaccff, 0.25);
    fill.position.set(-8, 6, -6);

    this.scene.add(ambient, key, fill);

    const plateGeometry = new THREE.PlaneGeometry(BUILD_PLATE_SIZE, BUILD_PLATE_SIZE);
    const plateMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a4a2a,
      roughness: 0.9,
    });
    this.buildPlate = new THREE.Mesh(plateGeometry, plateMaterial);
    this.buildPlate.rotation.x = -Math.PI / 2;
    this.buildPlate.receiveShadow = true;
    this.buildPlate.name = 'BuildPlate';
    this.scene.add(this.buildPlate);

    const grid = new THREE.GridHelper(BUILD_PLATE_SIZE, BUILD_PLATE_SIZE / STUD, 0x3d6b3d, 0x254025);
    grid.position.y = 0.01;
    this.scene.add(grid);

    const exportBorder = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(EXPORT_PLATE_SIZE, EXPORT_PLATE_SIZE)),
      new THREE.LineBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.65 }),
    );
    exportBorder.rotation.x = -Math.PI / 2;
    exportBorder.position.y = 0.02;
    exportBorder.name = 'ExportBounds';
    this.scene.add(exportBorder);
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  }

  handleResize() {
    if (!this.mountNode) {
      return;
    }
    const width = this.mountNode.clientWidth || 800;
    const height = this.mountNode.clientHeight || 600;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  setDefaultColor(colorHex) {
    if (colorHex) {
      this.defaultColor = colorHex.replace('#', '');
    }
  }

  #brickWithinExportBounds(brick) {
    return isWithinExportBounds(brick.position.x, brick.position.z);
  }

  #snapPlacementPoint(point, brickId) {
    const clamped = clampXZToExportBounds(point.x, point.z);
    const snapped = snapXZToStud(clamped.x, clamped.z);
    return {
      x: snapped.x,
      y: point.y ?? 0,
      z: snapped.z,
    };
  }

  addBrick(brickId, worldPoint, colorHex) {
    if (!brickId || !worldPoint) {
      return null;
    }

    const placement = this.#snapPlacementPoint(worldPoint, brickId);
    if (!isWithinExportBounds(placement.x, placement.z)) {
      return null;
    }

    const brick = createBrickSync(brickId, { color: colorHex || this.defaultColor });
    brick.position.set(placement.x, placement.y, placement.z);
    brick.userData.instanceId = `${brickId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    brick.userData.color = (colorHex || this.defaultColor).replace('#', '');

    this.bricksGroup.add(brick);
    return brick;
  }

  stackBrickOn(brickId, baseBrick, colorHex) {
    if (!brickId || !baseBrick?.isBrick) {
      return null;
    }

    const baseRecipe = resolveBrickRecipe(baseBrick.userData.brickId);
    const stackY = baseBrick.position.y + recipeHeight(baseRecipe);
    return this.addBrick(
      brickId,
      { x: baseBrick.position.x, y: stackY, z: baseBrick.position.z },
      colorHex,
    );
  }

  removeBrick(brickRoot) {
    if (!brickRoot?.isBrick) {
      return;
    }
    this.bricksGroup.remove(brickRoot);
    disposeObject3D(brickRoot);
  }

  rotateBrick(brickRoot) {
    if (!brickRoot?.isBrick) {
      return;
    }
    brickRoot.rotateY(Math.PI / 2);
  }

  duplicateBrick(brickRoot) {
    if (!brickRoot?.isBrick) {
      return null;
    }

    const brickId = brickRoot.userData.brickId;
    const recipe = resolveBrickRecipe(brickId);
    const sourceHeight = recipeHeight(recipe);
    const newY = brickRoot.position.y + sourceHeight + BRICK_HEIGHT;

    const clone = createBrickSync(brickId, { color: brickRoot.userData.color || this.defaultColor });
    clone.position.set(brickRoot.position.x, newY, brickRoot.position.z);
    clone.rotation.copy(brickRoot.rotation);
    clone.userData.instanceId = `${brickId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    clone.userData.color = brickRoot.userData.color || this.defaultColor;

    if (!this.#brickWithinExportBounds(clone)) {
      disposeObject3D(clone);
      return null;
    }

    this.bricksGroup.add(clone);
    return clone;
  }

  paintBrickRoot(brickRoot, colorHex) {
    if (!brickRoot?.isBrick) {
      return;
    }
    paintBrick(brickRoot, colorHex);
  }

  moveBrickRoot(brickRoot, worldPoint) {
    if (!brickRoot?.isBrick || !worldPoint) {
      return;
    }
    const clamped = clampXZToExportBounds(worldPoint.x, worldPoint.z);
    const snapped = snapPositionToStud({ x: clamped.x, y: brickRoot.position.y, z: clamped.z });
    brickRoot.position.x = snapped.x;
    brickRoot.position.z = snapped.z;
  }

  clearAllBricks() {
    [...this.bricksGroup.children].forEach((child) => {
      this.bricksGroup.remove(child);
      disposeObject3D(child);
    });
  }

  getRaycastTargets() {
    return [this.buildPlate, ...this.bricksGroup.children];
  }

  getBrickInstances({ forExport = false } = {}) {
    return this.bricksGroup.children
      .filter((brick) => !forExport || this.#brickWithinExportBounds(brick))
      .map((brick) => ({
        instanceId: brick.userData.instanceId,
        brickId: brick.userData.brickId,
        position: { x: brick.position.x, y: brick.position.y, z: brick.position.z },
        rotation: { x: brick.rotation.x, y: brick.rotation.y, z: brick.rotation.z },
        color: brick.userData.color || this.defaultColor,
      }));
  }

  loadBrickInstances(instances = []) {
    this.clearAllBricks();
    instances.forEach((entry) => {
      if (!entry?.brickId) {
        return;
      }
      const brick = createBrickSync(entry.brickId, { color: entry.color || this.defaultColor });
      if (entry.position) {
        brick.position.set(entry.position.x, entry.position.y, entry.position.z);
      }
      if (entry.rotation) {
        brick.rotation.set(entry.rotation.x, entry.rotation.y, entry.rotation.z);
      }
      brick.userData.instanceId = entry.instanceId
        || `${entry.brickId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      brick.userData.color = (entry.color || this.defaultColor).replace?.('#', '')
        || entry.color
        || this.defaultColor;
      this.bricksGroup.add(brick);
    });
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
      console.error('Workshop captureFrame failed:', error);
      return null;
    }
  }

  dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('resize', this.handleResize);
    this.clearAllBricks();
    this.scene.remove(this.bricksGroup);

    [...this.scene.children].forEach((child) => {
      this.scene.remove(child);
      disposeObject3D(child);
    });

    if (this.mountNode?.contains(this.renderer.domElement)) {
      this.mountNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
    this.mountNode = null;
    this.buildPlate = null;
  }
}