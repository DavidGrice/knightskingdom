export const ensureProfileSaveSlots = (profile) => ({
  ...profile,
  savedWorlds: profile.savedWorlds || {},
});

export const saveWorldProgress = (userData, profileId, worldId, payload) =>
  userData.map((profile) => {
    if (profile.id !== profileId) {
      return profile;
    }

    const withSlots = ensureProfileSaveSlots(profile);
    const existing = withSlots.savedWorlds[worldId] || { snapshots: [] };

    return {
      ...withSlots,
      savedWorlds: {
        ...withSlots.savedWorlds,
        [worldId]: {
          ...existing,
          ...payload,
          worldId,
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

    const withSlots = ensureProfileSaveSlots(profile);
    const existing = withSlots.savedWorlds[worldId] || { snapshots: [] };
    const snapshots = [...(existing.snapshots || []), snapshotEntry];

    return {
      ...withSlots,
      savedWorlds: {
        ...withSlots.savedWorlds,
        [worldId]: {
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
  profile?.savedWorlds?.[worldId] || null;