#!/usr/bin/env python3
"""Build 40 road events from Marco Polo stories.

Selects from 98 stories classified into 5 categories per
STORY_REQUIREMENTS.md §4:
  - desert/pass dangers (10)
  - caravan encounters (8)
  - court/official (8)
  - legend/wonders (8)
  - religious encounters (6)

Each event gets a 150-250 word narrative Body, 2-3 choices with game
effects, and proper lore provenance. One event (desert-voices) already
has full content and is kept.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EN_PATH = ROOT / "content" / "i18n" / "en.json"
ROAD_PATH = ROOT / "content" / "tables" / "events" / "road.json"
LORE_PATH = ROOT / "assets" / "books" / "marco-polo-lore.json"

I18N = json.loads(EN_PATH.read_text(encoding="utf-8"))

# ─ load stories ─────────────────────────────────────────────────────────
STORIES = json.loads(LORE_PATH.read_text(encoding="utf-8"))["stories"]

def strip(body: str) -> str:
    body = re.sub(r"\s+", " ", body).strip()
    body = re.sub(r"\{[^}]+\}", "", body)
    return body

# ─ category classifier ──────────────────────────────────────────────────
def classify(story: dict) -> str:
    t = (story.get("title", "") + " " + story.get("body", "")).lower()
    if any(k in t for k in ("desert", "sand", "wind", "drought", "pass",
                              "mountain", "wild beast", "serpent", "snake",
                              "robbed", "robber", "bandit", "danger", "peril",
                              "blizzard", "storm", "avalanche", "snow",
                              "starved", "froze", "dead ", "ghost",
                              "wild ass", "lion ", "tiger", "leopard")):
        return "desert"
    if any(k in t for k in ("caravan", "merchant", "trade", "market",
                              "silver", "gold ", "bought", "sold", "profit",
                              "goods", "camel ", "load ", "pack ")):
        return "caravan"
    if any(k in t for k in ("kaan", "khan ", "court", "palace", "throne",
                             "embassy", "envoy", "tablet", "paiza",
                             "tribute", "tax ", "customs", "officer",
                             "governor", "messenger")):
        return "court"
    if any(k in t for k in ("marvel", "miracle", "wonder", "strange",
                             "magic", "sorcerer", "enchant", "golden",
                             "paradise", "fountain", "burning",
                             "prester", "old man of the mountain", "assassin")):
        return "wonder"
    if any(k in t for k in ("god", "lord ", "christ", "church", "bishop",
                             "priest", "mosque", "pray", "faith",
                             "saint", "monastery", "idol", "temple",
                             "worship", "pilgrim", "holy", "shrine",
                             "nestor", "saracen", "cross", "bapt")):
        return "religious"
    return "wonder"  # default

categories: dict[str, list] = {"desert": [], "caravan": [], "court": [], "wonder": [], "religious": []}
for s in STORIES:
    categories[classify(s)].append(s)

print("Classified stories:")
for cat in categories:
    print(f"  {cat}: {len(categories[cat])}")

# ─ select top N per category by word count ──────────────────────────────
TARGETS = {"desert": 10, "caravan": 8, "court": 8, "wonder": 8, "religious": 6}
selected: list[dict] = []
for cat, n in TARGETS.items():
    pool = sorted(categories[cat], key=lambda s: len(strip(s.get("body", "")).split()), reverse=True)
    picked = pool[:n]
    selected.extend(picked)
    print(f"  {cat}: picked {len(picked)}/{len(pool)}")

# ─ compact stories into road event body ─────────────────────────────────
def story_to_road_body(story: dict) -> str:
    body = strip(story["body"])
    words = body.split()
    if len(words) > 220:
        body = " ".join(words[:220])
        for punct in (". ", "; ", "! ", "? "):
            idx = body.rfind(punct)
            if idx > 100:
                body = body[: idx + 1]
                body = re.sub(r",?\s*(And|But|Such).*$", ".", body)
                break
    body = re.sub(r"\s*\([^)]*\)", "", body)
    if not body.rstrip().endswith((".", "!", "?", '"')):
        body += "."
    return body

def make_event_id(idx: int) -> str:
    return f"ev-road-{idx:02d}"

def make_when(story: dict) -> dict:
    band = story.get("band", "")
    region_map = {
        "steppe": "steppe", "central_asia": "central_asia",
        "west_asia": "west_asia", "china": "china",
        "india": "india", "maritime_asia": "maritime_asia",
        "europe": "west_asia",
    }
    return {"bands": [region_map.get(band, "central_asia")]}

def make_scene(story: dict, cat: str) -> dict:
    band = story.get("band", "central_asia")
    region_map = {"steppe": "steppe", "central_asia": "central_asia",
                  "west_asia": "west_asia", "china": "china",
                  "india": "india", "maritime_asia": "maritime_asia",
                  "europe": "west_asia"}
    region = region_map.get(band, "central_asia")
    bg_map = {
        "desert": "desert-night", "caravan": "caravan-city",
        "court": "palace-gate", "wonder": "oasis-town",
        "religious": "temple-interior",
    }
    return {"bg": bg_map.get(cat, "caravan-city"), "region": region}

def make_choices(eid: str, cat: str) -> list[dict]:
    prefix = eid.replace("-", ".")
    if cat == "desert":
        bases = [
            ("press_on", [{"op": "days", "value": 2, "reason": "faced-the-danger"}]),
            ("turn_aside", [{"op": "days", "value": 5, "reason": "took-safer-road"}, {"op": "coins", "value": -40, "reason": "paid-for-detour"}]),
        ]
    elif cat == "caravan":
        bases = [
            ("join_caravan", [{"op": "coins", "value": -80, "reason": "paid-caravan-fee"}, {"op": "days", "value": -3, "reason": "travelled-faster"}]),
            ("go_alone", [{"op": "days", "value": 2, "reason": "waited-for-deal"}, {"op": "coins", "value": 30, "reason": "sold-at-crossroads"}]),
        ]
    elif cat == "court":
        bases = [
            ("present_credentials", [{"op": "reputation", "value": 1, "reason": "gained-court-favour"}]),
            ("observe", [{"op": "codex", "value": f"cx-road-story-{eid}", "reason": "recorded-ceremony"}]),
        ]
    elif cat == "wonder":
        bases = [
            ("investigate", [{"op": "codex", "value": f"cx-road-story-{eid}", "reason": "examined-marvel"}, {"op": "fate", "id": "travel", "value": 1, "reason": "witnessed-wonder"}]),
            ("keep_distance", [{"op": "coins", "value": 20, "reason": "sold-tale-to-merchants"}]),
        ]
    else:
        bases = [
            ("accept_blessing", [{"op": "fate", "id": "travel", "value": 1, "reason": "received-blessing"}, {"op": "coins", "value": -20, "reason": "left-offering"}]),
            ("decline", [{"op": "codex", "value": f"cx-road-story-{eid}", "reason": "observed-rite"}]),
        ]
    choices = []
    for label_suffix, effects in bases[:3]:
        choices.append({
            "label": f"{prefix}.choice.{label_suffix}",
            "effects": effects,
        })
    return choices

def main():
    road = {"contentVersion": 1, "table": "events", "records": []}
    existing = json.loads(ROAD_PATH.read_text(encoding="utf-8"))["records"]
    road["records"].extend(existing)
    added = 0
    for i, story in enumerate(selected):
        cat = classify(story)
        eid = make_event_id(i)
        prefix = eid.replace("-", ".")
        body_text = story_to_road_body(story)
        if len(body_text.split()) < 40:
            continue
        title = story["title"]
        title = re.sub(r"^How (the|The) ", "", title)
        title = re.sub(r"^Of (the|The) ", "", title)
        title = re.sub(r", and.*", "", title)
        title = re.sub(r"^Concerning (the|The) ", "", title)
        I18N[f"{prefix}.title"] = title.strip()
        I18N[f"{prefix}.body"] = body_text
        choices = make_choices(eid, cat)
        for ch in choices:
            I18N[ch["label"]] = ch["label"].split(".")[-1].replace("_", " ").title()
        event = {
            "id": eid, "kind": "road",
            "title": f"{prefix}.title",
            "when": make_when(story),
            "scene": make_scene(story, cat),
            "body": f"{prefix}.body", "once": False,
            "choices": choices,
            "lore": {
                "storyId": story["id"], "origin": "source",
                "ref": {"book": "marco-polo", "chapterId": story.get("source", {}).get("chapterTitle", "")},
            },
        }
        road["records"].append(event)
        added += 1
    EN_PATH.write_text(json.dumps(I18N, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    ROAD_PATH.write_text(json.dumps(road, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    ws = [len(I18N.get(r.get("body", ""), "").split()) for r in road["records"]]
    print(f"\nGenerated {added} road events ({len(road['records'])} total)")
    print(f"Body words: min={min(ws)} max={max(ws)} avg={sum(ws)//len(ws)}")

if __name__ == "__main__":
    main()
