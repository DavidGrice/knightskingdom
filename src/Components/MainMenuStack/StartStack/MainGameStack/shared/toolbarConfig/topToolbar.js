import { leaveIcon as gameLeaveIcon } from '../../MainGame/ComponentTop/ComponentTopResourceStack/index';
import { leaveIcon as workshopLeaveIcon } from '../../WorkShop/ComponentTop/ComponentTopResourceStack/index';

const gameMiddleIcons = [
    { key: 'move', passiveKey: 'movePassive', activeKey: 'moveActive', type: 'move', className: 'moveBrick' },
    { key: 'reverse', passiveKey: 'reversePassive', activeKey: 'reverseActive', type: 'reverse', className: 'rotateBrick' },
    { key: 'repaint', passiveKey: 'repaintPassive', activeKey: 'repaintActive', type: 'repaint', className: 'repaintBrick' },
    { key: 'delete', passiveKey: 'deletePassive', activeKey: 'deleteActive', type: 'delete', className: 'deleteBrick' },
    { key: 'action', passiveKey: 'actionPassive', activeKey: 'actionActive', type: 'action', className: 'interactBrick' },
    { key: 'drive', passiveKey: 'drivePassive', activeKey: 'driveActive', type: 'drive', className: 'driveBrick' },
];

const workshopMiddleIcons = [
    { key: 'move', passiveKey: 'brickMovePassive', activeKey: 'brickMoveActive', type: 'move', className: 'moveBrick' },
    { key: 'reverse', passiveKey: 'brickRotatePassive', activeKey: 'brickRotateActive', type: 'reverse', className: 'rotateBrick' },
    { key: 'repaint', passiveKey: 'brickRepaintPassive', activeKey: 'brickRepaintActive', type: 'repaint', className: 'repaintBrick' },
    { key: 'delete', passiveKey: 'brickDeletePassive', activeKey: 'brickDeleteActive', type: 'delete', className: 'deleteBrick' },
    { key: 'duplicate', passiveKey: 'brickDuplicatePassive', activeKey: 'brickDuplicateActive', type: 'duplicate', className: 'interactBrick' },
];

const buildMiddleIcons = (iconData, definitions) =>
    definitions.map((def) => ({
        passiveIcon: iconData[def.passiveKey],
        activeIcon: iconData[def.activeKey],
        type: def.type,
        className: def.className,
    }));

export const getTopToolbarConfig = (mode) => {
    if (mode === 'workshop') {
        const { iconData, leaveFrames, PlaceHolder } = workshopLeaveIcon;
        return {
            leaveIcon: { iconData, leaveFrames, placeHolder: PlaceHolder },
            middleIcons: buildMiddleIcons(iconData, workshopMiddleIcons),
            buttonOrder: ['bucket', 'save', 'middle', 'leave'],
            showPlay: false,
        };
    }

    const { iconData, leaveFrames, placeHolder } = gameLeaveIcon;
    return {
        leaveIcon: { iconData, leaveFrames, placeHolder },
        middleIcons: buildMiddleIcons(iconData, gameMiddleIcons),
        buttonOrder: ['save', 'bucket', 'middle', 'play', 'leave'],
        showPlay: true,
    };
};