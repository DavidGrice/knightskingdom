export const ensureProfileSaveSlots = (profile) => ({
  ...profile,
  savedWorlds: profile.savedWorlds || {},
});

const worldKey = (worldId) => String(worldId);

/** Resolve thumbnail src from any snapshot shape (legacy `image` or `imageDataUrl`). */
export const resolveSnapshotImage = (entry) => {
  if (!entry) {
    return null;
  }
  if (typeof entry.imageDataUrl === 'string' && entry.imageDataUrl.length > 0) {
    return entry.imageDataUrl;
  }
  if (typeof entry.image === 'string' && entry.image.length > 0) {
    return entry.image;
  }
  if (typeof entry.thumbnail === 'string' && entry.thumbnail.length > 0) {
    return entry.thumbnail;
  }
  return null;
};

/** Reject truncated data URLs and other corrupt snapshot payloads. */
export const isValidSnapshotImage = (src) => {
  if (!src || typeof src !== 'string') {
    return false;
  }

  if (src.startsWith('data:image/')) {
    const base64 = src.split('base64,')[1];
    return Boolean(base64 && base64.length >= 100);
  }

  return src.startsWith('/') || src.startsWith('http') || src.includes('.png') || src.includes('.jpg');
};

export const normalizeSnapshotEntry = (entry) => {
  const image = resolveSnapshotImage(entry);
  if (!isValidSnapshotImage(image)) {
    return null;
  }
  return {
    ...entry,
    image,
    imageDataUrl: entry.imageDataUrl || (image.startsWith('data:') ? image : entry.imageDataUrl),
  };
};

export const saveWorldProgress = (userData, profileId, worldId, payload) =>
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
          ...payload,
          worldId: Number(worldId) || worldId,
          updatedAt: new Date().toISOString(),
          snapshots: payload.snapshots || existing.snapshots || [],
        },
      },
    };
  });

export const appendWorldSnapshot = (userData, profileId, worldId, snapshotEntry) =>
  userData.map((profile) => {
    if (profile.id !== profileId) {
      return profile;
    }

    const key = worldKey(worldId);
    const withSlots = ensureProfileSaveSlots(profile);
    const existing = withSlots.savedWorlds[key] || { snapshots: [] };
    const normalizedEntry = normalizeSnapshotEntry(snapshotEntry);
    if (!normalizedEntry) {
      return withSlots;
    }

    const cleanedExisting = (existing.snapshots || [])
      .map((entry) => normalizeSnapshotEntry(entry))
      .filter(Boolean);
    const snapshots = [...cleanedExisting, normalizedEntry];

    return {
      ...withSlots,
      savedWorlds: {
        ...withSlots.savedWorlds,
        [key]: {
          ...existing,
          worldId,
          snapshots,
          updatedAt: new Date().toISOString(),
        },
      },
    };
  });

export const updateProfileOptions = (userData, profileId, optionsPatch) =>
  userData.map((profile) =>
    profile.id === profileId
      ? { ...profile, options: { ...profile.options, ...optionsPatch } }
      : profile
  );

export const getSavedWorld = (profile, worldId) =>
  profile?.savedWorlds?.[worldKey(worldId)] || null;

export const getWorldSnapshots = (profile, worldId) =>
  getSavedWorld(profile, worldId)?.snapshots || [];

export const mergeSnapshotLists = (...lists) => {
  const seen = new Set();
  const merged = [];

  lists.flat().forEach((entry) => {
    if (!entry) {
      return;
    }
    const key = entry.id != null
      ? `id:${entry.id}`
      : entry.createdAt
        ? `at:${entry.createdAt}`
        : entry.imageDataUrl
          ? `img:${entry.imageDataUrl.slice(0, 64)}`
          : null;
    if (!key || seen.has(key)) {
      return;
    }
    seen.add(key);
    merged.push(entry);
  });

  return merged.sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
  );
};

export const removeWorldSnapshot = (userData, profileId, worldId, snapshotId) =>
  userData.map((profile) => {
    if (profile.id !== profileId) {
      return profile;
    }

    const key = worldKey(worldId);
    const withSlots = ensureProfileSaveSlots(profile);
    const existing = withSlots.savedWorlds[key];
    if (!existing) {
      return withSlots;
    }

    const snapshots = (existing.snapshots || []).filter(
      (entry) => String(entry.id) !== String(snapshotId),
    );

    return {
      ...withSlots,
      savedWorlds: {
        ...withSlots.savedWorlds,
        [key]: {
          ...existing,
          snapshots,
          updatedAt: new Date().toISOString(),
        },
      },
    };
  });

export const getSavedWorldsList = (profile) => {
  const saved = profile?.savedWorlds || {};
  return Object.entries(saved).map(([key, data]) => ({
    id: key,
    worldId: data.worldId ?? key,
    name: data.worldName || `World ${key}`,
    image: data.thumbnail || null,
    scene: data.scene || null,
    updatedAt: data.updatedAt || null,
    snapshots: data.snapshots || [],
  }));
};

export const deleteSavedWorld = (userData, profileId, worldId) =>
  userData.map((profile) => {
    if (profile.id !== profileId) {
      return profile;
    }
    const key = worldKey(worldId);
    const withSlots = ensureProfileSaveSlots(profile);
    const { [key]: removed, ...rest } = withSlots.savedWorlds;
    return { ...withSlots, savedWorlds: rest };
  });