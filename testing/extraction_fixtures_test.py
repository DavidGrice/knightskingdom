#!/usr/bin/env python3
"""
Regression check for resources/model_files/tools/export_template_placements.py:
runs it against the real template .lca files and asserts the tier-1
(named-object) matches are exactly the ones hand-verified this session --
catches silent regressions in the WLD-parsing/name-resolution pipeline
without needing to re-derive "what should this template contain" by hand
each time.

Usage: python3 testing/extraction_fixtures_test.py
"""
import glob
import os
import sys
import tempfile

TOOLS_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), '..',
    'resources', 'model_files', 'tools')
TEMPLATES_GLOB = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), '..',
    'resources', 'model_files', 'extracted', 'pak', 'warehouse', 'worlds',
    'templates', '*.lca')

sys.path.insert(0, TOOLS_DIR)

# Hand-verified against resources/model_files/extracted/models/ and the
# warehouse bucket's minifig list during the semi-vanilla placements session.
EXPECTED_TIER1_MATCHES = {
    'template-01': {'SCL M/F : QL01': 'minifigqueenleonora01'},
    'template-02': {'SCL M/F : RS01': 'minifigrichardstrong01'},
    'template-03': {'SCL M/F : PS01': 'minifigprincessstorm01'},
    'template-04': {'SCL M/F : W01': 'minifigweezil01'},
    'template-05': {'SCL Bomb : L4105278': 'l4105278'},
    'template-06': {'SCL Vehicle : OC6032': 'oc6032'},
    'template-07': {'SCL M/F : RS03': 'minifigrichardstrong03'},
}


def main():
    import export_template_placements as etp

    models_dir = os.path.join(TOOLS_DIR, '..', 'extracted', 'models')
    sig_index = etp.ShapeSignatureIndex(etp.MODEL_METADATA_PATH)

    failures = []
    for lca_path in sorted(glob.glob(TEMPLATES_GLOB)):
        template_id = os.path.splitext(os.path.basename(lca_path))[0]
        expected = EXPECTED_TIER1_MATCHES.get(template_id)
        if not expected:
            continue

        placements = etp.extract_placements(lca_path, models_dir, sig_index)
        actual = {p['name']: p['matchedModelId'] for p in placements if p['tier'] == 1}

        for name, expected_id in expected.items():
            got = actual.get(name)
            status = 'PASS' if got == expected_id else 'FAIL'
            print(f'{template_id} "{name}" -> {got} ({status}, expected {expected_id})')
            if got != expected_id:
                failures.append((template_id, name, expected_id, got))

    print(f'\n{len(failures)} failures')
    if failures:
        sys.exit(1)


if __name__ == '__main__':
    main()
