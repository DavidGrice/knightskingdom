import React, { useState } from 'react';
import styles from './Bucket.module.css';
import BucketTop from './BucketTop/BucketTop';
import BucketBottom from './BucketBottom/BucketBottom';
import { getBucketConfig } from '../toolbarConfig';

const Bucket = ({ dataSource = 'models', handleLoadModel }) => {
    const { tabIcons, tabData, arrowImages } = getBucketConfig(dataSource);
    const [activeIcon, setActiveIcon] = useState(0);
    const [activeBucket, setActiveBucket] = useState(0);
    const [didUpdate, setDidUpdate] = useState(false);

    const handleIconClick = (icon) => {
        setActiveIcon(icon);
        setActiveBucket(icon);
        setDidUpdate(!didUpdate);
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
                didUpdate={didUpdate}
                setDidUpdate={setDidUpdate}
                tabData={tabData}
                arrowImages={arrowImages}
                onItemSelect={handleItemSelect}
            />
        </div>
    );
};

export default Bucket;