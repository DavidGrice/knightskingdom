import * as THREE from 'three';
import { cloneCachedObjMtlInstance, loadObjMtl } from './objMtlLoader';

/**
 * Standardized loader for every KK OBJ/MTL asset class. objMtlLoader.js is
 * the shared geometry/material core (mm scale, Y-flip upright correction,
 * DoubleSide, decal depth bias, per-instance materials); this module adds
 * the per-source structural policy on top so a convention change is a
 * one-line table edit instead of a hunt across engines.
 *
 * Policy semantics:
 *   wrap        return a neutral (scale 1) Group wrapping the scaled OBJ
 *               root, so world-unit children (studs, hitboxes) can attach
 *               without inheriting the mm->world scale/mirror.
 *   centerXZ    shift the OBJ inside the wrapper so the wrapper origin is
 *               the footprint centre (parametric-brick convention -- the
 *               exporter leaves KK bricks spanning 0..extent instead).
 *   bottomAlign shift the OBJ inside the wrapper so its lowest point sits
 *               at wrapper y=0 (feet-on-the-ground convention).
 *
 * Sources:
 *   warehouse   bucket/catalog models -- ModelLoader positions the root
 *               itself (ground alignment, flags, selection box), so no
 *               structural wrapping.
 *   map-part    template placement reconstructions -- ditto.
 *   brick       workshop bricks -- wrapped/centred/bottom-aligned so the
 *               root matches the parametric bricks' origin convention
 *               (root origin = footprint centre at feet), which the
 *               stud-grid stacking/collision math assumes.
 */
const POLICIES = {
  warehouse: {},
  map: {},
  'map-part': {},
  brick: { wrap: true, centerXZ: true, bottomAlign: true },
};

const measureBounds = new THREE.Box3();

const applyPolicy = (objRoot, policy) => {
  if (!policy.wrap) {
    return objRoot;
  }

  const wrapper = new THREE.Group();
  wrapper.add(objRoot);
  wrapper.updateMatrixWorld(true);

  measureBounds.setFromObject(objRoot);
  if (!measureBounds.isEmpty()) {
    const center = measureBounds.getCenter(new THREE.Vector3());
    if (policy.centerXZ) {
      objRoot.position.x -= center.x;
      objRoot.position.z -= center.z;
    }
    if (policy.bottomAlign) {
      objRoot.position.y -= measureBounds.min.y;
    }
  }
  wrapper.updateMatrixWorld(true);
  // wrapper-space content height, for callers placing world-unit add-ons
  // (e.g. studs on a brick's top face)
  wrapper.userData.contentHeight = measureBounds.isEmpty()
    ? 0
    : measureBounds.max.y - measureBounds.min.y;
  return wrapper;
};

/**
 * Load (or reuse from cache) a game model prepared per its source policy.
 * @param {'warehouse' | 'map-part' | 'brick'} source
 * @param {{ objUrl: string, mtlUrl: string }} urls
 * @returns {Promise<THREE.Object3D>}
 */
export const loadGameModel = (source, { objUrl, mtlUrl }) => {
  const policy = POLICIES[source] ?? {};
  return loadObjMtl(objUrl, mtlUrl).then((root) => applyPolicy(root, policy));
};

/**
 * Synchronous cache-hit variant (null when the template isn't warmed yet);
 * same preparation as loadGameModel.
 * @param {'warehouse' | 'map-part' | 'brick'} source
 * @param {{ objUrl: string, mtlUrl: string }} urls
 */
export const getGameModelSync = (source, { objUrl, mtlUrl }) => {
  const policy = POLICIES[source] ?? {};
  const root = cloneCachedObjMtlInstance(objUrl, mtlUrl);
  return root ? applyPolicy(root, policy) : null;
};
