import React, { useMemo, useState } from 'react';
import gameStyles from './Bucket.module.css';
import workshopStyles from './Bucket.workshop.module.css';
import BucketTop from './BucketTop/BucketTop';
import BucketBottom from './BucketBottom/BucketBottom';
import { workshopBucketTabVars } from '../../../../../Common';
import { getBucketConfig } from '../toolbarConfig';
import { buildCreationsBucketTab } from '../toolbarConfig/creationsBucket';

const Bucket = ({ dataSource = 'models', handleLoadModel, onBrickSelect, customCreations }) => {
    const isWorkshop = dataSource === 'bricks';
    const styles = isWorkshop ? workshopStyles : gameStyles;
    const variant = isWorkshop ? 'workshop' : 'game';
    const bucketLayoutStyle = useMemo(
        () => (isWorkshop ? workshopBucketTabVars('WORKSHOP_BUCKET') : undefined),
        [isWorkshop],
    );

    const { tabIcons, tabData, arrowImages } = useMemo(() => {
        const base = getBucketConfig(dataSource);
        if (dataSource !== 'models') {
            return base;
        }
        const creationsTab = buildCreationsBucketTab(customCreations);
        if (!creationsTab) {
            return base;
        }
        // Prepend so "My Creations" is tab 0 (top-left). Appending as tab 7
        // clipped off-screen — game bucket grid only fits ~2 icon rows.
        return {
            tabIcons: [creationsTab.tabIcon, ...base.tabIcons],
            tabData: [creationsTab.tabData, ...base.tabData],
            arrowImages: base.arrowImages,
        };
    }, [dataSource, customCreations]);
    const [activeIcon, setActiveIcon] = useState(0);
    const [activeBucket, setActiveBucket] = useState(0);
    const [resetKey, setResetKey] = useState(0);

    const handleIconClick = (icon) => {
        setActiveIcon(icon);
        setActiveBucket(icon);
        setResetKey((key) => key + 1);
    };

    const handleItemSelect = (item) => {
        if (isWorkshop) {
            onBrickSelect?.(item ?? null);
            return;
        }
        if (handleLoadModel && item?.SelectedModel) {
            handleLoadModel(item.SelectedModel);
        }
    };

    return (
        <div className={styles.bucketDiv} style={bucketLayoutStyle}>
            <BucketTop
                variant={variant}
                tabIcons={tabIcons}
                activeIcon={activeIcon}
                onIconClick={handleIconClick}
            />
            <BucketBottom
                variant={variant}
                activeBucket={activeBucket}
                resetKey={resetKey}
                tabData={tabData}
                arrowImages={arrowImages}
                onItemSelect={handleItemSelect}
            />
        </div>
    );
};

export default Bucket;