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

const playableWorld = (id, name, description, image) => ({
  id,
  name,
  description,
  image,
  isLocked: false,
  isCompleted: false,
  ...(mapAssets[`map${id}`] || mapAssets.map1),
  skyBoxes: grassSkybox,
  models: defaultPlayableModels,
});

export const localWorldsData = [
  playableWorld(1, 'World 1', 'This is the first world', Template1),
  playableWorld(2, 'World 2', 'This is the second world', Template2),
  playableWorld(3, 'World 3', 'This is the third world', Template3),
  playableWorld(4, 'World 4', 'This is the fourth world', Template4),
  playableWorld(5, 'World 5', 'This is the fifth world', Template5),
  playableWorld(6, 'World 6', 'This is the sixth world', Template6),
  playableWorld(7, 'World 7', 'This is the seventh world', Template7),
  playableWorld(8, 'World 8', 'This is the eighth world', Template8),
  playableWorld(9, 'World 9', 'This is the ninth world', Template9),
  playableWorld(10, 'World 10', 'This is the tenth world', Template9),
];