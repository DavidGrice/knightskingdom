import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EdgesGeometry, LineBasicMaterial, LineSegments } from 'three';

import Archer from '../GameEngineResourceStack/models/archer_with_box2.glb';
import { resolveDriveCameraProfile } from '../driveCameraProfiles';

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
    gltf.scene.isMovable = false;
    gltf.scene.isDeletable = true;
    gltf.scene.isModel = true;
    gltf.scene.userData.modelId = mapModel.name;

    configureGltfMeshNodes(gltf);
    attachDriveCameraProfile(gltf, null, mapModel.name);
    alignPlayableRootToWorldPosition(gltf.scene, mapModel.position);
};

const setupPlayableGltfScene = (gltf, modelKey, { position, rotation, color, skipGroundAlign = false }) => {
    const modelConfig = SelectedModels[modelKey];
    if (!modelConfig) {
        return;
    }

    gltf.scene.name = modelConfig.name;
    gltf.scene.isMovable = false;
    gltf.scene.isDeletable = true;
    gltf.scene.isModel = modelConfig.isModel;
    gltf.scene.userData.modelId = modelKey;

    configureGltfMeshNodes(gltf);
    attachDriveCameraProfile(gltf, modelKey, modelConfig.name);

    if (position) {
        if (skipGroundAlign) {
            if (position.isVector3) {
                gltf.scene.position.copy(position);
            } else {
                gltf.scene.position.set(position.x, position.y, position.z);
            }
        } else if (position.isVector3) {
            alignPlayableRootToWorldPosition(gltf.scene, position);
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
        case 'restore':
            loader.load(
                SelectedModels[modelData]?.model,
                (gltf) => {
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
                },
                undefined,
                (error) => {
                    console.error('An error happened while restoring a model', error);
                },
            );
            break;
        case 'add':
            loader.load(
                SelectedModels[modelData]['model'],
                (gltf) => {
                    setupPlayableGltfScene(gltf, modelData, { position });
                    scene.add(gltf.scene);
                    addedChampCounter += 1;
                    registerDriveSubject(gltf, cameraController, {
                        driveId: `champ-added-${modelData}-${addedChampCounter}`,
                        isDefault: false,
                        profileId: gltf.scene.userData.driveCameraProfileId,
                    });
                },
                undefined,
                (error) => {
                    console.error('An error happened', error);
                },
            );
            break;
        default:
            break;
    }
};

export default ModelLoader;