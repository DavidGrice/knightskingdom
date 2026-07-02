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
    // Map placement in world units. Y is ground height; ModelLoader snaps the
    // GLB hitbox feet to this Y (archer root is not centered at 0,0,0 in the file).
    position: { x: 0, y: 0, z: 0 },
  },
];

const templateMap = (n) => ({
  objUrl: `/models/maps/template-0${n}.obj`,
  mtlUrl: `/models/maps/template-0${n}.mtl`,
});

// Only 9 extracted world templates exist; World 10 reuses the last one
// (matching the existing precedent of World 10 reusing Template9's thumbnail).
export const mapAssets = {
  map1: templateMap(1),
  map2: templateMap(2),
  map3: templateMap(3),
  map4: templateMap(4),
  map5: templateMap(5),
  map6: templateMap(6),
  map7: templateMap(7),
  map8: templateMap(8),
  map9: templateMap(9),
  map10: templateMap(9),
};