import * as THREE from 'three';

const SkyBoxLoader = (mapData, scene) => {
    const skyboxGeometry = new THREE.BoxGeometry(600, 600, 600);
    const texLoader = new THREE.CubeTextureLoader();
    const texturePaths = mapData.skyBoxes.map((skyBox) => skyBox.filePath);
    const texture = texLoader.load(
        texturePaths,
        () => console.log('Skybox textures loaded successfully'),
        undefined,
        (error) => console.error('Error loading skybox textures:', error)
    );
    const skyboxMaterial = new THREE.MeshBasicMaterial({
        envMap: texture,
        side: THREE.BackSide
    });
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    skybox.position.set(0, 0, 0);
    skybox.isMovable = false;
    scene.add(skybox);
};

export default SkyBoxLoader;