import * as THREE from 'three';
import { parseCreationModelId } from '@/api/customCreations';
import { buildGroupFromBrickInstances } from '../../../WorkShop/WorkshopEngine/BrickFactory';

const placementBox = new THREE.Box3();

const alignCreationToWorldPosition = (root, worldPosition = {}) => {
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

/**
 * @param {'add' | 'restore'} type
 * @param {string | object} modelData - CREATION_<id> or saved scene entry
 * @param {object | THREE.Vector3 | null} position
 * @param {THREE.Scene} scene
 * @param {Record<string, object>} customCreations
 */
const CreationLoader = (type, modelData, position, scene, customCreations = {}) => {
  const modelId = typeof modelData === 'string' ? modelData : modelData?.modelId;
  const creationId = parseCreationModelId(modelId);
  if (!creationId) {
    return null;
  }

  const creation = customCreations[creationId];
  if (!creation?.brickInstances?.length) {
    console.warn(`CreationLoader: missing creation data for ${creationId}`);
    return null;
  }

  const group = buildGroupFromBrickInstances(creation.brickInstances, {
    name: creation.name || 'CustomCreation',
    modelId,
    creationId,
  });

  switch (type) {
    case 'add':
      if (position?.isVector3) {
        alignCreationToWorldPosition(group, position);
      } else if (position) {
        alignCreationToWorldPosition(group, position);
      } else {
        alignCreationToWorldPosition(group);
      }
      break;
    case 'restore': {
      const saved = position || {};
      if (saved.position) {
        group.position.set(saved.position.x, saved.position.y, saved.position.z);
      }
      if (saved.rotation) {
        group.rotation.set(saved.rotation.x, saved.rotation.y, saved.rotation.z);
      }
      group.updateMatrixWorld(true);
      break;
    }
    default:
      break;
  }

  scene.add(group);
  return group;
};

export default CreationLoader;