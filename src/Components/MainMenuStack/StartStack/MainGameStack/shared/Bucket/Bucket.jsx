import React, { useMemo, useState } from 'react';
import styles from './Bucket.module.css';
import BucketTop from './BucketTop/BucketTop';
import BucketBottom from './BucketBottom/BucketBottom';
import { getBucketConfig } from '../toolbarConfig';

const Bucket = ({ dataSource = 'models', handleLoadModel }) => {
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
        if (handleLoadModel && item.SelectedModel) {
            handleLoadModel(item.SelectedModel);
        }
    };

    return (
        <div className={styles.bucketDiv}>
            <BucketTop tabIcons={tabIcons} activeIcon={activeIcon} onIconClick={handleIconClick} />
            <BucketBottom
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