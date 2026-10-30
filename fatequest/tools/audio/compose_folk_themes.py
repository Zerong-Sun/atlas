#!/usr/bin/env python3
"""Regional songbook command-line entry point.

Earlier draft scores and synth voices below are inactive design history.
The current renderer is compose_regional_songbook.py.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
from functools import lru_cache
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 44_100
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets/audio/folk"
SITAR_SAMPLES = ROOT / "tools/audio/samples/sitar"
GUQIN_SAMPLE = ROOT / "tools/audio/samples/guqin/Zheng_diao.ogg"
SITAR_KEYS = {62: 16, 64: 17, 65: 18, 67: 19, 69: 20, 71: 21,
              72: 22, 74: 23, 76: 24, 77: 25, 79: 26}
# Measured onsets and fundamentals of Charlie Huang's public-domain open
# string scale recording. A zone ends before the next pluck; no composition
# fragment is replayed as a loop.
GUQIN_ZONES = ((0.15, 1.48, 127.3), (1.62, 2.83, 143.5),
               (2.98, 4.18, 170.6), (4.31, 5.53, 96.0),
               (5.67, 6.82, 107.9), (6.94, 8.10, 127.8),
               (8.23, 9.48, 144.1))

# Tokens are scale-degree/duration-in-beats. A dash is a deliberate rest.
# The score file gives every arrangement exactly eight bars at its own meter.
THEMES = json.loads(Path(__file__).with_name("folk_scores.json").read_text(encoding="utf-8"))


def midi(number: int) -> float:
    return 440.0 * 2 ** ((number - 69) / 12)


def pitch(theme: dict, degree: int) -> float:
    scale = theme["scale"]
    return midi(theme["tonic"] + scale[degree % len(scale)] + 12 * (degree // len(scale)))


def parse_bars(theme: dict, arrangement: str) -> list[list[tuple[float, int | None, float]]]:
    parsed = []
    for row in theme["melodies"][arrangement]:
        notes = []
        at = 0.0
        for token in row.split():
            degree, duration = token.split("/")
            beats = float(duration)
            notes.append((at, None if degree == "-" else int(degree), beats))
            at += beats
        if not math.isclose(at, float(theme["beats_per_bar"])):
            raise ValueError(f"bar has {at} beats: {row}")
        parsed.append(notes)
    if len(parsed) != 8:
        raise ValueError("a theme needs exactly eight bars")
    return parsed


def validate_scores() -> None:
    if len(THEMES) != 5 or len({tuple(t["scale"]) for t in THEMES.values()}) != 5:
        raise ValueError("five distinct modal pitch sets are required")
    for culture, theme in THEMES.items():
        versions = []
        for arrangement in ("town", "road", "quiet"):
            parse_bars(theme, arrangement)
            versions.append(tuple(theme["melodies"][arrangement]))
        if len(set(versions)) != 3:
            raise ValueError(f"{culture}: scene melodies must differ")


def validate_samples() -> None:
    sitar_manifest = json.loads((SITAR_SAMPLES / "SOURCE.json").read_text())
    if sitar_manifest["license"] != "CC0":
        raise ValueError("sitar source license changed")
    for record in sitar_manifest["files"]:
        data = (SITAR_SAMPLES / record["file"]).read_bytes()
        if hashlib.sha256(data).hexdigest() != record["sha256"]:
            raise ValueError(f"sitar source hash mismatch: {record['file']}")
    guqin_manifest = json.loads(GUQIN_SAMPLE.with_name("SOURCE.json").read_text())
    if not guqin_manifest["license"].startswith("public domain"):
        raise ValueError("guqin source license changed")
    if hashlib.sha256(GUQIN_SAMPLE.read_bytes()).hexdigest() != guqin_manifest["sha256"]:
        raise ValueError("guqin source hash mismatch")


@lru_cache(maxsize=None)
def sitar_source(key: int) -> np.ndarray:
    path = SITAR_SAMPLES / f"Str{SITAR_KEYS[key]:02d}.flac"
    samples, sr = sf.read(path, dtype="float32")
    if sr != SR:
        raise ValueError(f"unexpected sitar sample rate: {path}")
    return samples.mean(axis=1) if samples.ndim == 2 else samples


def sampled_sitar(freq: float, duration: float) -> np.ndarray:
    """Render a note from Dr. Raikar's CC0 recorded sitar key zones."""
    target = round(69 + 12 * math.log2(freq / 440.0))
    source_key = min(SITAR_KEYS, key=lambda key: abs(key - target))
    source = sitar_source(source_key)
    ratio = 2 ** ((target - source_key) / 12)
    count = max(1, round(duration * SR))
    positions = np.arange(count) * ratio
    note = np.interp(positions, np.arange(len(source)), source, right=0).astype(np.float64)
    release = round(.075 * SR)
    note[-min(release, count):] *= np.linspace(1, 0, min(release, count))
    return note * 1.25


@lru_cache(maxsize=None)
def guqin_source(zone: int) -> np.ndarray:
    recording, sr = sf.read(GUQIN_SAMPLE, dtype="float32")
    if sr != SR:
        raise ValueError("unexpected guqin sample rate")
    if recording.ndim == 2:
        recording = recording.mean(axis=1)
    start, end, _ = GUQIN_ZONES[zone]
    note = recording[round(start * SR):round(end * SR)].astype(np.float64)
    note -= np.mean(note)
    return note / max(np.max(np.abs(note)), .01)


def sampled_guqin(freq: float, duration: float) -> np.ndarray:
    zone = min(range(len(GUQIN_ZONES)), key=lambda i: abs(math.log2(freq / GUQIN_ZONES[i][2])))
    source = guqin_source(zone)
    ratio = freq / GUQIN_ZONES[zone][2]
    count = max(1, round(duration * SR))
    positions = np.arange(count) * ratio
    note = np.interp(positions, np.arange(len(source)), source, right=0)
    release = round(.075 * SR)
    note[-min(release, count):] *= np.linspace(1, 0, min(release, count))
    return note * .85


def tone(freq: float, duration: float, voice: str, rng: np.random.Generator) -> np.ndarray:
    if voice == "sitar":
        return sampled_sitar(freq, duration)
    if voice == "guqin":
        return sampled_guqin(freq, duration)
    n = max(1, round(duration * SR))
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # Instrument-specific start transients matter more than a generic EQ swap.
    if voice in ("oud_synth", "pipa_synth", "lute_synth", "tanpura_synth"):
        if voice == "oud_synth":
            harmonics, decay, detune, slide = (1, .48, .19, .08), 4.0, .0025, 0.0
        elif voice == "pipa_synth":
            harmonics, decay, detune, slide = (1, .64, .48, .23, .12), 5.5, 0.0, 0.0
        elif voice == "tanpura_synth":
            harmonics, decay, detune, slide = (1, .58, .37, .23, .15), 1.9, .003, 0.0
        else:
            harmonics, decay, detune, slide = (1, .42, .31, .18), 3.1, 0.0, 0.0
        # A short pitch scoop imitates a string pulled into pitch. A second
        # slightly detuned course creates the oud/tanpura beating character.
        phase = 2 * math.pi * freq * t + 2 * math.pi * freq * (2 ** (slide / 12) - 1) * .045 * (1 - np.exp(-t / .045))
        wave = sum(w * np.sin((i + 1) * phase + .16 * i) for i, w in enumerate(harmonics))
        if detune:
            wave += .32 * sum(w * np.sin((i + 1) * phase * (1 + detune)) for i, w in enumerate(harmonics[:3]))
        if voice == "pipa_synth":
            wave *= 1 + .17 * np.exp(-np.maximum(t - .19, 0) * 45) * (t >= .19)
        attack = .003 if voice == "pipa_synth" else .009
        env = (1 - np.exp(-t / attack)) * np.exp(-t * decay)
        pick = (.028 if voice == "lute_synth" else .045) * noise * np.exp(-t * 100)
        wave = wave * env + pick
    elif voice in ("morin_synth", "vielle_synth"):
        vibrato = .0055 if voice == "morin_synth" else .003
        phase = 2 * math.pi * freq * t + vibrato * freq * np.sin(2 * math.pi * 5.1 * t)
        partials = (1, .82, .42, .31, .20, .11) if voice == "morin_synth" else (1, .55, .34, .16)
        wave = sum(w * np.sin((i + 1) * phase + i * .07) for i, w in enumerate(partials))
        bow = .052 if voice == "morin_synth" else .025
        bow_air = np.convolve(noise, np.ones(7) / 7, mode="same")
        wave = np.tanh(1.15 * wave) + bow * bow_air * (1 - np.exp(-t / .065))
        env = (1 - np.exp(-t / (.08 if voice == "morin_synth" else .055))) * np.exp(-t * .25)
        wave *= env
    elif voice in ("ney_synth", "dizi_synth", "bansuri_synth", "recorder_synth"):
        phase = 2 * math.pi * freq * t + .16 * np.sin(2 * math.pi * (4.5 if voice == "ney_synth" else 5.2) * t)
        partials = {
            "ney_synth": (1, .14, .07), "dizi_synth": (1, .38, .27, .12),
            "bansuri_synth": (1, .22, .08), "recorder_synth": (1, .49, .12, .06),
        }[voice]
        wave = sum(w * np.sin((i + 1) * phase) for i, w in enumerate(partials))
        breath = .06 if voice == "ney_synth" else (.045 if voice == "dizi_synth" else .022)
        breath_air = np.convolve(noise, np.ones(11) / 11, mode="same")
        wave += breath * breath_air
        env = (1 - np.exp(-t / (.085 if voice == "ney_synth" else .045))) * np.exp(-t * .23)
        wave *= env
    else:
        raise ValueError(f"unknown voice: {voice}")
    release = .095 if voice in ("morin_synth", "vielle_synth", "ney_synth", "dizi_synth", "bansuri_synth", "recorder_synth") else .035
    wave *= np.minimum(1.0, np.maximum(0.0, duration - t) / release)
    return wave


def tick(duration: float, color: str, rng: np.random.Generator) -> np.ndarray:
    n = max(1, round(duration * SR))
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    if color == "riq":
        return (.55 * np.sin(2 * math.pi * 620 * t) + .25 * noise) * np.exp(-t * 42)
    if color == "wood":
        return (np.sin(2 * math.pi * 930 * t) + .12 * noise) * np.exp(-t * 70)
    if color == "hoof":
        return (np.sin(2 * math.pi * 250 * t) + .22 * noise) * np.exp(-t * 51)
    if color == "tabla":
        return (np.sin(2 * math.pi * (310 * t + 95 * t * np.exp(-t * 48))) + .16 * noise) * np.exp(-t * 43)
    return (np.sin(2 * math.pi * 490 * t) + .1 * noise) * np.exp(-t * 62)


def add(out: np.ndarray, sound: np.ndarray, at: float, gain: float) -> None:
    begin = round(at * SR)
    end = min(begin + len(sound), len(out))
    if end > begin:
        out[begin:end] += gain * sound[:end - begin]


def compose(culture: str, theme: dict, arrangement: str) -> np.ndarray:
    beat = 60.0 / theme["bpm"]
    duration = 8 * theme["beats_per_bar"] * beat
    out = np.zeros(round(duration * SR), dtype=np.float64)
    voice = theme["voices"][arrangement]
    rng = np.random.default_rng(20261025 + list(THEMES).index(culture) * 13 + ("town", "road", "quiet").index(arrangement))
    for bar, notes in enumerate(parse_bars(theme, arrangement)):
        base = bar * theme["beats_per_bar"] * beat
        for offset, degree, length in notes:
            if degree is None:
                continue
            note_length = length * beat * (.98 if arrangement == "quiet" else .88)
            lead_pitch = pitch(theme, degree)
            if culture == "east_asia" and arrangement in ("road", "quiet"):
                lead_pitch *= 2  # road guqin/quiet flute occupy a higher register
            add(out, tone(lead_pitch, note_length, voice, rng),
                base + offset * beat, .30 if arrangement != "quiet" else .27)
        # Each place has its own response/rhythm, entirely above rumble range.
        tonic = pitch(theme, 0)
        fifth = tonic * 1.5
        if culture == "islamic":
            if arrangement != "quiet":
                for pulse in ((0, 2.5) if arrangement == "town" else (0, 1.5, 2.5, 3.5)):
                    add(out, tick(.11, "riq", rng), base + pulse * beat, .075)
                add(out, tone(fifth, .30, "oud_synth", rng), base + 2 * beat, .055)
        elif culture == "east_asia":
            if arrangement == "town" and bar % 2 == 0:
                add(out, tone(fifth, .55, "guqin", rng), base + 2 * beat, .045)
            elif arrangement == "road":
                for pulse in (0, 2.5):
                    add(out, tick(.08, "wood", rng), base + pulse * beat, .055)
        elif culture == "steppe":
            if arrangement != "quiet":
                for pulse in ((0, 1.5, 2.5) if arrangement == "road" else (0, 2.5)):
                    add(out, tick(.10, "hoof", rng), base + pulse * beat, .08)
            if bar % 2 == 0:
                add(out, tone(fifth, 1.15 * beat, "morin_synth", rng), base, .05)
        elif culture == "indian_ocean":
            if bar % 2 == 0:
                add(out, tone(tonic, .75, "tanpura_synth", rng), base, .05)
                add(out, tone(fifth, .75, "tanpura_synth", rng), base + beat, .035)
            if arrangement == "road":
                for pulse in (0, 1.5, 3):
                    add(out, tick(.11, "tabla", rng), base + pulse * beat, .06)
        else:  # Latin: light parallel fifth and a distinct 1-3-4 road pattern.
            if arrangement != "quiet":
                add(out, tone(fifth, .48, "lute_synth", rng), base + beat, .045)
            if arrangement == "road":
                for pulse in (0, 1, 2):
                    add(out, tick(.09, "wood", rng), base + pulse * beat, .045)
    # Fade only the splice. The bar-8 cadence and bar-1 opening stay distinct.
    fade = round(.09 * SR)
    out[:fade] *= np.linspace(0, 1, fade)
    out[-fade:] *= np.linspace(1, 0, fade)
    # Recorded plucks are naturally much less dense than held synthetic notes.
    # Match scene loudness without crushing their attacks; quiet scenes stay softer.
    target_rms = .075 if arrangement == "quiet" else .11
    rms = max(float(np.sqrt(np.mean(out * out))), 1e-9)
    peak = max(float(np.max(np.abs(out))), 1e-9)
    out *= min(target_rms / rms, .72 / peak)
    return out.astype(np.float32)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--culture", choices=THEMES)
    parser.add_argument("--validate-only", action="store_true")
    args = parser.parse_args()
    from compose_regional_songbook import main as build_songbook, validate_sources as validate_songbook
    validate_songbook()
    if args.validate_only:
        print("regional songbook sources: valid")
        return
    build_songbook(args.culture)


if __name__ == "__main__":
    main()
