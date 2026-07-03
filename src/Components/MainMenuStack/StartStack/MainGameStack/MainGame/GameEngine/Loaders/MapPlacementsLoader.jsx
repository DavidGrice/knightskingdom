import * as THREE from 'three';
import { loadObjMtl, MM_TO_WORLD_SCALE } from '../../../shared/objMtlLoader';
import { updateSelectionBox } from '../../../WorkShop/WorkshopEngine/BrickFactory';
import { WAREHOUSE_MODEL_CATALOG } from './warehouseModelCatalog.generated';
import { applyMapFitTransform } from './MapLoader';
import templatePlacements from './templatePlacements.generated.json';

/**
 * "Semi-vanilla" placements recovered from each template's WLD data by
 * resources/model_files/tools/export_template_placements.py -- see that
 * script's docstring for how position/rotation/scale are extracted and how
 * objects resolve to a loadable source.
 *
 * Every real (non-terrain) placed object now resolves to one of two sources
 * (see the Python script for why coverage isn't capped at ~16% anymore):
 *   - 'catalog': an exact/high-confidence match against the existing
 *     264-model warehouse catalog (named characters/vehicles/props, or a
 *     confident geometry-fingerprint match) -- the game's actual asset.
 *   - 'local-part': export_template_parts.py exported this template's own
 *     copy of the object's shape directly (public/models/maps/<template-id>/
 *     parts/shapeNNNN.obj) when no catalog match exists. This is the bulk of
 *     placements (~85%) and is what actually replaces the pre-rendered
 *     merged mesh with real, individually loaded geometry.
 *
 * Interactivity policy: named/catalog-matched placements (tier 1, and tier
 * 2 exact/exact-ambiguous matches) are notable enough to stay fully
 * movable/rotatable/deletable, matching bucket-added objects. Bulk
 * local-part reconstructions (trees, walls, fences -- often 100+ per map)
 * default to non-interactive: they still replace the baked mesh visually,
 * without flooding the move/delete toolset with hundreds of draggable
 * scene objects.
 *
 * Deliberately additive either way: these spawn on top of the still-baked
 * terrain (which also contains this same geometry, merged in) rather than
 * editing the base map export -- see the plan's "Final phase" for
 * regenerating a terrain-only base map once this is reviewed in the browser.
 */

const templateIdFromMapData = (mapData) => {
    const match = /template-\d+/.exec(mapData?.objUrl || '');
    return match ? match[0] : null;
};

const findCatalogEntry = (matchedModelId) => Object.values(WAREHOUSE_MODEL_CATALOG).find(
    (entry) => entry.objUrl && entry.objUrl.endsWith(`/${matchedModelId}.obj`),
);

const localPartUrls = (templateId, matchedModelId) => ({
    objUrl: `/models/maps/${templateId}/parts/${matchedModelId}.obj`,
    mtlUrl: `/models/maps/${templateId}/parts/${matchedModelId}.mtl`,
});

const resolveUrls = (templateId, placement) => {
    if (placement.source === 'catalog') {
        const entry = findCatalogEntry(placement.matchedModelId);
        return entry ? { objUrl: entry.objUrl, mtlUrl: entry.mtlUrl } : null;
    }
    if (placement.source === 'local-part') {
        return localPartUrls(templateId, placement.matchedModelId);
    }
    return null;
};

const isNotable = (placement) => placement.tier === 1 || placement.source === 'catalog';

const configurePlacedObject = (root, placement) => {
    root.name = placement.name || `${placement.matchedModelId}#${placement.number}`;
    const interactive = isNotable(placement);
    root.isMovable = interactive;
    root.isRotatable = interactive;
    root.isDeletable = true; // always removable, including bulk reconstructions
    root.isPaintable = interactive;
    root.isDriveable = interactive;
    root.isModel = true;
    root.userData.modelId = placement.matchedModelId;
    root.userData.placementNumber = placement.number;
    root.userData.source = placement.source;
    root.traverse((child) => { child.isPaintable = interactive; });
};

/** Dev/test-only hook -- lets testing/placements.test.mjs assert what actually
 * spawned without needing a full three.js scene-graph introspection API. */
const recordForTesting = (templateId, placement) => {
    if (typeof window === 'undefined') {
        return;
    }
    window.__placedObjects = window.__placedObjects || [];
    window.__placedObjects.push({
        templateId,
        name: placement.name,
        matchedModelId: placement.matchedModelId,
        tier: placement.tier,
        source: placement.source,
    });
};

const spawnPlacement = (templateId, placement, transform, scene) => {
    const urls = resolveUrls(templateId, placement);
    if (!urls) {
        return;
    }
    loadObjMtl(urls.objUrl, urls.mtlUrl)
        .then((root) => {
            if (placement.instanceScale) {
                const [sx, sy, sz] = placement.instanceScale;
                root.scale.multiply(new THREE.Vector3(sx, sy, sz));
            }
            const rawPoint = new THREE.Vector3(...placement.position).multiplyScalar(MM_TO_WORLD_SCALE);
            const worldPoint = applyMapFitTransform(rawPoint, transform);
            root.position.copy(worldPoint);
            root.rotation.y = THREE.MathUtils.degToRad(placement.yawDegrees) + transform.yawRadians;
            configurePlacedObject(root, placement);
            updateSelectionBox(root);
            scene.add(root);
            recordForTesting(templateId, placement);
        })
        .catch((error) => {
            console.error(`Failed to spawn placement "${placement.name}":`, error);
        });
};

const MapPlacementsLoader = (mapData, transform, scene) => {
    const templateId = templateIdFromMapData(mapData);
    if (!templateId) {
        return;
    }
    if (typeof window !== 'undefined') {
        window.__placedObjects = [];
    }
    const placements = templatePlacements[templateId] || [];
    placements
        .filter((placement) => placement.matchedModelId && placement.source)
        .forEach((placement) => spawnPlacement(templateId, placement, transform, scene));
};

export default MapPlacementsLoader;
