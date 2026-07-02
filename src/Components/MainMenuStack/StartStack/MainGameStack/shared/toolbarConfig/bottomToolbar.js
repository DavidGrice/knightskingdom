import { images as gameImages } from '../../MainGame/ComponentBottom/ComponentBottomResourceStack/index';
import { images as workshopImages } from '../../WorkShop/ComponentBottom/ComponentBottomResourceStack/index';
import { images as gameBallImages } from '../../MainGame/ComponentBottom/Ball/BallResourceStack/index';
import { images as workshopBallImages } from '../../WorkShop/ComponentBottom/Ball/BallResourceStack/index';

export const getBottomToolbarConfig = (mode) => {
    if (mode === 'workshop') {
        return {
            images: workshopImages,
            ballImages: workshopBallImages,
            leftButtons: [
                { type: 'sweep', passive: workshopImages.sweep[0], active: workshopImages.sweep[1], className: 'sweepButton' },
            ],
            showTarget: false,
        };
    }

    return {
        images: gameImages,
        ballImages: gameBallImages,
        leftButtons: [
            { type: 'hammer', passive: gameImages.hammer[0], active: gameImages.hammer[1], className: 'hammerButton' },
            { type: 'camera', passive: gameImages.camera[0], active: gameImages.camera[1], className: 'snapShotButton' },
            { type: 'climate', passive: gameImages.climate[0], active: gameImages.climate[1], className: 'climateButton' },
        ],
        rightButtons: [
            { type: 'music', passive: gameImages.music[0], active: gameImages.music[1], className: 'musicButton' },
        ],
        showTarget: true,
    };
};