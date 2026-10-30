#!/usr/bin/env python3
"""Render original eight-bar Chinese themes with recorded pipa and guzheng attacks.

The input recordings supply timbre only. Every note, rhythm and combination
below is newly scored; source performances are never replayed as a phrase.
"""

from __future__ import annotations

import hashlib
import json
from functools import lru_cache
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
SAMPLES = ROOT / "tools/audio/samples/china"
OUTPUT = ROOT / "assets/audio/folk/east_asia"
SR = 44_100

# G-gong pentatonic: G A B D E. Pipa leads in its upper register, while
# guzheng answers below it with open fifths and passing suspensions. The
# staggered pairs are a small polyphonic texture, not a sustained chord pad.
# Tokens are note:beats; a dash means a scored rest. Each row is one 4/4 bar.
SCORES = {
    "town": {
        "bpm": 101,
        "lead": [
            "B4:1 D5:.5 E5:.5 D5:1 B4:1",
            "A4:.5 B4:.5 D5:1 B4:1 -:1",
            "D5:.5 E5:.5 G5:1 E5:.5 D5:.5 B4:1",
            "A4:1 B4:1 D5:1 -:1",
            "B4:.5 D5:.5 E5:.5 D5:.5 B4:1 A4:1",
            "D5:1 E5:.5 G5:.5 E5:1 D5:1",
            "B4:.5 A4:.5 B4:1 D5:.5 B4:.5 A4:1",
            "B4:1 A4:1 G4:2",
        ],
        "zither": [(0, "G4"), (1.6, "D5"), (2.8, "B4")],
    },
    "road": {
        "bpm": 112,
        "lead": [
            "D5:.5 E5:.5 G5:.5 E5:.5 D5:1 B4:1",
            "B4:.5 D5:.5 E5:1 D5:.5 B4:.5 A4:1",
            "E5:.5 G5:.5 E5:.5 D5:.5 B4:.5 D5:.5 E5:1",
            "D5:.5 B4:.5 A4:1 B4:1 -:1",
            "B4:.5 D5:.5 E5:.5 G5:.5 E5:.5 D5:.5 B4:1",
            "D5:.5 E5:.5 G5:1 E5:.5 D5:.5 B4:1",
            "A4:.5 B4:.5 D5:.5 B4:.5 E5:.5 D5:.5 A4:1",
            "B4:1 A4:1 G4:2",
        ],
        "zither": [(0, "G4"), (.72, "B4"), (1.5, "D5"), (2.65, "A4")],
    },
    "quiet": {
        "bpm": 92,
        "lead": [
            "G4:1 B4:1 D5:1 -:1",
            "A4:1 B4:1 G4:2",
            "B4:1 D5:1 E5:1 D5:1",
            "B4:1 A4:1 G4:2",
            "D5:1 B4:1 A4:1 G4:1",
            "A4:1 B4:1 D5:2",
            "E5:1 D5:1 B4:1 A4:1",
            "B4:1 A4:1 G4:2",
        ],
        "pipa_reply": [(2.45, "D5"), (3.1, "B4")],
    },
}

# A short onset with its whole remaining natural decay; pipa samples are
# selected before the next recital attack. They are never gated by MIDI note
# length. Long pipa notes use separately triggered finger strokes.
ZONES = {
    "guzheng": [(0.0, 4.35, 69), (7.39, 11.7, 67)],
    "pipa": [(13.94, 14.44, 74), (100.77, 101.52, 76), (98.58, 99.72, 78)],
}


def validate_sources() -> None:
    manifest = json.loads((SAMPLES / "SOURCE.json").read_text(encoding="utf-8"))
    assert {s["instrument"] for s in manifest["sources"]} == {"pipa", "guzheng"}
    for source in manifest["sources"]:
        if source["license"] not in {"CC0 1.0", "CC BY 4.0"}:
            raise ValueError("unexpected Chinese instrument license")
        path = SAMPLES / source["file"]
        if hashlib.sha256(path.read_bytes()).hexdigest() != source["sha256"]:
            raise ValueError(f"Chinese source hash mismatch: {path}")


def midi(name: str) -> int:
    names = {"G": 7, "A": 9, "B": 11, "D": 2, "E": 4}
    return (int(name[-1]) + 1) * 12 + names[name[0]]


def parse_bar(row: str) -> list[tuple[float, str, float]]:
    events = []
    at = 0.0
    for token in row.split():
        name, beats = token.split(":")
        length = float(beats)
        if name != "-":
            events.append((at, name, length))
        at += length
    if abs(at - 4.0) > 1e-8:
        raise ValueError(f"not four beats: {row}")
    return events


def validate_score() -> None:
    for scene, score in SCORES.items():
        if len(score["lead"]) != 8:
            raise ValueError(f"{scene} needs eight bars")
        for row in score["lead"]:
            parse_bar(row)


@lru_cache(maxsize=2)
def recording(instrument: str) -> np.ndarray:
    file = "pipa_xserra.mp3" if instrument == "pipa" else "guzheng_nanliu.mp3"
    audio, sr = sf.read(SAMPLES / file, dtype="float32")
    if sr != SR:
        raise ValueError(f"unexpected sample rate: {file}")
    return audio.mean(axis=1) if audio.ndim == 2 else audio


@lru_cache(maxsize=5)
def sample(instrument: str, zone: int) -> np.ndarray:
    start, end, _ = ZONES[instrument][zone]
    x = recording(instrument)[round(start * SR):round(end * SR)].astype(np.float64)
    x -= np.mean(x)
    # Remove microphone/room rumble without thinning the pluck's body.
    frequencies = np.fft.rfftfreq(len(x), 1 / SR)
    spectrum = np.fft.rfft(x)
    spectrum *= frequencies / np.sqrt(frequencies**2 + 95.0**2)
    x = np.fft.irfft(spectrum, n=len(x))
    edge = min(round(.008 * SR), len(x) // 4)
    x[:edge] *= np.linspace(.0, 1.0, edge)
    release = min(round((.10 if instrument == "guzheng" else .045) * SR), len(x) // 3)
    x[-release:] *= np.linspace(1.0, .0, release)
    peak = max(np.max(np.abs(x)), 1e-6)
    return x / peak


def pluck(instrument: str, target: int) -> np.ndarray:
    zone = min(range(len(ZONES[instrument])), key=lambda i: abs(ZONES[instrument][i][2] - target))
    source = sample(instrument, zone)
    key = ZONES[instrument][zone][2]
    ratio = 2 ** ((target - key) / 12)
    count = round(len(source) / ratio)
    return np.interp(np.arange(count) * ratio, np.arange(len(source)), source, right=0).astype(np.float64)


def add(buffer: np.ndarray, instrument: str, note: str, at: float, gain: float) -> None:
    sound = pluck(instrument, midi(note))
    first = round(at * SR)
    if first >= len(buffer):
        return
    last = min(first + len(sound), len(buffer))
    buffer[first:last] += gain * sound[:last-first]


def render(scene: str) -> np.ndarray:
    score = SCORES[scene]
    beat = 60 / score["bpm"]
    duration = 32 * beat
    out = np.zeros(round(duration * SR), dtype=np.float64)
    for bar, row in enumerate(score["lead"]):
        base = 4 * bar * beat
        for offset, note, length in parse_bar(row):
            moment = base + offset * beat
            if scene == "quiet":
                add(out, "guzheng", note, moment, .24)
            else:
                add(out, "pipa", note, moment, .24 if scene == "town" else .22)
                # Lunzhi-like individual finger strokes for the longest notes.
                if length >= 1.0 and note in ("E5", "G5") and bar in (2, 5):
                    for shift in (.13, .27, .41):
                        add(out, "pipa", note, moment + shift, .065)
        if scene == "quiet":
            # Pipa answers only selected bars, leaving room for the zither tail.
            if bar in (1, 3, 5, 7):
                for offset, note in score["pipa_reply"]:
                    add(out, "pipa", note, base + offset * beat, .105)
        else:
            # Alternating broken fifths and suspended dyads create moving
            # harmony; the attacks remain offset from the pipa's melody.
            for offset, note in score["zither"]:
                if bar % 2 and note == "B4":
                    note = "A4"
                add(out, "guzheng", note, base + offset * beat, .125 if scene == "town" else .105)
    fade = round(.15 * SR)
    out[:fade] *= np.sin(np.linspace(0, np.pi/2, fade))**2
    out[-fade:] *= np.sin(np.linspace(np.pi/2, 0, fade))**2
    # Keep a clear peak and let the natural instrumental attacks remain dynamic.
    peak = max(float(np.max(np.abs(out))), 1e-9)
    out *= (.70 if scene != "quiet" else .63) / peak
    return out.astype(np.float32)


def compose() -> None:
    validate_sources()
    validate_score()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for scene in SCORES:
        audio = render(scene)
        sf.write(OUTPUT / f"{scene}.ogg", audio, SR, format="OGG", subtype="VORBIS")
        print(f"east_asia/{scene}: original pipa + guzheng score, {len(audio)/SR:.2f}s")


if __name__ == "__main__":
    compose()
