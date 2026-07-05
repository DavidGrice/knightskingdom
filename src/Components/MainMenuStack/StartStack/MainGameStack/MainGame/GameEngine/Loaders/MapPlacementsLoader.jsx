import * as THREE from 'three';
import { MM_TO_WORLD_SCALE } from '../../../shared/objMtlLoader';
import { loadGameModel } from '../../../shared/gameModelLoader';
import { attachSelectionBox } from '../../../WorkShop/WorkshopEngine/BrickFactory';
import { disposeObject3D } from '../sceneDispose';
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

/**
 * The baked map mesh still contains every placed object, merged in --
 * spawning the individually loaded copy on top z-fights it ("competing
 * textures"). The map OBJ keeps one `o NNN_shapeM` group per WLD object
 * number, so once a placement actually spawns we hide its baked twin.
 * Failed spawns leave the baked version visible as a fallback, and
 * placements skipped by brickQuality=low never hide theirs.
 */
const bakedTwinMeshes = (scene, placementNumber) => {
    const mapRoot = scene.getObjectByName('GameMap');
    if (!mapRoot) {
        return [];
    }
    const prefix = `${String(placementNumber).padStart(3, '0')}_`;
    const meshes = [];
    mapRoot.traverse((child) => {
        if (child.isMesh && child.name.startsWith(prefix)) {
            meshes.push(child);
        }
    });
    return meshes;
};

/**
 * World-space bounds of a placement's baked twin -- the same object merged
 * into the map mesh, positioned correctly by the map's own (validated)
 * vertex pipeline. This is our ground truth for where the standalone
 * reconstruction must sit; matching to it sidesteps the placement export's
 * separate, offset coordinate frame entirely (empirically the export frame
 * differs from the map-vertex frame by a large per-template translation --
 * reconstructing it via applyMapFitTransform mislands parts by ~hundreds of
 * world units, the "castle behind the far wall").
 */
const bakedTwinBounds = (scene, placementNumber) => {
    const meshes = bakedTwinMeshes(scene, placementNumber);
    if (meshes.length === 0) {
        return null;
    }
    const bounds = new THREE.Box3();
    meshes.forEach((mesh) => bounds.union(new THREE.Box3().setFromObject(mesh)));
    return bounds.isEmpty() ? null : bounds;
};

const hideBakedTwin = (scene, placementNumber) => {
    bakedTwinMeshes(scene, placementNumber).forEach((mesh) => { mesh.visible = false; });
};

const twinBox = new THREE.Box3();
const twinCenter = new THREE.Vector3();
const partCenter = new THREE.Vector3();
const plateBox = new THREE.Box3();
const plateSize = new THREE.Vector3();

/**
 * Flat baseplate placements (grass/path plates, e.g. l4109610) land almost
 * coplanar with the single baked base plane (`543_shape207` at y=0) -- only
 * ~0.1 world units above it -- so at grazing angles the base's texture
 * (which carries the water/grass/beige regions) z-fights through them: the
 * "water seeping through the grass" the user saw. Lifting flat, wide plates
 * a clear gap above the base separates them in depth. Tall props/characters
 * are unaffected.
 */
const liftFlatPlate = (root) => {
    root.updateMatrixWorld(true);
    plateBox.setFromObject(root);
    plateBox.getSize(plateSize);
    if (plateSize.y < 1.5 && Math.max(plateSize.x, plateSize.z) > 8) {
        root.position.y += 0.35;
        // Ground plates are walkable surfaces, not obstacles: characters
        // stand ON them, so they must never block movement collisions.
        root.userData.isGroundPlate = true;
    }
};

/**
 * The placement export uses a coordinate frame offset from the map's vertex
 * frame by a constant per-template translation, so applyMapFitTransform
 * mislands parts by hundreds of world units. Placements that HAVE a baked
 * twin get positioned by center-matching (exact); the rest (named catalog
 * characters like the queen, which have no number-matched twin) fall back to
 * applyMapFitTransform and would land on the water far from the castle.
 *
 * Recover the constant offset empirically: for every twin-matched
 * placement, the gap between its correct twin center and what
 * applyMapFitTransform predicts IS that frame offset (plus per-object
 * pivot->center noise that averages out over 100+ samples). Apply the mean
 * to the twin-less fallbacks so they land in the right place too.
 */
const fallbackRawPoint = (placement) => new THREE.Vector3(
    placement.position[0],
    -placement.position[1], // model-up is negative Y in the export's OBJ space
    placement.position[2],
).multiplyScalar(MM_TO_WORLD_SCALE);

const computeFallbackCorrection = (placements, scene, transform) => {
    const sum = new THREE.Vector3();
    const delta = new THREE.Vector3();
    let n = 0;
    placements.forEach((placement) => {
        const bounds = bakedTwinBounds(scene, placement.number);
        if (!bounds) {
            return;
        }
        bounds.getCenter(twinCenter);
        const world = applyMapFitTransform(fallbackRawPoint(placement), transform);
        sum.add(delta.copy(twinCenter).sub(world));
        n += 1;
    });
    return n > 0 ? sum.multiplyScalar(1 / n) : null;
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

const spawnPlacement = (templateId, placement, transform, scene, fallbackCorrection) => {
    const urls = resolveUrls(templateId, placement);
    if (!urls) {
        return Promise.resolve(null);
    }
    return loadGameModel('map-part', urls)
        .then((root) => {
            if (placement.instanceScale) {
                const [sx, sy, sz] = placement.instanceScale;
                root.scale.multiply(new THREE.Vector3(sx, sy, sz));
            }
            root.rotation.y = THREE.MathUtils.degToRad(placement.yawDegrees) + transform.yawRadians;

            // Position by matching the baked twin's world center (ground
            // truth from the map's own vertex pipeline). Fall back to the
            // reconstructed transform only when no twin exists (e.g. a
            // number mismatch) -- with the OBJ-space Y negation, since
            // model-up is negative Y there.
            const bounds = bakedTwinBounds(scene, placement.number);
            if (bounds) {
                root.updateMatrixWorld(true);
                twinBox.setFromObject(root);
                twinBox.getCenter(partCenter);
                bounds.getCenter(twinCenter);
                root.position.add(twinCenter.sub(partCenter));
            } else {
                // No number-matched twin (named catalog characters): position
                // via the reconstructed transform plus the empirical
                // frame-offset correction derived from the twin-matched
                // placements, so they land near the castle, not on the water.
                root.position.copy(applyMapFitTransform(fallbackRawPoint(placement), transform));
                if (fallbackCorrection) {
                    root.position.add(fallbackCorrection);
                }
            }
            liftFlatPlate(root);
            configurePlacedObject(root, placement);
            hideBakedTwin(scene, placement.number);
            if (root.isMovable) {
                // Interactive placements need the selection box MOVING/
                // ROTATING modes show on grab; updateSelectionBox alone
                // no-ops when no box exists yet.
                attachSelectionBox(root, { visible: false, wireframeVisible: false });
            }
            scene.add(root);
            recordForTesting(templateId, placement);
            return { root, placement };
        })
        .catch((error) => {
            console.error(`Failed to spawn placement "${placement.name}":`, error);
            return null;
        });
};

const partBox = new THREE.Box3();
const partCenterPt = new THREE.Vector3();

/**
 * The template export historically emits a catalog character's child
 * body-part objects as separate local-parts too, which reassemble a
 * duplicate character right on top of the whole catalog minifig (the "two
 * queens"). After all placements spawn, drop any local-part reconstruction
 * whose center lies inside a spawned catalog character's world bounds --
 * geometric containment cleanly distinguishes body parts (inside) from
 * distinct nearby props (outside). (The generator now also stops recursing
 * at character roots; this runtime pass fixes the already-shipped data.)
 */
const dedupeCharacterParts = (spawned, scene) => {
    const charBoxes = spawned
        .filter((s) => s && s.placement.kind === 'character')
        .map((s) => {
            s.root.updateMatrixWorld(true);
            // Expand the tight catalog box by a margin so body parts that
            // sit just outside it -- the base plate under the feet, an
            // extended arm -- are still caught. 1.2 world units stays well
            // inside the ~5+ unit gap to the nearest distinct prop.
            return new THREE.Box3().setFromObject(s.root).expandByScalar(1.2);
        });
    if (charBoxes.length === 0) {
        return;
    }
    spawned.forEach((s) => {
        if (!s || s.placement.kind === 'character' || s.placement.source === 'catalog') {
            return;
        }
        s.root.updateMatrixWorld(true);
        partBox.setFromObject(s.root).getCenter(partCenterPt);
        if (charBoxes.some((box) => box.containsPoint(partCenterPt))) {
            scene.remove(s.root);
            disposeObject3D(s.root);
        }
    });
};

const MapPlacementsLoader = (mapData, transform, scene, { includeBulk = true } = {}) => {
    const templateId = templateIdFromMapData(mapData);
    if (!templateId) {
        return;
    }
    if (typeof window !== 'undefined') {
        window.__placedObjects = [];
    }
    const placements = templatePlacements[templateId] || [];
    const active = placements
        .filter((placement) => placement.matchedModelId && placement.source)
        // brickQuality=low keeps the notable (named/catalog) placements but
        // skips the bulk local-part reconstructions -- often 100+ objects
        // per map -- for weaker machines.
        .filter((placement) => includeBulk || isNotable(placement));
    // One correction for the whole template, derived from twin-matched
    // placements (computed before spawning; the baked map is already loaded).
    const fallbackCorrection = computeFallbackCorrection(active, scene, transform);
    const spawns = active.map(
        (placement) => spawnPlacement(templateId, placement, transform, scene, fallbackCorrection),
    );
    // After every placement has spawned, remove the duplicate character
    // body-part reconstructions that sit inside a catalog character.
    Promise.all(spawns).then((results) => dedupeCharacterParts(results, scene));
};

export default MapPlacementsLoader;
