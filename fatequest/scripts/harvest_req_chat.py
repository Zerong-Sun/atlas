#!/usr/bin/env python3
"""Harvest images from an existing ChatGPT chat → production filenames. No submit."""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import sys
from pathlib import Path

from batch_art_utils import ART_DIR, BatchJob, parse_batch_prompts_md
from chatgpt_gen_art import (
    batch_out_dir,
    connect_browser,
    fetch_image_bytes,
    image_to_webp_bytes,
    resize_to_spec,
)
from resume_dual_decks import ensure_chat
from submit_map_windows import missing_files, SKIP_NAMES


async def scroll_chat(page) -> None:
    for _ in range(8):
        await page.evaluate(
            """() => {
              const m = document.querySelector('main');
              if (m) { m.scrollTop = m.scrollHeight; }
              window.scrollTo(0, document.body.scrollHeight);
            }"""
        )
        await page.wait_for_timeout(400)
    for _ in range(4):
        await page.evaluate(
            """() => {
              const m = document.querySelector('main');
              if (m) { m.scrollTop = 0; }
              window.scrollTo(0, 0);
            }"""
        )
        await page.wait_for_timeout(350)


async def collect_all_gen_srcs(page) -> list[str]:
    await scroll_chat(page)
    return await page.evaluate(
        """() => {
          const main = document.querySelector('main') || document.body;
          const out = [], seen = new Set();
          const isGen = (src) => src && (
            src.includes('estuary/content') || src.includes('oaiusercontent.com') ||
            src.includes('oaidalle') || src.includes('/backend-api/') || src.startsWith('blob:'));
          for (const img of main.querySelectorAll('img')) {
            const src = img.currentSrc || img.src || '';
            if (!src || seen.has(src) || src.startsWith('data:image/svg')) continue;
            if (src.includes('avatar') || src.includes('/icon')) continue;
            const w = Math.max(img.naturalWidth || 0, img.getBoundingClientRect().width || 0);
            const h = Math.max(img.naturalHeight || 0, img.getBoundingClientRect().height || 0);
            if (!isGen(src) && (w < 120 || h < 120)) continue;
            if (w < 80 || h < 80) continue;
            seen.add(src);
            out.push(src);
          }
          return out;
        }"""
    )


def find_batch(batches: list[BatchJob], window: str | None, batch_hint: str | None) -> BatchJob:
    if batch_hint:
        hint = batch_hint.lower()
        matches = [b for b in batches if hint in b.name.lower()]
        if not matches:
            raise SystemExit(f"No batch matching {batch_hint!r}")
        if window:
            w = window.lower()
            wmatches = [b for b in matches if (b.window or "").lower() == w]
            if len(wmatches) == 1:
                return wmatches[0]
            if wmatches:
                matches = wmatches
        if len(matches) > 1:
            matches.sort(key=lambda b: len(b.name), reverse=True)
            print(
                f"  WARN ambiguous batch hint {batch_hint!r}; using {matches[0].name}",
                flush=True,
            )
        return matches[0]
    if not window:
        raise SystemExit("Need --window or --batch")
    for b in batches:
        if (b.window or "").lower() == window.lower():
            return b
    raise SystemExit(f"No window {window!r}")


def known_hashes() -> dict[str, str]:
    out: dict[str, str] = {}
    for p in ART_DIR.glob("*.webp"):
        try:
            out[hashlib.md5(p.read_bytes()).hexdigest()] = p.name
        except Exception:
            pass
    decks = ART_DIR.parent / "decks"
    if decks.is_dir():
        for p in decks.rglob("*.webp"):
            try:
                out[hashlib.md5(p.read_bytes()).hexdigest()] = p.name
            except Exception:
                pass
    return out


async def harvest(
    page,
    url: str,
    batch: BatchJob,
    *,
    skip_existing: bool,
    quality: int,
    take_last: bool,
    prompts_stem: str,
) -> int:
    await ensure_chat(page, url)
    await page.wait_for_timeout(2000)
    srcs = await collect_all_gen_srcs(page)
    need = [bf for bf in batch.files if bf.filename not in SKIP_NAMES]
    if skip_existing:
        miss = {bf.filename for bf in need if not (batch_out_dir(batch) / bf.filename).exists()}
        need = [bf for bf in need if bf.filename in miss]
    if not need:
        print(f"  all {len(batch.files)} files exist — skip", flush=True)
        return 0
    n = len(need)
    if len(srcs) < n:
        print(f"  WARN only {len(srcs)} images in chat, need {n}", flush=True)
    pick = srcs[-n:] if take_last and len(srcs) > n else srcs[:n]
    if len(pick) < n and len(srcs) >= n:
        pick = srcs[-n:]
    known = known_hashes()
    out_dir = batch_out_dir(batch)
    out_dir.mkdir(parents=True, exist_ok=True)
    saved = 0
    for i, (bf, src) in enumerate(zip(need, pick)):
        target = out_dir / bf.filename
        if skip_existing and target.exists() and target.stat().st_size > 0:
            print(f"  skip {target.name}", flush=True)
            continue
        raw = await fetch_image_bytes(page, src)
        cell = resize_to_spec(raw, bf, batch.transparent)
        data = image_to_webp_bytes(cell, batch.transparent, quality, bf.description)
        digest = hashlib.md5(data).hexdigest()
        other = known.get(digest)
        if other and other != target.name:
            print(f"  WARN {target.name} dup of {other}", flush=True)
        target.write_bytes(data)
        known[digest] = target.name
        print(
            f"  [{i+1}/{n}] saved {target.name} ({bf.out_w}×{bf.out_h}, {len(data)}b)",
            flush=True,
        )
        saved += 1
    still = missing_files(batch)
    if still:
        names = [bf.filename if hasattr(bf, "filename") else str(bf) for bf in still]
        print(f"  still missing: {', '.join(names)}", flush=True)
    return saved


async def run(args: argparse.Namespace) -> int:
    path = ART_DIR / args.prompts_file
    batches = parse_batch_prompts_md(path.read_text(encoding="utf-8"), source=path.name)
    batch = find_batch(batches, args.window, args.batch)
    print(f"Batch {batch.name} · {len(batch.files)} files · {args.chat_url}", flush=True)

    browser = await connect_browser(args.port)
    try:
        page = await browser.contexts[0].new_page()
        saved = await harvest(
            page,
            args.chat_url,
            batch,
            skip_existing=args.skip_existing,
            quality=args.quality,
            take_last=args.take_last,
            prompts_stem=Path(args.prompts_file).stem,
        )
        await page.close()
        return 0 if not missing_files(batch) or saved else 1
    finally:
        pw = getattr(browser, "_fq_pw", None)
        try:
            await browser.close()
        except Exception:
            pass
        if pw:
            await pw.stop()


def main() -> None:
    ap = argparse.ArgumentParser(description="Harvest existing chat images to REQ filenames")
    ap.add_argument("--chat-url", required=True)
    ap.add_argument("--prompts-file", required=True)
    ap.add_argument("--window", default=None)
    ap.add_argument("--batch", default=None, help="Substring match on batch title")
    ap.add_argument("--port", type=int, default=9222)
    ap.add_argument("--quality", type=int, default=90)
    ap.add_argument("--skip-existing", action="store_true", default=True)
    ap.add_argument("--no-skip-existing", action="store_false", dest="skip_existing")
    ap.add_argument("--take-last", action="store_true", help="Use last N images when chat has extras")
    ap.add_argument("--wait-login-ms", type=int, default=120_000)
    args = ap.parse_args()
    raise SystemExit(asyncio.run(run(args)))


if __name__ == "__main__":
    main()
