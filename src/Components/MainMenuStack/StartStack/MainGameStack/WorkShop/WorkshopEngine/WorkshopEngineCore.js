import * as THREE from 'three';
import { disposeObject3D } from '../../MainGame/GameEngine/sceneDispose';
import { createBrickSync, paintBrick } from './BrickFactory';
import { resolveBrickRecipe, recipeHeight } from './brickCatalog';
import { brickCollidesWithAny, getOrientedStuds } from './brickCollision';
import { getBrickMoveGroup } from './brickStack';
import { getRecipeStudFootprint, resolveStackPlacement } from './brickStuds';
import {
  BRICK_HEIGHT,
  BUILD_PLATE_SIZE,
  EXPORT_PLATE_SIZE,
  clampBrickCenterToExport,
  footprintWithinExportBounds,
  snapBrickCenterXZ,
  snapPositionForBrick,
  snapYToHeight,
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
    const { w, d } = getOrientedStuds(brick);
    return footprintWithinExportBounds(brick.position.x, brick.position.z, w, d);
  }

  #snapPlacementPoint(point, brickId) {
    const recipe = resolveBrickRecipe(brickId);
    const { w, d } = getRecipeStudFootprint(recipe, 0);
    const clamped = clampBrickCenterToExport(point.x, point.z, w, d);
    return {
      x: clamped.x,
      y: snapYToHeight(point.y ?? 0, recipeHeight(recipe)),
      z: clamped.z,
    };
  }

  #allBricks() {
    return this.bricksGroup.children.filter((child) => child.isBrick);
  }

  #brickCollides(brick, ignore = null) {
    return brickCollidesWithAny(brick, this.#allBricks(), ignore);
  }

  getBrickMoveGroup(hitBrick) {
    if (!hitBrick?.isBrick) {
      return [];
    }
    return getBrickMoveGroup(hitBrick, this.#allBricks());
  }

  tryMoveBrickGroup(anchorBrick, { x, y, z }) {
    if (!anchorBrick?.isBrick) {
      return false;
    }

    const group = getBrickMoveGroup(anchorBrick, this.#allBricks());
    const groupSet = new Set(group);
    const previous = group.map((brick) => brick.position.clone());
    const anchorPrev = anchorBrick.position.clone();

    const recipe = resolveBrickRecipe(anchorBrick.userData.brickId);
    const brickHeight = recipeHeight(recipe);
    const { w, d } = getOrientedStuds(anchorBrick);
    const clamped = clampBrickCenterToExport(x, z, w, d);
    const snapped = snapPositionForBrick({
      x: clamped.x,
      y: snapYToHeight(y ?? anchorBrick.position.y, brickHeight),
      z: clamped.z,
    }, w, d);

    const delta = new THREE.Vector3(
      snapped.x - anchorPrev.x,
      snapped.y - anchorPrev.y,
      snapped.z - anchorPrev.z,
    );

    if (delta.lengthSq() === 0) {
      return true;
    }

    group.forEach((brick) => {
      brick.position.add(delta);
    });

    const outOfBounds = group.some((brick) => !this.#brickWithinExportBounds(brick));
    const collides = group.some((brick) => this.#brickCollides(brick, groupSet));

    if (outOfBounds || collides) {
      group.forEach((brick, index) => {
        brick.position.copy(previous[index]);
      });
      return false;
    }

    return true;
  }

  addBrick(brickId, worldPoint, colorHex, { exactPlacement = false } = {}) {
    if (!brickId || !worldPoint) {
      return null;
    }

    const recipe = resolveBrickRecipe(brickId);
    const placement = exactPlacement
      ? {
        x: worldPoint.x,
        y: snapYToHeight(worldPoint.y ?? 0, recipeHeight(recipe)),
        z: worldPoint.z,
      }
      : this.#snapPlacementPoint(worldPoint, brickId);

    const { w, d } = getRecipeStudFootprint(recipe, 0);
    if (!footprintWithinExportBounds(placement.x, placement.z, w, d)) {
      return null;
    }

    const brick = createBrickSync(brickId, { color: colorHex || this.defaultColor });
    brick.position.set(placement.x, placement.y, placement.z);
    brick.userData.instanceId = `${brickId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    brick.userData.color = (colorHex || this.defaultColor).replace('#', '');

    if (this.#brickCollides(brick)) {
      disposeObject3D(brick);
      return null;
    }

    this.bricksGroup.add(brick);
    return brick;
  }

  stackBrickOn(brickId, baseBrick, colorHex, hitPoint = null) {
    if (!brickId || !baseBrick?.isBrick) {
      return null;
    }

    const placement = resolveStackPlacement(baseBrick, brickId, hitPoint);
    if (!placement) {
      return null;
    }

    return this.addBrick(brickId, placement, colorHex, { exactPlacement: true });
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
      return false;
    }
    brickRoot.rotateY(Math.PI / 2);
    if (this.#brickCollides(brickRoot)) {
      brickRoot.rotateY(-Math.PI / 2);
      return false;
    }
    return true;
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

    if (!this.#brickWithinExportBounds(clone) || this.#brickCollides(clone)) {
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

  trySetBrickPosition(brickRoot, { x, y, z }) {
    if (!brickRoot?.isBrick) {
      return false;
    }

    const recipe = resolveBrickRecipe(brickRoot.userData.brickId);
    const brickHeight = recipeHeight(recipe);
    const { w, d } = getOrientedStuds(brickRoot);
    const clamped = clampBrickCenterToExport(x, z, w, d);
    const snapped = snapPositionForBrick({
      x: clamped.x,
      y: snapYToHeight(y ?? brickRoot.position.y, brickHeight),
      z: clamped.z,
    }, w, d);

    const previous = brickRoot.position.clone();
    brickRoot.position.set(snapped.x, snapped.y, snapped.z);

    if (!this.#brickWithinExportBounds(brickRoot) || this.#brickCollides(brickRoot)) {
      brickRoot.position.copy(previous);
      return false;
    }

    return true;
  }

  moveBrickRoot(brickRoot, worldPoint) {
    if (!brickRoot?.isBrick || !worldPoint) {
      return false;
    }
    return this.tryMoveBrickGroup(brickRoot, {
      x: worldPoint.x,
      y: worldPoint.y ?? brickRoot.position.y,
      z: worldPoint.z,
    });
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
      if (entry.rotation) {
        brick.rotation.set(entry.rotation.x, entry.rotation.y, entry.rotation.z);
      }
      if (entry.position) {
        const loadRecipe = resolveBrickRecipe(entry.brickId);
        const { w, d } = getRecipeStudFootprint(loadRecipe, brick.rotation.y);
        const snapped = snapBrickCenterXZ(entry.position.x, entry.position.z, w, d);
        brick.position.set(snapped.x, entry.position.y, snapped.z);
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