/** Canonical app paths — single source of truth for navigation. */

export const ROUTES = {
  home: '/',
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

export const MAIN_GAME_BASE = ROUTES.startStack.mainGame;