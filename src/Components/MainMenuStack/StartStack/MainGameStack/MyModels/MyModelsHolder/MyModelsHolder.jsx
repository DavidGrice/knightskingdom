import React from 'react';
import { MenuPanelShell } from '../../../../../Common';
import MyModelsBody from '../MyModelsBody/MyModelsBody';
import holderFrame from '../MyModelsResourceStack/drop_down.png';

const MyModelsHolder = ({ selectedProfile, onDeleteSavedWorld }) => (
  <MenuPanelShell
    archetype="SINGLE_HEADER"
    screenKey="MY_MODELS"
    holderBackground={holderFrame.src ?? holderFrame}
  >
    <MyModelsBody
      selectedProfile={selectedProfile}
      onDeleteSavedWorld={onDeleteSavedWorld}
    />
  </MenuPanelShell>
);

export default MyModelsHolder;