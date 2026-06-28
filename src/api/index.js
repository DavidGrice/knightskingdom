import userData from './data/userData.json';

const STORAGE_KEY = 'knights-kingdom-user-data';

const defaultProfileOptions = {
  brickQuality: 'medium',
  renderer: 'hardware',
  dialogue: 'on',
  music: 'on',
};

export { defaultProfileOptions };

export const fetchData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return userData;
  }
};

export async function persistUserData(updatedData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error saving user data to localStorage:', error);
  }

  try {
    const response = await fetch('/updateUserData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  } catch (error) {
    // API unavailable — localStorage is the fallback for now
  }
}