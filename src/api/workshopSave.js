import { ensureProfileSaveSlots } from './worldSave';

const worldKey = (worldId) => String(worldId);

/**
 * @typedef {object} WorkshopDraft
 * @property {Array} brickInstances
 * @property {string | null} [thumbnail]
 * @property {string} [updatedAt]
 */

export const getWorkshopDraft = (profile, worldId) => {
  const key = worldKey(worldId);
  return profile?.savedWorlds?.[key]?.workshopDraft ?? null;
};

export const saveWorkshopDraft = (userData, profileId, worldId, payload) =>
  userData.map((profile) => {
    if (profile.id !== profileId) {
      return profile;
    }

    const key = worldKey(worldId);
    const withSlots = ensureProfileSaveSlots(profile);
    const existing = withSlots.savedWorlds[key] || { snapshots: [] };

    return {
      ...withSlots,
      savedWorlds: {
        ...withSlots.savedWorlds,
        [key]: {
          ...existing,
          worldId: Number(worldId) || worldId,
          workshopDraft: {
            brickInstances: payload.brickInstances || [],
            thumbnail: payload.thumbnail ?? existing.workshopDraft?.thumbnail ?? null,
            creationId: payload.creationId ?? existing.workshopDraft?.creationId ?? null,
            updatedAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        },
      },
    };
  });

export const clearWorkshopDraft = (userData, profileId, worldId) =>
  userData.map((profile) => {
    if (profile.id !== profileId) {
      return profile;
    }

    const key = worldKey(worldId);
    const withSlots = ensureProfileSaveSlots(profile);
    const existing = withSlots.savedWorlds[key];
    if (!existing?.workshopDraft) {
      return withSlots;
    }

    const { workshopDraft: _removed, ...restWorld } = existing;

    return {
      ...withSlots,
      savedWorlds: {
        ...withSlots.savedWorlds,
        [key]: restWorld,
      },
    };
  });