import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './index';


const MainGame = ({ navigateToStartMenu, map }) => {
  

  return (
    <GameEngine map={map} />
  );
}

export default MainGame;