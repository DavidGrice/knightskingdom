//region Bricks
import BrickDelete2 from './brick_delete_2.png';
import BrickDelete5 from './brick_delete_5.png';
import BrickDuplicate2 from './brick_duplicate_2.png';
import BrickDuplicate5 from './brick_duplicate_5.png';
import BrickMove2 from './brick_move_2.png';
import BrickMove5 from './brick_move_5.png';
import BrickRotate2 from './brick_rotate_2.png';
import BrickRotate5 from './brick_rotate_5.png';
import BrickRepaint2 from './brick_repaint_2.png';
import BrickRepaint5 from './brick_repaint_5.png';
//endregion

//region Animation
import Leave2 from './leave_2.png';
import Leave3 from './leave_3.png';
import Leave4 from './leave_4.png';
import Leave5 from './leave_5.png';
import Leave6 from './leave_6.png';
import Leave7 from './leave_7.png';
import Leave8 from './leave_8.png';
import Leave9 from './leave_9.png';
import Leave10 from './leave_10.png';
import Leave11 from './leave_11.png';
import Leave12 from './leave_12.png';
import Leave13 from './leave_13.png';
import Leave14 from './leave_14.png';
import Leave15 from './leave_15.png';
import Leave16 from './leave_16.png';
import Leave17 from './leave_17.png';
import Leave18 from './leave_18.png';
import Leave19 from './leave_19.png';
//endregion

//region Icons
import Save2 from './save_2.png';
import Save5 from './save_5.png';
import Bucket2 from './bucket_2.png';
import Bucket5 from './bucket_5.png';
//endregion

const icons = {
    brickDeletePassive: BrickDelete2,
    brickDeleteActive: BrickDelete5,
    brickDuplicatePassive: BrickDuplicate2,
    brickDuplicateActive: BrickDuplicate5,
    brickMovePassive: BrickMove2,
    brickMoveActive: BrickMove5,
    brickRotatePassive: BrickRotate2,
    brickRotateActive: BrickRotate5,
    brickRepaintPassive: BrickRepaint2,
    brickRepaintActive: BrickRepaint5,
    savePassive: Save2,
    saveActive: Save5,
    bucketPassive: Bucket5,
    bucketActive: Bucket2,
};

const leaveFrames = [
    Leave2,
    Leave3,
    Leave4,
    Leave5,
    Leave6,
    Leave7,
    Leave8,
    Leave9,
    Leave10,
    Leave11,
    Leave12,
    Leave13,
    Leave14,
    Leave15,
    Leave16,
    Leave17,
    Leave18,
    Leave19,
];

export const leaveIcon = { iconData:icons, leaveFrames:leaveFrames, PlaceHolder: Leave2 };