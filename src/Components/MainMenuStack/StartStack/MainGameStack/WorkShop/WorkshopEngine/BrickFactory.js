import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {
  loadObjMtl,
  preloadObjMtlAssets,
} from '../../shared/objMtlLoader';
import { getGameModelSync, loadGameModel } from '../../shared/gameModelLoader';
import { resolveBrickRecipe, recipeHeight } from './brickCatalog';
import {
  attachSelectionBox,
  centerGroupContentsXZ,
  computeContentBounds,
  updateSelectionBox,
} from './selectionBox';
import { PLATE_HEIGHT, STUD } from './studGrid';

export { attachSelectionBox, updateSelectionBox };

const gltfLoader = new GLTFLoader();
const glbCache = new Map();

// Authentic LEGO yellow (palette glit018 = 0.9176,0.7529,0 -> #EAC000), the
// colour the real brick OBJs carry in their own MTL and the bucket previews
// show. Was 0xc91a09 (red), which the old force-recolour applied to every
// placed brick.
const DEFAULT_COLOR = 0xeac000;

const studRadius = STUD * 0.18;
const studHeight = PLATE_HEIGHT * 0.85;

// Colours flow through the workshop as bare 6-hex strings ('eac000') from
// the palette + saved drafts. THREE.Color parses those as WHITE (it needs a
// '#' or a number), which silently broke every non-default paint. Normalise
// once here.
const toThreeColor = (colorHex) => {
  if (colorHex == null) {
    return new THREE.Color(DEFAULT_COLOR);
  }
  if (typeof colorHex === 'number') {
    return new THREE.Color(colorHex);
  }
  const s = String(colorHex).trim();
  return new THREE.Color(s.startsWith('#') ? s : `#${s}`);
};

const createMaterial = (colorHex) => new THREE.MeshStandardMaterial({
  color: toThreeColor(colorHex),
  roughness: 0.45,
  metalness: 0.05,
});

const applyColor = (root, colorHex) => {
  const color = toThreeColor(colorHex);
  root.traverse((child) => {
    if (!child.isMesh || !child.material) {
      return;
    }
    // OBJ meshes often carry material ARRAYS (one per MTL group); the old
    // `material?.color` guard silently skipped those, so OBJ brick bodies
    // never took the chosen colour (studs did -> mismatched bricks).
    const isArray = Array.isArray(child.material);
    const mats = (isArray ? child.material : [child.material]).map((mat) => {
      if (!mat?.color) {
        return mat;
      }
      const cloned = mat.clone();
      cloned.color.set(color);
      return cloned;
    });
    child.material = isArray ? mats : mats[0];
  });
};

// Recolour a brick ONLY when the player picked a paint colour different from
// the native default -- otherwise the brick keeps its authentic MTL colours.
const maybeApplyColor = (root, colorHex) => {
  if (colorHex != null && colorHex !== DEFAULT_COLOR) {
    applyColor(root, colorHex);
  }
};

const createStud = (material) => {
  const geometry = new THREE.CylinderGeometry(studRadius, studRadius, studHeight, 12);
  const stud = new THREE.Mesh(geometry, material);
  stud.position.y = studHeight / 2;
  stud.castShadow = true;
  return stud;
};

/**
 * Finish an OBJ/MTL brick prepared by gameModelLoader ('brick' policy:
 * neutral wrapper, footprint-centred, feet at y=0): tint it to the chosen
 * colour. NO parametric studs are added -- the real brick OBJs already
 * carry LEGO stud tops via a UV-mapped texture (spr001, the embossed "LEGO"
 * circle). The old code added 3D cylinder studs on top of that texture,
 * which never lined up with the textured stud positions (the "studs not
 * aligned with the LEGO texture" report). applyColor tints the textured
 * stud material along with the body, so studs match the brick colour.
 */
const finishObjBrick = (root, recipe, colorHex) => {
  // Authentic per-brick colour: leave the brick in the colours its own MTL
  // carries (the two-tone yellow body/tubes + the textured LEGO studs) unless
  // the player explicitly picked a DIFFERENT paint colour. Force-recolouring
  // every placed brick to one flat tone is what flattened the shading and,
  // via the parametric fallbacks, produced off-colour (blue) starts.
  maybeApplyColor(root, colorHex);
  return root;
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
    // A recessed detail block: a darker shade of the brick's OWN colour, not a
    // hardcoded blue (which made tall composite bricks start blue instead of
    // matching the brick).
    const insetColor = toThreeColor(colorHex).multiplyScalar(0.6);
    const insetMat = new THREE.MeshStandardMaterial({
      color: insetColor,
      roughness: 0.45,
      metalness: 0.05,
    });
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

/** Already-resolved cached GLB scene, or null if not loaded (or still loading). */
const getCachedGlbScene = (glbUrl) => {
  const cached = glbCache.get(glbUrl);
  return cached && !(cached instanceof Promise) ? cached : null;
};

/**
 * Warm the GLB cache for a set of urls ahead of time (fire-and-forget) so
 * synchronous placement (createBrickSync) can use the real mesh on first
 * click instead of always falling back to the parametric shape while the
 * fetch is in flight. Safe to call repeatedly -- loadGlbBrick dedupes.
 * @param {string[]} glbUrls
 */
export const preloadGlbBricks = (glbUrls) => {
  glbUrls.forEach((url) => {
    loadGlbBrick(url).catch((error) => {
      console.warn(`GLB preload failed for ${url}:`, error);
    });
  });
};

/**
 * Warm the OBJ/MTL cache for a set of {objUrl, mtlUrl} pairs ahead of time
 * (see preloadGlbBricks above -- same idea, live path). Thin re-export of
 * the shared helper so callers only need one import from BrickFactory.
 * @param {{ objUrl: string, mtlUrl: string }[]} entries
 */
export const preloadObjMtlBricks = (entries) => preloadObjMtlAssets(entries);

/**
 * Shift the loaded GLB's own children (not root) so their bottom sits at
 * local y=0, matching the parametric bricks' convention (their geometry is
 * authored bottom-aligned to begin with). Placement code (WorkshopEngineCore
 * .addBrick, buildGroupFromBrickInstances, etc.) always does an absolute
 * `root.position.set(...)` after creation -- shifting root.position here
 * instead of the children would just get silently overwritten, leaving the
 * mesh's true (unaligned) local offset to sink the brick below the plate.
 */
const alignBrickBottomToOrigin = (root) => {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const offsetY = -box.min.y;
  root.children.forEach((child) => {
    child.position.y += offsetY;
  });
  root.updateMatrixWorld(true);
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

  if (recipe.objUrl && recipe.mtlUrl) {
    // OBJ/MTL is the live path for every brick that has real LCA geometry
    // (independent of the recipe's parametric `shape`, which is now only
    // the cold-cache fallback). gameModelLoader's 'brick' policy centres
    // the part on its footprint and puts feet at y=0, matching the
    // parametric origin convention the stud-grid stacking math assumes.
    try {
      root = finishObjBrick(
        await loadGameModel('brick', { objUrl: recipe.objUrl, mtlUrl: recipe.mtlUrl }),
        recipe,
        colorHex,
      );
    } catch (error) {
      console.warn(`OBJ/MTL load failed for ${brickId}, using parametric fallback:`, error);
      root = createParametricBrick(recipe, colorHex);
    }
  } else if (recipe.shape === 'GLB' && recipe.glbUrl) {
    try {
      root = await loadGlbBrick(recipe.glbUrl);
      maybeApplyColor(root, colorHex);
      alignBrickBottomToOrigin(root);
    } catch (error) {
      console.warn(`GLB load failed for ${brickId}, using parametric fallback:`, error);
      root = createParametricBrick(recipe, colorHex);
    }
  } else {
    root = createParametricBrick(recipe, colorHex);
  }

  configureBrickRoot(root, brickId, recipe);
  // Hidden at rest: raycast picking still works (three.js raycasts ignore
  // visibility), and the box only shows as selection feedback. It used to
  // be visible:true but rendered 10x too small (pre selection-box scale
  // fix), i.e. effectively invisible -- keep that established look.
  attachSelectionBox(root, { visible: false, wireframeVisible: false });
  return root;
};

/**
 * @param {string} brickId
 * @param {{ color?: number | string }} [options}
 */
export const createBrickSync = (brickId, options = {}) => {
  const recipe = resolveBrickRecipe(brickId);
  const colorHex = typeof options.color === 'string'
    ? parseInt(options.color, 16)
    : (options.color ?? DEFAULT_COLOR);

  let root = null;
  if (recipe.objUrl && recipe.mtlUrl) {
    // OBJ/MTL is the live path -- see createBrick above.
    const prepared = getGameModelSync('brick', { objUrl: recipe.objUrl, mtlUrl: recipe.mtlUrl });
    if (prepared) {
      root = finishObjBrick(prepared, recipe, colorHex);
    } else {
      // not warmed yet -- kick off a load for next time and fall back to
      // parametric for this placement so the click still feels instant
      loadObjMtl(recipe.objUrl, recipe.mtlUrl).catch(() => {});
    }
  } else if (recipe.shape === 'GLB' && recipe.glbUrl) {
    const cached = getCachedGlbScene(recipe.glbUrl);
    if (cached) {
      root = cached.clone(true);
      maybeApplyColor(root, colorHex);
      alignBrickBottomToOrigin(root);
      root.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = false;
        }
      });
    } else {
      // not warmed yet -- kick off a load for next time and fall back to
      // parametric for this placement so the click still feels instant
      loadGlbBrick(recipe.glbUrl).catch(() => {});
    }
  }
  if (!root) {
    root = createParametricBrick(recipe, colorHex);
  }

  configureBrickRoot(root, brickId, recipe);
  // Hidden at rest: raycast picking still works (three.js raycasts ignore
  // visibility), and the box only shows as selection feedback. It used to
  // be visible:true but rendered 10x too small (pre selection-box scale
  // fix), i.e. effectively invisible -- keep that established look.
  attachSelectionBox(root, { visible: false, wireframeVisible: false });
  return root;
};

export const paintBrick = (root, colorHex) => {
  const parsed = typeof colorHex === 'string' ? parseInt(colorHex, 16) : colorHex;
  applyColor(root, parsed);
  root.userData.color = typeof colorHex === 'string' ? colorHex : parsed?.toString(16);
};

const alignGroupFeetToOrigin = (root) => {
  const bounds = computeContentBounds(root);
  if (!bounds.isEmpty()) {
    root.position.y -= bounds.min.y;
  }
};

/**
 * Build a grouped, placeable creation from saved brick instances.
 * @param {Array} instances
 * @param {{ name?: string, modelId?: string, creationId?: string }} [options]
 */
export const buildGroupFromBrickInstances = (instances = [], options = {}) => {
  const group = new THREE.Group();
  group.name = options.name || 'CustomCreation';

  instances.forEach((entry) => {
    if (!entry?.brickId) {
      return;
    }
    const brick = createBrickSync(entry.brickId, { color: entry.color });
    if (entry.position) {
      brick.position.set(entry.position.x, entry.position.y, entry.position.z);
    }
    if (entry.rotation) {
      brick.rotation.set(entry.rotation.x, entry.rotation.y, entry.rotation.z);
    }
    brick.userData.instanceId = entry.instanceId || brick.userData.instanceId;
    brick.userData.color = (entry.color || '').replace?.('#', '') || entry.color;
    group.add(brick);
  });

  centerGroupContentsXZ(group);
  alignGroupFeetToOrigin(group);
  attachSelectionBox(group, { visible: false, wireframeVisible: false });

  const groupBox = group.userData.transparentBox;
  if (groupBox) {
    groupBox.visible = false;
    const groupWireframe = groupBox.getObjectByName('wireframe');
    if (groupWireframe) {
      groupWireframe.visible = false;
    }
  }

  group.isModel = true;
  group.isMovable = true;
  group.isRotatable = true;
  group.isDeletable = true;
  group.isPaintable = true;
  group.userData.modelId = options.modelId || group.name;
  group.userData.creationId = options.creationId || null;

  group.traverse((child) => {
    if (child.name === 'transparentBox' && child !== groupBox) {
      child.visible = false;
      const brickWireframe = child.getObjectByName('wireframe');
      if (brickWireframe) {
        brickWireframe.visible = false;
      }
    }
    if (child !== groupBox && child.name !== 'wireframe') {
      child.isMovable = true;
      child.isRotatable = true;
      child.isDeletable = true;
      child.isPaintable = true;
    }
  });

  return group;
};