#!/usr/bin/env python3
"""Scan all ChatGPT tabs, download new images, split into missing art files."""

from __future__ import annotations

import asyncio
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

from batch_art_utils import (
    ART_DIR,
    SHEETS_DIR,
    BatchJob,
    parse_batch_prompts_md,
    save_cell_webp,
    split_contact_sheet,
)
from chatgpt_gen_art import connect_browser, fetch_image_bytes

# Known + active tabs from CDP
CHATS = [
    "https://chatgpt.com/c/WEB:9fcad73f-4f60-4cf2-8410-ab8dba1f253b",
    "https://chatgpt.com/c/WEB:4dde7e8d-a411-4d99-a914-6f52fadb450c",
    "https://chatgpt.com/c/6a5f7b8e-ece4-83ee-b76d-ec6bc3ad2305",
    "https://chatgpt.com/c/6a5f7b7f-baa8-83ee-8878-1077d4b62adc",
    "https://chatgpt.com/c/6a5e702d-fef8-83ee-bbbf-c6db646d670b",
    "https://chatgpt.com/c/6a5efd06-702c-83e8-8f27-7b7116bc98cc",
]


def chat_slug(url: str) -> str:
    part = url.rstrip("/").split("/")[-1]
    return part.replace(":", "-")[:24]


async def collect_images(page) -> list[dict]:
    await page.wait_for_timeout(1200)
    for _ in range(12):
        await page.evaluate(
            "() => { const m=document.querySelector('main'); if(m) m.scrollTop=m.scrollHeight; window.scrollBy(0,800); }"
        )
        await page.wait_for_timeout(280)
    return await page.evaluate(
        """() => {
      const main = document.querySelector('main') || document.body;
      const out=[], seen=new Set();
      const isGen=s=>s&&(s.includes('estuary')||s.includes('oaiusercontent')||s.includes('backend-api/')||s.startsWith('blob:'));
      for (const img of main.querySelectorAll('img')) {
        const src=img.currentSrc||img.src||'';
        if(!src||seen.has(src)||src.includes('avatar')) continue;
        const w=Math.max(img.naturalWidth||0, img.getBoundingClientRect().width||0);
        const h=Math.max(img.naturalHeight||0, img.getBoundingClientRect().height||0);
        if(!isGen(src)&&w<120) continue;
        if(w<80||h<80) continue;
        seen.add(src); out.push({src,w:Math.round(w),h:Math.round(h)});
      }
      return out;
    }"""
    )


def existing_md5s() -> set[str]:
    out = set()
    for p in list(ART_DIR.glob("*.webp")) + list(SHEETS_DIR.glob("*.webp")):
        try:
            out.add(hashlib.md5(p.read_bytes()).hexdigest())
        except Exception:
            pass
    return out


def missing_files(jobs) -> list:
    miss = []
    for j in jobs:
        for bf in j.files:
            t = ART_DIR / bf.filename
            if not t.exists() or t.stat().st_size == 0:
                miss.append((j, bf))
    return miss


def try_split_sheet(pil: Image.Image, jobs_f2, jobs_ui, jobs_map, report: dict) -> None:
    w, h = pil.size
    ratio = w / max(h, 1)

    # UI / MAP contact sheets: wide 5×2-ish
    if ratio > 1.4 and w >= 1400:
        # Prefer UI Batch 5+ missing first
        for batch in jobs_ui:
            miss = [bf for bf in batch.files if not (ART_DIR / bf.filename).exists() or (ART_DIR / bf.filename).stat().st_size == 0]
            if len(miss) == len(batch.files) and len(batch.files) in (8, 10) and batch.cols and batch.rows:
                job = BatchJob(
                    name=f"split-{batch.name}",
                    files=batch.files,
                    prompt="",
                    cols=batch.cols,
                    rows=batch.rows,
                    cell_w=batch.cell_w or (w // batch.cols),
                    cell_h=batch.cell_h or (h // batch.rows),
                    transparent=batch.transparent,
                )
                cells = split_contact_sheet(pil, job)
                for bf, cell in zip(batch.files, cells):
                    save_cell_webp(cell, ART_DIR / bf.filename, job.transparent, bf.description, 90)
                    report["saved"].append(bf.filename)
                report["actions"].append(f"UI sheet → {batch.name} ({len(batch.files)})")
                return
        for batch in jobs_map:
            miss = [bf for bf in batch.files if not (ART_DIR / bf.filename).exists() or (ART_DIR / bf.filename).stat().st_size == 0]
            if len(miss) == len(batch.files) and batch.cols and batch.rows and len(batch.files) >= 4:
                job = BatchJob(
                    name=f"split-{batch.name}",
                    files=batch.files,
                    prompt="",
                    cols=batch.cols,
                    rows=batch.rows,
                    cell_w=batch.cell_w or (w // batch.cols),
                    cell_h=batch.cell_h or (h // batch.rows),
                    transparent=batch.transparent,
                )
                cells = split_contact_sheet(pil, job)
                for bf, cell in zip(batch.files, cells):
                    save_cell_webp(cell, ART_DIR / bf.filename, job.transparent, bf.description, 90)
                    report["saved"].append(bf.filename)
                report["actions"].append(f"MAP sheet → {batch.name} ({len(batch.files)})")
                return
        report["actions"].append(f"wide sheet {w}x{h} archived only (no matching empty batch)")
        return

    # F2 mentors: portrait pair 1536×1024 → 1×2, or single portrait, or 3×2 grid
    mentors = []
    for batch in jobs_f2:
        if "Mentor" in batch.name or "mentor" in batch.name.lower():
            for bf in batch.files:
                t = ART_DIR / bf.filename
                if not t.exists() or t.stat().st_size == 0:
                    mentors.append(bf)

    if ratio > 1.2 and w >= 1200 and h >= 800 and mentors:
        # side-by-side pair
        n = min(2, len(mentors))
        pair = mentors[:n]
        job = BatchJob(
            name="split-mentors-pair",
            files=pair,
            prompt="",
            cols=n,
            rows=1,
            cell_w=w // n,
            cell_h=h,
            transparent=True,
        )
        cells = split_contact_sheet(pil, job)
        for bf, cell in zip(pair, cells):
            save_cell_webp(cell, ART_DIR / bf.filename, True, bf.description, 90)
            report["saved"].append(bf.filename)
        report["actions"].append(f"mentor pair → {', '.join(bf.filename for bf in pair)}")
        return

    if h > w and mentors and w >= 400:
        # single portrait → next missing mentor
        bf = mentors[0]
        save_cell_webp(pil, ART_DIR / bf.filename, True, bf.description, 90)
        report["saved"].append(bf.filename)
        report["actions"].append(f"single portrait → {bf.filename}")
        return

    # 3×2 or 2×3 mentor grid
    if mentors and len(mentors) >= 5 and w >= 900 and h >= 900:
        cols, rows = (3, 2) if ratio >= 1.0 else (2, 3)
        take = mentors[: min(6, cols * rows)]
        job = BatchJob(
            name="split-mentors-grid",
            files=take,
            prompt="",
            cols=cols,
            rows=rows,
            cell_w=w // cols,
            cell_h=h // rows,
            transparent=True,
        )
        cells = split_contact_sheet(pil, job)[: len(take)]
        for bf, cell in zip(take, cells):
            save_cell_webp(cell, ART_DIR / bf.filename, True, bf.description, 90)
            report["saved"].append(bf.filename)
        report["actions"].append(f"mentor grid {cols}x{rows} → {len(take)} files")
        return

    report["actions"].append(f"no split rule for {w}x{h}")


async def main() -> None:
    jobs_f2 = parse_batch_prompts_md((ART_DIR / "ART_PROMPTS_F2_NPCS.md").read_text(), "F2")
    jobs_ui = parse_batch_prompts_md((ART_DIR / "ART_PROMPTS_UI.md").read_text(), "UI")
    jobs_map = parse_batch_prompts_md((ART_DIR / "ART_PROMPTS_MAP.md").read_text(), "MAP")

    known = existing_md5s()
    SHEETS_DIR.mkdir(parents=True, exist_ok=True)

    browser = await connect_browser(9222)
    ctx = browser.contexts[0]
    page = await ctx.new_page()
    reports = []
    try:
        for url in CHATS:
            slug = chat_slug(url)
            print(f"\n=== {slug} ===", flush=True)
            rep = {"chat": slug, "url": url, "sheets": [], "saved": [], "actions": [], "new": 0}
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=120_000)
            except Exception as e:
                rep["error"] = str(e)
                reports.append(rep)
                print(f"  goto fail: {e}", flush=True)
                continue
            imgs = await collect_images(page)
            rep["image_count"] = len(imgs)
            print(f"  images={len(imgs)}", flush=True)
            for idx, im in enumerate(imgs):
                try:
                    raw = await fetch_image_bytes(page, im["src"])
                except Exception as e:
                    rep["actions"].append(f"fetch fail img{idx}: {e}")
                    continue
                md5 = hashlib.md5(raw).hexdigest()
                if md5 in known:
                    continue
                known.add(md5)
                rep["new"] += 1
                path = SHEETS_DIR / f"harvest-{slug}-img{idx}-{im['w']}x{im['h']}-{md5[:12]}.webp"
                path.write_bytes(raw)
                pil = Image.open(path)
                # re-save with actual size in name if browser reported wrong
                aw, ah = pil.size
                if (aw, ah) != (im["w"], im["h"]):
                    path2 = SHEETS_DIR / f"harvest-{slug}-img{idx}-{aw}x{ah}-{md5[:12]}.webp"
                    if path2 != path:
                        path.rename(path2)
                        path = path2
                rep["sheets"].append({"path": path.name, "size": [aw, ah], "md5": md5[:12]})
                print(f"  NEW {path.name}", flush=True)
                try_split_sheet(pil, jobs_f2, jobs_ui, jobs_map, rep)
            reports.append(rep)
            print(json.dumps({k: rep[k] for k in ("chat", "new", "saved", "actions")}, ensure_ascii=False), flush=True)
    finally:
        await page.close()
        pw = getattr(browser, "_fq_pw", None)
        try:
            await browser.close()
        except Exception:
            pass
        if pw:
            await pw.stop()

    notes = ART_DIR / "HARVEST_NOTES.md"
    prev = notes.read_text(encoding="utf-8") if notes.exists() else ""
    block = [
        "",
        f"## Harvest {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        "",
        "```json",
        json.dumps(reports, indent=2, ensure_ascii=False),
        "```",
        "",
    ]
    notes.write_text(prev + "\n".join(block), encoding="utf-8")
    print("\nDONE", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
