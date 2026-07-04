import seedUserData from '@/api/data/userData.json';

export const USER_DATA_STORAGE_KEY = 'knights-kingdom-user-data';
export const AUTH_SESSION_KEY = 'knights-kingdom-auth';

export const defaultProfileOptions = {
  brickQuality: 'medium',
  renderer: 'hardware',
  dialogue: 'on',
  music: 'on',
  soundEffects: 'on',
};

export const getSeedUserData = () => seedUserData;

export const loadUserData = () => {
  if (typeof window === 'undefined') {
    return seedUserData;
  }

  try {
    const stored = localStorage.getItem(USER_DATA_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return seedUserData;
  } catch (error) {
    console.error('Error loading user data:', error);
    return seedUserData;
  }
};

export const saveUserData = async (userData) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
    }
  }

  try {
    const response = await fetch('/api/updateUserData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  } catch {
    // API unavailable — localStorage is the fallback
  }
};

export const readSessionAuth = () => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, selectedProfile: null };
  }

  try {
    const stored = sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!stored) {
      return { isAuthenticated: false, selectedProfile: null };
    }
    const { selectedProfile } = JSON.parse(stored);
    return {
      isAuthenticated: Boolean(selectedProfile),
      selectedProfile: selectedProfile || null,
    };
  } catch {
    return { isAuthenticated: false, selectedProfile: null };
  }
};

export const writeSessionAuth = (selectedProfile) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (selectedProfile) {
    sessionStorage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify({ selectedProfile }),
    );
  } else {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  }
};

/** @deprecated Use loadUserData */
export const fetchData = loadUserData;

/** @deprecated Use saveUserData */
export const persistUserData = saveUserData;