#!/usr/bin/env python3
"""
test_addon_mock.py -- regression harness for io_import_lca.py (KK edition).
Installs a mock `bpy` module, imports the real add-on, and drives
do_import / apply_smo against real game files with API-shape assertions.
No Blender required; for live testing install the add-on normally.
"""
import sys
import types


# --------------------------------------------------------------------- mock
class Slot:
    def __init__(self):
        self.co = (0, 0, 0)
        self.uv = (0, 0)
        self.material_index = 0


class Mesh:
    def __init__(self, name):
        self.name = name
        self.materials = MatList()
        self.polygons = []
        self.uv_layers = UVLayers(self)
        self._faces = []

    def from_pydata(self, verts, edges, faces):
        self.verts = verts
        self._faces = faces
        self.polygons = [Slot() for _ in faces]

    def update(self):
        pass


class MatList(list):
    def append(self, m):
        super().append(m)


class UVLayers:
    def __init__(self, mesh):
        self.mesh = mesh
        self.layers = []

    def new(self, name='UVMap'):
        n_loops = sum(len(f) for f in self.mesh._faces)
        layer = types.SimpleNamespace(name=name,
                                      data=[Slot() for _ in range(n_loops)])
        self.layers.append(layer)
        return layer


class NodeSocket:
    def __init__(self):
        self.default_value = None


class Node:
    def __init__(self, ntype):
        self.type = ntype
        self.image = None
        self.inputs = _sockets()
        self.outputs = _sockets()


def _sockets():
    class D(dict):
        def __missing__(self, k):
            self[k] = NodeSocket()
            return self[k]
    return D()


class NodeTree:
    def __init__(self):
        self.nodes = Nodes()
        self.links = types.SimpleNamespace(new=lambda a, b: None)


class Nodes(list):
    def __init__(self):
        super().__init__([Node('BSDF_PRINCIPLED')])

    def new(self, kind):
        n = Node('TEX_IMAGE' if 'TexImage' in kind else kind)
        self.append(n)
        return n


class Material:
    def __init__(self, name):
        self.name = name
        self.use_nodes = False
        self.node_tree = NodeTree()
        self.blend_method = 'OPAQUE'


class ShapeKey:
    def __init__(self, name, n):
        self.name = name
        self.data = [Slot() for _ in range(n)]
        self.value = 0.0
        self.kf = []

    def keyframe_insert(self, path, frame=0):
        self.kf.append((path, frame, self.value))


class Object:
    def __init__(self, name, data):
        self.name = name
        self.data = data
        self.location = (0, 0, 0)
        self.rotation_mode = 'XYZ'
        self.rotation_quaternion = (1, 0, 0, 0)
        self.parent = None
        self.children = []
        self.hide_viewport = False
        self.hide_render = False
        self.empty_display_size = 1.0
        self.animation_data = None
        self._props = {}
        self._keys = []
        self._kf = []

    def __setitem__(self, k, v):
        self._props[k] = v

    def __getitem__(self, k):
        return self._props[k]

    def get(self, k, d=None):
        return self._props.get(k, d)

    def __setattr__(self, k, v):
        if k == 'parent' and v is not None:
            v.children.append(self)
        super().__setattr__(k, v)

    def shape_key_add(self, name='Key', from_mix=False):
        key = ShapeKey(name, len(getattr(self.data, 'verts', [])))
        self._keys.append(key)
        return key

    def animation_data_create(self):
        self.animation_data = types.SimpleNamespace(action=None)

    def keyframe_insert(self, path, frame=0):
        self._kf.append((path, frame))


class Image:
    def __init__(self, name, w, h):
        self.name = name
        self.size = (w, h)
        self.pixels = []

    def pack(self):
        pass


class Store:
    def __init__(self, factory):
        self.items = []
        self.factory = factory

    def new(self, name, *a, **kw):
        it = self.factory(name, *a, **kw)
        self.items.append(it)
        return it

    def get(self, name):
        for it in self.items:
            if getattr(it, 'name', None) == name:
                return it
        return None


class Collection:
    def __init__(self, name):
        self.name = name
        self.children = types.SimpleNamespace(link=lambda c: None)
        self.objects = types.SimpleNamespace(link=lambda o: None)


def fresh_bpy():
    bpy = types.ModuleType('bpy')
    bpy.data = types.SimpleNamespace(
        collections=Store(Collection),
        meshes=Store(Mesh),
        materials=Store(Material),
        objects=Store(lambda name, data=None: Object(name, data)),
        images=Store(lambda name, w=1, h=1, alpha=True: Image(name, w, h)),
        actions=Store(lambda name: types.SimpleNamespace(name=name)),
    )
    bpy.props = types.SimpleNamespace(
        StringProperty=lambda **kw: None, BoolProperty=lambda **kw: None,
        EnumProperty=lambda **kw: None)

    class _Op:
        def report(self, *a):
            pass
    bpy.types = types.SimpleNamespace(
        Operator=_Op, TOPBAR_MT_file_import=types.SimpleNamespace(
            append=lambda f: None, remove=lambda f: None))
    bpy.utils = types.SimpleNamespace(register_class=lambda c: None,
                                      unregister_class=lambda c: None)
    return bpy


class Ctx:
    def __init__(self):
        self.scene = types.SimpleNamespace(
            collection=Collection('Scene'),
            render=types.SimpleNamespace(fps=25),
            frame_end=250)
        self.active_object = None


# ------------------------------------------------------------------- driver
def main():
    def install(bpy):
        sys.modules['bpy'] = bpy
        props = types.ModuleType('bpy.props')
        props.StringProperty = lambda **kw: None
        props.BoolProperty = lambda **kw: None
        props.EnumProperty = lambda **kw: None
        sys.modules['bpy.props'] = props

    bpy = fresh_bpy()
    install(bpy)

    class _IH:
        pass
    sys.modules['bpy_extras'] = types.ModuleType('bpy_extras')
    sys.modules['bpy_extras.io_utils'] = types.SimpleNamespace(
        ImportHelper=_IH)

    import importlib
    mod = importlib.import_module('io_import_lca')

    def objs():
        return [o for o in bpy.data.objects.items]

    failures = []

    def check(cond, msg):
        print(('  PASS ' if cond else '  FAIL ') + msg)
        if not cond:
            failures.append(msg)

    # -- 1. Minifig (rig, LODs, shape keys, custom props) ------------------
    ctx = Ctx()
    root, st = mod.do_import(ctx, 'minifigkingleo01.lca', '', True, True)
    print('minifig:', st)
    meshes = [o for o in objs() if o.data is not None]
    empties = [o for o in objs() if o.data is None]
    check(st['meshes'] == 26 and st['empties'] == 21,
          '47 objects imported (26 meshes + 21 empties)')
    check(st['hidden'] > 0 and any(o.hide_viewport for o in objs()),
          'hidden LODs imported hidden, not skipped')
    keyed = [o for o in meshes if o._keys]
    check(len(keyed) == 2 and all(len(o._keys) == 4 for o in keyed),
          'two 4-cel shapes -> Basis + 3 shape keys each')
    check(all(len(k.kf) > 0 for o in keyed for k in o._keys[1:]),
          'shape keys carry one-hot keyframe cycles')
    check(all('lca_brees' in o._props for o in objs()),
          'rig custom properties stamped on every object')
    ngon = max(len(f) for o in meshes for f in o.data._faces)
    check(ngon > 4, 'n-gon facets preserved (max loop %d)' % ngon)

    # -- 2. SMO onto the unnamed rig (auto-map) ----------------------------
    applied, total, mapped = mod.apply_smo(ctx, 'anim_c_run.smo', root)
    print('smo run:', applied, '/', total, mapped)
    check(applied == 11, 'run clip: all 11 tracks auto-mapped and applied')
    hips = mod.automap_scl_rig(root).get('hips')
    check(hips is not None and any(
        ch.get('lca_type') == 0xFFFF for ch in hips.children),
        'hips maps to the body-bearing piece')
    kf = hips._kf
    rot_kf = [f for f in kf if f[0] == 'rotation_quaternion']
    check(len(rot_kf) == 21, 'hips carries 21 rotation keyframes')
    check(hips.animation_data.action is not None, 'action assigned')

    # -- 3. Castle, textured against the real global bank ------------------
    bpy2 = fresh_bpy()
    install(bpy2)
    mod = importlib.reload(mod)
    ctx = Ctx()
    root, st = mod.do_import(ctx, 'oc6098b2.lca', 'creator2000.spr',
                             True, True)
    print('castle:', st)
    check(st['meshes'] > 30, 'castle imports substantial geometry')
    check(st['materials'] > 3, 'multiple palette materials created')
    check(st['tex_faces'] > 100, 'textured faces detected (%d)'
          % st['tex_faces'])
    imgs = bpy2.data.images.items
    check(len(imgs) > 0 and all(len(i.pixels) == i.size[0] * i.size[1] * 4
                                for i in imgs),
          '%d bank textures decoded into images' % len(imgs))
    texmats = [m for m in bpy2.data.materials.items
               if m.name.startswith('tex')]
    check(texmats and all(any(n.type == 'TEX_IMAGE' and n.image is not None
                              for n in m.node_tree.nodes) for m in texmats),
          'tex materials wired to image nodes')

    # -- 3b. Master-world-style named rig: token alias matching -------------
    def named_rig():
        rootO = Object('100_SCL M_F  QL01', None)
        names = ['101_MiniFig - HipsBelt', '102_MiniFig - Body',
                 '103_MiniFig - Head', '104_Minifig - Arm Left',
                 '105_Minifig - Arm Right', '106_Hand Left',
                 '107_Hand Right', '108_Leg Left', '109_Leg Right',
                 '110_left foot', '111_right foot', '112_horn']
        for nm in names:
            o = Object(nm, None)
            o.parent = rootO
            o['lca_brees'] = [0, 0, 0]
        return rootO
    nroot = named_rig()
    applied, total, mapped = mod.apply_smo(ctx, 'anim_c_attention.smo',
                                           nroot)
    print('smo attention on named rig:', applied, '/', total, mapped)
    check(applied == total == 12,
          'all 12 tracks (incl. horn) matched by name tokens')

    # -- 4. Template (flat-plane rule) --------------------------------------
    bpy3 = fresh_bpy()
    install(bpy3)
    mod = importlib.reload(mod)
    ctx = Ctx()
    root, st = mod.do_import(ctx, 'template-01.lca', '', True, True)
    print('template:', st)
    check(st['meshes'] + st['empties'] == 619, 'all 619 objects imported')
    check(st['hidden'] >= 212, 'nested helper flats + LODs hidden '
          '(%d hidden)' % st['hidden'])

    # -- 5. Sprite bank decode (VIS.SPR mechanics) --------------------------
    bank = mod.SpriteBank('VIS.SPR')
    got = sum(1 for k in range(bank.count) if bank.pixels(k))
    print('VIS.SPR: %d/%d sprites decoded (rest are empty 0x0 slots)'
          % (got, bank.count))
    check(got == 36, 'VIS.SPR: all 36 non-empty sprites decode')

    # -- 6. Global bank (creator2000) ---------------------------------------
    import os
    if os.path.exists('creator2000.spr'):
        gb = mod.SpriteBank('creator2000.spr')
        ggot = sum(1 for k in range(gb.count) if gb.pixels(k))
        print('creator2000.spr: %d/%d sprites decoded' % (ggot, gb.count))
        check(gb.count == 310 and ggot >= 300,
              'global 310-sprite bank decodes')
        gv = mod.SpriteBank('creator2000.vrt')
        check(gv.count == gb.count,
              'bound .vrt container path finds the same bank '
              '(the 57-byte creator2000.xvr upload is a directory stub, '
              'not the archive)')

    print()
    if failures:
        raise SystemExit('FAILURES: %d -> %s' % (len(failures), failures))
    print('ALL MOCK TESTS PASSED')


if __name__ == '__main__':
    main()
