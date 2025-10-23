import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import Archer from '../GameEngineResourceStack/models/archer_with_box2.glb';
import { EdgesGeometry, LineBasicMaterial, LineSegments } from 'three';

const SelectedModels = {
    NONE:'NONE',
    ARCHER: {model: Archer, name: 'Archer', isMovable: true, isDeletable: true, isDriveable: true, isPaintable: true, isRotatable: true, isModel: true},
};


// // Function to update camera helpers' positions
// const updateCameraHelpers = () => {
//     const headBack = gltf.scene.getObjectByName("head_back");
//     if (headBack) {
//         gltf.scene.userData.frontCameraHelper.position.set(0, 0, 2).add(headBack.position);
//         gltf.scene.userData.backCameraHelper.position.set(0, 0, -2).add(headBack.position);
//     }
// };

function updateCameraHelpers(model, frontCameraHelper, backCameraHelper) {
    // Update the camera helpers' rotation to match the model's rotation
    frontCameraHelper.quaternion.copy(model.quaternion);
    frontCameraHelper.position.copy(model.position);
    frontCameraHelper.position.set(frontCameraHelper.position.x, frontCameraHelper.position.y, frontCameraHelper.position.z + 2);
    backCameraHelper.quaternion.copy(model.quaternion);
    backCameraHelper.position.copy(model.position);
    backCameraHelper.position.set(backCameraHelper.position.x, backCameraHelper.position.y, backCameraHelper.position.z - 2);
}

const ModelLoader = (type, modelData, position, mapData, scene) => {
    const loader = new GLTFLoader();
    switch (type) {
        case 'preload':
            mapData.models.forEach((model) => {
                loader.load(
                    model.filePath,
                    (gltf) => {
                        // const modelGroup = new THREE.Group();
                        // gltf.scene.name = model.name;
                        gltf.scene.name = model.name;
                        gltf.scene.isMovable = false;
                        gltf.scene.isDeletable = true;
                        gltf.scene.isModel = true;

                        // Traverse the gltf.scene to set properties on the transparentBox and add camera helpers to head_back
                        gltf.scene.traverse((child) => {
                            if (child.isMesh && child.name === "transparentBox") {
                                // Create transparent material for faces
                                const transparentMaterial = new THREE.MeshBasicMaterial({
                                    color: 0xffffff,
                                    opacity: 0.1,
                                    transparent: true,
                                });
                                child.material = transparentMaterial;

                                // Create edges geometry and line material for edges
                                const edgesGeometry = new EdgesGeometry(child.geometry);
                                const lineMaterial = new LineBasicMaterial({ color: 0xffffff });
                                const wireframe = new LineSegments(edgesGeometry, lineMaterial);

                                wireframe.isMovable = true;
                                wireframe.isRotatable = true;
                                wireframe.isPaintable = true;
                                wireframe.isDeletable = true;
                                wireframe.isDriveable = true;
                                wireframe.visible = true; // Set wireframe to be initially invisible
                                wireframe.name = "wireframe";

                                // Add wireframe as a child of the mesh
                                child.add(wireframe);

                                child.isMovable = true;
                                child.isRotatable = true;
                                child.isPaintable = true;
                                child.isDeletable = true;
                                child.visible = false; // Set transparentBox to be initially invisible
                                child.isDriveable = true;
                                gltf.scene.userData.transparentBox = child;
                            }

                            if (child.name === "head_back") {
                                // Add camera helpers to the head_back mesh
                                const frontCameraHelper = new THREE.Object3D();
                                frontCameraHelper.position.set(child.position.x, child.position.y, child.position.z); // Adjust position relative to head_back
                                child.add(frontCameraHelper);
                                gltf.scene.userData.frontCameraHelper = frontCameraHelper;
                    
                                const backCameraHelper = new THREE.Object3D();
                                backCameraHelper.position.set(child.position.x, child.position.y, child.position.z); // Adjust position relative to head_back
                                child.add(backCameraHelper);
                                gltf.scene.userData.backCameraHelper = backCameraHelper;
                    
                                // Update camera helpers initially
                                updateCameraHelpers(child, frontCameraHelper, backCameraHelper);
                    
                                // Add an event listener or a loop to update the camera helpers when the model rotates
                                // This is a simple example using requestAnimationFrame
                                const animate = () => {
                                    requestAnimationFrame(animate);
                                    updateCameraHelpers(child, frontCameraHelper, backCameraHelper);
                                };
                                animate();
                            }
                            child.isPaintable = true;
                        });

                        gltf.scene.position.set(model.position.x, model.position.y, model.position.z);
                        scene.add(gltf.scene);


                        // // Animation loop to update camera helpers
                        // const animate = () => {
                        //     updateCameraHelpers();
                        //     requestAnimationFrame(animate);
                        // };
                        // animate();
                    }
                        // gltf.scene.children.forEach((child) => {
                        //     child.isPaintable = true;
                        // });
                        // const modelGroup = new THREE.Group();
                        // modelGroup.add(gltf.scene);
                        // modelGroup.name = model.name;
                        // modelGroup.isMovable = false;
                        // modelGroup.isDeletable = true;

                        // const box = new THREE.Box3().setFromObject(modelGroup);
                        // const boxSize = new THREE.Vector3();
                        // box.getSize(boxSize);
                        // const boxGeometry = new THREE.BoxGeometry(boxSize.x * 2, boxSize.y * 2, boxSize.z * 2);
                        // const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, opacity: 0.5, wireframe: true });
                        // const transparentBox = new THREE.Mesh(boxGeometry, boxMaterial);

                        // transparentBox.isMovable = true;
                        // transparentBox.isRotatable = true;
                        // transparentBox.isPaintable = true;
                        // transparentBox.isDeletable = true;
                        // transparentBox.visible = false; // Set transparentBox to be initially invisible
                        // transparentBox.isDriveable = true;
                        // transparentBox.name = "transparentBox";
                        // modelGroup.userData.transparentBox = transparentBox;

                        // modelGroup.add(transparentBox); // Add transparentBox as a child of modelGroup

                        // // Add camera helpers
                        // const frontCameraHelper = new THREE.Object3D();
                        // frontCameraHelper.position.set(0, boxSize.y / 2, boxSize.z * 2);
                        // modelGroup.add(frontCameraHelper);
                        // modelGroup.userData.frontCameraHelper = frontCameraHelper;

                        // const backCameraHelper = new THREE.Object3D();
                        // backCameraHelper.position.set(0, boxSize.y / 2, -boxSize.z * 2);
                        // modelGroup.add(backCameraHelper);
                        // modelGroup.userData.backCameraHelper = backCameraHelper;

                        // modelGroup.position.set(model.position.x, model.position.y, model.position.z);
                        // scene.add(modelGroup);

                        // // Function to update camera helpers' positions
                        // const updateCameraHelpers = () => {
                        //     frontCameraHelper.position.set(0, boxSize.y / 2, boxSize.z * 2).add(modelGroup.position);
                        //     backCameraHelper.position.set(0, boxSize.y / 2, -boxSize.z * 2).add(modelGroup.position);
                        // };

                        // // Animation loop to update camera helpers
                        // const animate = () => {
                        //     updateCameraHelpers();
                        //     requestAnimationFrame(animate);
                        // };
                        // animate();
                    // }
                );
            });
            break;
        case 'add':
            loader.load(
                SelectedModels[modelData]['model'],
                (gltf) => {
                    // gltf.scene.add(gltf.scene);
                        gltf.scene.name = SelectedModels[modelData]['name'];
                        gltf.scene.isMovable = false;
                        gltf.scene.isDeletable = true;
                        gltf.scene.isModel = SelectedModels[modelData]['isModel'];

                        // Traverse the gltf.scene to set properties on the transparentBox and add camera helpers to head_back
                        gltf.scene.traverse((child) => {
                            if (child.isMesh && child.name === "transparentBox") {
                                // Create transparent material for faces
                                const transparentMaterial = new THREE.MeshBasicMaterial({
                                    color: 0xffffff,
                                    opacity: 0.1,
                                    transparent: true,
                                });
                                child.material = transparentMaterial;

                                // Create edges geometry and line material for edges
                                const edgesGeometry = new EdgesGeometry(child.geometry);
                                const lineMaterial = new LineBasicMaterial({ color: 0xffffff });
                                const wireframe = new LineSegments(edgesGeometry, lineMaterial);

                                wireframe.isMovable = true;
                                wireframe.isRotatable = true;
                                wireframe.isPaintable = true;
                                wireframe.isDeletable = true;
                                wireframe.isDriveable = true;
                                wireframe.visible = true; // Set wireframe to be initially invisible
                                wireframe.name = "wireframe";

                                // Add wireframe as a child of the mesh
                                child.add(wireframe);

                                child.isMovable = true;
                                child.isRotatable = true;
                                child.isPaintable = true;
                                child.isDeletable = true;
                                child.visible = false; // Set transparentBox to be initially invisible
                                child.isDriveable = true;
                                gltf.scene.userData.transparentBox = child;
                            }

                            if (child.isMesh && child.name === "head_back") {
                                // Add camera helpers to the head_back mesh
                                const frontCameraHelper = new THREE.Object3D();
                                frontCameraHelper.position.copy(child.position.x, child.position.y, child.position.z + 2); // Adjust position relative to head_back
                                child.add(frontCameraHelper);
                                gltf.scene.userData.frontCameraHelper = frontCameraHelper;

                                const backCameraHelper = new THREE.Object3D();
                                backCameraHelper.position.set(child.position.x, child.position.y, child.position.z - 2); // Adjust position relative to head_back
                                child.add(backCameraHelper);
                                gltf.scene.userData.backCameraHelper = backCameraHelper;
                            }
                            child.isPaintable = true;
                        });

                        gltf.scene.position.copy(position);
                        scene.add(gltf.scene);

                        // Function to update camera helpers' positions
                        const updateCameraHelpers = () => {
                            const headBack = gltf.scene.getObjectByName("head_back");
                            if (headBack) {
                                gltf.scene.userData.frontCameraHelper.position.set(0, 0, 2).add(headBack.position);
                                gltf.scene.userData.backCameraHelper.position.set(0, 0, -2).add(headBack.position);
                            }
                        };

                        // Animation loop to update camera helpers
                        const animate = () => {
                            updateCameraHelpers();
                            requestAnimationFrame(animate);
                        };
                        animate();
                    },
                    // gltf.scene.children.forEach((child) => {
                    //     child.isPaintable = true;
                    // });
                    // const modelGroup = new THREE.Group();
                    // modelGroup.add(gltf.scene);
                    // modelGroup.name = modelData.name;
                    // modelGroup.isMovable = false;
                    // modelGroup.isDeletable = true;

                    // const box = new THREE.Box3().setFromObject(modelGroup);
                    // const boxSize = new THREE.Vector3();
                    // box.getSize(boxSize);
                    // const boxGeometry = new THREE.BoxGeometry(boxSize.x * 2, boxSize.y * 2, boxSize.z * 2);
                    // const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, opacity: 0.5, wireframe: true });
                    // const transparentBox = new THREE.Mesh(boxGeometry, boxMaterial);

                    // transparentBox.isMovable = true;
                    // transparentBox.isRotatable = true;
                    // transparentBox.isPaintable = true;
                    // transparentBox.isDeletable = true;
                    // transparentBox.visible = false; // Set transparentBox to be initially invisible
                    // transparentBox.isDriveable = true;
                    // modelGroup.userData.transparentBox = transparentBox;
                    // transparentBox.name = "transparentBox";

                    // modelGroup.add(transparentBox); // Add transparentBox as a child of modelGroup

                    // // Add camera helpers
                    // const frontCameraHelper = new THREE.Object3D();
                    // frontCameraHelper.position.set(0, boxSize.y / 2, boxSize.z * 2);
                    // modelGroup.add(frontCameraHelper);
                    // modelGroup.userData.frontCameraHelper = frontCameraHelper;

                    // const backCameraHelper = new THREE.Object3D();
                    // backCameraHelper.position.set(0, boxSize.y / 2, -boxSize.z * 2);
                    // modelGroup.add(backCameraHelper);
                    // modelGroup.userData.backCameraHelper = backCameraHelper;

                    // modelGroup.position.copy(position);
                    // scene.add(modelGroup);

                    // // Function to update camera helpers' positions
                    // const updateCameraHelpers = () => {
                    //     frontCameraHelper.position.set(0, boxSize.y / 2, boxSize.z * 2).add(modelGroup.position);
                    //     backCameraHelper.position.set(0, boxSize.y / 2, -boxSize.z * 2).add(modelGroup.position);
                    // };

                    // // Animation loop to update camera helpers
                    // const animate = () => {
                    //     updateCameraHelpers();
                    //     requestAnimationFrame(animate);
                    // };
                    // animate();
                undefined,
                (error) => {
                    console.error('An error happened', error);
                }
            );
            break;
        default:
            break;
    }
};

export default ModelLoader;