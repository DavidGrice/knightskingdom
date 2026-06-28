import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EdgesGeometry, LineBasicMaterial, LineSegments } from 'three';

import Archer from '../GameEngineResourceStack/models/archer_with_box2.glb';

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

function updateCameraHelpers(model, frontCameraHelper, backCameraHelper) {
    frontCameraHelper.quaternion.copy(model.quaternion);
    frontCameraHelper.position.copy(model.position);
    frontCameraHelper.position.set(
        frontCameraHelper.position.x,
        frontCameraHelper.position.y,
        frontCameraHelper.position.z + 2,
    );
    backCameraHelper.quaternion.copy(model.quaternion);
    backCameraHelper.position.copy(model.position);
    backCameraHelper.position.set(
        backCameraHelper.position.x,
        backCameraHelper.position.y,
        backCameraHelper.position.z - 2,
    );
}

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

        if (child.isMesh && child.name === 'head_back') {
            const frontCameraHelper = new THREE.Object3D();
            frontCameraHelper.position.set(child.position.x, child.position.y, child.position.z + 2);
            child.add(frontCameraHelper);
            gltf.scene.userData.frontCameraHelper = frontCameraHelper;

            const backCameraHelper = new THREE.Object3D();
            backCameraHelper.position.set(child.position.x, child.position.y, child.position.z - 2);
            child.add(backCameraHelper);
            gltf.scene.userData.backCameraHelper = backCameraHelper;
        }

        child.isPaintable = true;
    });
};

const setupMapGltfScene = (gltf, mapModel) => {
    gltf.scene.name = mapModel.name;
    gltf.scene.isMovable = false;
    gltf.scene.isDeletable = true;
    gltf.scene.isModel = true;
    gltf.scene.userData.modelId = mapModel.name;

    configureGltfMeshNodes(gltf);
    gltf.scene.position.set(mapModel.position.x, mapModel.position.y, mapModel.position.z);
};

const setupPlayableGltfScene = (gltf, modelKey, { position, rotation, color }) => {
    const modelConfig = SelectedModels[modelKey];
    if (!modelConfig) {
        return;
    }

    gltf.scene.name = modelConfig.name;
    gltf.scene.isMovable = false;
    gltf.scene.isDeletable = true;
    gltf.scene.isModel = modelConfig.isModel;
    gltf.scene.userData.modelId = modelKey;
    gltf.scene.userData.isPlayableModel = true;

    configureGltfMeshNodes(gltf);

    if (position) {
        if (position.isVector3) {
            gltf.scene.position.copy(position);
        } else {
            gltf.scene.position.set(position.x, position.y, position.z);
        }
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

const registerCameraHelperUpdates = (child, frontCameraHelper, backCameraHelper, registerFrameCallback) => {
    updateCameraHelpers(child, frontCameraHelper, backCameraHelper);

    if (typeof registerFrameCallback === 'function') {
        registerFrameCallback(() => updateCameraHelpers(child, frontCameraHelper, backCameraHelper));
        return;
    }

    const animate = () => {
        requestAnimationFrame(animate);
        updateCameraHelpers(child, frontCameraHelper, backCameraHelper);
    };
    animate();
};

const attachCameraHelperUpdates = (gltf, registerFrameCallback) => {
    const headBack = gltf.scene.getObjectByName('head_back');
    if (headBack && gltf.scene.userData.frontCameraHelper && gltf.scene.userData.backCameraHelper) {
        registerCameraHelperUpdates(
            headBack,
            gltf.scene.userData.frontCameraHelper,
            gltf.scene.userData.backCameraHelper,
            registerFrameCallback,
        );
    }
};

const ModelLoader = (type, modelData, position, mapData, scene, onComplete, registerFrameCallback) => {
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
                        attachCameraHelperUpdates(gltf, registerFrameCallback);

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
                    setupPlayableGltfScene(gltf, modelData, position || {});
                    scene.add(gltf.scene);
                    attachCameraHelperUpdates(gltf, registerFrameCallback);
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
                    attachCameraHelperUpdates(gltf, registerFrameCallback);
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