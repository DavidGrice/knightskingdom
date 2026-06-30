import { ensureProfileSaveSlots } from './worldSave';

export const MAX_CUSTOM_CREATIONS = 20;

const creationKey = (id) => String(id);

const profileMatches = (profile, profileId) =>
  String(profile?.id) === String(profileId);

/**
 * @param {object | null | undefined} profile
 * @returns {Record<string, object>}
 */
export const getCustomCreations = (profile) => profile?.customCreations ?? {};

/**
 * @param {Record<string, object>} creations
 */
const pruneOldestCreations = (creations, maxCount = MAX_CUSTOM_CREATIONS) => {
  const entries = Object.values(creations);
  if (entries.length <= maxCount) {
    return creations;
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(a.updatedAt || a.createdAt).getTime()
      - new Date(b.updatedAt || b.createdAt).getTime(),
  );
  const toRemove = sorted.slice(0, entries.length - maxCount);
  const next = { ...creations };
  toRemove.forEach((entry) => {
    delete next[creationKey(entry.id)];
  });
  return next;
};

/**
 * @param {Array} userData
 * @param {string} profileId
 * @param {object} payload
 * @param {string} [payload.id] - reuse to update an existing creation
 * @param {string} [payload.name]
 * @param {Array} payload.brickInstances
 * @param {string | null} [payload.thumbnail]
 * @param {number | string | null} [payload.worldId]
 */
export const saveCustomCreation = (userData, profileId, payload) => {
  const now = new Date().toISOString();
  const id = creationKey(payload.id || crypto.randomUUID());

  return userData.map((profile) => {
    if (!profileMatches(profile, profileId)) {
      return profile;
    }

    const withSlots = ensureProfileSaveSlots(profile);
    const existing = getCustomCreations(withSlots);
    const prior = existing[id];

    const entry = {
      id,
      name: payload.name || prior?.name || 'My Creation',
      brickInstances: payload.brickInstances || [],
      thumbnail: payload.thumbnail ?? prior?.thumbnail ?? null,
      worldId: payload.worldId ?? prior?.worldId ?? null,
      createdAt: prior?.createdAt || now,
      updatedAt: now,
    };

    const merged = pruneOldestCreations({
      ...existing,
      [id]: entry,
    });

    return {
      ...withSlots,
      customCreations: merged,
    };
  });
};

export const deleteCustomCreation = (userData, profileId, creationId) =>
  userData.map((profile) => {
    if (!profileMatches(profile, profileId)) {
      return profile;
    }

    const withSlots = ensureProfileSaveSlots(profile);
    const existing = getCustomCreations(withSlots);
    const key = creationKey(creationId);
    if (!existing[key]) {
      return withSlots;
    }

    const { [key]: _removed, ...rest } = existing;
    return {
      ...withSlots,
      customCreations: rest,
    };
  });

export const CREATION_MODEL_PREFIX = 'CREATION_';

export const toCreationModelId = (creationId) => `${CREATION_MODEL_PREFIX}${creationId}`;

/**
 * @param {string | null | undefined} modelId
 */
export const parseCreationModelId = (modelId) => {
  if (!modelId?.startsWith(CREATION_MODEL_PREFIX)) {
    return null;
  }
  return modelId.slice(CREATION_MODEL_PREFIX.length);
};

export const isCreationModelId = (modelId) => Boolean(parseCreationModelId(modelId));