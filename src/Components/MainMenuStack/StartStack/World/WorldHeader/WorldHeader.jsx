import React from 'react';
import styles from './WorldHeader.module.css';
import LocalWorlds2 from './WorldHeaderResourceStack/local_worlds_2.png';
import LocalWorlds4 from './WorldHeaderResourceStack/local_worlds_4.png';
import SharedWorlds2 from './WorldHeaderResourceStack/shared_worlds_2.png';
import SharedWorlds4 from './WorldHeaderResourceStack/shared_worlds_4.png';

const WorldHeader = ({ isLocalWorlds, onSelectLocal, onSelectShared }) => (
  <div className={styles.headerHolder} data-testid="world-dual-header">
    <div
      className={styles.localWorldsHeader}
      style={{ backgroundImage: `url(${isLocalWorlds ? LocalWorlds4 : LocalWorlds2})` }}
      onClick={onSelectLocal}
      data-testid="world-tab-local"
      data-active={isLocalWorlds ? 'true' : 'false'}
    />
    <div
      className={styles.sharedWorldsHeader}
      style={{ backgroundImage: `url(${isLocalWorlds ? SharedWorlds2 : SharedWorlds4})` }}
      onClick={onSelectShared}
      data-testid="world-tab-shared"
      data-active={isLocalWorlds ? 'false' : 'true'}
    />
  </div>
);

export default WorldHeader;