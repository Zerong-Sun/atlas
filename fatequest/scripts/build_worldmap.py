#!/usr/bin/env python3
"""Build assets/data/worldmap.json — the geography the world map screen draws.

Two sources, merged:

  1. fatequest-worldmap/  (sibling project, CC0 gazetteer + Natural Earth)
     — 96 cities of the Latin known world, seas, regions, mountain spines.
  2. assets/data/gazetteer-east.json
     — the lands past the edge of that map (Cathay, Manzi, the Indies), which
       the MVP routes need and a European mappa mundi never carried.

Natural Earth land / lakes / rivers are fetched once into scripts/.cache/ and
clipped to the game bbox. Everything is projected here, so the runtime never
sees lon/lat — only view coordinates.

    python3 scripts/build_worldmap.py                # fetch if needed
    python3 scripts/build_worldmap.py --offline      # use the cache only

Natural Earth is public domain; the curated gazetteer is CC0.
"""
import argparse
import json
import math
import os
import urllib.request

# The game's world: Gibraltar to the China Sea, Novgorod to Java.
BBOX = {"west": -20.0, "south": -12.0, "east": 125.0, "north": 62.0}
VIEW_W = 1560.0
VIEW_H = VIEW_W * (BBOX["north"] - BBOX["south"]) / (BBOX["east"] - BBOX["west"])

NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/"
LAYERS = {
    "land": "ne_50m_land.geojson",
    "lakes": "ne_50m_lakes.geojson",
    "rivers": "ne_50m_rivers_lake_centerlines.geojson",
}

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, ".cache")
GAZ_DEFAULTS = [
    "../../fatequest-worldmap",
    "../../../fatequest-worldmap",
    os.path.expanduser("~/project/untitled/fatequest-worldmap"),
]


# ---------- sources ----------
def fetch(layer, offline):
    path = os.path.join(CACHE, LAYERS[layer])
    if not os.path.exists(path):
        if offline:
            raise SystemExit("missing %s and --offline given" % path)
        os.makedirs(CACHE, exist_ok=True)
        print("  fetching %s …" % LAYERS[layer])
        urllib.request.urlretrieve(NE + LAYERS[layer], path)
    with open(path, encoding="utf-8") as f:
        return json.load(f)["features"]


def find_gazetteer(given):
    cands = [given] if given else []
    cands += [os.path.normpath(os.path.join(HERE, d)) for d in GAZ_DEFAULTS]
    for c in cands:
        if c and os.path.isdir(os.path.join(c, "data")):
            return c
    return None


def load_gaz(src, name):
    with open(os.path.join(src, "data", name), encoding="utf-8") as f:
        return json.load(f)["features"]


# ---------- geometry ----------
def project(lon, lat):
    return ((lon - BBOX["west"]) / (BBOX["east"] - BBOX["west"]) * VIEW_W,
            (BBOX["north"] - lat) / (BBOX["north"] - BBOX["south"]) * VIEW_H)


def clip_polygon(ring):
    """Sutherland–Hodgman against the bbox (a convex rect)."""
    edges = [("w", BBOX["west"]), ("e", BBOX["east"]),
             ("s", BBOX["south"]), ("n", BBOX["north"])]

    def inside(p, side, v):
        return {"w": p[0] >= v, "e": p[0] <= v,
                "s": p[1] >= v, "n": p[1] <= v}[side]

    def cross(a, b, side, v):
        if side in ("w", "e"):
            t = (v - a[0]) / (b[0] - a[0])
            return [v, a[1] + t * (b[1] - a[1])]
        t = (v - a[1]) / (b[1] - a[1])
        return [a[0] + t * (b[0] - a[0]), v]

    out = ring
    for side, v in edges:
        if not out:
            return []
        buf, prev = [], out[-1]
        for cur in out:
            ci, pi = inside(cur, side, v), inside(prev, side, v)
            if ci:
                if not pi:
                    buf.append(cross(prev, cur, side, v))
                buf.append(cur)
            elif pi:
                buf.append(cross(prev, cur, side, v))
            prev = cur
        out = buf
    return out


def clip_line(line):
    """Split a polyline into the pieces that fall inside the bbox."""
    def inb(p):
        return (BBOX["west"] <= p[0] <= BBOX["east"]
                and BBOX["south"] <= p[1] <= BBOX["north"])

    pieces, cur = [], []
    for p in line:
        if inb(p):
            cur.append(p)
        elif cur:
            pieces.append(cur)
            cur = []
    if cur:
        pieces.append(cur)
    return [p for p in pieces if len(p) > 1]


def simplify(pts, tol):
    """Douglas–Peucker, iterative so long coastlines cannot blow the stack."""
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, jj = stack.pop()
        ax, ay = pts[i]
        bx, by = pts[jj]
        dx, dy = bx - ax, by - ay
        span = math.hypot(dx, dy)
        worst, wi = -1.0, i
        for k in range(i + 1, jj):
            px, py = pts[k]
            d = (math.hypot(px - ax, py - ay) if span == 0 else
                 abs(dy * px - dx * py + bx * ay - by * ax) / span)
            if d > worst:
                worst, wi = d, k
        if worst > tol:
            keep[wi] = True
            stack.append((i, wi))
            stack.append((wi, jj))
    return [p for p, k in zip(pts, keep) if k]


def ring_area(pts):
    a = 0.0
    for i in range(len(pts)):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % len(pts)]
        a += x1 * y2 - x2 * y1
    return abs(a) / 2


def to_path(pts, close):
    if not pts:
        return ""
    d = "M" + " L".join("%.1f,%.1f" % p for p in pts)
    return d + "Z" if close else d


def rings_of(geom):
    t, c = geom["type"], geom["coordinates"]
    if t == "Polygon":
        return c
    if t == "MultiPolygon":
        return [r for poly in c for r in poly]
    if t == "LineString":
        return [c]
    if t == "MultiLineString":
        return c
    return []


def polygon_paths(features, tol, min_area):
    out = []
    for f in features:
        for ring in rings_of(f["geometry"]):
            clipped = clip_polygon(ring)
            if len(clipped) < 3:
                continue
            pts = simplify([project(p[0], p[1]) for p in clipped], tol)
            if len(pts) < 3 or ring_area(pts) < min_area:
                continue
            out.append(to_path(pts, True))
    return out


def line_paths(features, tol):
    out = []
    for f in features:
        for line in rings_of(f["geometry"]):
            for piece in clip_line(line):
                pts = simplify([project(p[0], p[1]) for p in piece], tol)
                if len(pts) > 1:
                    out.append(to_path(pts, False))
    return out


def slug(s):
    out = "".join(c.lower() if c.isalnum() else "-" for c in s).strip("-")
    while "--" in out:
        out = out.replace("--", "-")
    return out


def in_bbox(lon, lat):
    return (BBOX["west"] <= lon <= BBOX["east"]
            and BBOX["south"] <= lat <= BBOX["north"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gazetteer", help="path to fatequest-worldmap")
    ap.add_argument("--offline", action="store_true")
    ap.add_argument("--out")
    args = ap.parse_args()

    out = args.out or os.path.normpath(
        os.path.join(HERE, "..", "assets", "data", "worldmap.json"))

    print("Natural Earth 50m …")
    land = fetch("land", args.offline)
    lakes = fetch("lakes", args.offline)
    rivers = fetch("rivers", args.offline)
    rivers = [f for f in rivers
              if (f["properties"].get("scalerank") or 99) <= 6]

    src = find_gazetteer(args.gazetteer)
    cities, seas, regions, ranges = [], [], [], []
    seen = set()

    def add_city(cid, medieval, modern, part, tier, note, lon, lat, center=False):
        if not in_bbox(lon, lat):
            print("  ! outside bbox, skipped: %s" % medieval)
            return
        while cid in seen:
            cid += "-2"
        seen.add(cid)
        x, y = project(lon, lat)
        cities.append({
            "id": cid, "medieval": medieval, "modern": modern,
            "part": part, "tier": tier, "note": note, "center": center,
            "lon": round(lon, 3), "lat": round(lat, 3),
            "x": round(x, 1), "y": round(y, 1),
        })

    def add_point(bucket, p, lon, lat, extra=()):
        x, y = project(lon, lat)
        row = {"name": p.get("name_medieval"), "modern": p.get("name_modern"),
               "note": p.get("note"), "x": round(x, 1), "y": round(y, 1)}
        for k in extra:
            row[k] = p.get(k)
        bucket.append(row)

    def add_spine(p, line, extra=()):
        pts = simplify([project(c[0], c[1]) for c in line], 0.5)
        row = {"name": p.get("name_medieval"), "modern": p.get("name_modern"),
               "d": to_path(pts, False),
               "x": round(pts[len(pts) // 2][0], 1),
               "y": round(pts[len(pts) // 2][1], 1)}
        for k in extra:
            row[k] = p.get(k)
        ranges.append(row)

    if src:
        print("gazetteer: %s" % src)
        for f in load_gaz(src, "cities.geojson"):
            p = f["properties"]
            lon, lat = f["geometry"]["coordinates"][:2]
            add_city(slug(p.get("name_modern") or p["name_medieval"]),
                     p["name_medieval"], p.get("name_modern"), p.get("part"),
                     p.get("tier"), p.get("note"), lon, lat,
                     bool(p.get("is_center")))
        for f in load_gaz(src, "seas.geojson"):
            add_point(seas, f["properties"], *f["geometry"]["coordinates"][:2])
        for f in load_gaz(src, "regions.geojson"):
            add_point(regions, f["properties"], *f["geometry"]["coordinates"][:2],
                      extra=("kind",))
        for f in load_gaz(src, "mountains.geojson"):
            g = f["geometry"]
            line = ([g["coordinates"]] if g["type"] == "Point"
                    else rings_of(g)[0])
            add_spine(f["properties"], line, extra=("peak_m",))
    else:
        print("! fatequest-worldmap not found — eastern gazetteer only")

    east_path = os.path.normpath(
        os.path.join(HERE, "..", "assets", "data", "gazetteer-east.json"))
    with open(east_path, encoding="utf-8") as f:
        east = json.load(f)
    for c in east["cities"]:
        add_city(c["id"], c["medieval"], c["modern"], c["part"], c["tier"],
                 c.get("note"), c["lon"], c["lat"])
    for s in east.get("seas", []):
        add_point(seas, s, s["lon"], s["lat"])
    for r in east.get("regions", []):
        add_point(regions, r, r["lon"], r["lat"], extra=("kind",))
    for m in east.get("ranges", []):
        add_spine(m, m["line"], extra=("peak_m",))

    doc = {
        "_generated_by": "scripts/build_worldmap.py — do not hand-edit",
        "_sources": ["Natural Earth 50m (public domain)",
                     "fatequest-worldmap gazetteer (CC0)",
                     "assets/data/gazetteer-east.json (CC0)"],
        "view": {"w": round(VIEW_W), "h": round(VIEW_H)},
        "bbox": BBOX,
        "land": polygon_paths(land, 0.55, 2.5),
        "lakes": polygon_paths(lakes, 0.55, 1.5),
        "rivers": line_paths(rivers, 0.7),
        "ranges": ranges,
        "cities": cities,
        "seas": seas,
        "regions": regions,
    }

    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    print("wrote %s  (%.0f KB)" % (out, os.path.getsize(out) / 1024))
    print("  view %dx%d · land %d · lakes %d · rivers %d · cities %d · "
          "seas %d · regions %d · ranges %d"
          % (doc["view"]["w"], doc["view"]["h"], len(doc["land"]),
             len(doc["lakes"]), len(doc["rivers"]), len(cities), len(seas),
             len(regions), len(ranges)))


if __name__ == "__main__":
    main()
