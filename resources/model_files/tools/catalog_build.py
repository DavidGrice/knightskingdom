#!/usr/bin/env python3
"""
catalog_build.py -- browsable HTML catalog for LEGO Creator: Knights'
Kingdom .lca extractions (KK port of the HP catalog builder).

For every .lca under the given roots:
  - parses it (category, object/shape/face counts, physical size in mm),
  - produces a textured OBJ via export_textured.py (bank textures must be
    pre-dumped: sprite_dump.py -> <texdir>, which is also searched for
    creator2000.pal for LITCOLS resolution),
  - renders a single-view thumbnail (matplotlib, embedded as base64),
  - optionally links sound associations from associate_sounds.py's CSV.

Outputs (to <outdir>):
  catalog.html         self-contained gallery: search box, category chips,
                       sort control, card grid, click-through detail panel.
                       No external files needed; thumbnails are embedded.
  model_catalog.json   per-model metadata ({'models': [{id, category,
                       vertexCount, faceCount, bbox{size}, ...}]}) --
                       schema-compatible with export_template_placements.py's
                       ShapeSignatureIndex, so the catalog build doubles as
                       the tier-2 fingerprint source.

Usage:
  python3 catalog_build.py <outdir> <texdir> [--sounds sounds.csv] \
      <lca-file-or-dir ...>
"""
import base64
import csv
import glob
import html
import io
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

from lca_parser import parse_lca
import export_textured as ET
import render_obj as RO


def load_obj_textured(obj_path):
    """Like render_obj.load_obj but also resolves textured faces to a
    sampled colour (texture pixel at the face's UV centroid), so
    thumbnails show decorations instead of the exporter's white base."""
    from PIL import Image
    verts, uvs, faces = [], [], []
    mtl, cur = None, '__d__'
    for ln in open(obj_path):
        p = ln.split()
        if not p:
            continue
        if p[0] == 'mtllib':
            mtl = os.path.join(os.path.dirname(obj_path), p[1])
        elif p[0] == 'v':
            verts.append([float(x) for x in p[1:4]])
        elif p[0] == 'vt':
            uvs.append((float(p[1]), float(p[2])))
        elif p[0] == 'usemtl':
            cur = p[1]
        elif p[0] == 'f':
            vi, ti = [], []
            for tok in p[1:]:
                parts = tok.split('/')
                vi.append(int(parts[0]) - 1)
                if len(parts) > 1 and parts[1]:
                    ti.append(int(parts[1]) - 1)
            faces.append((vi, ti if len(ti) == len(vi) else None, cur))
    kd, maps = {}, {}
    if mtl and os.path.exists(mtl):
        nm = None
        for ln in open(mtl):
            p = ln.split()
            if not p:
                continue
            if p[0] == 'newmtl':
                nm = p[1]
            elif p[0] == 'Kd' and nm:
                kd[nm] = tuple(float(x) for x in p[1:4])
            elif p[0] == 'map_Kd' and nm:
                maps[nm] = os.path.join(os.path.dirname(mtl), p[-1])
    imgs = {}

    def sample(mat, ti):
        path = maps.get(mat)
        if not path or not ti:
            return None
        img = imgs.get(path)
        if img is None:
            if not os.path.exists(path):
                return None
            img = imgs[path] = Image.open(path).convert('RGB')
        u = sum(uvs[t][0] for t in ti) / len(ti)
        v = sum(uvs[t][1] for t in ti) / len(ti)
        w, h = img.size
        px = img.getpixel((min(w - 1, max(0, int(u % 1.0 * w))),
                           min(h - 1, max(0, int((1 - v % 1.0) * h)))))
        return tuple(c / 255.0 for c in px)

    out = []
    for vi, ti, mat in faces:
        col = sample(mat, ti) or kd.get(mat, (0.7, 0.7, 0.7))
        out.append((vi, col))
    return np.array(verts), out


def thumb_png(obj_path, px=280):
    """Single-view thumbnail of an OBJ -> PNG bytes (None if empty)."""
    verts, faces = load_obj_textured(obj_path)
    if len(verts) == 0 or not faces:
        return None
    # KK content is +Y-up in VRT; the frozen exporter's Y-flip puts model
    # 'up' at NEGATIVE OBJ Y -- negate for display (det +1: no mirror).
    verts = verts[:, [0, 2, 1]] * np.array([1.0, 1.0, -1.0])
    fig = plt.figure(figsize=(px / 100.0, px / 100.0), dpi=100)
    ax = fig.add_subplot(111, projection='3d')
    lo, hi = verts.min(0), verts.max(0)
    center, span = (lo + hi) / 2, max((hi - lo).max() * 0.52, 1e-6)
    light = np.array([0.4, 0.8, 0.45])
    light = light / np.linalg.norm(light)
    polys, cols = [], []
    for idx, base in faces:
        tri = verts[idx]
        if len(tri) < 3:
            continue
        n = np.cross(tri[1] - tri[0], tri[2] - tri[0])
        ln = np.linalg.norm(n)
        lam = 0.55 + 0.45 * abs(n @ light / ln) if ln > 0 else 0.7
        polys.append(tri)
        cols.append(tuple(min(1, c * lam) for c in base))
    # autolim=False: skip mplot3d's own auto_scale_xyz -- it's redundant with
    # the manual set_[xyz]lim below, and on some matplotlib/numpy builds its
    # float32 margin math overflows to Inf/NaN and raises "Axis limits cannot
    # be NaN or Inf" for otherwise-fine models (mc005, mc008, ...).
    ax.add_collection3d(Poly3DCollection(polys, facecolors=cols,
                                         edgecolors='k', linewidths=0.1),
                        autolim=False)
    for setl, c in ((ax.set_xlim, center[0]), (ax.set_ylim, center[1]),
                    (ax.set_zlim, center[2])):
        setl(c - span, c + span)
    ax.view_init(elev=22, azim=-60)
    ax.set_axis_off()
    ax.set_box_aspect((1, 1, 1))
    fig.subplots_adjust(left=0, right=1, bottom=0, top=1)
    buf = io.BytesIO()
    fig.savefig(buf, format='png', transparent=True)
    plt.close(fig)
    return buf.getvalue()


def obj_stats(obj_path):
    nv = nf = 0
    lo = [1e30] * 3
    hi = [-1e30] * 3
    for ln in open(obj_path):
        p = ln.split()
        if not p:
            continue
        if p[0] == 'v':
            nv += 1
            for i in range(3):
                v = float(p[1 + i])
                lo[i] = min(lo[i], v)
                hi[i] = max(hi[i], v)
        elif p[0] == 'f':
            nf += 1
    size = [max(0.0, hi[i] - lo[i]) for i in range(3)] if nv else [0, 0, 0]
    return nv, nf, size


def load_sounds_csv(path):
    out = {}
    if not path or not os.path.exists(path):
        return out
    with open(path, newline='') as fh:
        for row in csv.DictReader(fh):
            out.setdefault(row['lca_file'], []).append(
                (row['sound_name'], row['match_rule']))
    return out


CSS = """
body{font-family:system-ui,sans-serif;margin:0;background:#181c24;
     color:#e8e8e8}
header{padding:14px 22px;background:#10131a;position:sticky;top:0;
       display:flex;gap:12px;align-items:center;flex-wrap:wrap;z-index:5}
h1{font-size:17px;margin:0 14px 0 0;color:#ffd257}
input,select{background:#242a36;color:#eee;border:1px solid #3a4356;
             border-radius:6px;padding:6px 10px;font-size:13px}
.chip{cursor:pointer;padding:4px 11px;border-radius:20px;background:#242a36;
      border:1px solid #3a4356;font-size:12px;user-select:none}
.chip.on{background:#ffd257;color:#10131a;border-color:#ffd257}
#grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));
      gap:14px;padding:18px 22px}
.card{background:#20252f;border:1px solid #303848;border-radius:10px;
      overflow:hidden;cursor:pointer;transition:transform .08s}
.card:hover{transform:translateY(-2px);border-color:#ffd257}
.card img{width:100%;aspect-ratio:1;object-fit:contain;background:
      radial-gradient(#2c3342,#181c24)}
.card .nm{padding:8px 10px 2px;font-size:13px;font-weight:600;
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.card .st{padding:0 10px 9px;font-size:11px;color:#9aa4b8}
.cat{display:inline-block;font-size:10px;padding:1px 7px;border-radius:9px;
     background:#39415a;margin-right:6px}
#detail{position:fixed;inset:0;background:#000a;display:none;
        align-items:center;justify-content:center;z-index:9}
#detail .box{background:#20252f;border-radius:12px;max-width:640px;
        width:92%;max-height:88%;overflow:auto;padding:20px}
#detail img{width:280px;float:right;margin:0 0 10px 14px}
#detail table{font-size:13px;border-collapse:collapse}
#detail td{padding:3px 10px 3px 0;color:#c8d0e0}
#detail td:first-child{color:#8892a8}
#detail h2{margin:0 0 10px;color:#ffd257}
.snd{font-size:12px;color:#9fd49f}
#count{font-size:12px;color:#9aa4b8;margin-left:auto}
"""

JS = """
const D=window.CATALOG;let cat='',q='',sort='name';
const grid=document.getElementById('grid'),
      cnt=document.getElementById('count');
function fmt(s){return s.map(x=>x.toFixed(0)).join(' x ')+' mm';}
function render(){
  let items=D.models.filter(m=>(!cat||m.category===cat)&&
    (m.id.toLowerCase().includes(q)||m.category.toLowerCase().includes(q)));
  items.sort((a,b)=>sort==='name'?a.id.localeCompare(b.id):
    sort==='faces'?b.faceCount-a.faceCount:
    Math.max(...b.bbox.size)-Math.max(...a.bbox.size));
  cnt.textContent=items.length+' / '+D.models.length+' models';
  grid.innerHTML=items.map((m,i)=>`<div class="card" onclick="show('${m.id}')">
    <img loading="lazy" src="${m.thumb||''}" alt="">
    <div class="nm">${m.id}</div>
    <div class="st"><span class="cat">${m.category}</span>${m.faceCount} faces</div>
    </div>`).join('');
}
function show(id){const m=D.models.find(x=>x.id===id);
  document.getElementById('dbody').innerHTML=`<h2>${m.id}</h2>
  <img src="${m.thumb||''}">
  <table>
  <tr><td>Category</td><td>${m.category}</td></tr>
  <tr><td>Objects</td><td>${m.objectCount} (${m.hiddenCount} hidden LOD/proxy)</td></tr>
  <tr><td>Shapes</td><td>${m.shapeCount}</td></tr>
  <tr><td>Vertices / faces</td><td>${m.vertexCount} / ${m.faceCount}</td></tr>
  <tr><td>Textured faces</td><td>${m.texFaces}</td></tr>
  <tr><td>Texture sprites</td><td>${m.textureRefs.join(', ')||'-'}</td></tr>
  <tr><td>Size</td><td>${fmt(m.bbox.size)}</td></tr>
  <tr><td>Sounds</td><td>${m.sounds.length?m.sounds.map(s=>
     `<div class="snd">${s[0]} <i style="color:#667">(${s[1]})</i></div>`).join(''):'-'}</td></tr>
  </table>`;
  document.getElementById('detail').style.display='flex';}
document.getElementById('detail').onclick=e=>{
  if(e.target.id==='detail')e.target.style.display='none';};
document.getElementById('q').oninput=e=>{q=e.target.value.toLowerCase();render();};
document.getElementById('sort').onchange=e=>{sort=e.target.value;render();};
const chips=document.getElementById('chips');
['',...D.categories].forEach(c=>{const el=document.createElement('span');
  el.className='chip'+(c===''?' on':'');el.textContent=c||'All';
  el.onclick=()=>{cat=c;[...chips.children].forEach(x=>
    x.classList.toggle('on',x===el));render();};chips.appendChild(el);});
render();
"""


def build(outdir, texdir, sounds_csv, roots, reuse_dir=None):
    paths = []
    for a in roots:
        if os.path.isdir(a):
            paths += sorted(glob.glob(os.path.join(a, '**', '*.lca'),
                                      recursive=True))
        elif os.path.exists(a):
            paths.append(a)
        else:
            print(f'  (skipping missing root {a})')
    os.makedirs(outdir, exist_ok=True)
    tmp = os.path.join(outdir, '_objs')
    os.makedirs(tmp, exist_ok=True)
    sounds = load_sounds_csv(sounds_csv)

    models = []
    errors = []
    for path in paths:
        mid = os.path.splitext(os.path.basename(path))[0]
        try:
            r = parse_lca(path)
            objs = r['wld']['objects'] if 'wld' in r else []
            hidden = sum(1 for ob in objs
                         if ob['oflags'] & 0xC0000000)
            reused = reuse_dir and os.path.join(reuse_dir, mid + '.obj')
            if reused and os.path.exists(reused):
                obj_path, st = reused, {'tex_faces': None}
            else:
                obj_path, st = ET.export_textured(path, tmp,
                                                  tex_dir=texdir)
            nv, nf, size = obj_stats(obj_path)
            png = thumb_png(obj_path)
            texrefs = sorted({int(m[3:6]) for m in
                              open(obj_path[:-4] + '.mtl').read().split()
                              if m.startswith('tex') and m[3:6].isdigit()})
            models.append({
                'id': mid,
                'category': r['header'].get('category', '?'),
                'objectCount': len(objs),
                'hiddenCount': hidden,
                'shapeCount': sum(1 for s in r['shp']['shapes'] if s),
                'vertexCount': nv,
                'faceCount': nf,
                'texFaces': (st['tex_faces'] if st.get('tex_faces')
                             is not None else sum(
                                 1 for ln in open(obj_path)
                                 if ln.startswith('f ') and '/' in ln)),
                'textureRefs': texrefs,
                'bbox': {'size': size},
                'sounds': sounds.get(os.path.basename(path), []),
                'thumb': ('data:image/png;base64,' +
                          base64.b64encode(png).decode()) if png else '',
            })
            print(f'  {mid}: {nf} faces')
        except Exception as exc:
            errors.append((path, str(exc)))
            print(f'  ERROR {mid}: {exc}')

    cats = sorted({m['category'] for m in models})
    data = {'models': models, 'categories': cats}
    page = ('<!doctype html><html><head><meta charset="utf-8">'
            '<title>Knights\' Kingdom model catalog</title>'
            '<style>' + CSS + '</style></head><body>'
            '<header><h1>Knights\' Kingdom catalog</h1>'
            '<input id="q" placeholder="search...">'
            '<span id="chips" style="display:flex;gap:6px;flex-wrap:wrap">'
            '</span>'
            '<select id="sort"><option value="name">name</option>'
            '<option value="faces">faces</option>'
            '<option value="size">size</option></select>'
            '<span id="count"></span></header>'
            '<div id="grid"></div>'
            '<div id="detail"><div class="box" id="dbody"></div></div>'
            '<script>window.CATALOG=' +
            json.dumps(data) + ';' + JS + '</script></body></html>')
    html_path = os.path.join(outdir, 'catalog.html')
    with open(html_path, 'w') as fh:
        fh.write(page)

    # placements-compatible metadata (ShapeSignatureIndex schema)
    meta = {'models': [{'id': m['id'], 'category': m['category'],
                        'vertexCount': m['vertexCount'],
                        'faceCount': m['faceCount'],
                        'bbox': m['bbox']} for m in models]}
    with open(os.path.join(outdir, 'model_catalog.json'), 'w') as fh:
        json.dump(meta, fh, indent=1)
    print(f'{html_path}: {len(models)} models, {len(errors)} errors, '
          f'{os.path.getsize(html_path)/1024:.0f} KB')
    return html_path, models, errors


def main():
    args = sys.argv[1:]
    sounds_csv = reuse = None
    if '--sounds' in args:
        i = args.index('--sounds')
        sounds_csv = args[i + 1]
        args = args[:i] + args[i + 2:]
    if '--reuse' in args:
        i = args.index('--reuse')
        reuse = args[i + 1]
        args = args[:i] + args[i + 2:]
    build(args[0], args[1], sounds_csv, args[2:], reuse_dir=reuse)


if __name__ == '__main__':
    main()
