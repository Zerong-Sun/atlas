#!/usr/bin/env python3
"""Build the portrait label database and historical/cultural review queue.

This is a read-only audit of authored data. It does not approve a culture or
historical claim; it records the exact local key/file that still needs a
human source check. The generated CSVs are evidence artifacts and can be
rebuilt after any content or portrait change.
"""

from __future__ import annotations

import csv
import hashlib
import json
import re
from pathlib import Path
from typing import Any, Dict, Iterable, List, Mapping, Sequence


ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / "assets" / "art"
MAP_PATH = ROOT / "game" / "map" / "portrait_art_map.json"
TAGS_PATH = ART / "PORTRAIT_TAGS.json"
RETAINERS_PATH = ROOT / "content" / "tables" / "retainers.json"
GOODS_PATH = ROOT / "content" / "tables" / "goods.json"
ZH_PATH = ROOT / "content" / "i18n" / "zh.json"
EN_PATH = ROOT / "content" / "i18n" / "en.json"
EVENT_DIR = ROOT / "content" / "tables" / "events"
SOURCE_REGISTRY_PATH = ROOT / "tools" / "art" / "historical_source_registry.json"
OUT_DIR = ROOT / "docs" / "library_audit"
PORTRAIT_CSV = OUT_DIR / "portrait_review_inventory.csv"
PORTRAIT_DB = OUT_DIR / "portrait_review_database.json"
CULTURE_CSV = OUT_DIR / "cultural_review_queue.csv"
CULTURE_SUMMARY = OUT_DIR / "cultural_review_summary.json"

REQUIRED_TAGS = {
    "gender",
    "culture_background",
    "age_range",
    "attire_props",
    "source_basis",
    "review_status",
}
CULTURES = {"latin", "islamic", "east_asia", "steppe", "indian_ocean", "unknown"}


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    if not path.exists():
        return ""
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def json_text(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def portrait_refs(mapping: Mapping[str, Any]) -> Dict[str, List[str]]:
    refs: Dict[str, List[str]] = {}

    def add(stem: str, ref: str) -> None:
        if stem:
            refs.setdefault(stem, []).append(ref)

    for stem in mapping.get("portraits", {}):
        add(str(stem), f"portraits:{stem}")
    for section in ("jobs", "venues"):
        for culture, roles in mapping.get(section, {}).items():
            for role, stem in roles.items():
                add(str(stem), f"{section}:{culture}:{role}")
    for section in ("events", "characters"):
        for record_id, binding in mapping.get(section, {}).items():
            if isinstance(binding, dict):
                add(str(binding.get("portrait", "")), f"{section}:{record_id}")
    for method, stem in mapping.get("mentors", {}).items():
        add(str(stem), f"mentors:{method}")
    return refs


def portrait_path(stem: str) -> Path:
    return ART / f"{stem}.webp"


def culture_from_stem(stem: str) -> str:
    for suffix, culture in (("-chr", "latin"), ("-isl", "islamic"), ("-con", "east_asia"), ("-mazu", "indian_ocean")):
        if stem.endswith(suffix):
            return culture
    if stem == "mentor-bazi":
        return "east_asia"
    return "unknown"


def validate_portraits(mapping: Mapping[str, Any], tags: Mapping[str, Any]) -> tuple[List[Dict[str, Any]], List[str]]:
    refs = portrait_refs(mapping)
    tag_rows = tags.get("portraits", {})
    errors: List[str] = []
    rows: List[Dict[str, Any]] = []

    for stem in sorted(refs):
        tag = tag_rows.get(stem)
        if not isinstance(tag, dict):
            errors.append(f"missing label: {stem}")
            tag = {}
        missing = sorted(REQUIRED_TAGS - set(tag))
        if missing:
            errors.append(f"{stem}: missing fields {','.join(missing)}")
        culture = str(tag.get("culture_background", "unknown"))
        if culture not in CULTURES:
            errors.append(f"{stem}: invalid culture_background={culture}")
        expected = culture_from_stem(stem)
        if expected != "unknown" and culture not in {expected, "unknown"}:
            errors.append(f"{stem}: filename set={expected} disagrees with label={culture}")
        path = portrait_path(stem)
        if not path.exists():
            errors.append(f"missing image: {path.relative_to(ROOT)}")
        rows.append({
            "character_id": stem,
            "image_stem": stem,
            "image_path": str(path.relative_to(ROOT)),
            "gender": str(tag.get("gender", "unknown")),
            "culture_background": culture,
            "age_range": str(tag.get("age_range", "unknown")),
            "attire_props": str(tag.get("attire_props", "")),
            "source_basis": str(tag.get("source_basis", "")),
            "applicable_events": ";".join(sorted(refs[stem])),
            "sha256": sha256(path),
            "review_status": str(tag.get("review_status", "unlabeled")),
            "issue_codes": "" if not missing else "MISSING_TAG_FIELD",
        })

    return rows, errors


def event_records() -> Dict[str, List[str]]:
    refs: Dict[str, List[str]] = {}

    def visit(value: Any, source: str) -> None:
        if isinstance(value, dict):
            record_id = value.get("id")
            lore = value.get("lore")
            if record_id and isinstance(lore, dict):
                ref = lore.get("ref", {})
                if isinstance(ref, dict) and ref.get("book"):
                    label = f"{ref.get('book')}:{ref.get('chapterId', ref.get('passageId', ''))}"
                    refs.setdefault(str(record_id), []).append(label)
                elif lore.get("origin"):
                    refs.setdefault(str(record_id), []).append(str(lore.get("origin")))
            for child in value.values():
                visit(child, source)
        elif isinstance(value, list):
            for child in value:
                visit(child, source)

    for path in sorted(EVENT_DIR.glob("*.json")):
        visit(load_json(path), str(path.relative_to(ROOT)))
    return refs


def record_ref(event_id: str, refs: Mapping[str, Sequence[str]]) -> str:
    values = sorted(set(refs.get(event_id, [])))
    return ";".join(values) if values else "source_needed"


def text_excerpt(value: str, limit: int = 180) -> str:
    return " ".join(str(value).split())[:limit]


def source_for_text(category: str, subject_id: str, text: str,
                    registry: Mapping[str, Mapping[str, Any]]) -> Dict[str, str]:
    """Select a source lead without claiming that it proves the line.

    The queue intentionally distinguishes a URL candidate from approval. The
    matcher is deterministic and conservative: game-generated divination and
    UI copy are explicitly marked as authored text instead of receiving a
    misleading historical citation.
    """
    haystack = f"{subject_id} {text}".lower()
    no_external_prefixes = ("div.", "lesson.", "annex.")
    if subject_id.lower().startswith(no_external_prefixes):
        return {
            "source_id": "none_game_authored",
            "source_status": "no_external_source",
            "source_resolution": "明确无来源",
            "source_candidate_reason": "游戏机制、练习或结果文案；不把连接性演绎伪装成史料。",
        }

    source_id = ""
    reason = ""
    if any(token in haystack for token in ("mazu", "天妃", "妈祖", "海神娘娘", "筊杯", "jiaobei")):
        source_id = "unesco_mazu"
        reason = "同一行提及妈祖/天妃庙、香火、供献或筊杯；来源只作为社区仪式核对入口。"
    elif any(token in haystack for token in ("ovoo", "敖包", "mongol", "蒙古", "长生天")):
        source_id = "unesco_mongolian_sacred_sites"
        reason = "同一行提及敖包或蒙古圣地祭祀；需按时代和具体社区复核。"
    elif any(token in haystack for token in ("zoroastr", "祆教", "magi", "不灭之火", "祭司守护一焰", "fire temple")):
        source_id = "iranica_zoroastrian_rituals"
        reason = "同一行提及祆教、祭司或圣火；需区分旅行者叙述与宗教内部术语。"
    elif any(token in haystack for token in ("masjid", "mosque", "清真寺", "聚礼", "呼图白", "礼拜mah")):
        source_id = "met_birth_of_islam"
        reason = "同一行提及清真寺/聚礼/礼拜；用于核对建筑与仪式术语，不证明具体城市细节。"
    elif any(token in haystack for token in ("buddhist", "佛寺", "佛前", "添香", "incense", "香炉")):
        source_id = "smithsonian_buddhist_incense"
        reason = "同一行提及佛寺、添香或香炉；用于核对礼仪语境，不证明玩家可见事件必然发生。"
    elif any(token in haystack for token in ("guqin", "古琴")):
        source_id = "unesco_guqin_music"
        reason = "同一行明确提及古琴；以 UNESCO 元素页面核对乐器与社会语境。"
    elif any(token in haystack for token in ("nanyin", "南音", "pipa", "琵琶", "织女之歌", "织机")):
        source_id = "unesco_nanyin"
        reason = "同一行提及琵琶、歌谣或闽南/刺桐语境；以南音页面作候选比对，不将其等同。"
    elif any(token in haystack for token in ("shashmaqom", "maqom", "maqam", "撒马尔罕", "samarkand", "bukhara", "bochara")):
        source_id = "unesco_shashmaqom"
        reason = "同一行提及中亚城市或 maqom 音乐；需复核具体年代与演出传统。"
    elif any(token in haystack for token in ("tahteeb", "stick game", "棍", "长棍", "埃及") ):
        source_id = "unesco_tahteeb"
        reason = "同一行提及埃及棍术/公共表演；仅在名称和实践相符时采用。"
    elif any(token in haystack for token in ("battuta", "ibn-battuta", "朝觐者", "pilgrim", "麦加", "rihla")):
        source_id = "loc_ibn_battuta_rihla"
        reason = "同一行关联伊本·白图泰或朝觐旅程；以数字原典作逐句核对入口。"
    elif any(token in haystack for token in ("marco", "rubruck", "conti", "康蒂", "马可波罗", "景教", "nestorian")):
        source_id = "uw_silkroad_historical_texts"
        reason = "同一行关联中世纪旅行记、景教或商路叙述；以学术史料索引定位具体版本。"
    elif subject_id.lower().startswith(("codex.", "book.", "ev.")):
        source_id = "uw_silkroad_historical_texts"
        reason = "事件/见闻键来自中世纪旅行记改写区；以学术史料索引定位原始旅行文本，再逐句核对改写。"
    elif category == "dance_music":
        source_id = "unesco_ich_music_dance_lists"
        reason = "舞蹈/音乐关键词命中，但未能安全归入具体传统；只提供官方名录作为专家检索入口。"
    elif category == "religion_ritual":
        source_id = "unesco_ich_craftsmanship"
        reason = "礼仪关键词命中但未能安全归入具体传统；只提供文化传承总览作为专家检索入口。"

    if not source_id or source_id not in registry:
        return {
            "source_id": "none_unresolved",
            "source_status": "no_external_source",
            "source_resolution": "明确无来源",
            "source_candidate_reason": "当前本地资料不足以选择不误导的外部来源；必须由专家补源后再审。",
        }
    source = registry[source_id]
    return {
        "source_id": source_id,
        "source_url": str(source["url"]),
        "source_title": str(source["title"]),
        "source_publisher": str(source.get("publisher", "")),
        "source_accessed_at": str(source["accessed_at"]),
        "source_status": "candidate_needs_expert",
        "source_resolution": "待专家",
        "source_candidate_reason": reason,
    }


def add_queue(rows: List[Dict[str, Any]], *, category: str, subject_id: str, locale_key: str,
              evidence_paths: str, source_basis: str, source_status: str,
              risk: str, notes: str, text: str = "", source_requested: bool = False,
              source_meta: Mapping[str, str] | None = None) -> None:
    source_meta = dict(source_meta or {})
    rows.append({
        "queue_id": f"HCR-{len(rows) + 1:04d}",
        "category": category,
        "subject_id": subject_id,
        "locale_key": locale_key,
        "evidence_paths": evidence_paths,
        "source_basis": source_basis,
        "source_status": source_status,
        "source_requested": "true" if source_requested else "false",
        "source_resolution": source_meta.get("source_resolution", "待专家"),
        "source_id": source_meta.get("source_id", ""),
        "source_url": source_meta.get("source_url", ""),
        "source_title": source_meta.get("source_title", ""),
        "source_publisher": source_meta.get("source_publisher", ""),
        "source_accessed_at": source_meta.get("source_accessed_at", ""),
        "source_candidate_reason": source_meta.get("source_candidate_reason", ""),
        "review_status": "queued",
        "risk": risk,
        "reviewer": "",
        "reviewed_at": "",
        "text_excerpt": text_excerpt(text),
        "notes": notes,
    })


def build_cultural_queue(registry: Mapping[str, Mapping[str, Any]]) -> List[Dict[str, Any]]:
    zh = load_json(ZH_PATH)
    en = load_json(EN_PATH)
    refs = event_records()
    rows: List[Dict[str, Any]] = []

    # Every city entry is queued, even if it has a source ref. The ref makes a
    # human review reproducible; it does not mean the prose was approved.
    city_keys = sorted(k for k in zh if re.fullmatch(r"ev\.[^.]+\.entry\.body", k))
    for key in city_keys:
        city_id = key.split(".")[1]
        source_parts: List[str] = []
        for event_id in (f"ev-{city_id}-entry", f"ev-{city_id}", city_id):
            source_parts.extend(refs.get(event_id, []))
        source = ";".join(sorted(set(source_parts))) if source_parts else "source_needed"
        add_queue(rows, category="city", subject_id=city_id, locale_key=key,
                  evidence_paths=f"content/i18n/zh.json:{key};content/i18n/en.json:{key}",
                  source_basis=source, source_status="attached_local_lore" if source != "source_needed" else "local_record_only",
                  risk="high", notes="核对地名、时代、政权、建筑、物产与入城行动；把一手引文、译者转述和游戏演绎分开。",
                  text=f"ZH: {zh.get(key, '')} EN: {en.get(key, '')}",
                  source_meta={
                      "source_id": "local_lore_ref" if source != "source_needed" else "none_unresolved",
                      "source_resolution": "已附来源" if source != "source_needed" else "待专家",
                      "source_title": source if source != "source_needed" else "",
                      "source_candidate_reason": "本地事件已有书名/章节锚点；仍需编辑核对原文与改写范围。" if source != "source_needed" else "城市事件没有本地 lore 锚点。",
                  })

    # Every authored retainer gets a queue row; missing gender is a data gap,
    # not permission to infer a portrait or identity.
    retainers = load_json(RETAINERS_PATH).get("records", [])
    for rec in retainers:
        rid = str(rec.get("id", ""))
        origin = rec.get("origin", {}) if isinstance(rec.get("origin"), dict) else {}
        add_queue(rows, category="person", subject_id=rid,
                  locale_key=f"retainer.{rid}.name",
                  evidence_paths=f"content/tables/retainers.json:{rid};content/i18n/zh.json:retainer.{rid}.*",
                  source_basis="content/tables/retainers.json: authored character record",
                  source_status="local_record_only", risk="high",
                  notes=f"核对姓名、性别字段、年龄/年龄段、出生地、语言、服饰和职业；culture={origin.get('culture', 'unknown')}。",
                  text=rid, source_meta={
                      "source_id": "none_unresolved",
                      "source_resolution": "待专家",
                      "source_candidate_reason": "角色为游戏原创记录；需要内容编辑决定是否补历史人物/族群来源。",
                  })

    # Goods are all queued because a market description can silently turn a
    # source location into a universal origin claim.
    for rec in load_json(GOODS_PATH).get("records", []):
        gid = str(rec.get("id", ""))
        name_key = str(rec.get("name", f"good.{gid}.name"))
        desc_key = f"good.{gid}.desc"
        add_queue(rows, category="good", subject_id=gid, locale_key=desc_key,
                  evidence_paths=f"content/tables/goods.json:{gid};content/i18n/zh.json:{desc_key};content/i18n/en.json:{desc_key}",
                  source_basis="content/tables/goods.json: origin/base/hot fields",
                  source_status="local_record_only", risk="medium",
                  notes=f"核对产地、工艺、年代和市场价格叙述；origin={json_text(rec.get('origin', []))}。",
                  text=f"{zh.get(name_key, '')}: {zh.get(desc_key, '')} {en.get(desc_key, '')}", source_meta={
                      "source_id": "none_unresolved",
                      "source_resolution": "待专家",
                      "source_candidate_reason": "商品记录已有本地产地字段；需要逐项工艺/年代来源，不能以泛商品数据库替代。",
                  })

    dance_pattern = re.compile(r"dance|dancer|dancing|music|musician|pipa|guqin|歌舞|舞蹈|乐师|琵琶|古琴|歌唱|歌")
    ritual_pattern = re.compile(r"清真寺|礼拜|聚礼|呼图白|教堂|神庙|佛寺|天妃|敖包|献礼|丧礼|婚礼|朝觐|masjid|mandir|mosque|church|temple|shrine|prayer|worship|ritual|offering|funeral|marriage|pilgrim")
    # Keep exact keys and excerpts so an editor can approve or rewrite one
    # line without searching a translated paragraph by eye.
    for key in sorted(set(zh) | set(en)):
        text = f"{zh.get(key, '')} {en.get(key, '')}"
        category = ""
        risk = "medium"
        notes = ""
        if dance_pattern.search(text):
            category = "dance_music"
            risk = "high"
            notes = "核对舞种/乐器名称、时代和地域；避免把现代类别或泛化的异域表演写成当地事实。"
        elif ritual_pattern.search(text):
            category = "religion_ritual"
            risk = "high"
            notes = "核对礼仪名称、参与者、场所和叙述语气；区分玩家观察、当地说法与史料事实，避免把信仰群体标签化。"
        if category:
            add_queue(rows, category=category, subject_id=key, locale_key=key,
                      evidence_paths=f"content/i18n/zh.json:{key};content/i18n/en.json:{key}",
                      source_basis="local bilingual text; source ref must be attached before approval",
                      source_status="source_needed", risk=risk, notes=notes, text=text)
            rows[-1].update(source_requested="true", source_meta=source_for_text(category, key, text, registry))
            meta = rows[-1].pop("source_meta")
            rows[-1].update(meta)

    return rows


def write_csv(path: Path, rows: Sequence[Mapping[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fields = list(rows[0]) if rows else []
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    mapping = load_json(MAP_PATH)
    tags = load_json(TAGS_PATH)
    registry_doc = load_json(SOURCE_REGISTRY_PATH)
    registry = {str(item["id"]): item for item in registry_doc.get("sources", [])}
    portrait_rows, errors = validate_portraits(mapping, tags)
    queue_rows = build_cultural_queue(registry)

    source_errors: List[str] = []
    valid_resolutions = {"已附来源", "明确无来源", "待专家"}
    for row in queue_rows:
        if row["source_resolution"] not in valid_resolutions:
            source_errors.append(f"{row['queue_id']}: invalid source_resolution={row['source_resolution']}")
        if row["source_status"] == "candidate_needs_expert":
            if not row["source_url"] or not row["source_title"] or not row["source_accessed_at"]:
                source_errors.append(f"{row['queue_id']}: candidate source missing url/title/accessed_at")
            if row["source_id"] not in registry:
                source_errors.append(f"{row['queue_id']}: unknown source_id={row['source_id']}")
        if row["source_status"] == "no_external_source" and row["source_url"]:
            source_errors.append(f"{row['queue_id']}: no_external_source must not carry a URL")

    write_csv(PORTRAIT_CSV, portrait_rows)
    write_csv(CULTURE_CSV, queue_rows)
    summary = {
        "portrait_rows": len(portrait_rows),
        "portrait_errors": errors,
        "portrait_missing_sha256": [r["image_stem"] for r in portrait_rows if not r["sha256"]],
        "portrait_validation_errors": errors,
        "cultural_rows": len(queue_rows),
        "cultural_by_category": {category: sum(1 for r in queue_rows if r["category"] == category)
                                 for category in sorted({r["category"] for r in queue_rows})},
        "queued_rows": len(queue_rows),
        "source_requested_rows": sum(1 for r in queue_rows if r["source_requested"] == "true"),
        "source_resolution": {resolution: sum(1 for r in queue_rows if r["source_resolution"] == resolution)
                              for resolution in sorted({r["source_resolution"] for r in queue_rows})},
        "source_candidate_rows_with_url": sum(1 for r in queue_rows if r["source_status"] == "candidate_needs_expert" and r["source_url"]),
        "source_validation_errors": source_errors,
        "generated_from": [str(p.relative_to(ROOT)) for p in [MAP_PATH, TAGS_PATH, RETAINERS_PATH, GOODS_PATH, ZH_PATH, EN_PATH, SOURCE_REGISTRY_PATH]],
    }
    PORTRAIT_DB.write_text(json.dumps({"version": 1, "rows": portrait_rows, "validation_errors": errors}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CULTURE_SUMMARY.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 1 if errors or source_errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
