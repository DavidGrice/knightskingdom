import WorkShopArches2 from './workshop_arches_2.png';
import WorkShopArches5 from './workshop_arches_5.png';
import WorkShopBasic2 from './workshop_basic_2.png';
import WorkShopBasic5 from './workshop_basic_5.png';
import WorkShopCastleAccessories2 from './workshop_castle_accessories_2.png';
import WorkShopCastleAccessories5 from './workshop_castle_accessories_5.png';
import WorkShopCastleComponents2 from './workshop_castle_components_2.png';
import WorkShopCastleComponents5 from './workshop_castle_components_5.png';
import WorkShopCylindrical2 from './workshop_cylindrical_2.png';
import WorkShopCylindrical5 from './workshop_cylindrical_5.png';
import WorkShopSlim2 from './workshop_slim_2.png';
import WorkShopSlim5 from './workshop_slim_5.png';
import WorkShopTiles2 from './workshop_tiles_2.png';
import WorkShopTiles5 from './workshop_tiles_5.png';
import WorkShopWedge2 from './workshop_wedge_2.png';
import WorkShopWedge5 from './workshop_wedge_5.png';
import WorkShopWindowsDoorsFences2 from './workshop_windows_doors_fences_2.png';
import WorkShopWindowsDoorsFences5 from './workshop_windows_doors_fences_5.png';

const images = {
    WorkShopArches2,
    WorkShopArches5,
    WorkShopBasic2,
    WorkShopBasic5,
    WorkShopCastleAccessories2,
    WorkShopCastleAccessories5,
    WorkShopCastleComponents2,
    WorkShopCastleComponents5,
    WorkShopCylindrical2,
    WorkShopCylindrical5,
    WorkShopSlim2,
    WorkShopSlim5,
    WorkShopTiles2,
    WorkShopTiles5,
    WorkShopWedge2,
    WorkShopWedge5,
    WorkShopWindowsDoorsFences2,
    WorkShopWindowsDoorsFences5,
};

const icons = [
    { passive: images.WorkShopBasic2, active: images.WorkShopBasic5 },
    { passive: images.WorkShopSlim2, active: images.WorkShopSlim5 },
    { passive: images.WorkShopWedge2, active: images.WorkShopWedge5 },
    { passive: images.WorkShopCylindrical2, active: images.WorkShopCylindrical5 },
    { passive: images.WorkShopArches2, active: images.WorkShopArches5 },
    { passive: images.WorkShopCastleComponents2, active: images.WorkShopCastleComponents5 },
    { passive: images.WorkShopWindowsDoorsFences2, active: images.WorkShopWindowsDoorsFences5 },
    { passive: images.WorkShopCastleAccessories2, active: images.WorkShopCastleAccessories5 },
    { passive: images.WorkShopTiles2, active: images.WorkShopTiles5 },
];

export default icons;