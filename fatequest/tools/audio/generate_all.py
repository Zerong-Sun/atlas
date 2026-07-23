#!/usr/bin/env python3
"""Build-time audio for FateQuest (AUDIO_PLAN.md §7).

Generates:
  - 5 cultures × 4 stems × 60s seamless mono OGG (~96 kbps)
  - 12 ambient loops (procedural / self-synth)

Red lines (AUDIO_PLAN §1): no adhān, Qur'ān, liturgical chant, or sacred
recitation. Scales are secular gestures, not representation.

Usage:
  tools/audio/.venv/bin/python tools/audio/generate_all.py
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

SR = 44100
STEM_DUR = 60.0
BITRATE = "96k"
ROOT = Path(__file__).resolve().parents[2]
OUT_STEMS = ROOT / "assets" / "audio" / "stems"
OUT_AMB = ROOT / "assets" / "audio" / "ambient"


def midi(n: float) -> float:
    return 440.0 * (2.0 ** ((n - 69.0) / 12.0))


def env_adsr(n: int, a: float, d: float, s: float, r: float, peak: float = 1.0) -> np.ndarray:
    e = np.zeros(n, dtype=np.float64)
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    ns = max(0, n - na - nd - nr)
    i = 0
    if na:
        e[i : i + na] = np.linspace(0, peak, na, endpoint=False)
        i += na
    if nd:
        e[i : i + nd] = np.linspace(peak, peak * s, nd, endpoint=False)
        i += nd
    if ns:
        e[i : i + ns] = peak * s
        i += ns
    if nr and i < n:
        e[i:] = np.linspace(peak * s, 0, n - i)
    return e


def soft_clip(x: np.ndarray, drive: float = 1.2) -> np.ndarray:
    return np.tanh(x * drive) / math.tanh(drive)


def one_pole_lp(x: np.ndarray, cutoff: float) -> np.ndarray:
    if cutoff <= 0:
        return np.zeros_like(x)
    cutoff = min(cutoff, SR * 0.45)
    a = math.exp(-2.0 * math.pi * cutoff / SR)
    return sps.lfilter([1 - a], [1, -a], x)


def one_pole_hp(x: np.ndarray, cutoff: float) -> np.ndarray:
    return x - one_pole_lp(x, cutoff)


def bandpass(x: np.ndarray, center: float, q: float) -> np.ndarray:
    center = float(np.clip(center, 40, SR * 0.4))
    bw = max(40.0, center / max(q, 0.1))
    low = max(20.0, center - bw / 2)
    high = min(SR * 0.45, center + bw / 2)
    if high <= low:
        return one_pole_lp(x, center)
    b, a = sps.butter(2, [low / (SR / 2), high / (SR / 2)], btype="band")
    return sps.lfilter(b, a, x)


def make_seamless(x: np.ndarray, fade: float = 0.08) -> np.ndarray:
    n = len(x)
    nf = max(1, min(int(fade * SR), n // 4))
    out = x.astype(np.float64).copy()
    w = np.linspace(0, math.pi / 2, nf)
    fade_in = np.sin(w) ** 2
    fade_out = np.cos(w) ** 2
    head = out[:nf].copy()
    tail = out[-nf:].copy()
    mixed = tail * fade_out + head * fade_in
    out[-nf:] = mixed
    out[:nf] = mixed
    out -= np.mean(out)
    peak = np.max(np.abs(out)) or 1.0
    return out / peak * 0.85


def write_ogg(path: Path, samples: np.ndarray, bitrate: str = BITRATE) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm16 = (np.clip(samples, -1.0, 1.0) * 32767.0).astype(np.int16)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    with wave.open(str(tmp_path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm16.tobytes())

    # Prefer oggenc (true mono Vorbis). FFmpeg built-in vorbis is stereo-only.
    br = bitrate.rstrip("kK")
    attempts = [
        ["oggenc", "-Q", "-b", br, "-o", str(path), str(tmp_path)],
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
         "-i", str(tmp_path), "-c:a", "libvorbis", "-b:a", bitrate, "-ac", "1", str(path)],
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
         "-i", str(tmp_path), "-ac", "2", "-c:a", "vorbis", "-strict", "-2", "-b:a", bitrate, str(path)],
    ]
    err = ""
    for cmd in attempts:
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode == 0 and path.exists() and path.stat().st_size > 0:
            tmp_path.unlink(missing_ok=True)
            return
        err = (r.stderr or r.stdout or "").strip()
    tmp_path.unlink(missing_ok=True)
    raise RuntimeError(f"ogg encode failed for {path}: {err}")


def noise(n: int, rng: np.random.Generator) -> np.ndarray:
    return rng.standard_normal(n)


def sine_freq(freq: float | np.ndarray, n: int, phase0: float = 0.0) -> np.ndarray:
    if np.isscalar(freq):
        t = np.arange(n, dtype=np.float64) / SR
        return np.sin(2 * math.pi * float(freq) * t + phase0)
    phase = phase0 + 2 * math.pi * np.cumsum(np.asarray(freq, dtype=np.float64)) / SR
    return np.sin(phase)


def pluck(freq: float, dur: float, rng: np.random.Generator, brightness: float = 0.35) -> np.ndarray:
    """Vectorized Karplus–Strong approximation via wavetable decay."""
    n = int(dur * SR)
    period = max(2, int(SR / max(freq, 20)))
    buf = rng.standard_normal(period)
    # average smoothing once
    buf = 0.5 * (buf + np.roll(buf, 1))
    buf = one_pole_lp(buf, 1800 + brightness * 5000)
    # build by repeating with exponential decay envelope per period
    reps = int(math.ceil(n / period)) + 1
    decay = (0.996 - (1 - brightness) * 0.004) ** np.arange(reps)
    tiled = np.tile(buf, reps)[:n]
    # amplitude decay approximating loop filter loss
    sample_decay = np.exp(-np.arange(n) / SR * (2.5 + (1 - brightness) * 4))
    out = tiled * sample_decay
    # mild period-index decay
    idx = np.arange(n) // period
    out *= decay[np.clip(idx, 0, len(decay) - 1)]
    return out * env_adsr(n, 0.002, 0.08, 0.35, min(0.4, dur * 0.5))


def bow(freq: float, dur: float, vibrato_hz: float = 4.5, vibrato_cents: float = 8.0) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    vib = 1.0 + (vibrato_cents / 1200.0) * np.sin(2 * math.pi * vibrato_hz * t)
    fund = sine_freq(freq * vib, n)
    h2 = 0.35 * sine_freq(freq * 2 * vib, n, 0.3)
    h3 = 0.12 * sine_freq(freq * 3 * vib, n, 0.7)
    return soft_clip(fund + h2 + h3, 1.1) * env_adsr(n, 0.12, 0.2, 0.7, 0.25)


def flute(freq: float, dur: float, breath: float = 0.08, rng: np.random.Generator | None = None) -> np.ndarray:
    rng = rng or np.random.default_rng(0)
    n = int(dur * SR)
    t = np.arange(n) / SR
    vib = 1.0 + 0.004 * np.sin(2 * math.pi * 5.2 * t)
    tone = sine_freq(freq * vib, n) + 0.25 * sine_freq(freq * 2 * vib, n, 1.1)
    nse = bandpass(noise(n, rng), freq * 1.8, 0.6) * breath
    return soft_clip(tone * 0.85 + nse) * env_adsr(n, 0.05, 0.1, 0.6, 0.2)


def frame_drum(dur: float, rng: np.random.Generator, tone: float = 180.0) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    body = sine_freq(tone, n) * np.exp(-t * 18)
    slap = one_pole_lp(noise(n, rng), 2500) * np.exp(-t * 60)
    return soft_clip(body * 0.55 + slap * 0.7)


def low_drum(dur: float, rng: np.random.Generator, tone: float = 70.0) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    pitch = tone * np.exp(-t * 8)
    body = np.sin(2 * math.pi * np.cumsum(pitch) / SR)
    click = one_pole_hp(noise(n, rng), 800) * np.exp(-t * 80)
    return soft_clip(body * np.exp(-t * 6) * 0.9 + click * 0.25)


def bell_partial(freq: float, dur: float, amp: float = 1.0) -> np.ndarray:
    n = int(dur * SR)
    ratios = [1.0, 2.76, 5.4, 8.2]
    amps = [1.0, 0.45, 0.2, 0.08]
    decays = [1.0, 1.6, 2.4, 3.2]
    out = np.zeros(n)
    t = np.arange(n) / SR
    for r, a, d in zip(ratios, amps, decays):
        out += a * np.sin(2 * math.pi * freq * r * t) * np.exp(-t * d * 2.2)
    return out * amp * env_adsr(n, 0.001, 0.05, 0.4, min(dur * 0.6, 2.0))


CULTURES = {
    "islamic": {
        "scale": [0, 1, 4, 5, 7, 8, 10],
        "tonic_midi": 50,
        "bpm": 78,
    },
    "east_asia": {
        "scale": [0, 2, 4, 7, 9],
        "tonic_midi": 55,
        "bpm": 60,
    },
    "steppe": {
        "scale": [0, 2, 4, 7, 9],
        "tonic_midi": 48,
        "bpm": 68,
    },
    "indian_ocean": {
        "scale": [0, 2, 3, 5, 7, 9, 10],
        "tonic_midi": 52,
        "bpm": 88,
    },
    "latin": {
        "scale": [0, 2, 3, 5, 7, 9, 10],
        "tonic_midi": 53,
        "bpm": 68,
    },
}


def scale_freqs(culture: str, octaves: int = 2) -> list[float]:
    c = CULTURES[culture]
    freqs = []
    for o in range(octaves):
        for d in c["scale"]:
            freqs.append(midi(c["tonic_midi"] + d + 12 * o))
    return freqs


def beat_times(bpm: float, dur: float, pattern: list[float]) -> list[float]:
    spb = 60.0 / bpm
    t, i, out = 0.0, 0, []
    while t < dur - 0.05:
        out.append(t)
        t += pattern[i % len(pattern)] * spb
        i += 1
    return out


def mix_at(out: np.ndarray, frag: np.ndarray, t0: float, gain: float = 1.0) -> None:
    i0 = int(t0 * SR)
    if i0 >= len(out):
        return
    i1 = min(len(out), i0 + len(frag))
    out[i0:i1] += frag[: i1 - i0] * gain


def gen_drone(culture: str, rng: np.random.Generator) -> np.ndarray:
    n = int(STEM_DUR * SR)
    freqs = scale_freqs(culture, 1)
    root = freqs[0]
    fifth = freqs[min(4, len(freqs) - 1)] if len(freqs) > 4 else root * 1.5
    t = np.arange(n) / SR

    if culture == "indian_ocean":
        out = np.zeros(n)
        cycle = 2.4
        for k, f in enumerate([root, root, fifth, root * 2]):
            starts = np.arange(0, STEM_DUR, cycle) + k * 0.35
            for s in starts:
                if s >= STEM_DUR:
                    break
                mix_at(out, pluck(f * (1 + rng.uniform(-0.002, 0.002)), 3.2, rng, 0.25), s, 0.35 if k else 0.5)
        out += 0.12 * sine_freq(root, n) + 0.06 * sine_freq(fifth, n)
    elif culture == "steppe":
        vib = 1.0 + 0.003 * np.sin(2 * math.pi * 0.15 * t)
        out = 0.45 * sine_freq(root * vib, n)
        out += 0.22 * sine_freq(root * 2 * vib, n)
        out += 0.12 * sine_freq(root * 3 * vib, n)
        out += 0.06 * sine_freq(root * 5 * vib, n)
        out *= 0.75 + 0.25 * np.sin(2 * math.pi * 0.07 * t)
    elif culture == "east_asia":
        out = 0.35 * sine_freq(root, n) + 0.18 * sine_freq(fifth, n)
        out += 0.08 * sine_freq(root * 2, n) * (0.5 + 0.5 * np.sin(2 * math.pi * 0.04 * t))
        out *= 0.7 + 0.3 * np.sin(2 * math.pi * 0.05 * t + 1.0)
    elif culture == "islamic":
        out = 0.4 * sine_freq(root, n) + 0.2 * sine_freq(fifth * 0.99, n)
        out += 0.1 * sine_freq(root * 2, n)
        out *= 0.8 + 0.2 * np.sin(2 * math.pi * 0.08 * t)
    else:
        out = 0.38 * sine_freq(root, n) + 0.2 * sine_freq(fifth, n)
        out += 0.1 * soft_clip(
            sine_freq(root, n) + 0.5 * sine_freq(fifth, n) + 0.25 * sine_freq(root * 2, n), 0.9
        )
        out *= 0.85 + 0.15 * np.sin(2 * math.pi * 0.06 * t)

    out += 0.05 * sine_freq(root * 0.5, n)
    return make_seamless(one_pole_lp(out, 1800), 0.12)


def gen_pulse(culture: str, rng: np.random.Generator) -> np.ndarray:
    n = int(STEM_DUR * SR)
    out = np.zeros(n)
    bpm = CULTURES[culture]["bpm"]

    if culture == "islamic":
        pattern = [1, 0.5, 0.5, 1.5, 1, 1]
        for t0 in beat_times(bpm, STEM_DUR, pattern):
            mix_at(out, frame_drum(0.35, rng, tone=160 + rng.uniform(-10, 20)), t0, rng.uniform(0.45, 0.75))
    elif culture == "east_asia":
        pattern = [2, 2, 3, 1]
        for i, t0 in enumerate(beat_times(bpm * 0.85, STEM_DUR, pattern)):
            if i % 3 == 2:
                continue
            nn = int(0.08 * SR)
            hit = one_pole_lp(noise(nn, rng), 900) * env_adsr(nn, 0.001, 0.02, 0.2, 0.03)
            hit += 0.4 * sine_freq(220, nn) * env_adsr(nn, 0.001, 0.02, 0.1, 0.05)
            mix_at(out, hit, t0, 0.55)
    elif culture == "steppe":
        pattern = [0.5, 0.5, 1.0]
        for i, t0 in enumerate(beat_times(bpm, STEM_DUR, pattern)):
            mix_at(out, low_drum(0.28, rng, tone=65 if i % 3 == 2 else 90), t0, 0.7 if i % 3 == 2 else 0.4)
    elif culture == "indian_ocean":
        pattern = [0.5, 0.5, 0.5, 0.5, 1, 0.5, 0.5]
        for i, t0 in enumerate(beat_times(bpm, STEM_DUR, pattern)):
            mix_at(out, frame_drum(0.22, rng, tone=200 + (i % 7) * 8), t0, 0.35 + 0.08 * (i % 7))
    else:
        pattern = [1, 1, 1, 1]
        for i, t0 in enumerate(beat_times(bpm, STEM_DUR, pattern)):
            mix_at(out, low_drum(0.3, rng, tone=80 if i % 4 == 0 else 110), t0, 0.55 if i % 4 == 0 else 0.3)

    return make_seamless(one_pole_lp(out, 3500), 0.06)


def gen_melody(culture: str, rng: np.random.Generator) -> np.ndarray:
    n = int(STEM_DUR * SR)
    out = np.zeros(n)
    freqs = scale_freqs(culture, 2)
    bpm = CULTURES[culture]["bpm"]
    spb = 60.0 / bpm

    def phrase_notes(length: int) -> list[int]:
        idx = len(freqs) // 4
        notes = []
        for _ in range(length):
            if culture == "islamic":
                step = int(rng.choice([-1, 0, 0, 1, 2, 3]))
            elif culture == "east_asia":
                step = int(rng.choice([-2, -1, 0, 0, 1, 2]))
            else:
                step = int(rng.choice([-2, -1, 0, 1, 1, 2]))
            idx = int(np.clip(idx + step, 0, len(freqs) - 1))
            notes.append(idx)
        return notes

    t = 0.0
    phrase_i = 0
    while t < STEM_DUR - 1.5:
        if culture == "east_asia" and phrase_i % 2 == 1:
            t += spb * rng.uniform(2.0, 4.0)
            phrase_i += 1
            continue
        notes = phrase_notes(int(rng.integers(4, 9)))
        for ni, nidx in enumerate(notes):
            dur = spb * float(rng.choice([0.5, 1.0, 1.0, 1.5, 2.0]))
            if culture == "islamic" and ni == len(notes) - 1:
                dur *= 1.6
            f = freqs[nidx]
            if culture in ("islamic", "indian_ocean", "latin"):
                frag = pluck(f, min(dur * 1.4, 2.5), rng, 0.4 if culture != "latin" else 0.3)
            elif culture == "east_asia":
                frag = (
                    flute(f, min(dur * 1.2, 2.8), 0.06, rng)
                    if rng.random() < 0.45
                    else pluck(f, min(dur * 1.5, 2.2), rng, 0.2)
                )
            else:
                frag = bow(f, min(dur * 1.3, 2.5), vibrato_hz=5.0, vibrato_cents=12)
            mix_at(out, frag, t, 0.55)
            t += dur
            if t >= STEM_DUR - 0.5:
                break
        t += spb * rng.uniform(0.5, 2.0)
        phrase_i += 1

    if culture == "latin":
        out += 0.28 * np.roll(out, int(0.01 * SR))

    return make_seamless(one_pole_lp(out, 4200), 0.1)


def gen_color(culture: str, rng: np.random.Generator) -> np.ndarray:
    n = int(STEM_DUR * SR)
    out = np.zeros(n)
    freqs = scale_freqs(culture, 2)
    root = freqs[0]
    t = rng.uniform(1.0, 3.0)
    while t < STEM_DUR - 1.0:
        kind = rng.random()
        if culture == "east_asia" and kind < 0.5:
            frag = bell_partial(root * 2 * float(rng.choice([1, 1.5, 2])), 3.5, 0.45)
        elif culture == "islamic" and kind < 0.4:
            frag = flute(freqs[int(rng.integers(2, len(freqs)))], 1.8, 0.1, rng) * 0.5
        elif culture == "steppe" and kind < 0.45:
            frag = flute(root * float(rng.choice([4, 5, 6])), 2.2, 0.15, rng) * 0.35
        elif culture == "indian_ocean" and kind < 0.4:
            frag = pluck(freqs[int(rng.integers(len(freqs) // 2, len(freqs)))], 1.4, rng, 0.55) * 0.5
        elif culture == "latin" and kind < 0.4:
            frag = bell_partial(root * 3, 2.8, 0.3)
        else:
            f = freqs[int(rng.integers(len(freqs) // 2, len(freqs)))]
            nn = int(1.5 * SR)
            frag = sine_freq(f, nn) * env_adsr(nn, 0.2, 0.3, 0.4, 0.6) * 0.25
            frag = frag + 0.15 * sine_freq(f * 2, nn)
        mix_at(out, frag, t, 1.0)
        t += rng.uniform(2.5, 6.5)

    t_arr = np.arange(n) / SR
    shimmer = 0.04 * sine_freq(root * 4, n) * (0.5 + 0.5 * np.sin(2 * math.pi * 0.11 * t_arr))
    out += one_pole_hp(shimmer, 1200)
    return make_seamless(out, 0.1)


def amb_wind_sand(rng: np.random.Generator, dur: float = 20.0) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = bandpass(noise(n, rng), 400, 0.4)
    x *= 0.55 + 0.45 * np.sin(2 * math.pi * 0.07 * t + rng.uniform(0, 3))
    gust = bandpass(noise(n, rng), 900, 0.7) * (0.3 + 0.3 * np.sin(2 * math.pi * 0.13 * t))
    return make_seamless(x * 0.7 + gust * 0.35, 0.5)


def amb_waves(rng: np.random.Generator, dur: float = 20.0) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    surf = one_pole_lp(noise(n, rng), 600)
    swell = 0.5 + 0.5 * np.sin(2 * math.pi * 0.08 * t) ** 2
    crash = one_pole_hp(noise(n, rng), 1500) * np.clip(np.sin(2 * math.pi * 0.08 * t), 0, 1) ** 3
    return make_seamless(surf * swell * 0.55 + crash * 0.25, 0.6)


def amb_ropes_mast(rng: np.random.Generator, dur: float = 16.0) -> np.ndarray:
    n = int(dur * SR)
    out = np.zeros(n)
    t = 0.0
    while t < dur:
        length = rng.uniform(0.3, 0.9)
        nn = int(length * SR)
        freqs = np.linspace(rng.uniform(180, 320), rng.uniform(90, 180), nn)
        creak = np.sin(2 * math.pi * np.cumsum(freqs) / SR) * env_adsr(nn, 0.05, 0.1, 0.5, 0.2)
        creak += 0.3 * bandpass(noise(nn, rng), 700, 1.0) * env_adsr(nn, 0.01, 0.05, 0.3, 0.2)
        mix_at(out, creak, t, rng.uniform(0.3, 0.55))
        t += rng.uniform(1.2, 3.5)
    return make_seamless(out + one_pole_lp(noise(n, rng), 200) * 0.08, 0.4)


def amb_market_crowd(rng: np.random.Generator, dur: float = 18.0) -> np.ndarray:
    n = int(dur * SR)
    out = bandpass(noise(n, rng), 450, 0.5) * 0.35 + bandpass(noise(n, rng), 900, 0.7) * 0.15
    t = 0.0
    while t < dur:
        nn = int(rng.uniform(0.15, 0.45) * SR)
        f = rng.uniform(220, 480)
        blip = (sine_freq(f, nn) + 0.4 * sine_freq(f * 1.6, nn)) * env_adsr(nn, 0.02, 0.05, 0.4, 0.1)
        mix_at(out, one_pole_lp(blip, 1200), t, rng.uniform(0.04, 0.1))
        t += rng.uniform(0.08, 0.35)
    return make_seamless(out, 0.5)


def amb_camel_bells(rng: np.random.Generator, dur: float = 16.0) -> np.ndarray:
    n = int(dur * SR)
    out = np.zeros(n)
    t = rng.uniform(0.5, 1.5)
    while t < dur:
        f = float(rng.choice([523.25, 587.33, 659.25, 698.46])) * rng.uniform(0.98, 1.02)
        frag = bell_partial(f, 2.0, 0.5)
        frag += 0.15 * one_pole_hp(noise(len(frag), rng), 2000) * env_adsr(len(frag), 0.001, 0.02, 0.05, 0.3)
        mix_at(out, frag, t, rng.uniform(0.25, 0.45))
        t += rng.uniform(1.4, 3.2)
    return make_seamless(out + bandpass(noise(n, rng), 300, 0.4) * 0.06, 0.4)


def amb_horse_hooves(rng: np.random.Generator, dur: float = 12.0) -> np.ndarray:
    n = int(dur * SR)
    out = np.zeros(n)
    pattern = [0.28, 0.28, 0.36]
    t, i = 0.0, 0
    while t < dur:
        nn = int(0.12 * SR)
        hit = one_pole_lp(noise(nn, rng), 500) * env_adsr(nn, 0.001, 0.02, 0.15, 0.06)
        hit += 0.35 * low_drum(0.12, rng, tone=100)[:nn]
        mix_at(out, hit, t, 0.55 if i % 3 == 2 else 0.35)
        t += pattern[i % 3] + rng.uniform(-0.02, 0.02)
        i += 1
    return make_seamless(out, 0.25)


def amb_river(rng: np.random.Generator, dur: float = 18.0) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = bandpass(noise(n, rng), 550, 0.55) * (0.7 + 0.3 * np.sin(2 * math.pi * 0.15 * t))
    return make_seamless(x * 0.5 + one_pole_hp(noise(n, rng), 3000) * 0.08, 0.5)


def amb_rain(rng: np.random.Generator, dur: float = 16.0) -> np.ndarray:
    n = int(dur * SR)
    out = one_pole_hp(noise(n, rng), 4000) * 0.1
    t = 0.0
    while t < dur:
        nn = int(0.03 * SR)
        d = bandpass(noise(nn, rng), 2500, 1.2) * env_adsr(nn, 0.001, 0.005, 0.1, 0.02)
        mix_at(out, d, t, rng.uniform(0.15, 0.4))
        t += rng.uniform(0.02, 0.08)
    return make_seamless(out + one_pole_lp(noise(n, rng), 800) * 0.12, 0.4)


def amb_fire(rng: np.random.Generator, dur: float = 14.0) -> np.ndarray:
    n = int(dur * SR)
    crackle = one_pole_hp(noise(n, rng), 2500)
    gate = one_pole_lp((rng.random(n) > 0.92).astype(np.float64), 30)
    low = one_pole_lp(noise(n, rng), 200) * 0.35
    return make_seamless(crackle * gate * 0.5 + low * 0.4, 0.35)


def amb_footsteps_echo(rng: np.random.Generator, dur: float = 12.0) -> np.ndarray:
    n = int(dur * SR)
    out = np.zeros(n)
    t = 0.0
    while t < dur - 0.5:
        nn = int(0.2 * SR)
        step = one_pole_lp(noise(nn, rng), 600) * env_adsr(nn, 0.002, 0.03, 0.2, 0.1)
        step += 0.2 * sine_freq(120, nn) * env_adsr(nn, 0.001, 0.02, 0.1, 0.08)
        mix_at(out, step, t, 0.5)
        mix_at(out, step, t + 0.28, 0.22)
        t += rng.uniform(0.85, 1.15)
    return make_seamless(out, 0.3)


def amb_dishes(rng: np.random.Generator, dur: float = 12.0) -> np.ndarray:
    n = int(dur * SR)
    out = np.zeros(n)
    t = rng.uniform(0.3, 1.0)
    while t < dur:
        f = rng.uniform(800, 2400)
        nn = int(rng.uniform(0.08, 0.25) * SR)
        clink = (sine_freq(f, nn) + 0.4 * sine_freq(f * 1.4, nn)) * env_adsr(nn, 0.001, 0.02, 0.15, 0.08)
        clink += 0.2 * one_pole_hp(noise(nn, rng), 3000) * env_adsr(nn, 0.001, 0.01, 0.05, 0.05)
        mix_at(out, clink, t, rng.uniform(0.25, 0.5))
        t += rng.uniform(0.6, 2.2)
    return make_seamless(out, 0.25)


def amb_seabirds(rng: np.random.Generator, dur: float = 16.0) -> np.ndarray:
    n = int(dur * SR)
    out = bandpass(noise(n, rng), 500, 0.4) * 0.08
    t = rng.uniform(1.0, 3.0)
    while t < dur - 1.0:
        length = rng.uniform(0.25, 0.7)
        nn = int(length * SR)
        freqs = np.linspace(rng.uniform(1800, 2800), rng.uniform(1200, 2000), nn)
        call = np.sin(2 * math.pi * np.cumsum(freqs) / SR) * env_adsr(nn, 0.02, 0.05, 0.5, 0.15)
        call = one_pole_hp(call, 800)
        mix_at(out, call, t, rng.uniform(0.2, 0.4))
        if rng.random() < 0.4:
            mix_at(out, call, t + 0.15, 0.25)
        t += rng.uniform(2.0, 5.0)
    return make_seamless(out, 0.4)


def _formant_voice(freq_contour: np.ndarray, rng: np.random.Generator, breath: float = 0.12) -> np.ndarray:
    """Blurred vocal-like bed: buzzing source through vowel formants — no phonemes."""
    n = len(freq_contour)
    # Saw-ish via summed harmonics of slow-varying f0
    phase = 2 * math.pi * np.cumsum(freq_contour) / SR
    src = (
        np.sin(phase)
        + 0.45 * np.sin(2 * phase)
        + 0.25 * np.sin(3 * phase)
        + 0.12 * np.sin(4 * phase)
    )
    src += breath * noise(n, rng)
    # Stack a few fixed formant bands (ah/oo-ish), heavily lowpassed → distant/blurred
    out = np.zeros(n)
    for center, q, g in ((520, 4.0, 0.55), (920, 5.0, 0.35), (2400, 3.0, 0.12)):
        out += g * bandpass(src, center, q)
    out = one_pole_lp(out, 1400)
    # Soft amplitude swell so it never sits as a hard "call"
    t = np.arange(n) / SR
    out *= 0.55 + 0.45 * (0.5 + 0.5 * np.sin(2 * math.pi * 0.05 * t))
    return soft_clip(out * 0.35, 0.9)


def amb_sacred_blur_islamic(rng: np.random.Generator, dur: float = 24.0) -> np.ndarray:
    """Adhān-contour gesture: slow Hijaz-ish leaps, distant and blurred — no words."""
    n = int(dur * SR)
    # Contour: long held tones with occasional rising call (not a real adhān melody)
    f0 = np.full(n, 220.0)
    t = 0.0
    while t < dur:
        # held
        hold = rng.uniform(2.5, 4.5)
        i0, i1 = int(t * SR), min(n, int((t + hold) * SR))
        f0[i0:i1] = midi(57 + float(rng.choice([0, 1, 4, 5])))  # around A3 + Hijaz colour
        t += hold
        if t >= dur:
            break
        # rising call
        rise = rng.uniform(1.2, 2.2)
        j0, j1 = int(t * SR), min(n, int((t + rise) * SR))
        if j1 > j0:
            f0[j0:j1] = np.linspace(midi(57), midi(64), j1 - j0)
        t += rise + rng.uniform(1.5, 3.0)
    # Smooth contour
    f0 = one_pole_lp(f0, 2.0)
    bed = _formant_voice(f0, rng, 0.1)
    space = one_pole_lp(noise(n, rng), 180) * 0.04
    return make_seamless(bed + space, 0.8)


def amb_sacred_blur_east_asia(rng: np.random.Generator, dur: float = 24.0) -> np.ndarray:
    """Sparse chant-like fifths / sustained tones — blurred, no liturgy text."""
    n = int(dur * SR)
    f0 = np.full(n, midi(55))
    t = 0.0
    while t < dur:
        note = midi(55 + float(rng.choice([0, 2, 4, 7, 9])))
        hold = rng.uniform(3.0, 6.0)
        i0, i1 = int(t * SR), min(n, int((t + hold) * SR))
        f0[i0:i1] = note
        t += hold + rng.uniform(1.0, 2.5)
    f0 = one_pole_lp(f0, 1.5)
    bed = _formant_voice(f0, rng, 0.06)
    # Soft bell air
    for _ in range(4):
        mix_at(bed, bell_partial(midi(67) * float(rng.choice([1, 1.5])), 3.0, 0.12), rng.uniform(2, dur - 3), 0.4)
    return make_seamless(bed, 0.8)


def amb_sacred_blur_latin(rng: np.random.Generator, dur: float = 24.0) -> np.ndarray:
    """Organum-ish parallel fifths, far choir blur — Dorian contour, no chant text."""
    n = int(dur * SR)
    f0 = np.full(n, midi(53))
    t = 0.0
    degrees = [0, 2, 3, 5, 7, 9, 10]
    while t < dur:
        deg = float(rng.choice(degrees))
        hold = rng.uniform(2.5, 5.0)
        i0, i1 = int(t * SR), min(n, int((t + hold) * SR))
        f0[i0:i1] = midi(53 + deg)
        t += hold + rng.uniform(0.4, 1.2)
    f0 = one_pole_lp(f0, 1.8)
    lower = _formant_voice(f0, rng, 0.08)
    upper = _formant_voice(f0 * 1.5, rng, 0.06)  # parallel fifth gesture
    return make_seamless(lower * 0.65 + upper * 0.45, 0.8)


def amb_sacred_blur_steppe(rng: np.random.Generator, dur: float = 24.0) -> np.ndarray:
    """Overtone-series whistle / distant throat-song colour — instrumentalized blur."""
    n = int(dur * SR)
    root = midi(48)
    t = np.arange(n) / SR
    # Drone + sweeping overtone partial emphasis
    bed = 0.3 * sine_freq(root, n)
    for k, g in ((2, 0.2), (3, 0.15), (4, 0.1), (5, 0.08), (6, 0.05)):
        wobble = 1.0 + 0.01 * np.sin(2 * math.pi * (0.07 + 0.02 * k) * t)
        bed += g * sine_freq(root * k * wobble, n) * (0.4 + 0.6 * (0.5 + 0.5 * np.sin(2 * math.pi * 0.04 * k * t)))
    bed = one_pole_lp(bed, 2000)
    voice = _formant_voice(np.full(n, root * 3), rng, 0.15) * 0.35
    return make_seamless(bed * 0.5 + voice, 0.8)


def amb_sacred_blur_indian_ocean(rng: np.random.Generator, dur: float = 24.0) -> np.ndarray:
    """Sustained tonal centre with slow melodic shadow — structural, not a named rāga."""
    n = int(dur * SR)
    root = midi(52)
    f0 = np.full(n, root * 2)
    t = 0.0
    scale = [0, 2, 3, 5, 7, 9, 10]
    while t < dur:
        deg = float(rng.choice(scale))
        hold = rng.uniform(2.0, 4.0)
        i0, i1 = int(t * SR), min(n, int((t + hold) * SR))
        if i1 > i0:
            start = f0[max(0, i0 - 1)] if i0 > 0 else root * 2
            f0[i0:i1] = np.linspace(start, midi(52 + 12 + deg), i1 - i0)
        t += hold
    f0 = one_pole_lp(f0, 2.0)
    bed = _formant_voice(f0, rng, 0.09)
    tanpura = 0.15 * sine_freq(root, n) + 0.08 * sine_freq(root * 1.5, n)
    return make_seamless(bed * 0.7 + tanpura, 0.8)


AMBIENTS = [
    ("wind_sand", amb_wind_sand),
    ("waves", amb_waves),
    ("ropes_mast", amb_ropes_mast),
    ("market_crowd", amb_market_crowd),
    ("camel_bells", amb_camel_bells),
    ("horse_hooves", amb_horse_hooves),
    ("river", amb_river),
    ("rain", amb_rain),
    ("fire", amb_fire),
    ("footsteps_echo", amb_footsteps_echo),
    ("dishes", amb_dishes),
    ("seabirds", amb_seabirds),
    # Blurred sacred-tonality beds (AUDIO_PLAN §1 allowed gestures)
    ("sacred_blur_islamic", amb_sacred_blur_islamic),
    ("sacred_blur_east_asia", amb_sacred_blur_east_asia),
    ("sacred_blur_latin", amb_sacred_blur_latin),
    ("sacred_blur_steppe", amb_sacred_blur_steppe),
    ("sacred_blur_indian_ocean", amb_sacred_blur_indian_ocean),
]

LAYERS = {
    "drone": gen_drone,
    "pulse": gen_pulse,
    "melody": gen_melody,
    "color": gen_color,
}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--only", choices=["stems", "ambient", "all"], default="all")
    ap.add_argument("--culture", default=None)
    args = ap.parse_args()

    print(f"SR={SR}  stems→{OUT_STEMS}  ambient→{OUT_AMB}")
    if args.only in ("stems", "all"):
        cultures = [args.culture] if args.culture else list(CULTURES)
        for culture in cultures:
            if culture not in CULTURES:
                print(f"unknown culture: {culture}", file=sys.stderr)
                return 1
            seed = abs(hash(f"fq-stem-{culture}")) % (2**32)
            rng = np.random.default_rng(seed)
            for layer, fn in LAYERS.items():
                print(f"  stem  {culture}/{layer} …", flush=True)
                layer_rng = np.random.default_rng(int(rng.integers(0, 2**32 - 1)))
                samples = fn(culture, layer_rng)
                path = OUT_STEMS / culture / f"{layer}.ogg"
                write_ogg(path, samples)
                print(f"         → {path.relative_to(ROOT)}  ({path.stat().st_size / 1024:.0f} KB)")

    if args.only in ("ambient", "all"):
        for name, fn in AMBIENTS:
            print(f"  ambient {name} …", flush=True)
            seed = abs(hash(f"fq-amb-{name}")) % (2**32)
            samples = fn(np.random.default_rng(seed))
            path = OUT_AMB / f"{name}.ogg"
            write_ogg(path, samples)
            print(f"         → {path.relative_to(ROOT)}  ({path.stat().st_size / 1024:.0f} KB)")

    man = ROOT / "assets" / "audio" / "MANIFEST.md"
    lines = [
        "# Audio assets",
        "",
        "Generated by `tools/audio/generate_all.py` per `docs/AUDIO_PLAN.md` §7.",
        "",
        "## Stems (5 cultures × 4 layers × 60s mono OGG ~96 kbps)",
        "",
        "| Culture | drone | pulse | melody | color |",
        "|---|---|---|---|---|",
    ]
    for c in CULTURES:
        cells = " | ".join(f"`stems/{c}/{L}.ogg`" for L in LAYERS)
        lines.append(f"| `{c}` | {cells} |")
    lines += ["", "## Ambient (12 loops)", "", "| File | Use |", "|---|---|"]
    for name, _ in AMBIENTS:
        lines.append(f"| `ambient/{name}.ogg` | scene bed / one-shot layer |")
    lines += [
        "",
        "## Notes",
        "",
        "- Scales are **secular gestures** (AUDIO_PLAN §1), not faithful maqām/rāga/chant.",
        "- No adhān, Qur'ān, liturgical chant, or sacred recitation.",
        "- Procedural UI SFX (bell, coin, dice, …) stay in `game/audio/` at runtime (§7.3).",
        "",
    ]
    man.parent.mkdir(parents=True, exist_ok=True)
    man.write_text("\n".join(lines), encoding="utf-8")
    print(f"\nWrote {man.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
