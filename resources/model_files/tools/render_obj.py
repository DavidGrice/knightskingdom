#!/usr/bin/env python3
"""Render an OBJ (with MTL colors) to PNG from a few angles, for QA."""
import os
import sys

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from mpl_toolkits.mplot3d.art3d import Poly3DCollection


def load_obj(path):
    verts, faces, mats = [], [], {}
    cur = (0.7, 0.7, 0.7)
    mtl = None
    for ln in open(path):
        p = ln.split()
        if not p:
            continue
        if p[0] == 'mtllib':
            mtl = os.path.join(os.path.dirname(path), p[1])
        elif p[0] == 'v':
            verts.append([float(x) for x in p[1:4]])
        elif p[0] == 'usemtl':
            cur = p[1]
        elif p[0] == 'f':
            faces.append(([int(x.split('/')[0]) - 1 for x in p[1:]], cur))
    colors = {}
    if mtl and os.path.exists(mtl):
        name = None
        for ln in open(mtl):
            p = ln.split()
            if not p:
                continue
            if p[0] == 'newmtl':
                name = p[1]
            elif p[0] == 'Kd' and name:
                colors[name] = tuple(float(x) for x in p[1:4])
    return np.array(verts), faces, colors


def render(path, out_png, views=((20, -60), (30, 120), (75, -90))):
    verts, faces, colors = load_obj(path)
    if len(verts) == 0 or not faces:
        print('empty obj, skipping render:', path)
        return
    # KK OBJs carry model-up at NEGATIVE Y (frozen exporter's Y-flip
    # vs +Y-up VRT content); negate for correct display (det +1).
    verts = verts[:, [0, 2, 1]] * np.array([1.0, 1.0, -1.0])
    fig = plt.figure(figsize=(5 * len(views), 5))
    lo, hi = verts.min(0), verts.max(0)
    center, span = (lo + hi) / 2, (hi - lo).max() * 0.55
    # simple sun-lambert shading
    light = np.array([0.4, 0.8, 0.45])
    light = light / np.linalg.norm(light)
    for k, (elev, azim) in enumerate(views):
        ax = fig.add_subplot(1, len(views), k + 1, projection='3d')
        polys, cols = [], []
        for idx, mat in faces:
            tri = verts[idx]
            n = np.cross(tri[1] - tri[0], tri[2] - tri[0])
            ln = np.linalg.norm(n)
            lam = 0.55 + 0.45 * abs(n @ light / ln) if ln > 0 else 0.7
            base = colors.get(mat, (0.7, 0.7, 0.7))
            polys.append(tri)
            cols.append(tuple(min(1, c * lam) for c in base))
        pc = Poly3DCollection(polys, facecolors=cols, edgecolors='k',
                              linewidths=0.15)
        # autolim=False: the manual set_[xyz]lim below already frames the
        # model; mplot3d's own autoscale overflows to Inf/NaN on some
        # matplotlib/numpy builds ("Axis limits cannot be NaN or Inf").
        ax.add_collection3d(pc, autolim=False)
        for setl, c, s in ((ax.set_xlim, center[0], span),
                           (ax.set_ylim, center[1], span),
                           (ax.set_zlim, center[2], span)):
            setl(c - s, c + s)
        # OBJ Y-up -> matplotlib z-up: plot (x, z, y)
        ax.view_init(elev=elev, azim=azim)
        ax.set_axis_off()
        ax.set_box_aspect((1, 1, 1))
    fig.tight_layout()
    fig.savefig(out_png, dpi=90)
    print('wrote', out_png, f'({len(faces)} faces)')


if __name__ == '__main__':
    for p in sys.argv[1:]:
        render(p, p.replace('.obj', '.png'))
