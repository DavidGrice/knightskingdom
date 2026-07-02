import * as THREE from 'three';
import { loadObjMtl } from '../../../shared/objMtlLoader';

/**
 * World-template OBJ exports (resources/model_files/extracted/models/
 * template-0N.obj) are on a wildly different scale than every other asset in
 * the game -- typically 1100-2000 world units across after the standard
 * MM_TO_WORLD_SCALE, versus ~5-16 for props/buildings -- because the game's
 * WLD (world layout) coordinate space isn't the same unit convention as its
 * SHP (part) space. Left unscaled, the camera (mounted at (0,5,10)) spawns
 * embedded inside the solid mesh, which is what previously read as "renders
 * almost entirely black" (not a material/lighting defect). Maps already
 * within range of this target are left untouched -- only outliers get
 * rescaled.
 */
const TARGET_MAP_SIZE = 120;
const RESCALE_THRESHOLD = TARGET_MAP_SIZE * 1.5;

const fitMapToWorldScale = (root) => {
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDimension = Math.max(size.x, size.y, size.z);

    if (maxDimension > RESCALE_THRESHOLD) {
        const scaleFactor = TARGET_MAP_SIZE / maxDimension;
        root.scale.multiplyScalar(scaleFactor);
        root.updateMatrixWorld(true);
        box.setFromObject(root);
    }

    const center = new THREE.Vector3();
    box.getCenter(center);
    root.position.x -= center.x;
    root.position.z -= center.z;
    root.position.y -= box.min.y;
    root.updateMatrixWorld(true);
};

const MapLoader = (mapData, scene, setModelLoaded) => {
    loadObjMtl(mapData.objUrl, mapData.mtlUrl)
        .then((root) => {
            root.name = 'GameMap';
            root.isMovable = false;
            fitMapToWorldScale(root);
            scene.add(root);
            setModelLoaded(true);
        })
        .catch((error) => {
            console.error('An error occurred while loading the map:', error);
        });
};

export default MapLoader;
