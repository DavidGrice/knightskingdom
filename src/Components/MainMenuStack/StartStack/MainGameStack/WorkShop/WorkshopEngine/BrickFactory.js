import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { resolveBrickRecipe, recipeHeight } from './brickCatalog';
import { PLATE_HEIGHT, STUD } from './studGrid';

const gltfLoader = new GLTFLoader();
const glbCache = new Map();

const DEFAULT_COLOR = 0xc91a09;

const studRadius = STUD * 0.18;
const studHeight = PLATE_HEIGHT * 0.85;

const createMaterial = (colorHex) => new THREE.MeshStandardMaterial({
  color: colorHex ?? DEFAULT_COLOR,
  roughness: 0.45,
  metalness: 0.05,
});

const applyColor = (root, colorHex) => {
  const color = new THREE.Color(colorHex ?? DEFAULT_COLOR);
  root.traverse((child) => {
    if (child.isMesh && child.material?.color) {
      child.material = child.material.clone();
      child.material.color.set(color);
    }
  });
};

const createStud = (material) => {
  const geometry = new THREE.CylinderGeometry(studRadius, studRadius, studHeight, 12);
  const stud = new THREE.Mesh(geometry, material);
  stud.position.y = studHeight / 2;
  stud.castShadow = true;
  return stud;
};

const addStudsToBody = (group, recipe, bodyHeight, material) => {
  if (recipe.showStuds === false || recipe.shape === 'TILE') {
    return;
  }

  const { w, d } = recipe.studs;
  for (let sx = 0; sx < w; sx += 1) {
    for (let sz = 0; sz < d; sz += 1) {
      const stud = createStud(material);
      stud.position.x = (sx - (w - 1) / 2) * STUD;
      stud.position.z = (sz - (d - 1) / 2) * STUD;
      stud.position.y = bodyHeight + studHeight / 2;
      group.add(stud);
    }
  }
};

const createBoxBody = (recipe, material) => {
  const { w, d } = recipe.studs;
  const width = w * STUD;
  const depth = d * STUD;
  const height = recipeHeight(recipe);
  const bodyGeometry = new THREE.BoxGeometry(width * 0.96, height * 0.92, depth * 0.96);
  const body = new THREE.Mesh(bodyGeometry, material);
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  return { body, height, group: new THREE.Group() };
};

const createSlopeBrick = (recipe, colorHex) => {
  const material = createMaterial(colorHex);
  const { w, d } = recipe.studs;
  const width = w * STUD;
  const depth = d * STUD;
  const height = recipeHeight(recipe);
  const group = new THREE.Group();

  const profile = new THREE.Shape();
  profile.moveTo(0, 0);
  profile.lineTo(depth * 0.96, 0);
  profile.lineTo(depth * 0.96, height);
  profile.closePath();

  const geometry = new THREE.ExtrudeGeometry(profile, {
    depth: width * 0.96,
    bevelEnabled: false,
  });
  geometry.rotateY(-Math.PI / 2);
  geometry.translate(-width / 2, 0, -depth / 2);

  const ramp = new THREE.Mesh(geometry, material);
  ramp.castShadow = true;
  ramp.receiveShadow = true;
  group.add(ramp);
  addStudsToBody(group, recipe, height, material);
  return group;
};

const createCylinderBrick = (recipe, colorHex) => {
  const material = createMaterial(colorHex);
  const height = recipeHeight(recipe);
  const radius = Math.min(recipe.studs.w, recipe.studs.d) * STUD * 0.42;
  const geometry = new THREE.CylinderGeometry(radius, radius, height * 0.92, 20);
  const body = new THREE.Mesh(geometry, material);
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;

  const group = new THREE.Group();
  group.add(body);
  if (recipe.heightPlates >= 3) {
    addStudsToBody(group, { ...recipe, studs: { w: 1, d: 1 } }, height, material);
  }
  return group;
};

const createArchBrick = (recipe, colorHex) => {
  const material = createMaterial(colorHex);
  const { w, d } = recipe.studs;
  const width = w * STUD;
  const depth = d * STUD;
  const height = recipeHeight(recipe);
  const group = new THREE.Group();

  const pillarW = Math.max(STUD * 0.35, width * 0.2);
  const pillarH = height * 0.65;
  const pillarGeom = new THREE.BoxGeometry(pillarW, pillarH, depth * 0.9);

  const left = new THREE.Mesh(pillarGeom, material);
  left.position.set(-width * 0.32, pillarH / 2, 0);
  const right = new THREE.Mesh(pillarGeom, material);
  right.position.set(width * 0.32, pillarH / 2, 0);

  const archRadius = width * 0.28;
  const archGeom = new THREE.TorusGeometry(archRadius, STUD * 0.18, 8, 12, Math.PI);
  const arch = new THREE.Mesh(archGeom, material);
  arch.position.y = pillarH + archRadius * 0.15;
  arch.rotation.x = Math.PI / 2;
  arch.rotation.z = Math.PI;

  group.add(left, right, arch);
  addStudsToBody(group, recipe, height, material);
  return group;
};

const createCompositeBrick = (recipe, colorHex) => {
  const material = createMaterial(colorHex);
  const { w, d } = recipe.studs;
  const width = w * STUD;
  const depth = d * STUD;
  const height = recipeHeight(recipe);
  const group = new THREE.Group();

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.96, height * 0.96, depth * 0.96),
    material,
  );
  frame.position.y = height / 2;
  frame.castShadow = true;
  group.add(frame);

  if (height > PLATE_HEIGHT * 3) {
    const insetMat = createMaterial(0x223355);
    const inset = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.55, height * 0.45, depth * 0.4),
      insetMat,
    );
    inset.position.y = height * 0.55;
    group.add(inset);
  }

  addStudsToBody(group, recipe, height, material);
  return group;
};

const createParametricBrick = (recipe, colorHex) => {
  const material = createMaterial(colorHex);

  switch (recipe.shape) {
    case 'SLOPE':
      return createSlopeBrick(recipe, colorHex);
    case 'CYLINDER':
      return createCylinderBrick(recipe, colorHex);
    case 'ARCH':
      return createArchBrick(recipe, colorHex);
    case 'COMPOSITE':
      return createCompositeBrick(recipe, colorHex);
    case 'TILE':
    case 'PLATE':
    case 'BOX':
    default: {
      const { body, height, group } = createBoxBody(recipe, material);
      group.add(body);
      const showStuds = recipe.shape !== 'TILE' && recipe.showStuds !== false;
      if (showStuds && (recipe.shape !== 'PLATE' && recipe.heightPlates !== 1)) {
        addStudsToBody(group, recipe, height, material);
      }
      return group;
    }
  }
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
    const cached = glbCache.get(glbUrl);
    if (cached instanceof Promise) {
      return cached.then((scene) => scene.clone(true));
    }
    return Promise.resolve(cached.clone(true));
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