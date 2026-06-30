import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { resolveBrickRecipe, recipeHeight } from './brickCatalog';
import { PLATE_HEIGHT, STUD } from './studGrid';

const gltfLoader = new GLTFLoader();
const glbCache = new Map();

const DEFAULT_COLOR = 0xc91a09;

const studRadius = STUD * 0.18;
const studHeight = PLATE_HEIGHT * 0.85;

const applyColor = (root, colorHex) => {
  const color = new THREE.Color(colorHex ?? DEFAULT_COLOR);
  root.traverse((child) => {
    if (child.isMesh && child.material?.color) {
      child.material = child.material.clone();
      child.material.color.set(color);
    }
  });
};

const createStud = () => {
  const geometry = new THREE.CylinderGeometry(studRadius, studRadius, studHeight, 12);
  const material = new THREE.MeshStandardMaterial({ color: DEFAULT_COLOR });
  const stud = new THREE.Mesh(geometry, material);
  stud.position.y = studHeight / 2;
  stud.castShadow = true;
  return stud;
};

const addStudsToBody = (group, recipe, bodyHeight) => {
  if (recipe.showStuds === false) {
    return;
  }

  const { w, d } = recipe.studs;
  for (let sx = 0; sx < w; sx += 1) {
    for (let sz = 0; sz < d; sz += 1) {
      const stud = createStud();
      stud.position.x = (sx - (w - 1) / 2) * STUD;
      stud.position.z = (sz - (d - 1) / 2) * STUD;
      stud.position.y = bodyHeight + studHeight / 2;
      group.add(stud);
    }
  }
};

const createParametricBrick = (recipe, colorHex) => {
  const { w, d } = recipe.studs;
  const width = w * STUD;
  const depth = d * STUD;
  const height = recipeHeight(recipe);
  const isPlate = recipe.shape === 'PLATE' || recipe.heightPlates === 1;

  const bodyGeometry = new THREE.BoxGeometry(width * 0.96, height * 0.92, depth * 0.96);
  const material = new THREE.MeshStandardMaterial({
    color: colorHex ?? DEFAULT_COLOR,
    roughness: 0.45,
    metalness: 0.05,
  });
  const body = new THREE.Mesh(bodyGeometry, material);
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;

  const group = new THREE.Group();
  group.add(body);

  if (!isPlate) {
    addStudsToBody(group, recipe, height);
  }

  return group;
};

const configureBrickRoot = (root, brickId, recipe) => {
  root.userData.brickId = brickId;
  root.userData.recipe = recipe;
  root.isBrick = true;
  root.isMovable = true;
  root.isRotatable = true;
  root.isDeletable = true;
  root.isPaintable = true;

  root.traverse((child) => {
    child.isMovable = true;
    child.isRotatable = true;
    child.isDeletable = true;
    child.isPaintable = true;
  });
};

const loadGlbBrick = (glbUrl) => {
  if (glbCache.has(glbUrl)) {
    return glbCache.get(glbUrl).then((scene) => scene.clone(true));
  }

  const promise = new Promise((resolve, reject) => {
    gltfLoader.load(
      glbUrl,
      (gltf) => {
        glbCache.set(glbUrl, gltf.scene);
        resolve(gltf.scene.clone(true));
      },
      undefined,
      reject,
    );
  });
  glbCache.set(glbUrl, promise);
  return promise;
};

const alignBrickBottomToOrigin = (root) => {
  const box = new THREE.Box3().setFromObject(root);
  root.position.y -= box.min.y;
};

/**
 * @param {string} brickId
 * @param {{ color?: number | string }} [options]
 */
export const createBrick = async (brickId, options = {}) => {
  const recipe = resolveBrickRecipe(brickId);
  const colorHex = typeof options.color === 'string'
    ? parseInt(options.color, 16)
    : (options.color ?? DEFAULT_COLOR);

  let root;

  if (recipe.shape === 'GLB' && recipe.glbUrl) {
    try {
      root = await loadGlbBrick(recipe.glbUrl);
      applyColor(root, colorHex);
      alignBrickBottomToOrigin(root);
    } catch (error) {
      console.warn(`GLB load failed for ${brickId}, using parametric fallback:`, error);
      root = createParametricBrick(recipe, colorHex);
    }
  } else {
    root = createParametricBrick(recipe, colorHex);
  }

  configureBrickRoot(root, brickId, recipe);
  return root;
};

/**
 * Synchronous parametric create (D1 default path).
 * @param {string} brickId
 * @param {{ color?: number | string }} [options]
 */
export const createBrickSync = (brickId, options = {}) => {
  const recipe = resolveBrickRecipe(brickId);
  const colorHex = typeof options.color === 'string'
    ? parseInt(options.color, 16)
    : (options.color ?? DEFAULT_COLOR);

  const root = createParametricBrick(recipe, colorHex);
  configureBrickRoot(root, brickId, recipe);
  return root;
};

export const paintBrick = (root, colorHex) => {
  const parsed = typeof colorHex === 'string' ? parseInt(colorHex, 16) : colorHex;
  applyColor(root, parsed);
  root.userData.color = typeof colorHex === 'string' ? colorHex : parsed?.toString(16);
};