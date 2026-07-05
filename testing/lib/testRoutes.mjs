/** Canonical paths for Puppeteer tests — mirrors src/lib/routes.js without importing app code. */
export const TEST_ROUTES = {
  authentication: '/authentication',
  mainMenu: '/main-menu',
  options: '/options',
  credits: '/credits',
  startStack: {
    start: '/start-stack/start',
    mainGame: '/start-stack/main-game',
    workshop: '/start-stack/main-game/workshop',
    snapshot: '/start-stack/main-game/snapshot',
    myModels: '/start-stack/main-game/my-models',
  },
};