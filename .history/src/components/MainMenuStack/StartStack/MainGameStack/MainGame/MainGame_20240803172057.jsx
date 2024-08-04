import React, { useEffect, useRef, useState } from 'react';
import { GameEngine, ComponentTop, ComponentBottom } from './index';


const MainGame = ({ navigateToStartMenu, map }) => {
  

  return (
    <div>
      <div>
        <ComponentTop navigateToStartMenu={navigateToStartMenu} />
      </div>
      <GameEngine map={map} />
      <div>
        <ComponentBottom />
      </div>
    </div>
  );
}

export default MainGame;