import MyWorld1 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/SharedWorldsFrames/myworld_01.png';
import MyWorld2 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/SharedWorldsFrames/myworld_02.png';
import MyWorld3 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/SharedWorldsFrames/myworld_03.png';
import MyWorld4 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/SharedWorldsFrames/myworld_04.png';
import MyWorld5 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/SharedWorldsFrames/myworld_05.png';
import MyWorld6 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/SharedWorldsFrames/myworld_06.png';
import MyWorld7 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/SharedWorldsFrames/myworld_07.png';
import MyWorld8 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/SharedWorldsFrames/myworld_08.png';
import MyWorld9 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/SharedWorldsFrames/myworld_09.png';
import MyWorld10 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/SharedWorldsFrames/myworld_10.png';
import MyWorld11 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/SharedWorldsFrames/myworld_11.png';
import MyWorld12 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/SharedWorldsFrames/myworld_12.png';
import MyWorld13 from '../../Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/SharedWorldsFrames/myworld_13.png';

const sharedWorld = (id, name, description, image, isLocked) => ({
  id,
  name,
  description,
  image,
  isLocked,
  isCompleted: false,
});

export const sharedWorldsData = [
  sharedWorld(1, 'My World 1', 'This is my first world', MyWorld1, false),
  sharedWorld(2, 'My World 2', 'This is my second world', MyWorld2, true),
  sharedWorld(3, 'My World 3', 'This is my third world', MyWorld3, true),
  sharedWorld(4, 'My World 4', 'This is my fourth world', MyWorld4, true),
  sharedWorld(5, 'My World 5', 'This is my fifth world', MyWorld5, true),
  sharedWorld(6, 'My World 6', 'This is my sixth world', MyWorld6, true),
  sharedWorld(7, 'My World 7', 'This is my seventh world', MyWorld7, true),
  sharedWorld(8, 'My World 8', 'This is my eighth world', MyWorld8, true),
  sharedWorld(9, 'My World 9', 'This is my ninth world', MyWorld9, true),
  sharedWorld(10, 'My World 10', 'This is my tenth world', MyWorld10, true),
  sharedWorld(11, 'My World 11', 'This is my eleventh world', MyWorld11, true),
  sharedWorld(12, 'My World 12', 'This is my twelfth world', MyWorld12, true),
  sharedWorld(13, 'My World 13', 'This is my thirteenth world', MyWorld13, true),
];