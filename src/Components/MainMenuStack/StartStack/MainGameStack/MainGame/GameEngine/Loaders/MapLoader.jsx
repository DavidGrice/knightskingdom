import * as THREE from 'three';
import { loadObjMtl, MM_TO_WORLD_SCALE } from '../../../shared/objMtlLoader';

/**
 * World templates import at their natural scale -- just the shared
 * MM_TO_WORLD_SCALE conversion every OBJ/MTL asset gets, no extra
 * normalization. Earlier revisions force-rescaled every map to a fixed
 * target size; that fought the source data instead of just importing it.
 * The camera/ground-alignment logic below only needed the *ground
 * detection* fix (raycasting for local surface height), not a size fit --
 * grounding was the actual reason a too-small camera used to end up
 * embedded in the terrain, not the map's absolute scale.
 *
 * SKYBOX_REFERENCE_SIZE is a safe upper bound covering every template's
 * natural size (largest observed ~2000 world units) with margin, exported
 * for SkyBoxLoader since it builds the skybox before the map's actual
 * bounding box is known.
 */
export const SKYBOX_REFERENCE_SIZE = 2500;

/**
 * The extraction toolchain's world layout faces the opposite way from the
 * engine's default camera facing (-Z) -- template-01's castle sits behind
 * the camera at spawn without this. A yaw (Y-axis) turn swaps front/back
 * while leaving the upright correction from objMtlLoader.js untouched.
 */
const MAP_YAW_RADIANS = Math.PI;

const groundRaycaster = new THREE.Raycaster();

/**
 * These templates are uneven terrain (crater-shaped valleys, mountain rims),
 * not a flat plate -- the player/camera spawn at world (0,0,0), so "ground"
 * has to mean the actual surface height under that point, not the map's
 * global bbox minimum. Using the global min put the spawn point's y=0 on a
 * mountain-base elevation while the actual playable valley floor sat well
 * above it, embedding the camera in solid terrain. Falls back to the global
 * minimum if the downward ray happens to miss (e.g. a genuine gap).
 */
const findGroundHeightAtOrigin = (root, box) => {
    groundRaycaster.set(new THREE.Vector3(0, box.max.y + 1, 0), new THREE.Vector3(0, -1, 0));
    const hits = groundRaycaster.intersectObject(root, true);
    return hits.length > 0 ? hits[0].point.y : box.min.y;
};

/**
 * Applies the exact same fit -- scale, yaw, XZ recenter, ground offset -- to
 * `root`, and returns the transform's parameters so other loaders (namely
 * MapPlacementsLoader) can carry a raw template-space point (the same
 * millimetre space export_obj.py's own vertices/positions use) through the
 * identical pipeline and land in the right spot relative to the map.
 */
const fitMapToWorldScale = (root) => {
    root.updateMatrixWorld(true);

    root.rotation.y += MAP_YAW_RADIANS;
    root.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(root);
    const center = new THREE.Vector3();
    box.getCenter(center);
    root.position.x -= center.x;
    root.position.z -= center.z;
    root.updateMatrixWorld(true);

    box.setFromObject(root);
    const groundOffsetY = -findGroundHeightAtOrigin(root, box);
    root.position.y += groundOffsetY;
    root.updateMatrixWorld(true);

    return {
        scaleFactor: 1,
        yawRadians: MAP_YAW_RADIANS,
        offsetX: -center.x,
        offsetY: groundOffsetY,
        offsetZ: -center.z,
    };
};

/**
 * Carries a raw template-space point (loadObjMtl's own MM_TO_WORLD_SCALE +
 * upright Y-negation already applied, same as any mesh vertex) through the
 * map's fit transform: scale about the origin, yaw about the origin, then
 * the map's own recenter/ground offsets, in that order -- matching how the
 * mesh itself was transformed in fitMapToWorldScale.
 */
export const applyMapFitTransform = (point, transform) => {
    const { scaleFactor, yawRadians, offsetX, offsetY, offsetZ } = transform;
    const scaled = point.clone().multiplyScalar(scaleFactor);
    const rotated = scaled.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRadians);
    return new THREE.Vector3(
        rotated.x + offsetX,
        rotated.y + offsetY,
        rotated.z + offsetZ,
    );
};

const forceDoubleSided = (root) => {
    root.traverse((child) => {
        if (child.isMesh && child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat) => { mat.side = THREE.DoubleSide; });
        }
    });
};

const MapLoader = (mapData, scene, setModelLoaded) => {
    loadObjMtl(mapData.objUrl, mapData.mtlUrl)
        .then((root) => {
            root.name = 'GameMap';
            root.isMovable = false;
            // Double-sided first: fitMapToWorldScale's ground raycast needs to
            // hit the same faces this fixes the visibility of.
            forceDoubleSided(root);
            const transform = fitMapToWorldScale(root);
            scene.add(root);
            setModelLoaded(true, transform);
        })
        .catch((error) => {
            console.error('An error occurred while loading the map:', error);
        });
};

export default MapLoader;
