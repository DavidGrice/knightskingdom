import * as THREE from 'three';
import { disposeObject3D, removeSceneObjectByName } from '../sceneDispose';

const WEATHER_SYSTEM_NAMES = ['SNOW', 'RAIN', 'FOGGY', 'WINDY'];

const removeCurrentWeatherSystem = (scene, currentSystem, climateNeedsUpdating) => {
  if (!climateNeedsUpdating || !currentSystem) {
    return;
  }

  scene.remove(currentSystem);
  disposeObject3D(currentSystem);
};

const updateAmbientLight = (scene, color, intensity) => {
  let ambientLight = scene.getObjectByName('systemLight');
  if (!ambientLight) {
    ambientLight = new THREE.AmbientLight(color, intensity);
    ambientLight.name = 'systemLight';
    scene.add(ambientLight);
    return;
  }

  ambientLight.color.set(color);
  ambientLight.intensity = intensity;
};

const createSunnySystem = (scene) => {
  updateAmbientLight(scene, 0x404040, 35);
  return null;
};

const createSnowParticleSystem = (scene) => {
  updateAmbientLight(scene, 0xffffff, 5);
  const snowGeometry = new THREE.BufferGeometry();
  const snowVertices = [];

  for (let i = 0; i < 10000; i += 1) {
    snowVertices.push(
      Math.random() * 1000 - 500,
      Math.random() * 500,
      Math.random() * 1000 - 500,
    );
  }

  snowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(snowVertices, 3));
  const snowMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
    transparent: true,
    opacity: 0.8,
  });
  const snow = new THREE.Points(snowGeometry, snowMaterial);
  snow.name = 'SNOW';
  scene.add(snow);
  return snow;
};

const createRainParticleSystem = (scene) => {
  updateAmbientLight(scene, 0x000080, 50);
  const rainGeometry = new THREE.BufferGeometry();
  const rainVertices = [];

  for (let i = 0; i < 2000; i += 1) {
    rainVertices.push(
      Math.random() * 1000 - 500,
      Math.random() * 500,
      Math.random() * 1000 - 500,
    );
  }

  rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rainVertices, 3));
  const rainMaterial = new THREE.PointsMaterial({
    color: 0x63e5ff,
    size: 0.5,
  });
  const rain = new THREE.Points(rainGeometry, rainMaterial);
  rain.name = 'RAIN';
  scene.add(rain);
  return rain;
};

const createFogSystem = (scene) => {
  updateAmbientLight(scene, 0xffffff, 20);
  const fogGeometry = new THREE.BufferGeometry();
  const fogVertices = [];

  for (let i = 0; i < 10000; i += 1) {
    fogVertices.push(
      Math.random() * 1000 - 500,
      Math.random() * 500,
      Math.random() * 1000 - 500,
    );
  }

  fogGeometry.setAttribute('position', new THREE.Float32BufferAttribute(fogVertices, 3));
  const fogMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.5,
    transparent: true,
    opacity: 0.5,
  });
  const fog = new THREE.Points(fogGeometry, fogMaterial);
  fog.name = 'FOGGY';
  scene.add(fog);
  return fog;
};

const createWindySystem = (scene) => {
  updateAmbientLight(scene, 0xffffff, 0.2);
  const particleCount = 1000;
  const particles = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i += 1) {
    particles[i * 3] = Math.random() * 500 - 250;
    particles[i * 3 + 1] = Math.random() * 500 - 250;
    particles[i * 3 + 2] = Math.random() * 500 - 250;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
  });
  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  particleSystem.name = 'WINDY';
  scene.add(particleSystem);
  return particleSystem;
};

const updateWeatherSystem = (climate, system) => {
  if (!system?.geometry?.attributes?.position) {
    return;
  }

  const speedFactor = 10;
  const positions = system.geometry.attributes.position.array;

  if (climate === 'SNOW' || climate === 'RAIN') {
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] -= Math.random() * speedFactor;
      if (positions[i + 1] < 0) {
        positions[i + 1] = 500;
      }
    }
    system.geometry.attributes.position.needsUpdate = true;
    return;
  }

  if (climate === 'WINDY') {
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += Math.random() * 0.1 - 0.05;
      positions[i + 1] += Math.random() * 0.1 - 0.05;
      positions[i + 2] += Math.random() * 0.1 - 0.05;
    }
    system.geometry.attributes.position.needsUpdate = true;
  }
};

const ClimateLoader = (
  climate,
  scene,
  climateNeedsUpdating = false,
  currentSystem = null,
  setCurrentSystem = null,
  registerFrameCallback = null,
) => {
  removeCurrentWeatherSystem(scene, currentSystem, climateNeedsUpdating);
  WEATHER_SYSTEM_NAMES.forEach((name) => removeSceneObjectByName(scene, name));

  let system = null;
  switch (climate) {
    case 'SUNNY':
      createSunnySystem(scene);
      break;
    case 'SNOW':
      system = createSnowParticleSystem(scene);
      break;
    case 'RAIN':
      system = createRainParticleSystem(scene);
      break;
    case 'FOGGY':
      system = createFogSystem(scene);
      break;
    case 'WINDY':
      system = createWindySystem(scene);
      break;
    default:
      break;
  }

  if (typeof setCurrentSystem === 'function') {
    setCurrentSystem(system);
  }

  if (system && typeof registerFrameCallback === 'function') {
    registerFrameCallback(() => updateWeatherSystem(climate, system));
  }

  return system;
};

export { WEATHER_SYSTEM_NAMES, updateWeatherSystem };
export default ClimateLoader;