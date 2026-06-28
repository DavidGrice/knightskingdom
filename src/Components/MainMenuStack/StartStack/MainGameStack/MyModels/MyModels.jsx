import React from 'react';

const MyModels = ({ selectedProfile }) => {
  const savedWorlds = selectedProfile?.savedWorlds || {};
  const entries = Object.values(savedWorlds);

  if (entries.length === 0) {
    return (
      <div style={{ padding: '24px', color: '#fff', textAlign: 'center' }}>
        No saved worlds yet. Play a world and use the save button in-game.
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', color: '#fff' }}>
      <h2>Saved Worlds</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {entries.map((entry) => (
          <li key={entry.worldId} style={{ marginBottom: '12px' }}>
            {entry.worldName || `World ${entry.worldId}`}
            {entry.thumbnail && (
              <img
                src={entry.thumbnail}
                alt={`Save thumbnail for ${entry.worldName || entry.worldId}`}
                style={{ display: 'block', maxWidth: '120px', marginTop: '6px' }}
              />
            )}
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              {entry.snapshots?.length || 0} snapshot(s)
              {entry.updatedAt ? ` · ${new Date(entry.updatedAt).toLocaleString()}` : ''}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyModels;