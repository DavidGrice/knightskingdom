import React, { useMemo, useState } from 'react';
import gameStyles from './Bucket.module.css';
import workshopStyles from './Bucket.workshop.module.css';
import BucketTop from './BucketTop/BucketTop';
import BucketBottom from './BucketBottom/BucketBottom';
import { workshopBucketTabVars } from '../../../../../Common';
import { getBucketConfig } from '../toolbarConfig';

const Bucket = ({ dataSource = 'models', handleLoadModel, onBrickSelect }) => {
    const isWorkshop = dataSource === 'bricks';
    const styles = isWorkshop ? workshopStyles : gameStyles;
    const variant = isWorkshop ? 'workshop' : 'game';
    const bucketLayoutStyle = useMemo(
        () => (isWorkshop ? workshopBucketTabVars('WORKSHOP_BUCKET') : undefined),
        [isWorkshop],
    );

    const { tabIcons, tabData, arrowImages } = useMemo(
        () => getBucketConfig(dataSource),
        [dataSource]
    );
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