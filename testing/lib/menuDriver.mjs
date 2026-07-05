import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BASE_URL, seedAuth } from './driver.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_SNAPSHOT_IMAGE = `data:image/png;base64,${
  fs.readFileSync(path.join(__dirname, '..', 'castle-fixed.png')).toString('base64')
}`;

/** Navigate to authentication screen */
export const gotoAuthentication = async (page) => {
  await page.goto(`${BASE_URL}/authentication`, { waitUntil: 'networkidle0' });
};

/** Auth with seeded profiles — empty row + named rows for typography/layout tests */
export const gotoAuthenticationWithProfiles = async (page) => {
  await page.goto(`${BASE_URL}/authentication`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const profiles = [
      {
        id: 1,
        name: 'David',
        level: 'knight',
        options: { brickQuality: 'high', renderer: 'hardware', dialogue: 'off', music: 'off' },
      },
      {
        id: 2,
        name: 'Alice',
        level: 'page',
        options: { brickQuality: 'high', renderer: 'hardware', dialogue: 'off', music: 'off' },
      },
    ];
    localStorage.setItem('knights-kingdom-user-data', JSON.stringify(profiles));
    sessionStorage.removeItem('knights-kingdom-auth');
  });
  await page.reload({ waitUntil: 'networkidle0' });
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
  await page.evaluate((snapshotImage) => {
    const profile = {
      id: 1,
      name: 'Regression',
      level: 'baronet',
      options: { brickQuality: 'high', renderer: 'hardware', dialogue: 'off', music: 'off' },
      savedWorlds: {
        1: {
          thumbnail: snapshotImage,
          updatedAt: new Date().toISOString(),
          snapshots: [
            { id: 1001, imageDataUrl: snapshotImage, createdAt: new Date().toISOString() },
            { id: 1002, imageDataUrl: snapshotImage, createdAt: new Date().toISOString() },
          ],
          scene: { models: [], camera: {}, climate: 'sunny' },
        },
      },
    };
    sessionStorage.setItem('knights-kingdom-auth', JSON.stringify({ selectedProfile: profile }));
    localStorage.setItem('knights-kingdom-user-data', JSON.stringify([profile]));
  }, TEST_SNAPSHOT_IMAGE);
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
};