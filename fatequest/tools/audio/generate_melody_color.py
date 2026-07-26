#!/usr/bin/env python3
"""Richer melody + color stems (AUDIO_PLAN hybrid: keep synth drone/pulse).

Generates 5 cultures × (melody, color) × 60s seamless mono OGG ~96 kbps.
Uses improved additive / Karplus / bowed synthesis with culture-specific
phrase grammar — AI-assisted design, deterministic seeds.

Red lines: secular gestures only; no liturgical text or sacred recitation.

Usage:
  tools/audio/.venv/bin/python tools/audio/generate_melody_color.py
  tools/audio/.venv/bin/python tools/audio/generate_melody_color.py --culture east_asia
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

# Reuse helpers from generate_all where practical by local copy (standalone).
SR = 44100
STEM_DUR = 60.0
BITRATE = "96k"
ROOT = Path(__file__).resolve().parents[2]
OUT_STEMS = ROOT / "assets" / "audio" / "stems"


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
    cutoff = min(max(cutoff, 20.0), SR * 0.45)
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


def make_seamless(x: np.ndarray, fade: float = 0.1) -> np.ndarray:
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
    return out / peak * 0.82


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
        for cmd in (
            ["oggenc", "-Q", "-b", br, "-o", str(path), str(tmp_path)],
            [
                "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                "-i", str(tmp_path), "-c:a", "libvorbis", "-b:a", BITRATE, "-ac", "1",
                str(path),
            ],
        ):
            r = subprocess.run(cmd, capture_output=True, text=True)
            if r.returncode == 0 and path.exists() and path.stat().st_size > 0:
                return
        raise RuntimeError("ogg encode failed")
    finally:
        tmp_path.unlink(missing_ok=True)


def noise(n: int, rng: np.random.Generator) -> np.ndarray:
    return rng.standard_normal(n)


def sine_freq(freq: float | np.ndarray, n: int, phase0: float = 0.0) -> np.ndarray:
    if np.isscalar(freq):
        t = np.arange(n, dtype=np.float64) / SR
        return np.sin(2 * math.pi * float(freq) * t + phase0)
    phase = phase0 + 2 * math.pi * np.cumsum(np.asarray(freq, dtype=np.float64)) / SR
    return np.sin(phase)


def reverbish(x: np.ndarray, decay: float = 0.35, taps: int = 6) -> np.ndarray:
    out = x.copy()
    for i in range(1, taps + 1):
        d = int((0.029 * i + 0.011) * SR)
        g = decay ** i
        if d < len(out):
            out[d:] += g * x[: len(out) - d]
    return one_pole_lp(out, 6000)


def pluck_rich(freq: float, dur: float, rng: np.random.Generator, brightness: float = 0.4) -> np.ndarray:
    n = int(dur * SR)
    period = max(2, int(SR / max(freq, 20)))
    buf = rng.standard_normal(period)
    buf = 0.5 * (buf + np.roll(buf, 1))
    buf = one_pole_lp(buf, 1200 + brightness * 7000)
    reps = int(math.ceil(n / period)) + 1
    tiled = np.tile(buf, reps)[:n]
    sample_decay = np.exp(-np.arange(n) / SR * (1.8 + (1 - brightness) * 3.5))
    out = tiled * sample_decay
    # body resonance
    out += 0.12 * sine_freq(freq, n) * sample_decay
    out += 0.05 * sine_freq(freq * 2, n) * sample_decay
    return soft_clip(out * env_adsr(n, 0.002, 0.1, 0.4, min(0.5, dur * 0.45)))


def bow_rich(freq: float, dur: float, vibrato_hz: float = 5.0, vibrato_cents: float = 14.0) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    vib = 1.0 + (vibrato_cents / 1200.0) * np.sin(2 * math.pi * vibrato_hz * t)
    # richer harmonic stack (morin-khuur / vielle-ish)
    amps = [1.0, 0.55, 0.28, 0.14, 0.07, 0.04]
    out = np.zeros(n)
    for k, a in enumerate(amps, start=1):
        out += a * sine_freq(freq * k * vib, n, 0.2 * k)
    # bow noise
    out += 0.04 * bandpass(np.random.default_rng(int(freq * 10)).standard_normal(n), freq * 3, 0.8)
    return soft_clip(out * env_adsr(n, 0.15, 0.25, 0.75, 0.3), 1.05)


def flute_rich(freq: float, dur: float, breath: float, rng: np.random.Generator) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    vib = 1.0 + 0.005 * np.sin(2 * math.pi * 5.5 * t)
    tone = sine_freq(freq * vib, n) + 0.22 * sine_freq(freq * 2 * vib, n, 1.0)
    tone += 0.08 * sine_freq(freq * 3 * vib, n, 0.4)
    nse = bandpass(noise(n, rng), freq * 2.2, 0.7) * breath
    return soft_clip(tone * 0.8 + nse) * env_adsr(n, 0.06, 0.12, 0.55, 0.22)


def bell_rich(freq: float, dur: float, amp: float = 1.0) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    # inharmonic partials (bianzhong / church-bell gesture)
    partials = [(1.0, 1.0, 1.0), (2.76, 0.4, 1.7), (5.4, 0.18, 2.6), (8.2, 0.08, 3.4), (10.5, 0.04, 4.0)]
    out = np.zeros(n)
    for r, a, d in partials:
        out += a * np.sin(2 * math.pi * freq * r * t) * np.exp(-t * d * 1.8)
    return out * amp * env_adsr(n, 0.001, 0.06, 0.35, min(dur * 0.55, 2.5))


def tanpura_drone(freq: float, n: int) -> np.ndarray:
    t = np.arange(n) / SR
    jawari = 0.5 + 0.5 * np.sin(2 * math.pi * 0.9 * t) ** 2
    out = 0.4 * sine_freq(freq, n) + 0.25 * sine_freq(freq * 1.5, n)
    out += 0.15 * sine_freq(freq * 2, n) * jawari
    out += 0.08 * sine_freq(freq * 3, n)
    return one_pole_lp(out, 2500)


CULTURES = {
    "islamic": {
        "scale": [0, 1, 4, 5, 7, 8, 10],  # Hijaz colour
        "tonic_midi": 50,
        "bpm": 78,
        "melody_voice": "pluck_flute",
        "color_voice": "flute_bell",
    },
    "east_asia": {
        "scale": [0, 2, 4, 7, 9],
        "tonic_midi": 55,
        "bpm": 58,
        "melody_voice": "pluck_flute_sparse",
        "color_voice": "bell",
    },
    "steppe": {
        "scale": [0, 2, 4, 7, 9],
        "tonic_midi": 48,
        "bpm": 66,
        "melody_voice": "bow",
        "color_voice": "overtone",
    },
    "indian_ocean": {
        "scale": [0, 2, 3, 5, 7, 9, 10],
        "tonic_midi": 52,
        "bpm": 88,
        "melody_voice": "pluck_tanpura",
        "color_voice": "pluck_bright",
    },
    "latin": {
        "scale": [0, 2, 3, 5, 7, 9, 10],  # Dorian
        "tonic_midi": 53,
        "bpm": 66,
        "melody_voice": "pluck_organum",
        "color_voice": "bell_pipe",
    },
}


def scale_freqs(culture: str, octaves: int = 2) -> list[float]:
    c = CULTURES[culture]
    freqs = []
    for o in range(octaves):
        for d in c["scale"]:
            freqs.append(midi(c["tonic_midi"] + d + 12 * o))
    return freqs


def mix_at(out: np.ndarray, frag: np.ndarray, t0: float, gain: float = 1.0) -> None:
    i0 = int(t0 * SR)
    if i0 >= len(out):
        return
    i1 = min(len(out), i0 + len(frag))
    out[i0:i1] += frag[: i1 - i0] * gain


def gen_melody(culture: str, rng: np.random.Generator) -> np.ndarray:
    n = int(STEM_DUR * SR)
    out = np.zeros(n)
    freqs = scale_freqs(culture, 2)
    bpm = CULTURES[culture]["bpm"]
    spb = 60.0 / bpm
    voice = CULTURES[culture]["melody_voice"]
    root = freqs[0]

    if "tanpura" in voice:
        out += 0.22 * tanpura_drone(root, n)

    t = 0.0
    phrase_i = 0
    idx = len(freqs) // 4
    while t < STEM_DUR - 1.8:
        # east asia: leave air between phrases
        if "sparse" in voice and phrase_i % 2 == 1:
            t += spb * rng.uniform(2.5, 5.0)
            phrase_i += 1
            continue
        length = int(rng.integers(5, 11))
        for ni in range(length):
            if culture == "islamic":
                step = int(rng.choice([-1, 0, 0, 1, 2, 3, 4]))
            elif culture == "east_asia":
                step = int(rng.choice([-2, -1, 0, 0, 1, 2]))
            elif culture == "latin":
                step = int(rng.choice([-2, -1, 0, 1, 1, 2]))
            else:
                step = int(rng.choice([-2, -1, 0, 1, 1, 2]))
            idx = int(np.clip(idx + step, 0, len(freqs) - 1))
            dur = spb * float(rng.choice([0.5, 1.0, 1.0, 1.5, 2.0, 2.5]))
            if culture == "islamic" and ni == length - 1:
                dur *= 1.7
            f = freqs[idx]
            if voice == "bow":
                frag = bow_rich(f, min(dur * 1.4, 3.0), vibrato_hz=5.2, vibrato_cents=16)
            elif "flute" in voice and rng.random() < (0.55 if culture == "east_asia" else 0.35):
                frag = flute_rich(f, min(dur * 1.3, 3.2), 0.07, rng)
            else:
                frag = pluck_rich(f, min(dur * 1.5, 2.8), rng, 0.45 if culture != "latin" else 0.32)
            mix_at(out, frag, t, 0.58)
            if "organum" in voice and rng.random() < 0.55:
                # parallel fifth gesture
                mix_at(out, pluck_rich(f * 1.5, min(dur * 1.3, 2.4), rng, 0.25), t, 0.28)
            t += dur
            if t >= STEM_DUR - 0.4:
                break
        t += spb * rng.uniform(0.6, 2.2)
        phrase_i += 1

    out = reverbish(out, decay=0.4 if culture != "east_asia" else 0.28, taps=7)
    return make_seamless(one_pole_lp(out, 5200), 0.12)


def gen_color(culture: str, rng: np.random.Generator) -> np.ndarray:
    n = int(STEM_DUR * SR)
    out = np.zeros(n)
    freqs = scale_freqs(culture, 2)
    root = freqs[0]
    voice = CULTURES[culture]["color_voice"]
    t = rng.uniform(1.0, 3.5)

    while t < STEM_DUR - 1.2:
        kind = rng.random()
        if voice == "bell" or (voice.startswith("flute_bell") and kind < 0.55) or (voice == "bell_pipe" and kind < 0.5):
            f = root * float(rng.choice([2, 3, 4, 1.5, 2.5]))
            frag = bell_rich(f, rng.uniform(2.5, 4.5), 0.5)
        elif voice == "overtone":
            # whistling partial over a held fundamental
            hold = rng.uniform(2.0, 3.5)
            nn = int(hold * SR)
            partial = float(rng.choice([4, 5, 6, 7]))
            frag = flute_rich(root * partial, hold, 0.18, rng) * 0.55
            frag += 0.15 * sine_freq(root, nn) * env_adsr(nn, 0.2, 0.3, 0.6, 0.4)
        elif voice == "pluck_bright":
            f = freqs[int(rng.integers(len(freqs) // 2, len(freqs)))]
            frag = pluck_rich(f, rng.uniform(1.0, 1.8), rng, 0.65) * 0.7
        elif voice == "flute_bell":
            f = freqs[int(rng.integers(2, len(freqs)))]
            frag = flute_rich(f, rng.uniform(1.5, 2.4), 0.1, rng) * 0.55
        else:  # bell_pipe leftover
            f = root * 3
            frag = bell_rich(f, 3.0, 0.35)
            if rng.random() < 0.4:
                nn = len(frag)
                frag += 0.2 * soft_clip(sine_freq(root, nn) + 0.5 * sine_freq(root * 1.5, nn)) * env_adsr(nn, 0.3, 0.4, 0.5, 0.8)
        mix_at(out, frag, t, 1.0)
        t += rng.uniform(2.8, 7.0)

    # high shimmer bed
    t_arr = np.arange(n) / SR
    shimmer = 0.035 * sine_freq(root * 4, n) * (0.5 + 0.5 * np.sin(2 * math.pi * 0.09 * t_arr))
    out += one_pole_hp(shimmer, 1400)
    out = reverbish(out, decay=0.45, taps=8)
    return make_seamless(out, 0.12)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--culture", default=None)
    args = ap.parse_args()
    cultures = [args.culture] if args.culture else list(CULTURES)
    for culture in cultures:
        if culture not in CULTURES:
            print(f"unknown culture {culture}", file=sys.stderr)
            return 1
        seed = abs(hash(f"fq-mc-{culture}-v2")) % (2**32)
        rng = np.random.default_rng(seed)
        for layer, fn in (("melody", gen_melody), ("color", gen_color)):
            print(f"  {culture}/{layer} …", flush=True)
            layer_rng = np.random.default_rng(int(rng.integers(0, 2**32 - 1)))
            samples = fn(culture, layer_rng)
            path = OUT_STEMS / culture / f"{layer}.ogg"
            write_ogg(path, samples)
            print(f"    → {path.relative_to(ROOT)} ({path.stat().st_size / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
