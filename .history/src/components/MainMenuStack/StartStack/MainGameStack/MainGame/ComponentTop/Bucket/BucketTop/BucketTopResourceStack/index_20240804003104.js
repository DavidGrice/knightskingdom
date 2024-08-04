import Building2 from './buildings_2.png';
import Building5 from './buildings_5.png';
import Challenges2 from './challenges_2.png';
import Challenges5 from './challenges_5.png';
import Explosives2 from './explosives_2.png';
import Explosives5 from './explosives_5.png';
import MinifigureAnimals2 from './minifigure_animals_2.png';
import MinifigureAnimals5 from './minifigure_animals_5.png';
import Scenery2 from './scenery_2.png';
import Scenery5 from './scenery_5.png';
import Vehicles2 from './vehicles_2.png';
import Vehicles5 from './vehicles_5.png';

const images = {
    Building2,
    Building5,
    Challenges2,
    Challenges5,
    Explosives2,
    Explosives5,
    MinifigureAnimals2,
    MinifigureAnimals5,
    Scenery2,
    Scenery5,
    Vehicles2,
    Vehicles5,
};

const icons = [
    { passive: images.MinifigureAnimals2, active: images.MinifigureAnimals5 },
    { passive: images.Building2, active: images.Building5 },
    { passive: images.Vehicles2, active: images.Vehicles5 },
    { passive: images.Scenery2, active: images.Scenery5 },
    { passive: images.Explosives2, active: images.Explosives5 },
    { passive: images.Challenges2, active: images.Challenges5 },
];

export default {images, icons};