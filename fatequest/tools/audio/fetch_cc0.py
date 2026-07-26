#!/usr/bin/env python3
"""Fetch CC0 ambient / instrument samples for FateQuest (AUDIO_PLAN.md §7.2).

Sources (in order):
  1. Curated BigSoundBank (CC0) direct OGG URLs — no API key needed
  2. Freesound APIv2 search (CC0 filter) when FREESOUND_API_KEY is set
  3. Optional local cache under tools/audio/_cc0_cache/

Usage:
  tools/audio/.venv/bin/python tools/audio/fetch_cc0.py search rain
  tools/audio/.venv/bin/python tools/audio/fetch_cc0.py download --all-ambient
  tools/audio/.venv/bin/python tools/audio/fetch_cc0.py download --slot wind_sand --id 0595
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CACHE = Path(__file__).resolve().parent / "_cc0_cache"
MANIFEST = CACHE / "SOURCES.json"

UA = "FateQuestAudioBot/1.0 (+https://github.com/local; CC0 asset fetch)"

# BigSoundBank: https://bigsoundbank.com/UPLOAD/ogg/NNNN.ogg  (CC0 / public domain)
# Curated for FateQuest scene beds — verified downloadable 2026-07-26.
BSB_CURATED: dict[str, dict] = {
    "wind_sand": {
        "id": "0595",
        "title": "Wind",
        "url": "https://bigsoundbank.com/UPLOAD/ogg/0595.ogg",
        "license": "CC0",
        "source": "bigsoundbank",
        "page": "https://bigsoundbank.com/wind-s0595.html",
    },
    "rain": {
        "id": "0740",
        "title": "Rain",
        "url": "https://bigsoundbank.com/UPLOAD/ogg/0740.ogg",
        "license": "CC0",
        "source": "bigsoundbank",
        "page": "https://bigsoundbank.com/search?q=rain",
    },
    "fire": {
        "id": "0987",
        "title": "Campfire",
        "url": "https://bigsoundbank.com/UPLOAD/ogg/0987.ogg",
        "license": "CC0",
        "source": "bigsoundbank",
        "page": "https://bigsoundbank.com/search?q=campfire",
    },
    "waves": {
        "id": "0267",
        "title": "Sea waves",
        "url": "https://bigsoundbank.com/UPLOAD/ogg/0267.ogg",
        "license": "CC0",
        "source": "bigsoundbank",
        "page": "https://bigsoundbank.com/search?q=sea+waves",
    },
    "river": {
        "id": "1354",
        "title": "River",
        "url": "https://bigsoundbank.com/UPLOAD/ogg/1354.ogg",
        "license": "CC0",
        "source": "bigsoundbank",
        "page": "https://bigsoundbank.com/search?q=river",
    },
    "horse_hooves": {
        "id": "1854",
        "title": "Horse walking on a path",
        "url": "https://bigsoundbank.com/UPLOAD/ogg/1854.ogg",
        "license": "CC0",
        "source": "bigsoundbank",
        "page": "https://bigsoundbank.com/horse-walking-on-a-path-s1854.html",
    },
    "market_crowd": {
        "id": "2728",
        "title": "Outdoor market 1",
        "url": "https://bigsoundbank.com/UPLOAD/ogg/2728.ogg",
        "license": "CC0",
        "source": "bigsoundbank",
        "page": "https://bigsoundbank.com/outdoor-market-1-s2728.html",
    },
    "dishes": {
        "id": "1193",
        "title": "Cutlery manipulations on plate",
        "url": "https://bigsoundbank.com/UPLOAD/ogg/1193.ogg",
        "license": "CC0",
        "source": "bigsoundbank",
        "page": "https://bigsoundbank.com/cutlery-manipulations-on-plate-s1193.html",
    },
    "footsteps_echo": {
        "id": "0376",
        "title": "Footsteps shoe on parquet",
        "url": "https://bigsoundbank.com/UPLOAD/ogg/0376.ogg",
        "license": "CC0",
        "source": "bigsoundbank",
        "page": "https://bigsoundbank.com/footsteps-shoe-on-parquet-s0376.html",
    },
    "seabirds": {
        "id": "2573",
        "title": "Gulls on the harbor",
        "url": "https://bigsoundbank.com/UPLOAD/ogg/2573.ogg",
        "license": "CC0",
        "source": "bigsoundbank",
        "page": "https://bigsoundbank.com/gulls-on-the-harbor-s2573.html",
    },
    "ropes_mast": {
        "id": "3426",
        "title": "Big rope",
        "url": "https://bigsoundbank.com/UPLOAD/ogg/3426.ogg",
        "license": "CC0",
        "source": "bigsoundbank",
        "page": "https://bigsoundbank.com/big-rope-s3426.html",
    },
    "camel_bells": {
        "id": "0585",
        "title": "Bells of Santa Claus",
        "url": "https://bigsoundbank.com/UPLOAD/ogg/0585.ogg",
        "license": "CC0",
        "source": "bigsoundbank",
        "page": "https://bigsoundbank.com/bells-of-santa-claus-s0585.html",
        "note": "Sleigh/herd-bell colour used as camel-bell bed (secular)",
    },
}

# Instrument one-shots for melody/color composition (CC0 BigSoundBank).
BSB_INSTRUMENTS: dict[str, list[dict]] = {
    "pluck": [
        {"id": "0215", "url": "https://bigsoundbank.com/UPLOAD/ogg/0215.ogg", "title": "Bell"},
    ],
    "flute": [
        {"id": "0595", "url": "https://bigsoundbank.com/UPLOAD/ogg/0595.ogg", "title": "Wind (noise bed)"},
    ],
}


def _http_get(url: str, timeout: float = 60.0) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def bsb_search(query: str, limit: int = 12) -> list[dict]:
    """Scrape BigSoundBank HTML search for CC0 OGG ids."""
    url = "https://bigsoundbank.com/search?q=" + urllib.parse.quote(query)
    html = _http_get(url).decode("utf-8", "replace")
    out: list[dict] = []
    seen: set[str] = set()
    for m in re.finditer(r"/([a-z0-9\-]+)-s(\d{4})\.html", html, re.I):
        slug, sid = m.group(1), m.group(2)
        if sid in seen:
            continue
        seen.add(sid)
        out.append(
            {
                "id": sid,
                "title": slug.replace("-", " "),
                "url": f"https://bigsoundbank.com/UPLOAD/ogg/{sid}.ogg",
                "page": f"https://bigsoundbank.com/{slug}-s{sid}.html",
                "license": "CC0",
                "source": "bigsoundbank",
            }
        )
        if len(out) >= limit:
            break
    if not out:
        for m in re.finditer(r"UPLOAD/ogg/(\d{4})", html):
            sid = m.group(1)
            if sid in seen:
                continue
            seen.add(sid)
            out.append(
                {
                    "id": sid,
                    "title": sid,
                    "url": f"https://bigsoundbank.com/UPLOAD/ogg/{sid}.ogg",
                    "page": f"https://bigsoundbank.com/search?q={sid}",
                    "license": "CC0",
                    "source": "bigsoundbank",
                }
            )
            if len(out) >= limit:
                break
    return out


def freesound_search(query: str, limit: int = 10) -> list[dict]:
    key = os.environ.get("FREESOUND_API_KEY", "").strip()
    if not key:
        return []
    params = urllib.parse.urlencode(
        {
            "query": query,
            "filter": 'license:"Creative Commons 0"',
            "fields": "id,name,previews,license,url,duration",
            "page_size": str(limit),
            "token": key,
        }
    )
    data = json.loads(_http_get(f"https://freesound.org/apiv2/search/text/?{params}"))
    out = []
    for r in data.get("results", []):
        previews = r.get("previews") or {}
        preview = previews.get("preview-hq-ogg") or previews.get("preview-hq-mp3")
        if not preview:
            continue
        out.append(
            {
                "id": str(r["id"]),
                "title": r.get("name", ""),
                "url": preview,
                "page": r.get("url", f"https://freesound.org/s/{r['id']}/"),
                "license": "CC0",
                "source": "freesound",
                "duration": r.get("duration"),
            }
        )
    return out


def download_to(url: str, dest: Path) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    print(f"  GET {url}")
    data = _http_get(url)
    if len(data) < 1000 or not (data.startswith(b"OggS") or data[:3] == b"ID3" or data[:4] == b"RIFF" or data[:4] == b"fLaC"):
        # mp3 without ID3 still ok if large enough
        if len(data) < 8000:
            raise RuntimeError(f"download too small / unexpected format ({len(data)} bytes): {url}")
    dest.write_bytes(data)
    print(f"  → {dest} ({len(data) / 1024:.0f} KB)")
    return dest


def cmd_search(args: argparse.Namespace) -> int:
    q = args.query
    print(f"BigSoundBank search: {q!r}")
    for hit in bsb_search(q, args.limit):
        print(f"  [{hit['id']}] {hit['title']}  {hit['url']}")
    fs = freesound_search(q, args.limit)
    if fs:
        print(f"Freesound CC0 search: {q!r}")
        for hit in fs:
            print(f"  [{hit['id']}] {hit['title']}  {hit['url']}")
    elif not os.environ.get("FREESOUND_API_KEY"):
        print("(set FREESOUND_API_KEY to also search Freesound)")
    return 0


def _record(slot: str, meta: dict, path: Path) -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    man: dict = {}
    if MANIFEST.exists():
        man = json.loads(MANIFEST.read_text(encoding="utf-8"))
    man[slot] = {
        **meta,
        "cached": str(path.relative_to(CACHE)) if path.is_relative_to(CACHE) else str(path),
        "bytes": path.stat().st_size,
        "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    MANIFEST.write_text(json.dumps(man, indent=2) + "\n", encoding="utf-8")


def cmd_download(args: argparse.Namespace) -> int:
    slots: list[tuple[str, dict]] = []
    if args.all_ambient:
        for slot, meta in BSB_CURATED.items():
            slots.append((slot, meta))
    elif args.slot:
        meta = dict(BSB_CURATED.get(args.slot, {}))
        if args.id:
            sid = str(args.id).zfill(4)
            meta = {
                "id": sid,
                "title": args.slot,
                "url": f"https://bigsoundbank.com/UPLOAD/ogg/{sid}.ogg",
                "license": "CC0",
                "source": "bigsoundbank",
                "page": f"https://bigsoundbank.com/search?q={sid}",
            }
        if args.url:
            meta["url"] = args.url
        if not meta.get("url"):
            print(f"unknown slot {args.slot!r}; pass --id or --url", file=sys.stderr)
            return 1
        slots.append((args.slot, meta))
    else:
        print("pass --all-ambient or --slot NAME", file=sys.stderr)
        return 1

    ok = 0
    for slot, meta in slots:
        ext = ".ogg"
        url = meta["url"]
        if url.endswith(".mp3"):
            ext = ".mp3"
        elif url.endswith(".wav"):
            ext = ".wav"
        dest = CACHE / "raw" / f"{slot}{ext}"
        try:
            download_to(url, dest)
            _record(slot, meta, dest)
            ok += 1
        except Exception as e:
            print(f"  FAIL {slot}: {e}", file=sys.stderr)
            # try alternate ids from search
            if args.fallback_search:
                try:
                    hits = bsb_search(slot.replace("_", " "), 8)
                    for hit in hits:
                        try:
                            download_to(hit["url"], dest)
                            _record(slot, hit, dest)
                            ok += 1
                            print(f"  recovered via search → {hit['id']} {hit['title']}")
                            break
                        except Exception:
                            continue
                    else:
                        print(f"  no fallback for {slot}", file=sys.stderr)
                except Exception as e2:
                    print(f"  fallback search failed: {e2}", file=sys.stderr)
        time.sleep(0.35)
    print(f"\nDownloaded {ok}/{len(slots)} → {CACHE}")
    return 0 if ok else 1


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    sub = ap.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("search", help="Search BigSoundBank (+ Freesound if keyed)")
    s.add_argument("query")
    s.add_argument("--limit", type=int, default=12)
    s.set_defaults(func=cmd_search)

    d = sub.add_parser("download", help="Download curated / selected CC0 samples")
    d.add_argument("--all-ambient", action="store_true")
    d.add_argument("--slot", default=None, help="ambient slot name, e.g. wind_sand")
    d.add_argument("--id", default=None, help="BigSoundBank numeric id")
    d.add_argument("--url", default=None, help="direct sample URL")
    d.add_argument("--fallback-search", action="store_true", default=True)
    d.set_defaults(func=cmd_download)

    args = ap.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
