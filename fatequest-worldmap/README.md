# fatequest · Orbis Terrarum — the Medieval European Known World

A game-ready world geography built around the *mappa mundi* worldview: the world
as medieval Christendom understood it — Europe, the Mediterranean, North Africa,
the Near East, Persia, Arabia and the Indies — centred on Jerusalem, with the
encircling Ocean at its edges and the Earthly Paradise in the far East.

The design choice that makes this both authentic **and** usable in an engine:

> All features carry **real modern coordinates (EPSG:4326)**, but the *scope,
> names, cities, mountains, seas and lands* are the medieval known world. So the
> data aligns with real coastlines and real elevation (heightmaps work), while
> reading as a medieval map (Hierusalem at the centre, Mare Nostrum, Scythia,
> Aethiopia, Paradisus…). A one-click *East-up* mode in the web viewer gives the
> authentic orientation of the great mappae mundi.

---

## What's in the box

```
fatequest-worldmap/
├── data/                     ← vector data (engine + GIS ready)
│   ├── cities.geojson        90 cities: medieval + modern name, part, tier, note
│   ├── cities.csv            same, as a flat table
│   ├── mountains.geojson     21 ranges/peaks: spine, peak_m, trend, note
│   ├── rivers.geojson        23 rivers: source→mouth polylines, medieval name
│   ├── seas.geojson          16 seas/oceans: label points, medieval name
│   ├── regions.geojson       22 lands + the 3 T-O "parts" (Asia/Europa/Africa)
│   └── world_config.json     bbox, CRS, centre-of-world, counts, orientation
├── heightmap/
│   ├── heightmap.png         16-bit grayscale, 2048×1024 (engine import)
│   ├── heightmap_preview.png colour hillshade (for humans)
│   └── heightmap_meta.json   bbox, elevation scale (gray→metres)
├── web/
│   ├── index.html            interactive Leaflet map (double-click to open)
│   └── preview_static.png    static parchment render of every layer
├── scripts/
│   ├── gen_vector_data.py    rebuilds data/ (edit the lists to add features)
│   ├── gen_heightmap.py      rebuilds the synthetic heightmap from mountains
│   ├── build_web_map.py      rebuilds web/index.html (embeds the GeoJSON)
│   ├── render_preview.py     rebuilds the static preview
│   └── build_real_terrain.py ▶ run WITH internet to get REAL coastlines + DEM
└── README.md
```

## Coordinate system & extent

* **CRS:** `EPSG:4326` (WGS84 longitude/latitude), the GeoJSON default.
* **Bounding box (oikoumene):** west −20°, south 5°, east 100°, north 66°.
* **Centre of the world:** Hierusalem / Jerusalem (31.778 N, 35.235 E).
* **Orientation:** medieval maps put **East at the top**. The web viewer's
  *East-up* button rotates the map 90° CCW to reproduce this.

## Field reference

**cities.geojson** (Point) — `name_medieval`, `name_modern`, `part`
(`Asia`/`Europa`/`Africa`, the three T-O divisions), `tier` (1 sacred/great,
2 major, 3 lesser), `note`, `is_center` (true only for Jerusalem).

**mountains.geojson** (LineString spine, or Point for a lone peak) —
`name_medieval`, `name_modern`, `peak_m` (metres), `trend` (orientation e.g.
`WSW–ENE`), `note`. The heightmap ridges are derived from these spines.

**rivers.geojson** (LineString, ordered source→mouth) — `name_medieval`,
`name_modern`, `note`.

**seas.geojson / regions.geojson** (Point label anchors) — `name_medieval`,
`name_modern`, `note`; regions also carry `kind` (`part` = a continent of the
tripartite world, `land` = a named country/region).

---

## The interactive map

Open `web/index.html` by double-clicking it. The GeoJSON is embedded inline, so
every overlay (cities, mountains, rivers, seas, region labels) renders offline;
only the base tiles need internet. Controls:

* **Base layers:** *Relief* (Esri World Physical) or *Parchment* (light) — both
  are given a sepia/aged-paper cast via CSS.
* **Overlay toggles** for each data layer (bottom-right).
* **Turn map East-up** — the medieval *mappa mundi* orientation.
* **Toggle all labels** — for clean screenshots.

## The heightmap → game engines

`heightmap/heightmap.png` is 16-bit grayscale, 2048×1024, covering the bbox.
`heightmap_meta.json` gives the scale: `metres = gray / 65535 × 8000`.

> The shipped heightmap is a **synthetic prototype** — real mountain ranges laid
> as ridges over fractal lowlands, so relief matches the labelled ranges but it
> is **not** a true DEM and has no sea mask (everything reads as land). For
> production terrain, run `build_real_terrain.py` (below) to replace it with a
> real clipped DEM in the identical bbox/resolution — a drop-in swap.

**Unity** — Terrain → *Import Raw…* → 16-bit, 2048×1024, Windows byte order.
Set Terrain *Width/Length* to your world scale and *Height* so full-white =
8000 world-metres. (PNG import: use a RAW export, or load the PNG as a Texture
and sample it in a terrain tool — the RAW path is simplest.)

**Godot 4** — add a `HeightMapShape3D` or the *Terrain3D* addon; feed the PNG as
the height source and set height scale = `8000 × your_unit`. For a mesh, use an
`ImageTexture` in a shader displacing a subdivided `PlaneMesh`.

**Unreal 5** — Landscape → *Import from File* → select the 16-bit PNG. Set the
Z-scale so 65535 maps to 8000 m in your units (Landscape default Z is 512 for a
0–100 range; scale accordingly). Longitude/latitude of the bbox tells you the
real-world km footprint if you want 1:1 scale.

Placing cities/mountains in-engine: read the GeoJSON, convert lon/lat to your
world XZ with the same bbox mapping the heightmap uses —
`x = (lon − west)/(east − west) × mapWidth`,
`z = (north − lat)/(north − south) × mapDepth` — then sample the heightmap for Y.

## Getting REAL coastlines + elevation

The sandbox that generated this had no internet, so coastline polygons and the
true DEM are produced by a script you run locally:

```bash
pip install requests shapely rasterio numpy pillow
export OPENTOPO_KEY=your_free_key        # portal.opentopography.org
python3 scripts/build_real_terrain.py --ne-scale 50m --dem opentopo
```

It fetches **Natural Earth** (coastline, land, rivers, lakes — public domain),
clips them to the bbox into `data/*.geojson`, then pulls an elevation subset
(SRTM15+/GEBCO via OpenTopography, or point it at a GEBCO/ETOPO GeoTIFF with
`--dem file`) and writes a real `heightmap/heightmap.png` over the same bbox.

## Data sources & licenses

* **Natural Earth** — public domain. https://www.naturalearthdata.com
* **GEBCO 2024** bathymetry/topography — open. https://www.gebco.net
* **ETOPO 2022** (NOAA NCEI) — public domain.
* **SRTM15+ / OpenTopography Global DEM** — free with API key.
  https://portal.opentopography.org
* **Curated content** (city list, medieval names, notes, spines) — assembled
  from public-domain historical geography; released **CC0** for use in fatequest.
* Base map tiles in the viewer: © Esri (World Physical), © OpenStreetMap © CARTO.
  Keep their attribution if you ship the viewer.

## Editing / extending

Everything is regenerated from `scripts/gen_vector_data.py` — add a tuple to the
`CITIES`, `MOUNTAINS`, `RIVERS`, `SEAS` or `REGIONS` lists and re-run:

```bash
python3 scripts/gen_vector_data.py    # rebuild data/
python3 scripts/gen_heightmap.py      # rebuild synthetic heightmap
python3 scripts/build_web_map.py      # rebuild the viewer with new data
python3 scripts/render_preview.py     # rebuild the static preview
```

*Deus vult — sail to the edge of the map.*
