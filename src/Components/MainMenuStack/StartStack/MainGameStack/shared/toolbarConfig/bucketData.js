import gameTabIcons from '../../MainGame/ComponentTop/Bucket/BucketTop/BucketTopResourceStack/index';
import workshopTabIcons from '../../WorkShop/ComponentTop/Bucket/BucketTop/BucketTopResourceStack/index';
import {
    images as gameBucketImages,
    minifigureAnimalsData,
    buildingsData,
    vehiclesData,
    sceneryData,
    explosivesData,
    challengesData as gameChallengesData,
} from '../../MainGame/ComponentTop/Bucket/BucketBottom/BucketBottomResourceStack/index';
import {
    images as workshopBucketImages,
    basicData,
    slimData,
    wedgeData,
    cylindricalData,
    archesData,
    castleComponentsData,
    windowsDoorsFencesData,
    castleAccessoriesData,
    tilesData,
    challengesData as workshopChallengesData,
} from '../../WorkShop/ComponentTop/Bucket/BucketBottom/BucketBottomResourceStack/index';

const gameBucketConfig = {
    tabIcons: gameTabIcons,
    arrowImages: gameBucketImages,
    tabData: [
        minifigureAnimalsData,
        buildingsData,
        vehiclesData,
        sceneryData,
        explosivesData,
        gameChallengesData,
    ],
};

const workshopBucketConfig = {
    tabIcons: workshopTabIcons,
    arrowImages: workshopBucketImages,
    tabData: [
        basicData,
        slimData,
        wedgeData,
        cylindricalData,
        archesData,
        castleComponentsData,
        windowsDoorsFencesData,
        castleAccessoriesData,
        tilesData,
        workshopChallengesData,
    ],
};

export const getBucketConfig = (dataSource) =>
    dataSource === 'bricks' ? workshopBucketConfig : gameBucketConfig;