#!/usr/bin/env python3
"""
fix_region_terms.py — Apply region-accurate terminology across i18n + city data.

Fixes:
  C) Sinocentric terms in Bazi (Baldacum) / Tarot (Tauris) divination results
  D) "tithe" / "什一税" → tamghā; bug "十取其十" → "十取其一"
  E) Balc shrine faith islam → folk (Magi fire-temple; zoroastrian not in Faith enum)
"""

from __future__ import annotations

import json
import re
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
I18N_EN = ROOT / "content/i18n/en.json"
I18N_ZH = ROOT / "content/i18n/zh.json"
BALC_CITY = ROOT / "content/tables/cities/central_asia.json"


def load(path: Path) -> OrderedDict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f, object_pairs_hook=OrderedDict)


def save(path: Path, data) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"  ✓ wrote {path.relative_to(ROOT)}")


# ── Category C: divination results (West Asia mentors) ──────────────────

# Bazi taught in Baldacum (Baghdad) — Perso-Islamic terms
BAZI_ZH = {
    "div.bazi.result.00": "日主偏刚，宜选稳妥 rāh-i shāhī（御道），勿赌抄近。",
    "div.bazi.result.03": "金气显，议价宜硬，但勿开罪 tamghā-chī（税吏）。",
    "div.bazi.result.14": "财星显，bāzār 可久留，yām（驿）勿久留。",
    "div.bazi.result.15": "官杀重，tamghā-gāh（税卡）前宜备足文书。",
    "div.bazi.result.16": "印星护，宜投宿有 masjid（清真寺）的城。",
    # 驿马 is a Chinese astrology technical term (star name) — keep with gloss
    "div.bazi.result.28": "驿马星（迁徙星）动，迁徙频繁之年宜减货载。",
}

# Tarot taught in Tauris (Tabriz) — Perso-Ilkhanate terms
TAROT_ZH = {
    "div.tarot.result.01": "阻力牌提示：抄近路代价高于 rāh-i shāhī（御道）。",
    "div.tarot.result.03": "资源牌在右：东向 yām（驿）更可靠。",
    "div.tarot.result.12": "正位通行：tamghā-gāh（税卡）问询可如实作答。",
    "div.tarot.result.21": "金钱流提示：支出在 tamghā（商税），不在脚力。",
}


def fix_divination_zh(zh: OrderedDict) -> int:
    n = 0
    for table in (BAZI_ZH, TAROT_ZH):
        for k, v in table.items():
            if k in zh and zh[k] != v:
                zh[k] = v
                n += 1
                print(f"    {k}")
            elif k not in zh:
                print(f"  ⚠ missing key {k}")
            else:
                zh[k] = v  # idempotent refresh
                n += 1
    return n


# ── Category D: tithe → tamghā ──────────────────────────────────────────

def fix_tithe(en: OrderedDict, zh: OrderedDict) -> int:
    n = 0

    # EN replacements
    en_fixes = {
        "codex.cx-zayton-tithe.name": "The Kaan's Tamghā",
    }
    for k, v in en_fixes.items():
        if en.get(k) != v:
            en[k] = v
            n += 1
            print(f"    EN {k}")

    # EN body: replace "tithe" / "Tithe" with tamghā wording
    for k in list(en.keys()):
        if "zayton" not in k and "cx-zayton-tithe" not in k:
            continue
        old = en[k]
        new = old
        # Prefer precise phrase replacements
        new = new.replace("takes tithe of", "takes the tamghā on")
        new = new.replace("takes a tithe of", "takes a tamghā on")
        new = new.replace("a tithe of", "a tamghā on")
        new = new.replace("the tithe", "the tamghā")
        new = new.replace("Tithe", "Tamghā")
        new = new.replace("tithe", "tamghā")
        if new != old:
            en[k] = new
            n += 1
            print(f"    EN rewrite {k}")

    # ZH replacements
    zh_name = "大汗的 tamghā（商税）"
    if zh.get("codex.cx-zayton-tithe.name") != zh_name:
        zh["codex.cx-zayton-tithe.name"] = zh_name
        n += 1
        print("    ZH codex.cx-zayton-tithe.name")

    for k in list(zh.keys()):
        if "zayton" not in k and "cx-zayton-tithe" not in k:
            continue
        old = zh[k]
        new = old
        # Fix the known 100% tax bug first
        new = new.replace("十取其十", "十取其一")
        new = new.replace("什一税", "tamghā（商税）")
        if new != old:
            zh[k] = new
            n += 1
            print(f"    ZH rewrite {k}")

    return n


# ── Category E: Balc shrine faith ───────────────────────────────────────

def fix_balc_shrine() -> None:
    """Magi fire-temple is not islam; Faith enum has no zoroastrian → use folk."""
    data = json.loads(BALC_CITY.read_text(encoding="utf-8"))
    changed = False
    for rec in data["records"]:
        if rec["id"] != "balc":
            continue
        shrine = rec.get("shrine")
        if shrine and shrine.get("faith") == "islam":
            shrine["faith"] = "folk"
            changed = True
            print("    balc.shrine.faith: islam → folk (Magi fire-temple)")
        # Ensure folk is listed among city faiths
        faiths = rec.get("faiths", [])
        if "folk" not in faiths:
            faiths.append("folk")
            rec["faiths"] = faiths
            changed = True
            print("    balc.faiths: added folk")
    if changed:
        BALC_CITY.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"  ✓ wrote {BALC_CITY.relative_to(ROOT)}")
    else:
        print("    balc shrine already folk (or missing)")


def main():
    en = load(I18N_EN)
    zh = load(I18N_ZH)

    print("Category C — divination terminology (West Asia)...")
    n_c = fix_divination_zh(zh)
    print(f"  {n_c} keys updated")

    print("Category D — tithe → tamghā...")
    n_d = fix_tithe(en, zh)
    print(f"  {n_d} keys updated")

    print("Category E — Balc shrine faith...")
    fix_balc_shrine()

    save(I18N_EN, OrderedDict(sorted(en.items())))
    save(I18N_ZH, OrderedDict(sorted(zh.items())))
    print("Done.")


if __name__ == "__main__":
    main()
