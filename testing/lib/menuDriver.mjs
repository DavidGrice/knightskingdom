import { BASE_URL, seedAuth } from './driver.mjs';

/** Navigate to authentication screen */
export const gotoAuthentication = async (page) => {
  await page.goto(`${BASE_URL}/authentication`, { waitUntil: 'networkidle0' });
};

/** Seed auth + land on world picker */
export const gotoWorldPicker = async (page) => {
  await seedAuth(page);
  await page.goto(`${BASE_URL}/start-stack/start`, { waitUntil: 'networkidle0' });
};

/** Seed auth, select world 1, land in main game */
export const gotoMainGame = async (page) => {
  const { selectWorld, waitForMapLoad } = await import('./driver.mjs');
  await seedAuth(page);
  await selectWorld(page, 0);
  await waitForMapLoad(page, 3000);
};

/**
 * Seed profile with saved world + snapshot fixtures for save/photo menu tests.
 */
export const seedProfileWithFixtures = async (page) => {
  await page.goto(`${BASE_URL}/authentication`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const profile = {
      id: 1,
      name: 'Regression',
      level: 'baronet',
      options: { brickQuality: 'high', renderer: 'hardware', dialogue: 'off', music: 'off' },
      savedWorlds: {
        1: {
          thumbnail: tinyPng,
          updatedAt: new Date().toISOString(),
          snapshots: [
            { id: 1001, imageDataUrl: tinyPng, createdAt: new Date().toISOString() },
            { id: 1002, imageDataUrl: tinyPng, createdAt: new Date().toISOString() },
          ],
          scene: { models: [], camera: {}, climate: 'sunny' },
        },
      },
    };
    sessionStorage.setItem('knights-kingdom-auth', JSON.stringify({ selectedProfile: profile }));
    localStorage.setItem('knights-kingdom-user-data', JSON.stringify([profile]));
  });
};

export const gotoMyModels = async (page) => {
  await seedProfileWithFixtures(page);
  await page.goto(`${BASE_URL}/start-stack/main-game/my-models`, { waitUntil: 'networkidle0' });
};

export const gotoSnapshot = async (page) => {
  await seedProfileWithFixtures(page);
  await page.goto(`${BASE_URL}/start-stack/main-game/snapshot`, {
    waitUntil: 'networkidle0',
  });
  // Snapshot route may need world context — inject mapData via session if needed
  await page.evaluate(() => {
    const w = window;
    if (!w.__testMapData) {
      w.__testMapData = { id: 1, name: 'World 1', snapshots: [] };
    }
  });
};