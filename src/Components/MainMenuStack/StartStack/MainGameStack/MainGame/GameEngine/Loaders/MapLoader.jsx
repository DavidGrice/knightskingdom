import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const MapLoader = (mapData, scene, setModelLoaded) => {
    const loader = new GLTFLoader();
    loader.load(
        mapData.filePath,
        (gltf) => {
            const map = gltf.scene;
            map.isMovable = false;
            scene.add(map);
            setModelLoaded(true);
        },
        undefined,
        (error) => {
            console.error('An error occurred while loading the map:', error);
            fetch(mapData.filePath)
                .then(response => response.text())
                .then(text => console.log('Map file content:', text))
                .catch(fetchError => console.error('Error fetching map file:', fetchError));
        }
    );
};

export default MapLoader;