# KK Toolchain Validation Pass — Phase 2

All existing tools re-validated against the real global bank
(creator2000.*) and the three sample .lca files. One bug found and fixed.

| Tool | Result |
|---|---|
| xvr_extract.py | Round-trip proven: recompressed the 12.4MB .vrt payload into a synthetic .xvr, extracted, **all 6 sub-files byte-identical** to your uploads. Side finding: the 57-byte creator2000.xvr you exported is a genuine internal sub-file (`VRT file CREATO~2.XVR rev 6523`), not a truncation. |
| sprite_dump.py | 304/310 dumped; the 6 skipped entries are all-zero 0×0 placeholder slots (same pattern as VIS.SPR's 35). **All real sprites decode.** Minifig face/torso decals verified visually. |
| snd_dump.py | 92/92 sounds extracted, all WAVs structurally valid, 0 empty, 152 s total audio, names resolved from the symbol table. |
| export_textured.py | minifig / castle / template: 43 + 268 + 3140 textured faces, **missing_tex = [] on all three** against the real bank. Textured King Leo QA render correct. |
| gltf_writer.py / obj_to_glb.py | 3 GLBs produced; glTF header, chunk lengths, and totals verified; 5/6/44 textures embedded respectively. |
| generate_asset_manifest.py | 3 files scanned, 0 errors. |
| associate_sounds.py | **BUG FOUND**: character minifigs named with SCL codes (`SCL M/F : KL01`) matched nothing — the code table was documented but never used. **FIXED** (scl-code matching tier); King Leo now correctly gets his 5 bank sounds (`Minifigures KL *` + Step/Fart). 12 → 22 associations on the samples. |
| export_template_parts.py | 87 parts exported from template-01, 9 terrain shapes correctly classified by the map-scale heuristic. |
| export_template_placements.py | 141 placements, **100% coverage via local parts, zero orphaned references** (catalog tiers idle here only because the container lacks your 264-model metadata fixture). |

Bonus master-world validation: creator2000.wld parses with **zero warnings
across 2225 objects**; global SHP bank parses clean (51 shapes) and names
the SMO rig shapes (`Minifig - Arm Left`, `HipsBelt`, `horn`, ...), which
is what the add-on's token-alias matching keys on.

Updated file: `associate_sounds.py` (SCL-code patch, delivered alongside).
