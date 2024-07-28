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


export const fetchData = () => {
    try {
        const response = userData;
        return response;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}