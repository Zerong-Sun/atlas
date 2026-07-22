#!/usr/bin/env python3
"""
Resume art generation with strict concurrency:
  - max 3 ChatGPT tabs at once
  - one batch submit at a time per tab
  - poll every --poll-sec (default 600 = 10 min)

Priority queue:
  1) Extra2 emoji (true images; deletes stand-ins first)
  2) Tarot deck remaining
  3) I Ching 31–64
  4) UI batches (P1 symbols live mostly here) — skip existing
  5) MAP windows C D E F1 F2 F G — skip F1a / existing

Usage:
  .venv/bin/python orchestrate_resume.py --dry-run
  .venv/bin/python orchestrate_resume.py --chat-url 'https://chatgpt.com/c/...'
  .venv/bin/python orchestrate_resume.py --max-windows 3 --poll-sec 600
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import sys
import time
from dataclasses import dataclass, field, replace
from pathlib import Path

from batch_art_utils import ART_DIR, BatchJob, parse_batch_prompts_md
from chatgpt_gen_art import (
    batch_out_dir,
    collect_image_srcs,
    connect_browser,
    ensure_logged_in,
    open_fresh_chat,
    safe_detect_rate_limit,
    submit_prompt,
    wait_out_rate_limit,
)
from resume_dual_decks import (
    STYLE_ICHING,
    STYLE_TAROT,
    build_batch_message,
    collect_imgs,
    dismiss_rate_limit,
    ensure_chat,
    generation_busy,
    missing_jobs,
    save_new_images,
    submit_in_place,
    DeckState,
)
from submit_map_windows import (
    EMOJI_STYLE,
    MAP_STYLE,
    SKIP_NAMES,
    build_map_message,
    missing_files,
    save_batch,
)

UI_STYLE = (
    "Cloud-ridge Twilight: medieval manuscript × dusk mountain wilderness. "
    "Palette — forest ink #0D1411, parchment cream #F0E4D0, antique gold #BDA476, "
    "rubric crimson #B3402E (accent only), mist blue #7FA3BD, cloud-peach #E8B28A. "
    "Flat mineral-paint look, thick gold contours where needed, subtle paper grain / "
    "gold-leaf flecks, candlelight or dusk glow only. No photorealism, no 3D, no neon, "
    "no text labels on the sheet."
)

STANDINS = [
    "ic-extra-alchemical-symbol-for-fire.webp",
    "ic-extra-microbe.webp",
    "ic-extra-spool-of-thread.webp",
]
STANDIN_SOURCES = {
    "ic-extra-alchemical-symbol-for-fire.webp": "ic-dream-fire.webp",
    "ic-extra-microbe.webp": "ic-dream-snake.webp",
    "ic-extra-spool-of-thread.webp": "ic-extra-school-satchel.webp",
}

# MAP windows after A/B (done). F1/F2/F now use dedicated prompt files.
MAP_WINDOWS = ["C", "D", "E", "G"]
SKIP_BATCH_SUBSTR = ("F1a",)  # never re-submit even if files wiped
STALE_WAIT_SEC = 900  # abandon wait and resubmit missing
PARTIAL_RETRY_SEC = 180  # after partial harvest, retry missing soon
MAX_SEPARATE_PER_SUBMIT = 2  # ChatGPT often returns fewer than requested


def _md5(path: Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()


def is_standin(filename: str) -> bool:
    """True if file is missing or still a copy of its temporary stand-in source."""
    src_name = STANDIN_SOURCES.get(filename)
    if not src_name:
        return False
    dest = ART_DIR / filename
    src = ART_DIR / src_name
    if not dest.exists() or dest.stat().st_size == 0:
        return True
    if not src.exists():
        return False
    return _md5(dest) == _md5(src)


@dataclass
class Lane:
    """One ChatGPT tab working through a list of pending units."""

    name: str
    kind: str  # emoji | map | ui | tarot | iching
    page: object = None
    chat_url: str = "https://chatgpt.com/"
    waiting: bool = False
    done: bool = False
    # pending work units differ by kind
    batches: list = field(default_factory=list)  # BatchJob for map/ui/emoji
    deck_files_queue: list = field(default_factory=list)  # for decks: list of (batch, files)
    pending_batch: BatchJob | None = None
    pending_submit_files: list = field(default_factory=list)
    pending_deck_files: list = field(default_factory=list)
    pending_batch_name: str = ""
    baseline_srcs: set = field(default_factory=set)
    submitted_at: float = 0.0
    style: str = ""
    prompts_stem: str = ""
    first_submit: bool = True


def delete_standins() -> None:
    for name in STANDINS:
        if is_standin(name):
            p = ART_DIR / name
            if p.exists():
                p.unlink()
                print(f"deleted stand-in {name}", flush=True)


def load_emoji_extra2() -> list[BatchJob]:
    jobs = parse_batch_prompts_md(
        (ART_DIR / "ART_PROMPTS_EMOJI.md").read_text(encoding="utf-8"),
        source="ART_PROMPTS_EMOJI.md",
    )
    out = []
    for b in jobs:
        if (b.window or "").upper() != "EXTRA2":
            continue
        # Treat stand-in copies as still missing so Extra2 stays in queue
        need = missing_files(b) or [
            bf for bf in b.files if bf.filename in STANDIN_SOURCES and is_standin(bf.filename)
        ]
        if need:
            out.append(b)
    return out


def load_ui_pending() -> list[BatchJob]:
    jobs = parse_batch_prompts_md(
        (ART_DIR / "ART_PROMPTS_UI.md").read_text(encoding="utf-8"),
        source="ART_PROMPTS_UI.md",
    )
    return [b for b in jobs if missing_files(b)]


def load_named_prompts_pending(filename: str, style: str, stem: str, lane_name: str) -> Lane | None:
    path = ART_DIR / filename
    if not path.exists():
        return None
    jobs = [
        b
        for b in parse_batch_prompts_md(path.read_text(encoding="utf-8"), source=filename)
        if missing_files(b) and not any(s in b.name for s in SKIP_BATCH_SUBSTR)
    ]
    if not jobs:
        return None
    kind = "map" if "F1" in lane_name or "SCENES" in filename.upper() else "map"
    # F2 portraits are transparent sheet/separate like map assets
    if "F2" in lane_name or "NPC" in filename.upper():
        kind = "map"
    return Lane(
        name=lane_name,
        kind=kind,
        batches=jobs,
        style=style,
        prompts_stem=stem,
    )


def load_map_pending() -> dict[str, list[BatchJob]]:
    jobs = parse_batch_prompts_md(
        (ART_DIR / "ART_PROMPTS_MAP.md").read_text(encoding="utf-8"),
        source="ART_PROMPTS_MAP.md",
    )
    by: dict[str, list[BatchJob]] = {}
    for b in jobs:
        if any(s in b.name for s in SKIP_BATCH_SUBSTR):
            print(f"  skip batch (policy): {b.name}", flush=True)
            continue
        w = b.window or ""
        if w not in MAP_WINDOWS:
            continue
        if not missing_files(b):
            continue
        by.setdefault(w, []).append(b)
    return by


def load_deck_pending(prompts: str) -> list[tuple]:
    batches = parse_batch_prompts_md(
        (ART_DIR / prompts).read_text(encoding="utf-8"), source=prompts
    )
    return missing_jobs(batches)


def build_lane_queue() -> list[Lane]:
    lanes: list[Lane] = []

    extra = load_emoji_extra2()
    if extra:
        lanes.append(
            Lane(
                name="Extra2",
                kind="emoji",
                batches=extra,
                style=EMOJI_STYLE,
                prompts_stem="ART_PROMPTS_EMOJI",
            )
        )

    # Tarot / I Ching decks PAUSED — do not enqueue
    # (resume later by re-enabling load_deck_pending lanes)

    # §F1 scenes + §F2 NPCs (dedicated prompt files; before generic UI/MAP)
    f1 = load_named_prompts_pending(
        "ART_PROMPTS_F1_SCENES.md", MAP_STYLE, "ART_PROMPTS_F1_SCENES", "F1-scenes"
    )
    if f1:
        lanes.append(f1)
    f2 = load_named_prompts_pending(
        "ART_PROMPTS_F2_NPCS.md", MAP_STYLE, "ART_PROMPTS_F2_NPCS", "F2-npcs"
    )
    if f2:
        lanes.append(f2)

    ui = load_ui_pending()
    if ui:
        lanes.append(
            Lane(
                name="UI",
                kind="ui",
                batches=ui,
                style=UI_STYLE,
                prompts_stem="ART_PROMPTS_UI",
            )
        )

    for w, jobs in load_map_pending().items():
        lanes.append(
            Lane(
                name=f"MAP-{w}",
                kind="map",
                batches=jobs,
                style=MAP_STYLE,
                prompts_stem="ART_PROMPTS_MAP",
            )
        )

    return lanes


async def open_lane_page(browser, lane: Lane, seed_url: str | None) -> None:
    ctx = browser.contexts[0]
    page = await ctx.new_page()
    url = seed_url if seed_url else "https://chatgpt.com/"
    await ensure_chat(page, url)
    lane.page = page
    if "/c/" in (page.url or ""):
        lane.chat_url = page.url.split("?")[0]
    print(f"  [{lane.name}] tab ready {lane.chat_url}", flush=True)


async def submit_sheet_lane(lane: Lane, rate_limit_ms: int) -> bool:
    """Submit next contact-sheet / separate batch for emoji|ui|map."""
    while lane.batches:
        batch = lane.batches[0]
        if any(s in batch.name for s in SKIP_BATCH_SUBSTR):
            print(f"  [{lane.name}] skip {batch.name}", flush=True)
            lane.batches.pop(0)
            continue
        miss = missing_files(batch)
        if not miss:
            print(f"  [{lane.name}] skip existing {batch.name}", flush=True)
            lane.batches.pop(0)
            continue
        break
    else:
        lane.done = True
        return False

    batch = lane.batches[0]
    page = lane.page
    submit_files = list(miss)
    if batch.mode == "separate" and len(submit_files) > MAX_SEPARATE_PER_SUBMIT:
        submit_files = submit_files[:MAX_SEPARATE_PER_SUBMIT]
    sub = replace(batch, files=submit_files)
    await wait_out_rate_limit(page, pause_ms=rate_limit_ms)
    if lane.first_submit and "/c/" not in (page.url or ""):
        await open_fresh_chat(page)
    message = build_map_message(sub, lane.style)
    prev = await collect_image_srcs(page)
    print(
        f"  [{lane.name}] SUBMIT {batch.name} ({len(submit_files)}/{len(miss)} missing) …",
        flush=True,
    )
    await submit_prompt(page, message, new_chat=False)
    lane.first_submit = False
    lane.waiting = True
    lane.pending_batch = batch
    lane.pending_submit_files = submit_files
    lane.baseline_srcs = prev
    lane.submitted_at = time.time()
    lane.pending_batch_name = batch.name
    return True


def _should_reset_wait(lane: Lane, *, saved: int, elapsed: int, still: list) -> bool:
    if not still:
        return False
    if elapsed >= STALE_WAIT_SEC:
        return True
    if saved > 0 and elapsed >= PARTIAL_RETRY_SEC:
        return True
    return False


def _reset_lane_wait(lane: Lane, reason: str) -> None:
    print(f"  [{lane.name}] {reason} — will resubmit missing", flush=True)
    lane.waiting = False
    lane.pending_submit_files = []


async def harvest_sheet_lane(lane: Lane, known: dict, quality: int) -> bool:
    page = lane.page
    if await generation_busy(page):
        print(f"  [{lane.name}] still generating…", flush=True)
        return False
    if await dismiss_rate_limit(page):
        return False
    batch = lane.pending_batch
    if not batch:
        lane.waiting = False
        return False
    submit_files = lane.pending_submit_files or batch.files
    sub = replace(batch, files=list(submit_files))
    elapsed = int(time.time() - lane.submitted_at)
    saved = 0
    try:
        saved = await save_batch(
            page,
            sub,
            lane.baseline_srcs,
            quality,
            known,
            prompts_stem=lane.prompts_stem,
        )
    except Exception as e:
        print(f"  [{lane.name}] harvest error: {e}", flush=True)
        still = missing_files(batch)
        if _should_reset_wait(lane, saved=saved, elapsed=elapsed, still=still):
            _reset_lane_wait(lane, f"stale after error ({elapsed}s, {len(still)} left)")
        return False
    still = missing_files(batch)
    if still:
        if _should_reset_wait(lane, saved=saved, elapsed=elapsed, still=still):
            _reset_lane_wait(
                lane,
                f"partial {saved}; still {len(still)} after {elapsed}s",
            )
        else:
            print(
                f"  [{lane.name}] partial {saved}; still {len(still)} after {elapsed}s — waiting",
                flush=True,
            )
        return False
    print(f"  [{lane.name}] DONE {batch.name}", flush=True)
    if lane.batches and lane.batches[0] is batch:
        lane.batches.pop(0)
    lane.waiting = False
    lane.pending_batch = None
    if not lane.batches:
        lane.done = True
    return True


async def submit_deck_lane(lane: Lane) -> bool:
    while lane.deck_files_queue:
        batch, files = lane.deck_files_queue[0]
        # refresh missing
        out_dir = batch_out_dir(batch)
        files = [
            bf
            for bf in files
            if not (out_dir / bf.filename).exists() or (out_dir / bf.filename).stat().st_size == 0
        ]
        if not files:
            lane.deck_files_queue.pop(0)
            continue
        lane.deck_files_queue[0] = (batch, files)
        break
    else:
        lane.done = True
        return False

    batch, files = lane.deck_files_queue[0]
    n = len(files)
    kind = "tarot" if lane.kind == "tarot" else "I Ching"
    msg = build_batch_message(files, lane.style, n, kind)
    page = lane.page
    before = await collect_imgs(page)
    lane.baseline_srcs = {im["src"] for im in before}
    print(f"  [{lane.name}] SUBMIT {batch.name} ({n} files) …", flush=True)
    try:
        await submit_in_place(page, msg)
    except Exception as e:
        print(f"  [{lane.name}] submit failed: {e}", flush=True)
        await dismiss_rate_limit(page)
        return False
    # wrap as DeckState-compatible for save_new_images
    lane.waiting = True
    lane.pending_deck_files = files
    lane.pending_batch_name = batch.name
    lane.submitted_at = time.time()
    return True


async def harvest_deck_lane(lane: Lane) -> bool:
    page = lane.page
    if await generation_busy(page):
        print(f"  [{lane.name}] still generating…", flush=True)
        return False
    if await dismiss_rate_limit(page):
        return False
    # Adapt to DeckState API
    ds = DeckState(lane.name, "", lane.chat_url, page)
    ds.waiting = True
    ds.pending_files = lane.pending_deck_files
    ds.pending_batch_name = lane.pending_batch_name
    ds.baseline_srcs = lane.baseline_srcs
    ds.submitted_at = lane.submitted_at
    saved = await save_new_images(page, ds)
    if saved <= 0:
        elapsed = int(time.time() - lane.submitted_at)
        print(f"  [{lane.name}] no complete result yet ({elapsed}s)", flush=True)
        return False
    print(f"  [{lane.name}] harvested {saved}", flush=True)
    # drop finished unit if all files present
    if lane.deck_files_queue:
        batch, files = lane.deck_files_queue[0]
        out_dir = batch_out_dir(batch)
        still = [
            bf
            for bf in files
            if not (out_dir / bf.filename).exists() or (out_dir / bf.filename).stat().st_size == 0
        ]
        if not still:
            lane.deck_files_queue.pop(0)
        else:
            lane.deck_files_queue[0] = (batch, still)
    lane.waiting = False
    lane.pending_deck_files = []
    if not lane.deck_files_queue:
        lane.done = True
    return True


async def try_submit(lane: Lane, rate_limit_ms: int) -> bool:
    if lane.done or lane.waiting:
        return False
    if lane.kind in ("emoji", "ui", "map"):
        return await submit_sheet_lane(lane, rate_limit_ms)
    return await submit_deck_lane(lane)


async def try_harvest(lane: Lane, known: dict, quality: int) -> bool:
    if not lane.waiting:
        return False
    if lane.kind in ("emoji", "ui", "map"):
        return await harvest_sheet_lane(lane, known, quality)
    return await harvest_deck_lane(lane)


def summarize(lanes: list[Lane]) -> None:
    for lane in lanes:
        if lane.kind in ("tarot", "iching"):
            left = sum(len(f) for _, f in lane.deck_files_queue)
            print(f"  {lane.name}: {left} files / {len(lane.deck_files_queue)} batches left", flush=True)
        elif lane.kind == "emoji":
            left = 0
            for b in lane.batches:
                left += len(missing_files(b)) or sum(
                    1 for bf in b.files if bf.filename in STANDIN_SOURCES and is_standin(bf.filename)
                )
            print(f"  {lane.name}: {left} files / {len(lane.batches)} batches left (stand-ins→regen)", flush=True)
        else:
            left = sum(len(missing_files(b)) for b in lane.batches)
            print(f"  {lane.name}: {left} files / {len(lane.batches)} batches left", flush=True)


async def run(args: argparse.Namespace) -> int:
    if not args.dry_run:
        delete_standins()
    all_lanes = build_lane_queue()
    print(f"Queue ({len(all_lanes)} lanes), max_windows={args.max_windows}, poll={args.poll_sec}s:", flush=True)
    summarize(all_lanes)

    if args.dry_run:
        return 0
    if not all_lanes:
        print("Nothing to do.", flush=True)
        return 0

    browser = await connect_browser(args.port)
    try:
        page0 = browser.contexts[0].pages[0] if browser.contexts[0].pages else await browser.contexts[0].new_page()
        await ensure_logged_in(page0, wait=args.wait_login, wait_ms=args.wait_login_ms)

        known: dict[str, str] = {}
        for p in ART_DIR.glob("*.webp"):
            try:
                known[hashlib.md5(p.read_bytes()).hexdigest()] = p.name
            except Exception:
                pass

        pending = list(all_lanes)
        active: list[Lane] = []
        seed = args.chat_url

        async def fill_slots() -> None:
            nonlocal seed
            while len(active) < args.max_windows and pending:
                lane = pending.pop(0)
                url = seed
                seed = None  # only first lane reuses provided chat
                await open_lane_page(browser, lane, url)
                active.append(lane)
                await try_submit(lane, args.rate_limit_ms)
                await asyncio.sleep(3)

        await fill_slots()

        while active or pending:
            print(f"\n— poll @ {time.strftime('%H:%M:%S')} —", flush=True)
            for lane in list(active):
                if lane.done:
                    continue
                await lane.page.bring_to_front()
                await asyncio.sleep(0.4)
                harvested = await try_harvest(lane, known, args.quality)
                if harvested or not lane.waiting:
                    if not lane.done:
                        await try_submit(lane, args.rate_limit_ms)

            # retire finished lanes, open next
            still = []
            for lane in active:
                if lane.done:
                    print(f"  [{lane.name}] lane complete — closing slot", flush=True)
                    try:
                        await lane.page.close()
                    except Exception:
                        pass
                else:
                    still.append(lane)
            active = still
            await fill_slots()

            if not active and not pending:
                break

            print(
                f"  active={[l.name for l in active]} queued={[l.name for l in pending]}",
                flush=True,
            )
            await asyncio.sleep(args.poll_sec)

        print(json.dumps({"ok": True, "lanes_done": [l.name for l in all_lanes if l.done]}))
        return 0
    finally:
        pw = getattr(browser, "_fq_pw", None)
        try:
            await browser.close()
        except Exception:
            pass
        if pw:
            await pw.stop()


def main() -> None:
    ap = argparse.ArgumentParser(description="Orchestrate art resume (max 3 windows, 10min poll)")
    ap.add_argument("--port", type=int, default=9222)
    ap.add_argument("--max-windows", type=int, default=3)
    ap.add_argument("--poll-sec", type=int, default=600, help="Check interval (default 10 min)")
    ap.add_argument("--chat-url", default=None, help="Seed first tab with this conversation")
    ap.add_argument("--rate-limit-ms", type=int, default=600_000)
    ap.add_argument("--quality", type=int, default=90)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--wait-login", action="store_true")
    ap.add_argument("--wait-login-ms", type=int, default=600_000)
    args = ap.parse_args()
    raise SystemExit(asyncio.run(run(args)))


if __name__ == "__main__":
    main()
