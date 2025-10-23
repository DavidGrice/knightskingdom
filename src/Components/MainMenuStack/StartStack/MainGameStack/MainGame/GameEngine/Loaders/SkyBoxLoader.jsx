// import * as THREE from 'three';

// const SkyBoxLoader = (mapData, scene) => {
//     const skyboxGeometry = new THREE.BoxGeometry(600, 600, 600);
//     const texLoader = new THREE.CubeTextureLoader();
//     const texturePaths = mapData.skyBoxes.map((skyBox) => skyBox.filePath);
//     const texture = texLoader.load(
//         texturePaths,
//         () => console.log('Skybox textures loaded successfully'),
//         undefined,
//         (error) => console.error('Error loading skybox textures:', error)
//     );
//     const skyboxMaterial = new THREE.MeshBasicMaterial({
//         envMap: texture,
//         side: THREE.BackSide
//     });
//     const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
//     skybox.position.set(0, 0, 0);
//     skybox.isMovable = false;
//     scene.add(skybox);
// };

// export default SkyBoxLoader;

import * as THREE from 'three';

const SkyBoxLoader = (mapData, scene, selectedClimateMode) => {
    const skyboxGeometry = new THREE.BoxGeometry(600, 600, 600);
    const texLoader = new THREE.CubeTextureLoader();
    const texturePaths = mapData.skyBoxes.map((skyBox) => skyBox.filePath);
    const texture = texLoader.load(
        texturePaths,
        () => console.log('Skybox textures loaded successfully'),
        undefined,
        (error) => console.error('Error loading skybox textures:', error)
    );

    const skyboxMaterial = new THREE.ShaderMaterial({
        uniforms: {
            skybox: { value: texture },
            climateFactor: { value: 1.0 }, // Default climate factor
            climateMode: { value: selectedClimateMode }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform samplerCube skybox;
            uniform float climateFactor;
            uniform int climateMode;
            varying vec3 vWorldPosition;

            void main() {
                vec3 direction = normalize(vWorldPosition);
                vec4 texColor = textureCube(skybox, direction);

                // Modify the color based on climateMode
                switch (climateMode) {
                    case 0: // SUNNY
                        texColor.rgb *= climateFactor;
                        break;
                    case 1: // WINDY
                        texColor.rgb *= climateFactor * vec3(0.8, 0.8, 1.0);
                        break;
                    case 2: // FOGGY
                        texColor.rgb *= climateFactor * vec3(0.7, 0.7, 0.7);
                        break;
                    case 3: // RAIN
                        texColor.rgb *= climateFactor * vec3(0.5, 0.5, 0.8);
                        break;
                    case 4: // SNOW
                        texColor.rgb *= climateFactor * vec3(1.0, 1.0, 1.0);
                        break;
                    case 5: // DARK_SUNNY
                        texColor.rgb *= climateFactor * vec3(0.5, 0.5, 0.3);
                        break;
                    case 6: // DARK_WINDY
                        texColor.rgb *= climateFactor * vec3(0.4, 0.4, 0.6);
                        break;
                    case 7: // DARK_FOGGY
                        texColor.rgb *= climateFactor * vec3(0.3, 0.3, 0.3);
                        break;
                    case 8: // DARK_DRIZZLY
                        texColor.rgb *= climateFactor * vec3(0.4, 0.4, 0.5);
                        break;
                    case 9: // DARK_THUNDERSTORM
                        texColor.rgb *= climateFactor * vec3(0.2, 0.2, 0.3);
                        break;
                    default: // Default to SUNNY
                        texColor.rgb *= climateFactor;
                        break;
                }

                gl_FragColor = texColor;
            }
        `,
        side: THREE.BackSide
    });

    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    skybox.position.set(0, 0, 0);
    skybox.isMovable = false;
    skybox.name = "SkyBox";
    scene.add(skybox);

    // Function to update the climate mode
    const updateClimate = (newClimateMode) => {
        skyboxMaterial.uniforms.climateMode.value = newClimateMode;
    };

    return updateClimate;
};

export default SkyBoxLoader;
