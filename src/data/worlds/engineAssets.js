import Map1 from '../../Components/MainMenuStack/StartStack/MainGameStack/MainGame/GameEngine/GameEngineResourceStack/maps/map1/map1.glb';
import GrassRight from '../../Components/MainMenuStack/StartStack/MainGameStack/MainGame/GameEngine/GameEngineResourceStack/skyboxes/grass/right.png';
import GrassLeft from '../../Components/MainMenuStack/StartStack/MainGameStack/MainGame/GameEngine/GameEngineResourceStack/skyboxes/grass/left.png';
import GrassTop from '../../Components/MainMenuStack/StartStack/MainGameStack/MainGame/GameEngine/GameEngineResourceStack/skyboxes/grass/top.png';
import GrassBot from '../../Components/MainMenuStack/StartStack/MainGameStack/MainGame/GameEngine/GameEngineResourceStack/skyboxes/grass/bot.png';
import GrassFront from '../../Components/MainMenuStack/StartStack/MainGameStack/MainGame/GameEngine/GameEngineResourceStack/skyboxes/grass/front.png';
import GrassBack from '../../Components/MainMenuStack/StartStack/MainGameStack/MainGame/GameEngine/GameEngineResourceStack/skyboxes/grass/back.png';
import Archer from '../../Components/MainMenuStack/StartStack/MainGameStack/MainGame/GameEngine/GameEngineResourceStack/models/archer_with_box2.glb';

export const grassSkybox = [
  { id: 1, name: 'right', description: 'Right side of skybox', filePath: GrassRight },
  { id: 2, name: 'left', description: 'Left side of skybox', filePath: GrassLeft },
  { id: 3, name: 'top', description: 'Top side of skybox', filePath: GrassTop },
  { id: 4, name: 'bot', description: 'Bottom side of skybox', filePath: GrassBot },
  { id: 5, name: 'front', description: 'Front side of skybox', filePath: GrassFront },
  { id: 6, name: 'back', description: 'Back side of skybox', filePath: GrassBack },
];

export const defaultPlayableModels = [
  {
    id: 1,
    name: 'Archer',
    description: 'Default archer model',
    isLocked: false,
    isCompleted: false,
    filePath: Archer,
    position: { x: 0, y: 0, z: 0 },
  },
];

export const mapAssets = {
  map1: Map1,
};