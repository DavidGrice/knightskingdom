import React, { useEffect, useRef, useState } from 'react';
import { GameEngine, ComponentTop, ComponentBottom } from './index';


const MainGame = ({ navigateToStartMenu, map }) => {
  

  return (
    <div>
    <GameEngine map={map} />
    </div>
  );
}

export default MainGame;