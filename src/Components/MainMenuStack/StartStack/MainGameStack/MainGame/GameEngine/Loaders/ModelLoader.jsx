import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EdgesGeometry, LineBasicMaterial, LineSegments } from 'three';

import Archer from '../GameEngineResourceStack/models/archer_with_box2.glb';
import { resolveDriveCameraProfile } from '../driveCameraProfiles';
import { attachSelectionBox, updateSelectionBox } from '../../../WorkShop/WorkshopEngine/BrickFactory';
import { WAREHOUSE_MODEL_CATALOG } from './warehouseModelCatalog.generated';
import { loadGameModel } from '../../../shared/gameModelLoader';

const SelectedModels = {
    NONE: 'NONE',
    ARCHER: {
        model: Archer,
        name: 'Archer',
        isMovable: true,
        isDeletable: true,
        isDriveable: true,
        isPaintable: true,
        isRotatable: true,
        isModel: true,
    },
    ...WAREHOUSE_MODEL_CATALOG,
};

let addedChampCounter = 0;

const configureGltfMeshNodes = (gltf) => {
    gltf.scene.traverse((child) => {
        if (child.isMesh && child.name === 'transparentBox') {
            const transparentMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                opacity: 0.1,
                transparent: true,
            });
            child.material = transparentMaterial;

            const edgesGeometry = new EdgesGeometry(child.geometry);
            const lineMaterial = new LineBasicMaterial({ color: 0xffffff });
            const wireframe = new LineSegments(edgesGeometry, lineMaterial);

            wireframe.isMovable = true;
            wireframe.isRotatable = true;
            wireframe.isPaintable = true;
            wireframe.isDeletable = true;
            wireframe.isDriveable = true;
            wireframe.visible = true;
            wireframe.name = 'wireframe';
            child.add(wireframe);

            child.isMovable = true;
            child.isRotatable = true;
            child.isPaintable = true;
            child.isDeletable = true;
            child.visible = false;
            child.isDriveable = true;
            gltf.scene.userData.transparentBox = child;
        }

        child.isPaintable = true;
    });
};

const attachDriveCameraProfile = (gltf, modelKey, modelName) => {
    const profile = resolveDriveCameraProfile(modelKey, modelName);
    gltf.scene.userData.driveCameraProfileId = profile.id;
    return profile.id;
};

const registerDriveSubject = (gltf, cameraController, { driveId, isDefault = false, profileId }) => {
    if (!cameraController || !gltf.scene.getObjectByName('head_back')) {
        return;
    }
    cameraController.registerSubject(gltf.scene, driveId, { isDefault, profileId });
};

/**
 * GLB models (Archer) carry a hand-authored transparentBox mesh that
 * configureGltfMeshNodes rigs up; warehouse OBJ/MTL models have no such
 * mesh, so without this they could never show a selection box (and MOVING
 * mode, which requires one, silently did nothing). Attach the standard
 * workshop box, hidden until a grab shows it.
 */
const ensureSelectionBox = (root) => {
    if (!root.userData.transparentBox) {
        attachSelectionBox(root, { visible: false, wireframeVisible: false });
    }
};

const placementBox = new THREE.Box3();

/** GLB roots are not centered at the origin — align hitbox feet to the requested world Y. */
const alignPlayableRootToWorldPosition = (root, worldPosition = {}) => {
    const x = worldPosition.x ?? 0;
    const surfaceY = worldPosition.y ?? 0;
    const z = worldPosition.z ?? 0;

    root.position.set(x, surfaceY, z);
    root.updateMatrixWorld(true);

    const footprint = root.userData.transparentBox ?? root;
    placementBox.setFromObject(footprint);
    root.position.y += surfaceY - placementBox.min.y;
    root.updateMatrixWorld(true);
};

const setupMapGltfScene = (gltf, mapModel) => {
    gltf.scene.name = mapModel.name;
    // Matches SelectedModels.ARCHER's flags -- preloaded map characters are
    // playable content, not static scenery, and should be as movable/
    // rotatable as any bucket-added copy of the same model.
    gltf.scene.isMovable = true;
    gltf.scene.isRotatable = true;
    gltf.scene.isDeletable = true;
    gltf.scene.isPaintable = true;
    gltf.scene.isDriveable = true;
    gltf.scene.isModel = true;
    gltf.scene.userData.modelId = mapModel.name;

    configureGltfMeshNodes(gltf);
    ensureSelectionBox(gltf.scene);
    attachDriveCameraProfile(gltf, null, mapModel.name);
    alignPlayableRootToWorldPosition(gltf.scene, mapModel.position);
    updateSelectionBox(gltf.scene);
};

const setupPlayableGltfScene = (gltf, modelKey, { position, rotation, color, skipGroundAlign = false }) => {
    const modelConfig = SelectedModels[modelKey];
    if (!modelConfig) {
        return;
    }

    gltf.scene.name = modelConfig.name;
    // Interaction flags come from the catalog entry -- every warehouse
    // entry ships isMovable/isRotatable/isPaintable/isDeletable.
    gltf.scene.isMovable = modelConfig.isMovable ?? true;
    gltf.scene.isRotatable = modelConfig.isRotatable ?? true;
    gltf.scene.isPaintable = modelConfig.isPaintable ?? true;
    gltf.scene.isDeletable = modelConfig.isDeletable ?? true;
    gltf.scene.isDriveable = modelConfig.isDriveable ?? false;
    gltf.scene.isModel = modelConfig.isModel;
    gltf.scene.userData.modelId = modelKey;

    configureGltfMeshNodes(gltf);
    ensureSelectionBox(gltf.scene);
    attachDriveCameraProfile(gltf, modelKey, modelConfig.name);

    if (position) {
        if (skipGroundAlign) {
            if (position.isVector3) {
                gltf.scene.position.copy(position);
            } else {
                gltf.scene.position.set(position.x, position.y, position.z);
            }
        } else {
            alignPlayableRootToWorldPosition(gltf.scene, position);
        }
    } else if (!skipGroundAlign) {
        alignPlayableRootToWorldPosition(gltf.scene);
    }
    if (rotation) {
        gltf.scene.rotation.set(rotation.x, rotation.y, rotation.z);
    }
    if (color) {
        gltf.scene.userData.color = color;
        const paintColor = new THREE.Color(parseInt(color, 16));
        gltf.scene.traverse((child) => {
            if (child.isMesh && child.isPaintable && child.material?.color) {
                child.material.color.set(paintColor);
            }
        });
    }
    updateSelectionBox(gltf.scene);
};

/**
 * Load one catalog entry's geometry, GLTF (hand-authored models, e.g.
 * Archer) or OBJ/MTL (warehouse models -- the live path; see the "Wire real
 * 3D models" plan's OBJ/MTL pivot). Resolves with a `{ scene }` shape either
 * way so callers can treat the result like a GLTFLoader payload regardless
 * of which loader actually ran.
 */
const loadModelEntry = (entry) => {
    if (entry.objUrl && entry.mtlUrl) {
        return loadGameModel('warehouse', entry).then((root) => ({ scene: root }));
    }
    return new Promise((resolve, reject) => {
        new GLTFLoader().load(entry.model, resolve, undefined, reject);
    });
};

const ModelLoader = (type, modelData, position, mapData, scene, onComplete, cameraController) => {
    const loader = new GLTFLoader();
    switch (type) {
        case 'preload': {
            const models = mapData?.models || [];
            if (!models.length) {
                onComplete?.();
                break;
            }

            let loadedCount = 0;
            models.forEach((model) => {
                loader.load(
                    model.filePath,
                    (gltf) => {
                        setupMapGltfScene(gltf, model);
                        scene.add(gltf.scene);
                        registerDriveSubject(gltf, cameraController, {
                            driveId: `champ-map-${model.id}`,
                            isDefault: true,
                            profileId: gltf.scene.userData.driveCameraProfileId,
                        });

                        loadedCount += 1;
                        if (loadedCount === models.length) {
                            onComplete?.();
                        }
                    },
                );
            });
            break;
        }
        case 'restore': {
            const entry = SelectedModels[modelData];
            if (!entry) {
                console.error(`ModelLoader: no model registered for "${modelData}"`);
                break;
            }
            loadModelEntry(entry)
                .then((gltf) => {
                    setupPlayableGltfScene(gltf, modelData, {
                        position: position?.position,
                        rotation: position?.rotation,
                        color: position?.color,
                        skipGroundAlign: true,
                    });
                    scene.add(gltf.scene);
                    const restoredId = position?.driveId ?? `champ-restored-${modelData}`;
                    registerDriveSubject(gltf, cameraController, {
                        driveId: restoredId,
                        isDefault: false,
                        profileId: gltf.scene.userData.driveCameraProfileId,
                    });
                })
                .catch((error) => {
                    console.error('An error happened while restoring a model', error);
                });
            break;
        }
        case 'add': {
            const entry = SelectedModels[modelData];
            if (!entry) {
                console.error(`ModelLoader: no model registered for "${modelData}"`);
                break;
            }
            loadModelEntry(entry)
                .then((gltf) => {
                    setupPlayableGltfScene(gltf, modelData, { position });
                    scene.add(gltf.scene);
                    addedChampCounter += 1;
                    registerDriveSubject(gltf, cameraController, {
                        driveId: `champ-added-${modelData}-${addedChampCounter}`,
                        isDefault: false,
                        profileId: gltf.scene.userData.driveCameraProfileId,
                    });
                })
                .catch((error) => {
                    console.error('An error happened', error);
                });
            break;
        }
        default:
            break;
    }
};

export default ModelLoader;