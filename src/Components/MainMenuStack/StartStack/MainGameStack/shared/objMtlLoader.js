import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

/**
 * Runtime OBJ/MTL loader for models extracted by resources/model_files/ --
 * loads .obj+.mtl directly (public/models/, populated by
 * resources/model_pipeline/copy_obj_assets.mjs) instead of the GLB conversion
 * pipeline (obj2gltfHelper.mjs / ModelLoader.jsx's warehouseModelCatalog /
 * BrickFactory's GLB path, all of which still exist and still work, just
 * aren't the live path any more -- see the "Wire real 3D models" plan).
 *
 * Shared textures live at TEXTURE_BASE; every .mtl's `map_Kd textures/...`
 * reference resolves against it via MTLLoader.setResourcePath, independent
 * of where the .obj/.mtl pair itself lives.
 */

const TEXTURE_BASE = '/models/';

/**
 * Same empirically-derived correction as obj2gltfHelper.mjs's
 * MM_TO_WORLD_SCALE: the extraction toolchain's coordinates are true LEGO
 * millimeters, and 0.1 maps an 8mm stud to the Workshop's STUD=0.8 world
 * unit exactly. The source data is also Y-down; negating Y here both
 * uprights the model AND fixes the back-face culling that showed up as
 * "missing" geometry -- three.js detects the resulting negative-determinant
 * transform and automatically reverses the front-face winding to compensate,
 * so one negated scale component fixes both symptoms.
 */
export const MM_TO_WORLD_SCALE = 0.1;

const cache = new Map(); // `${objUrl}|${mtlUrl}` -> Object3D template (resolved) or Promise

const cacheKey = (objUrl, mtlUrl) => `${objUrl}|${mtlUrl}`;

const splitUrl = (url) => {
  const i = url.lastIndexOf('/');
  return { dir: url.slice(0, i + 1), file: url.slice(i + 1) };
};

/**
 * Load (or reuse from cache) an OBJ/MTL pair as a scaled, upright,
 * culling-corrected Object3D template. Callers should `.clone(true)` before
 * adding a returned template to more than one place in the scene -- this
 * function itself always resolves with a fresh clone.
 * @param {string} objUrl
 * @param {string} mtlUrl
 * @param {{ scale?: number }} [options]
 * @returns {Promise<THREE.Object3D>}
 */
export function loadObjMtl(objUrl, mtlUrl, options = {}) {
  const scale = options.scale ?? MM_TO_WORLD_SCALE;
  const key = cacheKey(objUrl, mtlUrl);

  // Every caller's chain ends in its own, independent `.clone(true)` off the
  // never-mutated cached template -- never off a value another caller may
  // already be mutating (concurrent callers during an in-flight load used to
  // share and mutate the same clone via chained `.then()`s, so callers that
  // scale/rotate the result, e.g. MapLoader, could double-apply on top of
  // each other's changes).
  const cached = cache.get(key);
  if (cached) {
    return Promise.resolve(cached).then((template) => template.clone(true));
  }

  const promise = new Promise((resolve, reject) => {
    const mtlLoader = new MTLLoader();
    mtlLoader.setResourcePath(TEXTURE_BASE);
    const mtlParts = splitUrl(mtlUrl);
    mtlLoader.setPath(mtlParts.dir);
    mtlLoader.load(
      mtlParts.file,
      (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        const objParts = splitUrl(objUrl);
        objLoader.setPath(objParts.dir);
        objLoader.load(
          objParts.file,
          (root) => {
            root.scale.set(scale, scale * -1, scale);
            root.traverse((child) => {
              if (child.isMesh) {
                child.frustumCulled = false;
              }
            });
            root.updateMatrixWorld(true);
            resolve(root);
          },
          undefined,
          (err) => reject(new Error(`OBJ load failed (${objUrl}): ${err?.message || err}`)),
        );
      },
      undefined,
      (err) => reject(new Error(`MTL load failed (${mtlUrl}): ${err?.message || err}`)),
    );
  });

  cache.set(key, promise);
  promise.then(
    (template) => cache.set(key, template),
    () => cache.delete(key),
  );
  return promise.then((template) => template.clone(true));
}

/** Already-resolved cached template, or null if not loaded (or still loading). */
export function getCachedObjMtlTemplate(objUrl, mtlUrl) {
  const cached = cache.get(cacheKey(objUrl, mtlUrl));
  return cached && !(cached instanceof Promise) ? cached : null;
}

/**
 * Warm the cache for a set of {objUrl, mtlUrl} pairs (fire-and-forget) so
 * synchronous placement code can use real geometry on the first click
 * instead of waiting on the network. Safe to call repeatedly -- dedupes.
 * @param {{ objUrl: string, mtlUrl: string }[]} entries
 */
export function preloadObjMtlAssets(entries) {
  entries.forEach(({ objUrl, mtlUrl }) => {
    loadObjMtl(objUrl, mtlUrl).catch((error) => {
      // eslint-disable-next-line no-console
      console.warn(`OBJ/MTL preload failed for ${objUrl}:`, error);
    });
  });
}

/** Shift a loaded root's own children so their bottom sits at local y=0. */
export function alignObjMtlBottomToOrigin(root) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const offsetY = -box.min.y;
  root.children.forEach((child) => {
    child.position.y += offsetY;
  });
  root.updateMatrixWorld(true);
}
