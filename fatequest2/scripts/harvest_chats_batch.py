#!/usr/bin/env python3
"""Download + split images from known ChatGPT harvest chats."""

from __future__ import annotations

import asyncio
import hashlib
import json
from dataclasses import replace
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

CHATS = [
    {
        "id": "6a5efcf7",
        "url": "https://chatgpt.com/c/6a5efcf7-4a7c-83ee-b102-d681b7f94f58",
        "label": "F1-scenes-batch4",
        "note": "1× composite 1672×941 → 2×2 cut → Batch4 region scenes",
    },
    {
        "id": "6a5efd06",
        "url": "https://chatgpt.com/c/6a5efd06-702c-83e8-8f27-7b7116bc98cc",
        "label": "F2-gatekeepers",
        "note": "img0: 3×3 NPC grid → Batch1 (8 cells); img1+: 2×2 scene composites if applicable",
    },
    {
        "id": "6a5f7e1a",
        "url": "https://chatgpt.com/c/6a5f7e1a-8f70-83e8-9da2-ec0ed8266f34",
        "label": "UI-batch4",
        "note": "5×2 contact sheet (last sheet) → ui-tab-* / ui-icon-*",
    },
    {
        "id": "6a5f7b8e",
        "url": "https://chatgpt.com/c/6a5f7b8e-ece4-83ee-b76d-ec6bc3ad2305",
        "label": "F2-tea-inn",
        "note": "4× 1536×1024 → each 1×2 cut → Batch2 tea+inn (8 NPCs)",
    },
]


async def collect_images(page) -> list[dict]:
    await page.wait_for_timeout(1500)
    for _ in range(10):
        await page.evaluate(
            "() => { const m=document.querySelector('main'); if(m) m.scrollTop=m.scrollHeight; }"
        )
        await page.wait_for_timeout(350)
    return await page.evaluate(
        """() => {
      const main = document.querySelector('main') || document.body;
      const out=[]; const seen=new Set();
      const isGen=s=>s&&(s.includes('estuary')||s.includes('oaiusercontent')||s.includes('backend-api/')||s.startsWith('blob:'));
      for (const img of main.querySelectorAll('img')) {
        const src=img.currentSrc||img.src||'';
        if(!src||seen.has(src)||src.includes('avatar')) continue;
        const w=Math.max(img.naturalWidth||0, img.getBoundingClientRect().width||0);
        const h=Math.max(img.naturalHeight||0, img.getBoundingClientRect().height||0);
        if(!isGen(src)&&w<120) continue;
        seen.add(src); out.push({src,w,h});
      }
      return out;
    }"""
    )


def save_sheet(raw: bytes, chat_id: str, idx: int, w: int, h: int) -> Path:
    SHEETS_DIR.mkdir(parents=True, exist_ok=True)
    md5 = hashlib.md5(raw).hexdigest()[:12]
    path = SHEETS_DIR / f"harvest-{chat_id}-img{idx}-{w}x{h}-{md5}.webp"
    path.write_bytes(raw)
    return path


def split_and_save(job: BatchJob, im: Image.Image, force: bool = False) -> list[str]:
    cells = split_contact_sheet(im, job)
    saved = []
    for bf, cell in zip(job.files, cells):
        target = ART_DIR / bf.filename
        if target.exists() and target.stat().st_size > 0 and not force:
            saved.append(f"skip-existing:{bf.filename}")
            continue
        save_cell_webp(cell, target, job.transparent, bf.description, 90)
        saved.append(bf.filename)
    return saved


async def process_chat(page, spec: dict, jobs_f1, jobs_f2, jobs_ui) -> dict:
    chat_id = spec["id"]
    result = {"chat": chat_id, "label": spec["label"], "sheets": [], "saved": [], "notes": spec["note"]}
    await page.goto(spec["url"], wait_until="domcontentloaded", timeout=120_000)
    imgs = await collect_images(page)
    result["image_count"] = len(imgs)

    for idx, im in enumerate(imgs):
        raw = await fetch_image_bytes(page, im["src"])
        sheet_path = save_sheet(raw, chat_id, idx, im["w"], im["h"])
        pil = Image.open(sheet_path)
        result["sheets"].append({"path": sheet_path.name, "size": pil.size, "md5": hashlib.md5(raw).hexdigest()[:12]})

        if chat_id == "6a5efcf7" and idx == 0:
            batch = jobs_f1[3]  # Batch 4 B2
            job = BatchJob(
                name="split-F1-B4", files=batch.files, prompt="", cols=2, rows=2,
                cell_w=960, cell_h=540, transparent=False,
            )
            result["saved"] += split_and_save(job, pil)

        elif chat_id == "6a5efd06":
            if idx == 0 and pil.width >= 900 and pil.height >= 900:
                batch1 = jobs_f2[0]
                job = BatchJob(
                    name="split-F2-B1", files=batch1.files, prompt="", cols=3, rows=3,
                    cell_w=pil.width // 3, cell_h=pil.height // 3, transparent=True,
                )
                cells = split_contact_sheet(pil, job)[:8]
                for bf, cell in zip(batch1.files, cells):
                    t = ART_DIR / bf.filename
                    if not t.exists() or t.stat().st_size == 0:
                        save_cell_webp(cell, t, True, bf.description, 90)
                        result["saved"].append(bf.filename)
            elif pil.width > pil.height * 1.2:
                # 2×2 landscape composite → try map to F1 batch4 missing only
                batch4 = jobs_f1[3]
                miss = [bf for bf in batch4.files if not (ART_DIR / bf.filename).exists()]
                if len(miss) >= 4:
                    job = BatchJob(
                        name="split-F1-B4-extra", files=batch4.files, prompt="", cols=2, rows=2,
                        cell_w=pil.width // 2, cell_h=pil.height // 2, transparent=False,
                    )
                    result["saved"] += split_and_save(job, pil, force=False)

        elif chat_id == "6a5f7e1a":
            # Last UI sheet in chat = batch 4 (5×2 icons)
            if idx == len(imgs) - 1 or (pil.width > pil.height * 1.5 and pil.width > 1500):
                batch4 = jobs_ui[3]
                job = BatchJob(
                    name="split-UI-B4", files=batch4.files, prompt="", cols=5, rows=2,
                    cell_w=512, cell_h=512, transparent=True,
                )
                result["saved"] += split_and_save(job, pil)

        elif chat_id == "6a5f7b8e":
            batch2 = jobs_f2[1]
            # Each image: 2 portraits side-by-side (1×2)
            pair_files = batch2.files[idx * 2 : idx * 2 + 2]
            if len(pair_files) == 2:
                job = BatchJob(
                    name=f"split-F2-B2-pair{idx}",
                    files=pair_files,
                    prompt="",
                    cols=2,
                    rows=1,
                    cell_w=pil.width // 2,
                    cell_h=pil.height,
                    transparent=True,
                )
                result["saved"] += split_and_save(job, pil)

    return result


async def main() -> None:
    jobs_f1 = parse_batch_prompts_md(
        (ART_DIR / "ART_PROMPTS_F1_SCENES.md").read_text(encoding="utf-8"),
        source="ART_PROMPTS_F1_SCENES.md",
    )
    jobs_f2 = parse_batch_prompts_md(
        (ART_DIR / "ART_PROMPTS_F2_NPCS.md").read_text(encoding="utf-8"),
        source="ART_PROMPTS_F2_NPCS.md",
    )
    jobs_ui = parse_batch_prompts_md(
        (ART_DIR / "ART_PROMPTS_UI.md").read_text(encoding="utf-8"),
        source="ART_PROMPTS_UI.md",
    )

    browser = await connect_browser(9222)
    ctx = browser.contexts[0]
    page = await ctx.new_page()
    reports = []
    try:
        for spec in CHATS:
            print(f"\n=== {spec['label']} {spec['id']} ===", flush=True)
            rep = await process_chat(page, spec, jobs_f1, jobs_f2, jobs_ui)
            reports.append(rep)
            print(json.dumps(rep, indent=2, ensure_ascii=False), flush=True)
    finally:
        await page.close()
        pw = getattr(browser, "_fq_pw", None)
        try:
            await browser.close()
        except Exception:
            pass
        if pw:
            await pw.stop()

    notes_path = ART_DIR / "HARVEST_NOTES.md"
    lines = [
        "# ChatGPT harvest notes",
        "",
        f"Updated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        "",
        "| Chat | Label | Split rule |",
        "|---|---|---|",
    ]
    for spec in CHATS:
        lines.append(f"| `{spec['id']}` | {spec['label']} | {spec['note']} |")
    lines.append("")
    lines.append("## Run log")
    lines.append("")
    lines.append("```json")
    lines.append(json.dumps(reports, indent=2, ensure_ascii=False))
    lines.append("```")
    notes_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\nWrote {notes_path}", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
