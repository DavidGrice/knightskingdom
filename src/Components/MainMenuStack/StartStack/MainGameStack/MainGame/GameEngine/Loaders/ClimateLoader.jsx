import * as THREE from 'three';
import { disposeObject3D, removeSceneObjectByName } from '../sceneDispose';

const WEATHER_SYSTEM_NAMES = ['SNOW', 'RAIN', 'FOGGY', 'WINDY'];

const FOG_LAYER_SHADER = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPos;
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 fogColor;
    uniform float opacity;
    uniform float time;
    uniform float layerOffset;
    varying vec2 vUv;
    varying vec3 vWorldPos;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    void main() {
      vec2 uv = vWorldPos.xz * 0.012 + layerOffset;
      float n = noise(uv + vec2(time * 0.04, time * 0.025));
      float n2 = noise(uv * 2.2 - vec2(time * 0.02, time * 0.035));
      float mist = smoothstep(0.2, 0.82, n * 0.55 + n2 * 0.45);
      float alpha = mist * opacity;
      if (alpha < 0.01) {
        discard;
      }
      gl_FragColor = vec4(fogColor, alpha);
    }
  `,
};

const clearSceneFog = (scene) => {
  scene.fog = null;
};

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

const createSunnySystem = (scene, { dark = false } = {}) => {
  clearSceneFog(scene);
  if (dark) {
    scene.fog = new THREE.FogExp2(0x2a2520, 0.008);
    updateAmbientLight(scene, 0x3a3028, 10);
    return null;
  }
  updateAmbientLight(scene, 0x404040, 35);
  return null;
};

const createSnowParticleSystem = (scene) => {
  clearSceneFog(scene);
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

  const snowPositions = new THREE.Float32BufferAttribute(snowVertices, 3);
  snowPositions.setUsage(THREE.DynamicDrawUsage);
  snowGeometry.setAttribute('position', snowPositions);
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

const createRainParticleSystem = (scene, {
  particleCount = 2000,
  ambientColor = 0x000080,
  ambientIntensity = 50,
  rainColor = 0x63e5ff,
  rainSpeed = 10,
  atmosphericFog = null,
} = {}) => {
  clearSceneFog(scene);
  if (atmosphericFog) {
    scene.fog = atmosphericFog;
  }
  updateAmbientLight(scene, ambientColor, ambientIntensity);
  const rainGeometry = new THREE.BufferGeometry();
  const rainVertices = [];

  for (let i = 0; i < particleCount; i += 1) {
    rainVertices.push(
      Math.random() * 1000 - 500,
      Math.random() * 500,
      Math.random() * 1000 - 500,
    );
  }

  const rainPositions = new THREE.Float32BufferAttribute(rainVertices, 3);
  rainPositions.setUsage(THREE.DynamicDrawUsage);
  rainGeometry.setAttribute('position', rainPositions);
  const rainMaterial = new THREE.PointsMaterial({
    color: rainColor,
    size: 0.5,
  });
  const rain = new THREE.Points(rainGeometry, rainMaterial);
  rain.name = 'RAIN';
  rain.userData.rainSpeed = rainSpeed;
  scene.add(rain);
  return rain;
};

const createFogLayer = (y, opacity, size, fogColor, layerOffset) => {
  const geometry = new THREE.PlaneGeometry(size, size, 1, 1);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      fogColor: { value: new THREE.Color(fogColor) },
      opacity: { value: opacity },
      time: { value: 0 },
      layerOffset: { value: layerOffset },
    },
    vertexShader: FOG_LAYER_SHADER.vertexShader,
    fragmentShader: FOG_LAYER_SHADER.fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const layer = new THREE.Mesh(geometry, material);
  layer.position.y = y;
  layer.renderOrder = 2;
  return layer;
};

const createFogSystem = (scene, { dark = false } = {}) => {
  updateAmbientLight(scene, dark ? 0x888888 : 0xc8ccd4, dark ? 12 : 18);
  const fogColor = dark ? 0x6a6e78 : 0xd4d8e0;
  const atmosphericColor = dark ? 0x5a5e68 : 0xb8bcc8;
  scene.fog = new THREE.FogExp2(atmosphericColor, dark ? 0.022 : 0.014);

  const fogGroup = new THREE.Group();
  fogGroup.name = 'FOGGY';

  const layers = [
    { y: 0.6, opacity: dark ? 0.55 : 0.62 },
    { y: 2.0, opacity: dark ? 0.42 : 0.48 },
    { y: 4.5, opacity: dark ? 0.3 : 0.34 },
    { y: 7.5, opacity: dark ? 0.2 : 0.22 },
    { y: 11.0, opacity: dark ? 0.12 : 0.14 },
  ];

  layers.forEach((layer, index) => {
    fogGroup.add(createFogLayer(
      layer.y,
      layer.opacity,
      560,
      fogColor,
      index * 17.3,
    ));
  });

  scene.add(fogGroup);
  return fogGroup;
};

const createWindySystem = (scene, { dark = false } = {}) => {
  clearSceneFog(scene);
  if (dark) {
    scene.fog = new THREE.FogExp2(0x3a3a50, 0.01);
    updateAmbientLight(scene, 0x505070, 8);
  } else {
    updateAmbientLight(scene, 0xffffff, 0.2);
  }
  const particleCount = 1000;
  const particles = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i += 1) {
    particles[i * 3] = Math.random() * 500 - 250;
    particles[i * 3 + 1] = Math.random() * 500 - 250;
    particles[i * 3 + 2] = Math.random() * 500 - 250;
  }

  const particleGeometry = new THREE.BufferGeometry();
  const windyPositions = new THREE.BufferAttribute(particles, 3);
  windyPositions.setUsage(THREE.DynamicDrawUsage);
  particleGeometry.setAttribute('position', windyPositions);
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
  });
  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  particleSystem.name = 'WINDY';
  scene.add(particleSystem);
  return particleSystem;
};

const updateWeatherSystem = (system) => {
  if (system.name === 'FOGGY') {
    system.traverse((child) => {
      if (child.material?.uniforms?.time) {
        child.material.uniforms.time.value += 0.01;
      }
    });
    return;
  }

  const positionAttribute = system?.geometry?.attributes?.position;
  if (!positionAttribute?.array) {
    return;
  }

  const positions = positionAttribute.array;

  if (system.name === 'SNOW' || system.name === 'RAIN') {
    const speedFactor = system.name === 'SNOW' ? 2 : (system.userData?.rainSpeed ?? 10);
    for (let i = 0; i < positions.length; i += 3) {
      if (system.name === 'SNOW') {
        positions[i] += Math.random() * 0.4 - 0.2;
      }
      positions[i + 1] -= Math.random() * speedFactor;
      if (positions[i + 1] < 0) {
        positions[i + 1] = 500;
      }
    }
    positionAttribute.needsUpdate = true;
    return;
  }

  if (system.name === 'WINDY') {
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += Math.random() * 0.1 - 0.05;
      positions[i + 1] += Math.random() * 0.1 - 0.05;
      positions[i + 2] += Math.random() * 0.1 - 0.05;
    }
    positionAttribute.needsUpdate = true;
  }
};

const animateWeatherSystems = (scene) => {
  WEATHER_SYSTEM_NAMES.forEach((name) => {
    const weatherSystem = scene.getObjectByName(name);
    if (weatherSystem) {
      updateWeatherSystem(weatherSystem);
    }
  });
};

const ClimateLoader = (
  climate,
  scene,
  climateNeedsUpdating = false,
  currentSystem = null,
  setCurrentSystem = null,
) => {
  removeCurrentWeatherSystem(scene, currentSystem, climateNeedsUpdating);
  WEATHER_SYSTEM_NAMES.forEach((name) => removeSceneObjectByName(scene, name));
  clearSceneFog(scene);

  let system = null;
  switch (climate) {
    case 'SUNNY':
      createSunnySystem(scene);
      break;
    case 'DARK_SUNNY':
      createSunnySystem(scene, { dark: true });
      break;
    case 'SNOW':
      system = createSnowParticleSystem(scene);
      break;
    case 'RAIN':
      system = createRainParticleSystem(scene);
      break;
    case 'DARK_DRIZZLY':
      system = createRainParticleSystem(scene, {
        particleCount: 1200,
        ambientColor: 0x1a1a40,
        ambientIntensity: 22,
        rainColor: 0x4a6a9a,
        rainSpeed: 4,
        atmosphericFog: new THREE.FogExp2(0x1a1a30, 0.012),
      });
      break;
    case 'DARK_THUNDERSTORM':
      system = createRainParticleSystem(scene, {
        particleCount: 3500,
        ambientColor: 0x0a0a20,
        ambientIntensity: 18,
        rainColor: 0x3a5a8a,
        rainSpeed: 18,
        atmosphericFog: new THREE.FogExp2(0x0a0a18, 0.018),
      });
      break;
    case 'FOGGY':
      system = createFogSystem(scene);
      break;
    case 'DARK_FOGGY':
      system = createFogSystem(scene, { dark: true });
      break;
    case 'WINDY':
      system = createWindySystem(scene);
      break;
    case 'DARK_WINDY':
      system = createWindySystem(scene, { dark: true });
      break;
    default:
      break;
  }

  if (typeof setCurrentSystem === 'function') {
    setCurrentSystem(system);
  }

  return system;
};

export { WEATHER_SYSTEM_NAMES, animateWeatherSystems, updateWeatherSystem };
export default ClimateLoader;