import React from 'react';
import { MenuPanelShell } from '../../../../../Common';
import SnapShotBody from './SnapShotBody/SnapShotBody';
import holderFrame from './SnapShotHolderResourceStack/snapshot_holder.png';

const SnapShotHolder = ({
  selectedProfile,
  mapData,
  onRemoveSnapshot,
}) => (
  <MenuPanelShell
    archetype="SINGLE_HEADER"
    screenKey="SNAPSHOT"
    holderBackground={holderFrame.src ?? holderFrame}
  >
    <SnapShotBody
      selectedProfile={selectedProfile}
      mapData={mapData}
      onRemoveSnapshot={onRemoveSnapshot}
    />
  </MenuPanelShell>
);

export default SnapShotHolder;