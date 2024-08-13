import { useEffect, useState } from 'react';
import * as THREE from 'three';

const ClimateLoader = (climate, scene, climateNeedsUpdating, currentSystem, setCurrentSystem) => {
    // const [currentClimate, setCurrentClimate] = useState(climate);
    // let currentSystems = [];
    let system = null;
    // const clearCurrentSystems = (scene) => {
    //     // Remove the current weather system
    //     if (climateNeedsUpdating && currentSystem !== null) {
    //         console.log('currentSystem:', currentSystem);
    //         if (currentSystem.length > 0) {
    //             currentSystem.forEach((system) => {
    //                 scene.remove(system);
    //             });
    //         }
    //     }
    //     // Remove the ambient light if it exists
    //     // const ambientLight = scene.getObjectByName('systemLight');
    //     // if (ambientLight) {
    //     //     scene.remove(ambientLight);
    //     // }
    // };

    const removeCurrentWeatherSystem = (scene) => {
        if (climateNeedsUpdating && currentSystem !== null) {
            scene.remove(currentSystem);
            currentSystem.geometry.dispose();
            currentSystem.material.dispose();
        }
    };

    // const clearAllSystems = (scene) => {
    //     if (currentSystems.length > 0) {
    //         currentSystems.forEach((system) => {
    //             scene.remove(system);
    //             system.geometry.dispose();
    //             system.material.dispose();
    //         });
    //     }
    //     currentSystems = [];
    // };

    // const clearSystemByName = (scene, name) => {
    //     const system = scene.getObjectByName(name);
    //     if (system) {
    //         scene.remove(system);
    //         system.geometry.dispose();
    //         system.material.dispose();
    //         currentSystems = currentSystems.filter(sys => sys.name !== name);
    //     }
    // };

    const updateAmbientLight = (scene, color, intensity) => {
        let ambientLight = scene.getObjectByName('systemLight');
        if (!ambientLight) {
            ambientLight = new THREE.AmbientLight(color, intensity);
            ambientLight.name = 'systemLight';
            scene.add(ambientLight);
        } else {
            ambientLight.color.set(color);
            ambientLight.intensity = intensity;
        }
    };
    

    const createSunnySystem = (scene) => {
        updateAmbientLight(scene, 0x404040, 35);
    }

    const createSnowParticleSystem = (scene) => {
        updateAmbientLight(scene, 0xffffff, 5);
        // Create the geometry for the snow particles
        const snowGeometry = new THREE.BufferGeometry();
        const snowVertices = [];

        // Create the vertices for the snow particles
        for (let i = 0; i < 10000; i++) {
            const snowflake = new THREE.Vector3(
                Math.random() * 1000 - 500,
                Math.random() * 500,
                Math.random() * 1000 - 500
            );
            snowVertices.push(snowflake.x, snowflake.y, snowflake.z);
        }

        snowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(snowVertices, 3));

        // Create the material for the snow particles
        const snowMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.8
        });

        // Create the Points object
        const snow = new THREE.Points(snowGeometry, snowMaterial);
        snow.name = 'SNOW'; // Add a name to the snow system
        setCurrentSystem(snow);
        // Add the snow particle system to the scene
        scene.add(snow);

        return snow;
    }

    const createRainParticleSystem = (scene) => {
        updateAmbientLight(scene, 0x000080, 50);
        // Create the geometry for the rain particles
        const rainGeometry = new THREE.BufferGeometry();
        const rainVertices = [];
    
        // Create the vertices for the rain particles
        for (let i = 0; i < 2000; i++) {
            const rainDrop = new THREE.Vector3(
                Math.random() * 1000 - 500,
                Math.random() * 500,
                Math.random() * 1000 - 500
            );
            rainVertices.push(rainDrop.x, rainDrop.y, rainDrop.z);
        }
    
        rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rainVertices, 3));
    
        // Create the material for the rain particles
        const rainMaterial = new THREE.PointsMaterial({
            color: 0x63e5ff,
            size: 0.5
        });
    
        // Create the Points object
        const rain = new THREE.Points(rainGeometry, rainMaterial);
        rain.name = 'RAIN'; // Add a name to the rain system
        setCurrentSystem(rain);
        // Add the rain particle system to the scene
        scene.add(rain);
    
        return rain;
    }

    const createFogSystem = (scene) => {
        updateAmbientLight(scene, 0xffffff, 20);
        // Create the geometry for the fog particles
        const fogGeometry = new THREE.BufferGeometry();
        const fogVertices = [];
    
        // Create the material for the fog particles
        const fogMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.5,
            transparent: true,
            opacity: 0.5
        });
    
        // Create the vertices for the fog particles
        for (let i = 0; i < 10000; i++) {
            const fogParticle = new THREE.Vector3(
                Math.random() * 1000 - 500,
                Math.random() * 500,
                Math.random() * 1000 - 500
            );
            fogVertices.push(fogParticle.x, fogParticle.y, fogParticle.z);
        }
    
        // Set the vertices to the BufferGeometry
        fogGeometry.setAttribute('position', new THREE.Float32BufferAttribute(fogVertices, 3));
    
        // Create the Points object
        const fog = new THREE.Points(fogGeometry, fogMaterial);
        fog.name = 'FOGGY'; // Add a name to the fog system
        setCurrentSystem(fog);
        // Add the fog particle system to the scene
        scene.add(fog);
    
        return fog;
    }

    const createWindySystem = (scene) => {
        updateAmbientLight(scene, 0xffffff, 0.2);
        // Create particles or objects to be affected by wind
        const particleCount = 1000;
        const particles = new Float32Array(particleCount * 3); // 3 coordinates per particle
    
        for (let i = 0; i < particleCount; i++) {
            const pX = Math.random() * 500 - 250;
            const pY = Math.random() * 500 - 250;
            const pZ = Math.random() * 500 - 250;
            particles[i * 3] = pX;
            particles[i * 3 + 1] = pY;
            particles[i * 3 + 2] = pZ;
        }
    
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    
        const pMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 1
        });
    
        const particleSystem = new THREE.Points(particleGeometry, pMaterial);
        particleSystem.name = 'WINDY'; // Add a name to the windy system
        scene.add(particleSystem);
    
        // Apply wind force to particles
        const windForce = new THREE.Vector3(0.1, 0, 0); // Wind blowing along the x-axis
        
        function applyWindForce() {
            const positions = particleGeometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] += windForce.x;
                positions[i * 3 + 1] += windForce.y;
                positions[i * 3 + 2] += windForce.z;
    
                if (positions[i * 3] > 250) positions[i * 3] = -250; // Reset position if out of bounds
            }
            particleGeometry.attributes.position.needsUpdate = true;
        }
        
        // Update the particles in the animation loop
        function animate() {
            requestAnimationFrame(animate);
            applyWindForce();
        }
        
        animate();
    };

    const updateWeatherSystem = (climate, system) => {
        const speedFactor = 10; // Adjust this value to increase/decrease the speed
        if (climate === 'SNOW') {
            const positions = system.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] -= Math.random() * speedFactor; // Move down along the y-axis
                if (positions[i + 1] < 0) {
                    positions[i + 1] = 500; // Reset position to the top
                }
            }
            system.geometry.attributes.position.needsUpdate = true;
        }
    
        if (climate === 'RAIN') {
            const positions = system.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] -= Math.random() * speedFactor; // Move down along the y-axis
                if (positions[i + 1] < 0) {
                    positions[i + 1] = 500; // Reset position to the top
                }
            }
            system.geometry.attributes.position.needsUpdate = true;
        }
    
        if (climate === 'WINDY') {
            const positions = system.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += Math.random() * 0.1 - 0.05; // Move randomly along the x-axis
                positions[i + 1] += Math.random() * 0.1 - 0.05; // Move randomly along the y-axis
                positions[i + 2] += Math.random() * 0.1 - 0.05; // Move randomly along the z-axis
            }
            system.geometry.attributes.position.needsUpdate = true;
        }
    
        if (climate === 'SUNNY') {
            // Do nothing
        }
    };
    
    switch (climate) {
        case 'SUNNY':
            removeCurrentWeatherSystem(scene);
            createSunnySystem(scene);
            break;
        case 'SNOW':
            removeCurrentWeatherSystem(scene);
            system = createSnowParticleSystem(scene);
            break;
        case 'RAIN':
            removeCurrentWeatherSystem(scene);
            system = createRainParticleSystem(scene);
            break;
        case 'FOGGY':
            removeCurrentWeatherSystem(scene);
            system = createFogSystem(scene);
            break;
        case 'WINDY':
            removeCurrentWeatherSystem(scene);
            system = createWindySystem(scene);
            break;
        default:
            removeCurrentWeatherSystem(scene);
            break;
    }
    // Call updateWeatherSystem in your animation loop
    function animate() {
        requestAnimationFrame(animate);
        updateWeatherSystem(climate, system);
        // renderer.render(scene, camera);
    }

    animate();
};

export default ClimateLoader;