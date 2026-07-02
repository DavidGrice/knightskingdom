const NAVIGATION_PENDING_KEY = 'kk-navigation-pending';

let loadingApi = null;

export const registerGameLoadingApi = (api) => {
  loadingApi = api;
};

export const unregisterGameLoadingApi = () => {
  loadingApi = null;
};

export const startGameLoading = (key) => {
  loadingApi?.startLoading(key);
};

export const stopGameLoading = (key) => {
  loadingApi?.stopLoading(key);
};

export const markNavigationPending = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(NAVIGATION_PENDING_KEY, '1');
  }
};

export const consumeNavigationPending = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const pending = sessionStorage.getItem(NAVIGATION_PENDING_KEY) === '1';
  sessionStorage.removeItem(NAVIGATION_PENDING_KEY);
  return pending;
};

/** Call before router.push to show the Lego Clock during the transition. */
export const beginNavigationLoading = (extraKeys = []) => {
  markNavigationPending();
  startGameLoading('navigation');
  extraKeys.forEach((key) => startGameLoading(key));
};