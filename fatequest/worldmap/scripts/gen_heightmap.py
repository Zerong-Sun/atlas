#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fatequest — synthetic heightmap generator, consistent with mountains.geojson.

This produces a PROTOTYPE heightmap for the oikoumene bbox. It is NOT a real
DEM: it synthesizes elevation by laying the known mountain ranges (from
mountains.geojson) as ridges over a fractal lowland base. Because it reads the
same vector spines the map uses, the relief lines up with the labelled ranges.

For a REAL DEM (GEBCO/ETOPO clipped to the bbox), run scripts/build_real_terrain.py
in an environment with network access — it drops a drop-in replacement here.

Outputs (heightmap/):
  heightmap.png          16-bit grayscale, 2048x1024 (engine import: R16 / raw)
  heightmap_preview.png  colored hillshade preview (for humans)
  heightmap_meta.json    bbox, resolution, elevation scale for the engine
"""
import json, os, math
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "data")
OUT  = os.path.join(ROOT, "heightmap")
os.makedirs(OUT, exist_ok=True)

cfg = json.load(open(os.path.join(DATA, "world_config.json"), encoding="utf-8"))
B = cfg["bbox"]
W, H = 2048, 1024
MAX_ELEV_M = 8000.0   # maps grayscale 65535 -> 8000 m

def lonlat_to_px(lon, lat):
    x = (lon - B["west"]) / (B["east"] - B["west"]) * (W - 1)
    y = (B["north"] - lat) / (B["north"] - B["south"]) * (H - 1)  # north at top
    return x, y

# --- fractal value noise (numpy only) --------------------------------------
rng = np.random.default_rng(1300)  # anno domini seed
def value_noise(w, h, cells):
    g = rng.random((cells + 1, cells + 1))
    ys = np.linspace(0, cells, h); xs = np.linspace(0, cells, w)
    x0 = np.floor(xs).astype(int); y0 = np.floor(ys).astype(int)
    x1 = np.minimum(x0 + 1, cells); y1 = np.minimum(y0 + 1, cells)
    tx = xs - x0; ty = ys - y0
    sx = tx * tx * (3 - 2 * tx); sy = ty * ty * (3 - 2 * ty)
    g00 = g[np.ix_(y0, x0)]; g10 = g[np.ix_(y0, x1)]
    g01 = g[np.ix_(y1, x0)]; g11 = g[np.ix_(y1, x1)]
    top = g00 * (1 - sx) + g10 * sx
    bot = g01 * (1 - sx) + g11 * sx
    return top * (1 - sy[:, None]) + bot * sy[:, None]

def fbm(w, h):
    out = np.zeros((h, w)); amp = 1.0; total = 0.0
    for cells in (3, 6, 12, 24, 48):
        out += amp * value_noise(w, h, cells); total += amp; amp *= 0.5
    return out / total

base = fbm(W, H)                       # 0..1 continental lumpiness
elev = base * 350.0                    # gentle lowlands up to ~350 m

# --- distance field to mountain spines -------------------------------------
mts = json.load(open(os.path.join(DATA, "mountains.geojson"), encoding="utf-8"))
yy, xx = np.mgrid[0:H, 0:W]

def add_ridge(px_pts, peak_m, width_px):
    # densify polyline, stamp gaussian ridge; nearest-vertex distance approx.
    dense = []
    for (x0, y0), (x1, y1) in zip(px_pts[:-1], px_pts[1:]):
        n = max(2, int(math.hypot(x1 - x0, y1 - y0) / 6))
        for t in np.linspace(0, 1, n):
            dense.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t))
    if len(px_pts) == 1:
        dense = [px_pts[0]]
    dist2 = np.full((H, W), 1e18)
    for (cx, cy) in dense:
        # only compute within a local window for speed
        x0 = max(0, int(cx - 4 * width_px)); x1 = min(W, int(cx + 4 * width_px))
        y0 = max(0, int(cy - 4 * width_px)); y1 = min(H, int(cy + 4 * width_px))
        d = (xx[y0:y1, x0:x1] - cx) ** 2 + (yy[y0:y1, x0:x1] - cy) ** 2
        np.minimum(dist2[y0:y1, x0:x1], d, out=dist2[y0:y1, x0:x1])
    ridge = np.exp(-dist2 / (2 * width_px ** 2)) * peak_m
    # roughen the ridge a little so it isn't a smooth tube
    ridge *= (0.75 + 0.25 * fbm(W, H))
    return ridge

for f in mts["features"]:
    g = f["geometry"]; peak = f["properties"]["peak_m"]
    pts = [g["coordinates"]] if g["type"] == "Point" else g["coordinates"]
    px = [lonlat_to_px(lon, lat) for lon, lat in pts]
    width = 10 + peak / 320.0          # taller ranges a touch broader
    elev = np.maximum(elev, add_ridge(px, peak, width))

# foothill halo so ranges bleed into surrounding highland
elev = elev + 0.15 * base * (elev > 500)

elev = np.clip(elev, 0, MAX_ELEV_M)

# --- write 16-bit heightmap ------------------------------------------------
norm = (elev / MAX_ELEV_M * 65535.0).astype(np.uint16)
Image.fromarray(norm, mode="I;16").save(os.path.join(OUT, "heightmap.png"))

# --- colored hillshade preview ---------------------------------------------
def hillshade(z, az=315, alt=45, ve=0.00025):
    dy, dx = np.gradient(z * ve)
    slope = np.pi/2 - np.arctan(np.hypot(dx, dy))
    aspect = np.arctan2(-dx, dy)
    az_r = math.radians(360 - az + 90); alt_r = math.radians(alt)
    hs = (np.sin(alt_r)*np.sin(slope) +
          np.cos(alt_r)*np.cos(slope)*np.cos(az_r - aspect))
    return np.clip(hs, 0, 1)

# hypsometric tint
t = elev / MAX_ELEV_M
stops = [(0.00,(58,90,64)),(0.03,(96,132,74)),(0.12,(168,178,104)),
         (0.30,(196,170,120)),(0.55,(160,120,86)),(0.80,(150,140,140)),
         (1.00,(250,250,252))]
rgb = np.zeros((H, W, 3))
for i in range(len(stops)-1):
    a,ca = stops[i]; b,cb = stops[i+1]
    m = (t>=a)&(t<=b); f=(t[m]-a)/max(b-a,1e-6)
    for c in range(3): rgb[m,c]=ca[c]+(cb[c]-ca[c])*f
hs = hillshade(elev)[...,None]
rgb = np.clip(rgb*(0.55+0.55*hs),0,255).astype(np.uint8)
Image.fromarray(rgb,"RGB").save(os.path.join(OUT,"heightmap_preview.png"))

meta = {
  "type":"synthetic-prototype",
  "note":"Relief derived from mountains.geojson over fractal lowlands. Replace with real DEM via scripts/build_real_terrain.py for production.",
  "width":W,"height":H,"bit_depth":16,"channel":"grayscale",
  "bbox":B,"crs":"EPSG:4326",
  "elevation":{"grayscale_min":0,"grayscale_max":65535,
               "meters_min":0.0,"meters_max":MAX_ELEV_M,
               "formula_m":"meters = gray/65535 * %d" % int(MAX_ELEV_M)},
  "engine_hint":{
     "unity":"Terrain > Import Raw, 16-bit, 2048x1024, set Terrain Height = 8000 (scaled to your world units)",
     "godot":"HeightMapShape3D / terrain addon; height scale = 8000 * your_unit",
     "unreal":"Landscape Import Heightmap (16-bit PNG); Z scale so 65535 -> 8000 m"}
}
json.dump(meta, open(os.path.join(OUT,"heightmap_meta.json"),"w"), indent=2)
print("heightmap done; elev max=%.0f m, land>500m px=%d" % (elev.max(), int((elev>500).sum())))
