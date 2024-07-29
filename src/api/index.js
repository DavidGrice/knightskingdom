import userData from './data/userData.json';

// async function fetchData() {
//     // const url = './data/userData.json'; // Path to the local file
//     // try {
//     //     const response = await fetch(url);
//     //     if (!response.ok) {
//     //         throw new Error('Network response was not ok');
//     //     }
//     //     const data = await response.json();
//     //     console.log('Data fetched:', data);
//     //     return data;
//     // } catch (error) {
//     //     console.error('There was a problem with the fetch operation:', error);
//     // }
//     return data;
// }

// export default fetchData;


export async function updateUserData(updatedData) {
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
  
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
}

export const fetchData = () => {
    try {
        const response = userData;
        return response;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}