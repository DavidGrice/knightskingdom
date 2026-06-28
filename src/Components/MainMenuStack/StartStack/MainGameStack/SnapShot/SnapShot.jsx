import React from 'react';
import styles from './SnapShot.module.css';
import { SnapShotHolder } from './index';
import { checkmarks } from './SnapShotResourceStack/index';
import { CommonComponent } from "../../../../Common/index";

const SnapShot = ({ navigateToMainGame, mapData }) => {
    const handleCheckmarkClick = () => {
        navigateToMainGame(mapData);
    };

    const latestSnapshot = mapData?.sceneSnapshot;

    return (
        <div className={styles.snapShotDiv}>
            <SnapShotHolder latestSnapshot={latestSnapshot} savedSnapshots={mapData?.snapshots} />
            {latestSnapshot?.imageDataUrl && (
                <div className={styles.capturePreview}>
                    <img src={latestSnapshot.imageDataUrl} alt="Latest scene capture" />
                </div>
            )}
            <div className={styles.bottomLeftCorner}>
                <CommonComponent
                    initialImage={checkmarks.checkMark2}
                    hoverImage={checkmarks.checkMark4}
                    altText="Checkmark"
                    onClick={handleCheckmarkClick}
                />
            </div>
        </div>
    );
}

export default SnapShot;