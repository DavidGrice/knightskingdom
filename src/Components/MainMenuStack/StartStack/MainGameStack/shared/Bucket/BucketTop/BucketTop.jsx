import React from 'react';
import gameStyles from './BucketTop.module.css';
import workshopStyles from './BucketTop.workshop.module.css';
import BucketIcon from '../BucketIcon/BucketIcon';

const BucketTop = ({ variant = 'game', tabIcons, activeIcon, onIconClick }) => {
    const styles = variant === 'workshop' ? workshopStyles : gameStyles;

    return (
        <div className={styles.bucketTop}>
            <div className={styles.bucketTopRow}>
                {tabIcons.map((icon, index) => (
                    <BucketIcon
                        key={index}
                        bucketIconPassive={icon.passive}
                        bucketIconActive={icon.active}
                        isActive={activeIcon === index}
                        onClick={() => onIconClick(index)}
                        testId={variant === 'workshop' ? `workshop-bucket-tab-${index}` : undefined}
                    />
                ))}
            </div>
        </div>
    );
};

export default BucketTop;