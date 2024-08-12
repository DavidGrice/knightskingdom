import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ModelLoader = (mapData, scene) => {
    const loader = new GLTFLoader();
    mapData.models.forEach((model) => {
        loader.load(
            model.filePath,
            (gltf) => {
                gltf.scene.children.forEach((child) => {
                    child.isPaintable = true;
                });
                const modelGroup = new THREE.Group();
                modelGroup.add(gltf.scene);
                modelGroup.name = model.name;
                modelGroup.isMovable = false;
                modelGroup.isDeletable = true;

                const box = new THREE.Box3().setFromObject(modelGroup);
                const boxSize = new THREE.Vector3();
                box.getSize(boxSize);
                const boxGeometry = new THREE.BoxGeometry(boxSize.x * 2, boxSize.y * 2, boxSize.z * 2);
                const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, opacity: 0.5, wireframe: true });
                const transparentBox = new THREE.Mesh(boxGeometry, boxMaterial);

                transparentBox.isMovable = true;
                transparentBox.isRotatable = true;
                transparentBox.isPaintable = true;
                transparentBox.isDeletable = true;
                transparentBox.visible = false; // Set transparentBox to be initially invisible
                transparentBox.isDriveable = true;
                scene.userData.transparentBox = transparentBox;

                modelGroup.add(transparentBox); // Add transparentBox as a child of modelGroup

                // Add camera helpers
                const frontCameraHelper = new THREE.Object3D();
                frontCameraHelper.position.set(0, boxSize.y / 2, boxSize.z * 2);
                modelGroup.add(frontCameraHelper);
                modelGroup.userData.frontCameraHelper = frontCameraHelper;

                const backCameraHelper = new THREE.Object3D();
                backCameraHelper.position.set(0, boxSize.y / 2, -boxSize.z * 2);
                modelGroup.add(backCameraHelper);
                modelGroup.userData.backCameraHelper = backCameraHelper;

                modelGroup.position.set(model.position.x, model.position.y, model.position.z);
                scene.add(modelGroup);

                // Function to update camera helpers' positions
                const updateCameraHelpers = () => {
                    frontCameraHelper.position.set(0, boxSize.y / 2, boxSize.z * 2).add(modelGroup.position);
                    backCameraHelper.position.set(0, boxSize.y / 2, -boxSize.z * 2).add(modelGroup.position);
                };

                // Animation loop to update camera helpers
                const animate = () => {
                    updateCameraHelpers();
                    requestAnimationFrame(animate);
                };
                animate();
            }
        );
    });
}

export default ModelLoader;