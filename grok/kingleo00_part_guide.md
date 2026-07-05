# King Leo Minifig (`minifigkingleo00`) — Part Identification Guide

**Phase 4** — derived from Phase 3 analysis ([kingleo00_scene_analysis.json](kingleo00_scene_analysis.json))  
**LCA symbol:** `SCL M/F : KL00`  
**Character:** King Leo (Knight's Kingdom)

---

## Overview

King Leo is a standard LEGO Creator Knights Kingdom **SCL M/F** (scale minifigure) rig. The exported OBJ contains **12 visible mesh parts** (LOD duplicates omitted). Each OBJ name is prefixed with the original LCA object number (`008_`, `011_`, etc.).

Parts are **pre-assembled** in the OBJ — they must stay at their world positions when rigged (parent with keep-transform).

### Scene orientation (phase2 root)

After `grok/phase2_import_kingleo.py` the root empty uses
`rotation_euler = (90°, 0°, 180°)` and feet on ground **Z = 0**. In
**world** space (not raw OBJ / LCA):

| Axis | Role |
|------|------|
| **−Y** | Up (head ≈ Y −0.03, feet ≈ Y 0) |
| **+Z** | Forward (LCA authored **−Z**; yaw 180° flips to +Z) |

Rig bones: world bounds → armature-local via `kingleo_rig_coords.py`; roll += π per bone. See `resources/model_files/README.md` § *Importing OBJ models — orientation*.

---

## Part table

| # | OBJ prefix | Blender mesh name | Rig bone | What it is |
|---|------------|-------------------|----------|------------|
| 1 | `008_` | `008_Minifig_2_-_Hips_BK_Belt` | `pelvis` | **Hip block / waist** — black belt texture, anchors legs and torso |
| 2 | `018_` | `018_Minifig_2_-_Body_No_code_GY` | `spine` | **Torso / chest** — gray base + Leo tunic print (`spr073`) |
| 3 | `020_` | `020_Minifig_2_-_Head_Leo` | `head` | **Head + face** — yellow skin + Leo face decal (`spr115`) |
| 4 | `023_` | `023_L_7101500` | `head_acc` | **Crown / royal hair** — LEGO part 71015, light gray, sits on top of head |
| 5 | `011_` | `011_Minifig_2_-_Leg_Lt_All_tex_GY` | `leg.L` | **Left upper leg** — gray with stud texture (`spr138`) |
| 6 | `013_` | `013_Minifig_2_-_Foot_Left_GY` | `foot.L` | **Left foot** — plain gray (`glit042`) |
| 7 | `015_` | `015_Minifig_2_-_Leg_Rt_All_tex_GY` | `leg.R` | **Right upper leg** |
| 8 | `017_` | `017_Minifig_2_-_Foot_Right_GY` | `foot.R` | **Right foot** |
| 9 | `032_` | `032_Minifig_2_-_Arm_Lt_BL` | `arm.L` | **Left upper arm** — blue (`glit026`), hangs ~45° at rest |
| 10 | `035_` | `035_Minifig_2_-_Hand_YE` | `hand.L` | **Left claw hand** — yellow (`glit018`) |
| 11 | `027_` | `027_Minifig_2_-_Arm_Rt_BL` | `arm.R` | **Right upper arm** |
| 12 | `030_` | `030_Minifig_2_-_Hand_YE` | `hand.R` | **Right claw hand** |

---

## Detailed descriptions

### Pelvis — `008_` (LCA object 8)

- **Original symbol:** `Minifig 2 - Hips BK Belt`
- **Visual:** Short rectangular hip piece; black belt wrap on front/back (`spr133_128x32.png`)
- **Size in scene:** ~14.4 × 8 × 8 mm
- **Role:** Root of locomotion; both legs and torso attach here in the LCA hierarchy (group 7)

### Torso — `018_` (LCA object 18)

- **Original symbol:** `Minifig 2 - Body No code GY`
- **Visual:** Classic minifig torso; printed red/gold Leo tunic on chest (`spr073_64x64.png`)
- **Size:** ~16 × 12.8 × 8 mm
- **Role:** Connects hips to head and arms; neck socket at top

### Head — `020_` (LCA object 20)

- **Original symbol:** `Minifig 2 - Head Leo`
- **Visual:** Yellow minifig head with King Leo face (beard, expression) on `spr115_64x64.png`
- **Size:** ~10 × 10.7 × 10 mm
- **Role:** Rotates on neck joint; crown parents to this

### Crown — `023_` (LCA object 23)

- **Original symbol:** `L 7101500` (LEGO element 71015)
- **Visual:** Tall light-gray crown / hair piece; highest mesh in the figure (~15.8 mm tall zone)
- **Vertices:** 162 (most complex single part)
- **Role:** Cosmetic accessory; should move with head when rigged as `head_acc` child of `head`

### Legs & feet — `011_` / `013_` / `015_` / `017_`

- **Legs:** Upper leg segments with gray stud texture; hinge at hip (LCA groups 10 left, 14 right)
- **Feet:** Small flat blocks at ground level (root shifted so sole **Z ≈ 0**; height runs along **−Y** in world space); hinge at ankle (LCA foot offset `pos Y = -3200` VRT units below leg)
- **Left vs right:** Left parts have more negative X center (~-20 mm); right parts ~-12 mm

### Arms & hands — `032_` / `035_` / `027_` / `030_`

- **Arms:** Blue cylindrical upper arms; LCA rest rotation `brees[0] ≈ 8192` (~45° pitch) on groups 31 (left) and 26 (right)
- **Hands:** Yellow C-clamp claw hands; slight roll on hand groups (`brees[2] ≈ ±1820`)
- **Attachment:** Shoulder socket on torso top corners

---

## LCA hierarchy (animation-relevant)

```
pelvis (hips group 7)
├── leg.L (group 10) → mesh 11, foot 13
├── leg.R (group 14) → mesh 15, foot 17
└── spine (body mesh 18)
    ├── head (group 19) → mesh 20, crown 23
    ├── arm.R (group 26) → mesh 27, hand 30
    └── arm.L (group 31) → mesh 32, hand 35
```

---

## SMO animation track names (future)

When applying `.smo` clips: `hips`, `body`, `head`, `leftarm`, `rightarm`, `lefthand`, `righthand`, `leftleg`, `rightleg`, `leftfoot`, `rightfoot`.

See [resources/model_files/tools/smo_pose_test.py](../resources/model_files/tools/smo_pose_test.py).

---

## Phase 5 bone order

| Step | Bone | Mesh |
|------|------|------|
| 1 | `pelvis` | `008_` |
| 2 | `spine` | `018_` |
| 3 | `head` | `020_` |
| 4 | `head_acc` | `023_` |
| 5 | `leg.L` | `011_` |
| 6 | `foot.L` | `013_` |
| 7 | `leg.R` | `015_` |
| 8 | `foot.R` | `017_` |
| 9 | `arm.L` | `032_` |
| 10 | `hand.L` | `035_` |
| 11 | `arm.R` | `027_` |
| 12 | `hand.R` | `030_` |

**Final rig:** `grok/minifigkingleo00_rigged.blend`  
**Pose tests:** `python grok/run_blender_script.py grok/test_minifig_poses.py` → `grok/pose_tests/`  
**SMO run clip:** `python grok/run_blender_script.py grok/apply_smo_to_rig.py` → `grok/minifigkingleo00_run_anim.blend`

---

## Not in OBJ (skipped LOD / invisible)

LCA objects 9, 12, 16, 21, 24, 29, 34 are lower-detail duplicates — not exported to the game OBJ.