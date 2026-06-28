import Template1 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/LocalWorldsFrames/template_01.png';
import Template2 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/LocalWorldsFrames/template_02.png';
import Template3 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/LocalWorldsFrames/template_03.png';
import Template4 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/LocalWorldsFrames/template_04.png';
import Template5 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/LocalWorldsFrames/template_05.png';
import Template6 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/LocalWorldsFrames/template_06.png';
import Template7 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/LocalWorldsFrames/template_07.png';
import Template8 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/LocalWorldsFrames/template_08.png';
import Template9 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/LocalWorldsFrames/template_09.png';
import { defaultPlayableModels, grassSkybox, mapAssets } from './engineAssets';

const lockedWorld = (id, name, description, image) => ({
  id,
  name,
  description,
  image,
  isLocked: true,
  isCompleted: false,
});

export const localWorldsData = [
  {
    id: 1,
    name: 'World 1',
    description: 'This is the first world',
    image: Template1,
    isLocked: false,
    isCompleted: false,
    filePath: mapAssets.map1,
    skyBoxes: grassSkybox,
    models: defaultPlayableModels,
  },
  lockedWorld(2, 'World 2', 'This is the second world', Template2),
  lockedWorld(3, 'World 3', 'This is the third world', Template3),
  lockedWorld(4, 'World 4', 'This is the fourth world', Template4),
  lockedWorld(5, 'World 5', 'This is the fifth world', Template5),
  lockedWorld(6, 'World 6', 'This is the sixth world', Template6),
  lockedWorld(7, 'World 7', 'This is the seventh world', Template7),
  lockedWorld(8, 'World 8', 'This is the eighth world', Template8),
  lockedWorld(9, 'World 9', 'This is the ninth world', Template9),
  lockedWorld(10, 'World 10', 'This is the tenth world', Template9),
];