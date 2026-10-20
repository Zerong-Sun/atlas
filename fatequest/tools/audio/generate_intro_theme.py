#!/usr/bin/env python3
"""Generate FateQuest's title/arrival theme.

This is a short, secular procedural motif for the opening desk only.  It is
deliberately kept separate from the culture × scene travel stems: the title
should announce the game before the player's identity or location is known.
"""

from __future__ import annotations

import math
import wave
from pathlib import Path

import numpy as np

SR = 44_100
DURATION = 18.0
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets" / "audio" / "intro" / "title_theme.wav"


def tone(freq: float, start: float, length: float, gain: float, harmonic: float = 0.2) -> None:
    i0 = int(start * SR)
    n = min(int(length * SR), len(mix) - i0)
    if n <= 0:
        return
    t = np.arange(n, dtype=np.float64) / SR
    attack = np.minimum(1.0, t / 0.08)
    release = np.minimum(1.0, np.maximum(0.0, (length - t) / 0.22))
    env = attack * release * np.exp(-t * 0.12)
    wave_ = np.sin(2 * math.pi * freq * t)
    wave_ += harmonic * np.sin(2 * math.pi * freq * 2.0 * t + 0.35)
    wave_ += harmonic * 0.45 * np.sin(2 * math.pi * freq * 3.0 * t + 0.8)
    mix[i0 : i0 + n] += wave_ * env * gain


def bell(freq: float, start: float, gain: float = 0.16) -> None:
    n = int(2.4 * SR)
    i0 = int(start * SR)
    n = min(n, len(mix) - i0)
    if n <= 0:
        return
    t = np.arange(n, dtype=np.float64) / SR
    env = np.exp(-t * 2.8)
    partials = (
        (1.0, 1.0),
        (2.76, 0.32),
        (5.4, 0.12),
    )
    wave_ = sum(a * np.sin(2 * math.pi * freq * r * t) for r, a in partials)
    mix[i0 : i0 + n] += wave_ * env * gain


mix = np.zeros(int(DURATION * SR), dtype=np.float64)
# A neutral, pentatonic travel phrase: C–D–G–A–C, with a quiet return.
notes = [261.63, 293.66, 392.00, 440.00, 523.25, 440.00, 392.00, 293.66]
for i, freq in enumerate(notes):
    tone(freq, 1.0 + i * 1.55, 1.15, 0.18, 0.16)
    if i in (0, 4):
        bell(freq, 1.0 + i * 1.55)

# A low, slow fifth gives the desk a sense of arrival without imitating a
# particular historical instrument or liturgical tradition.
for i in range(9):
    tone(130.81 if i % 2 == 0 else 196.00, 0.7 + i * 1.55, 1.5, 0.09, 0.08)

fade = int(0.9 * SR)
mix[:fade] *= np.linspace(0.0, 1.0, fade)
mix[-fade:] *= np.linspace(1.0, 0.0, fade)
mix = np.tanh(mix * 1.25) * 0.72
pcm = (np.clip(mix, -1.0, 1.0) * 32767).astype(np.int16)
OUT.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(OUT), "wb") as handle:
    handle.setnchannels(1)
    handle.setsampwidth(2)
    handle.setframerate(SR)
    handle.writeframes(pcm.tobytes())
print(f"wrote {OUT} ({len(pcm) / SR:.1f}s, {OUT.stat().st_size} bytes)")
