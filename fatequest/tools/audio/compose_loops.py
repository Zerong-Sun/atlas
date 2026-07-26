#!/usr/bin/env python3
"""Compose seamless mono OGG loops from CC0 samples (AUDIO_PLAN ambient beds).

Reads tools/audio/_cc0_cache/raw/<slot>.* and writes:
  assets/audio/ambient/<slot>.ogg  (~96 kbps mono, seamless)

Also can regenerate melody/color stems when given --stems (delegates to
generate_melody_color.py logic via import).

Usage:
  tools/audio/.venv/bin/python tools/audio/compose_loops.py --all-ambient
  tools/audio/.venv/bin/python tools/audio/compose_loops.py --slot rain
"""

from __future__ import annotations

import argparse
import math
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np
from scipy import signal as sps
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parents[2]
CACHE = Path(__file__).resolve().parent / "_cc0_cache" / "raw"
OUT_AMB = ROOT / "assets" / "audio" / "ambient"
SR = 44100
BITRATE = "96k"

AMBIENT_SLOTS = [
    "wind_sand",
    "waves",
    "ropes_mast",
    "market_crowd",
    "camel_bells",
    "horse_hooves",
    "river",
    "rain",
    "fire",
    "footsteps_echo",
    "dishes",
    "seabirds",
]

# Target loop lengths (seconds) per slot
DUR = {
    "wind_sand": 20.0,
    "waves": 20.0,
    "ropes_mast": 16.0,
    "market_crowd": 18.0,
    "camel_bells": 16.0,
    "horse_hooves": 12.0,
    "river": 18.0,
    "rain": 16.0,
    "fire": 14.0,
    "footsteps_echo": 12.0,
    "dishes": 12.0,
    "seabirds": 16.0,
}


def load_audio(path: Path) -> np.ndarray:
    """Load any ffmpeg-readable file → mono float64 @ SR."""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        cmd = [
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(path),
            "-ac", "1", "-ar", str(SR),
            str(tmp_path),
        ]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            raise RuntimeError(r.stderr or "ffmpeg failed")
        rate, data = wavfile.read(str(tmp_path))
        if data.dtype == np.int16:
            x = data.astype(np.float64) / 32768.0
        elif data.dtype == np.int32:
            x = data.astype(np.float64) / 2147483648.0
        else:
            x = data.astype(np.float64)
            peak = np.max(np.abs(x)) or 1.0
            if peak > 1.5:
                x = x / peak
        if x.ndim > 1:
            x = x.mean(axis=1)
        return x
    finally:
        tmp_path.unlink(missing_ok=True)


def make_seamless(x: np.ndarray, fade: float = 0.5) -> np.ndarray:
    n = len(x)
    nf = max(1, min(int(fade * SR), n // 4))
    out = x.astype(np.float64).copy()
    w = np.linspace(0, math.pi / 2, nf)
    fade_in = np.sin(w) ** 2
    fade_out = np.cos(w) ** 2
    mixed = out[-nf:] * fade_out + out[:nf] * fade_in
    out[-nf:] = mixed
    out[:nf] = mixed
    out -= np.mean(out)
    peak = np.max(np.abs(out)) or 1.0
    return out / peak * 0.85


def loop_to_duration(x: np.ndarray, dur: float) -> np.ndarray:
    need = int(dur * SR)
    if len(x) >= need:
        # pick a quiet-ish mid segment if long
        if len(x) > need * 1.5:
            start = (len(x) - need) // 3
            return x[start : start + need]
        return x[:need]
    reps = int(math.ceil(need / len(x))) + 1
    tiled = np.tile(x, reps)
    # crossfade each junction lightly
    period = len(x)
    out = tiled[:need].copy()
    nf = min(int(0.15 * SR), period // 8)
    for k in range(1, reps):
        i = k * period
        if i >= need:
            break
        a0 = max(0, i - nf)
        a1 = min(need, i + nf)
        if a1 <= a0:
            continue
        # already contiguous from tile; apply small equal-power blend around join
        mid = i
        left = out[max(0, mid - nf) : mid]
        right = out[mid : min(need, mid + nf)]
        n = min(len(left), len(right))
        if n < 2:
            continue
        w = np.linspace(0, 1, n)
        out[mid - n : mid] = left[-n:] * (1 - w) + right[:n][::-1][::-1] * 0  # noop safeguard
        # simpler: equal-power at boundary using mirrored crossfade of neighbors
        seg = out[mid - n : mid + n].copy() if mid + n <= len(out) else None
        if seg is not None and len(seg) == 2 * n:
            w2 = np.sin(np.linspace(0, math.pi / 2, n)) ** 2
            left_n = out[mid - n : mid].copy()
            right_n = out[mid : mid + n].copy()
            out[mid - n : mid] = left_n * (1 - w2) + right_n * w2
            out[mid : mid + n] = left_n * w2 + right_n * (1 - w2)
    return out[:need]


def one_pole_lp(x: np.ndarray, cutoff: float) -> np.ndarray:
    cutoff = min(cutoff, SR * 0.45)
    a = math.exp(-2.0 * math.pi * cutoff / SR)
    return sps.lfilter([1 - a], [1, -a], x)


def write_ogg(path: Path, samples: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm16 = (np.clip(samples, -1.0, 1.0) * 32767.0).astype(np.int16)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        with wave.open(str(tmp_path), "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(SR)
            wf.writeframes(pcm16.tobytes())
        br = BITRATE.rstrip("kK")
        attempts = [
            ["oggenc", "-Q", "-b", br, "-o", str(path), str(tmp_path)],
            [
                "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                "-i", str(tmp_path), "-c:a", "libvorbis", "-b:a", BITRATE, "-ac", "1", str(path),
            ],
        ]
        err = ""
        for cmd in attempts:
            r = subprocess.run(cmd, capture_output=True, text=True)
            if r.returncode == 0 and path.exists() and path.stat().st_size > 0:
                return
            err = (r.stderr or r.stdout or "").strip()
        raise RuntimeError(f"ogg encode failed: {err}")
    finally:
        tmp_path.unlink(missing_ok=True)


def find_raw(slot: str) -> Path | None:
    for ext in (".ogg", ".mp3", ".wav", ".flac"):
        p = CACHE / f"{slot}{ext}"
        if p.exists():
            return p
    return None


def process_slot(slot: str) -> Path:
    raw = find_raw(slot)
    if raw is None:
        raise FileNotFoundError(f"no cached raw for {slot} under {CACHE}")
    print(f"compose {slot} ← {raw.name}")
    x = load_audio(raw)
    # gentle bed shaping — keep speech unintelligible for crowd
    if slot == "market_crowd":
        x = one_pole_lp(x, 1800)
        # light band-limit to kill consonants
        b, a = sps.butter(2, [180 / (SR / 2), 1600 / (SR / 2)], btype="band")
        x = sps.lfilter(b, a, x)
    elif slot == "camel_bells":
        # emphasize metallic partials a bit
        x = x + 0.15 * (x - one_pole_lp(x, 800))
    dur = DUR.get(slot, 16.0)
    x = loop_to_duration(x, dur)
    x = make_seamless(x, fade=min(0.8, dur * 0.08))
    out = OUT_AMB / f"{slot}.ogg"
    write_ogg(out, x)
    print(f"  → {out.relative_to(ROOT)} ({out.stat().st_size / 1024:.0f} KB)")
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--all-ambient", action="store_true")
    ap.add_argument("--slot", default=None)
    args = ap.parse_args()
    slots = AMBIENT_SLOTS if args.all_ambient else ([args.slot] if args.slot else [])
    if not slots:
        print("pass --all-ambient or --slot NAME", file=sys.stderr)
        return 1
    ok = 0
    for slot in slots:
        try:
            process_slot(slot)
            ok += 1
        except Exception as e:
            print(f"FAIL {slot}: {e}", file=sys.stderr)
    print(f"\nComposed {ok}/{len(slots)}")
    return 0 if ok == len(slots) else 1


if __name__ == "__main__":
    raise SystemExit(main())
