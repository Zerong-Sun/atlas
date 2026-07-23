#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fatequest — REAL terrain pipeline (run in an environment WITH internet).

Fetches open geographic data and clips it to the oikoumene bounding box,
producing engine-ready deliverables that DROP IN beside the curated data:

  data/coastline.geojson   Natural Earth coastlines (public domain)
  data/land.geojson        Natural Earth land polygons
  data/rivers_ne.geojson   Natural Earth river centerlines
  data/lakes.geojson       Natural Earth lakes
  heightmap/heightmap.png  REAL 16-bit DEM clipped to the bbox (replaces the
                           synthetic prototype), + heightmap_meta.json

------------------------------------------------------------------------------
DATA SOURCES & LICENSES (all free / open):
  * Natural Earth  — https://www.naturalearthdata.com  (Public Domain)
      GitHub mirror: https://github.com/nvkelso/natural-earth-vector
  * Elevation DEM (choose one):
      - GEBCO 2024 grid — https://www.gebco.net  (free, open)
      - ETOPO 2022      — NOAA NCEI (public domain)
      - SRTM15+ / GEBCO subset via OpenTopography Global Raster API
        https://portal.opentopography.org  (free API key)
------------------------------------------------------------------------------
DEPENDENCIES:
    pip install requests shapely
    # for the real DEM clip additionally:
    pip install rasterio numpy pillow
Usage:
    export OPENTOPO_KEY=xxxx      # optional, enables one-call DEM subset
    python3 build_real_terrain.py --ne-scale 50m --dem opentopo
"""
import argparse, json, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "data"); HM = os.path.join(ROOT, "heightmap")
CFG  = json.load(open(os.path.join(DATA, "world_config.json"), encoding="utf-8"))
B    = CFG["bbox"]
BBOX = (B["west"], B["south"], B["east"], B["north"])

NE_BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson"
NE_LAYERS = {          # scale is substituted below
    "coastline": "ne_{s}_coastline.geojson",
    "land":      "ne_{s}_land.geojson",
    "rivers_ne": "ne_{s}_rivers_lake_centerlines.geojson",
    "lakes":     "ne_{s}_lakes.geojson",
}

def fetch_json(url):
    import requests
    print("  GET", url)
    r = requests.get(url, timeout=120); r.raise_for_status()
    return r.json()

def clip_vectors(scale):
    from shapely.geometry import shape, box, mapping
    from shapely.ops import unary_union
    clip = box(*BBOX)
    for name, tmpl in NE_LAYERS.items():
        try:
            gj = fetch_json(f"{NE_BASE}/{tmpl.format(s=scale)}")
        except Exception as e:
            print(f"  ! skip {name}: {e}"); continue
        out = []
        for f in gj["features"]:
            try:
                g = shape(f["geometry"]).intersection(clip)
            except Exception:
                continue
            if g.is_empty: continue
            out.append({"type": "Feature", "properties": f.get("properties", {}),
                        "geometry": mapping(g)})
        dst = os.path.join(DATA, f"{name}.geojson")
        json.dump({"type": "FeatureCollection", "features": out},
                  open(dst, "w", encoding="utf-8"), ensure_ascii=False)
        print(f"  wrote {name}.geojson  ({len(out)} features clipped to bbox)")

def dem_opentopo(demtype="SRTM15Plus"):
    """One-call bbox subset via OpenTopography Global Raster API -> GeoTIFF."""
    import requests
    key = os.environ.get("OPENTOPO_KEY")
    if not key:
        sys.exit("Set OPENTOPO_KEY (free at portal.opentopography.org) or use --dem file")
    url = ("https://portal.opentopography.org/API/globaldem"
           f"?demtype={demtype}&south={B['south']}&north={B['north']}"
           f"&west={B['west']}&east={B['east']}&outputFormat=GTiff&API_Key={key}")
    tif = os.path.join(HM, "_dem_raw.tif")
    print("  GET OpenTopography DEM ->", tif)
    r = requests.get(url, timeout=600); r.raise_for_status()
    open(tif, "wb").write(r.content)
    return tif

def dem_to_heightmap(tif, W=2048, H=1024, max_elev=8000.0):
    import numpy as np, rasterio
    from rasterio.enums import Resampling
    from PIL import Image
    with rasterio.open(tif) as ds:
        arr = ds.read(1, out_shape=(H, W), resampling=Resampling.bilinear).astype("float32")
    arr = np.where(arr < 0, 0, arr)          # clamp ocean/bathymetry to 0 (land engine)
    arr = np.clip(arr, 0, max_elev)
    norm = (arr / max_elev * 65535.0).astype("uint16")
    Image.fromarray(norm).save(os.path.join(HM, "heightmap.png"))
    meta = {"type": "real-dem", "source_tif": os.path.basename(tif),
            "width": W, "height": H, "bit_depth": 16, "bbox": B, "crs": "EPSG:4326",
            "elevation": {"grayscale_max": 65535, "meters_max": max_elev,
                          "formula_m": f"meters = gray/65535 * {int(max_elev)}"}}
    json.dump(meta, open(os.path.join(HM, "heightmap_meta.json"), "w"), indent=2)
    print(f"  wrote REAL heightmap.png  (max {arr.max():.0f} m)")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ne-scale", default="50m", choices=["10m", "50m", "110m"],
                    help="Natural Earth resolution (10m finest)")
    ap.add_argument("--dem", default="none",
                    choices=["none", "opentopo", "file"],
                    help="DEM source; 'file' expects heightmap/_dem_raw.tif already present")
    ap.add_argument("--demtype", default="SRTM15Plus",
                    help="OpenTopography demtype (SRTM15Plus, GEBCOIceTopo, ...)")
    a = ap.parse_args()
    os.makedirs(HM, exist_ok=True)
    print("Clipping Natural Earth vectors to", BBOX)
    clip_vectors(a.ne_scale)
    if a.dem == "opentopo":
        dem_to_heightmap(dem_opentopo(a.demtype))
    elif a.dem == "file":
        dem_to_heightmap(os.path.join(HM, "_dem_raw.tif"))
    else:
        print("DEM step skipped (--dem none). Synthetic heightmap remains in place.")
    print("Done.")

if __name__ == "__main__":
    main()
