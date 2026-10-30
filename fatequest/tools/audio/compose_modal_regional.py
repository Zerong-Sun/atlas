#!/usr/bin/env python3
"""Render five original modal eight-bar themes as separate regional cues.

Source performances provide isolated instrument attacks only. No existing
performance phrase is copied into an output. The title theme is never read or
written by this script.
"""
from __future__ import annotations

import math
import sys
from functools import lru_cache
from pathlib import Path

import numpy as np

from compose_regional_songbook import (OUT, SOURCES, SR, audio, clean, cut,
                                       fft_resample, midi, place, write_vorbis)

# Four beats per row; dashes are real rests. The answer melody (B) is not a
# transposition of A. These are short game pieces inspired by modal behaviour,
# not claims of authentic traditional composition or performance.
SCORES = {
    "east_asia": {
        "bpm": 92, "mode": {"G", "A", "B", "D", "E"},
        "a": [
            "G4:1 B4:.5 D5:.5 B4:1 A4:1", "G4:2 -:1 D5:1",
            "G4:1 B4:.5 D5:.5 B4:1 A4:1", "E5:1 D5:1 B4:1 G4:1",
            "B4:1 D5:.5 E5:.5 D5:2", "B4:1 A4:1 G4:2",
            "G4:1 B4:.5 D5:.5 A4:1 B4:1", "A4:1 G4:3",
        ],
        "b": [
            "D5:1 E5:.5 D5:.5 B4:2", "A4:1 B4:1 G4:2",
            "D5:1 E5:.5 D5:.5 B4:2", "A4:1 G4:1 B4:2",
            "G4:1 A4:1 D5:2", "E5:1 D5:1 B4:2",
            "D5:1 E5:.5 D5:.5 A4:1 B4:1", "A4:1 G4:3",
        ],
    },
    "islamic": {
        "bpm": 86, "mode": {"D", "Eb", "F#", "G", "A", "Bb", "C"},
        "a": [
            "D4:1 Eb4:.5 F#4:.5 G4:2", "F#4:1 Eb4:1 D4:2",
            "D4:1 Eb4:.5 F#4:.5 G4:2", "A4:1 G4:1 F#4:2",
            "G4:.5 A4:.5 Bb4:1 A4:2", "G4:1 F#4:1 Eb4:2",
            "D4:1 Eb4:.5 F#4:.5 G4:1 Eb4:1", "F#4:1 D4:3",
        ],
        "b": [
            "G4:1 F#4:.5 Eb4:.5 D4:2", "Eb4:1 F#4:1 G4:2",
            "G4:1 F#4:.5 Eb4:.5 D4:2", "A4:1 G4:1 F#4:2",
            "G4:1 A4:.5 Bb4:.5 C5:2", "Bb4:1 A4:1 G4:2",
            "G4:1 F#4:.5 Eb4:.5 D4:1 G4:1", "Eb4:1 D4:3",
        ],
    },
    "steppe": {
        "bpm": 84, "mode": {"D", "F", "G", "A", "C"},
        "a": [
            "D4:2 A4:1 G4:1", "F4:1 G4:1 D4:2",
            "D4:2 A4:1 G4:1", "A4:1 G4:1 F4:2",
            "F4:1 G4:1 A4:2", "A4:1 G4:1 F4:2",
            "D4:2 A4:1 F4:1", "G4:1 D4:3",
        ],
        "b": [
            "A4:1 G4:1 F4:2", "G4:1 F4:1 D4:2",
            "A4:1 G4:1 F4:2", "D4:2 F4:1 G4:1",
            "A4:2 G4:1 F4:1", "G4:1 A4:1 G4:2",
            "A4:1 G4:1 F4:1 D4:1", "F4:1 D4:3",
        ],
    },
    "indian_ocean": {
        "bpm": 86, "mode": {"C", "Db", "E", "F", "G", "Ab", "B"},
        "a": [
            "C4:1 Db4:.5 E4:1 F4:.5 E4:1", "Db4:1 C4:3",
            "C4:1 Db4:.5 E4:1 F4:.5 E4:1", "G4:2 F4:1 E4:1",
            "E4:1 F4:.5 G4:.5 Ab4:2", "G4:1 F4:1 E4:2",
            "C4:1 Db4:.5 E4:1 F4:.5 Db4:1", "E4:1 C4:3",
        ],
        "b": [
            "G4:1 Ab4:1 G4:.5 F4:.5 E4:1", "Db4:1 C4:3",
            "G4:1 Ab4:1 G4:.5 F4:.5 E4:1", "E4:2 F4:1 G4:1",
            "Ab4:1 B4:.5 Ab4:.5 G4:2", "F4:1 E4:1 Db4:2",
            "G4:1 Ab4:1 G4:.5 E4:.5 Db4:1", "E4:1 C4:3",
        ],
    },
    "latin": {
        "bpm": 102, "mode": {"D", "E", "F", "G", "A", "B", "C"},
        "a": [
            "D5:.5 F5:.5 G5:1 F5:1 D5:1", "E5:1 F5:1 D5:2",
            "D5:.5 F5:.5 G5:1 F5:1 D5:1", "C5:1 E5:1 D5:2",
            "F5:1 G5:.5 A5:.5 G5:2", "F5:1 E5:1 D5:2",
            "D5:.5 F5:.5 G5:1 B4:1 C5:1", "C5:1 D5:3",
        ],
        "b": [
            "F5:1 E5:.5 D5:.5 C5:2", "E5:1 D5:1 A4:2",
            "F5:1 E5:.5 D5:.5 C5:2", "D5:1 E5:1 F5:2",
            "G5:1 A5:.5 G5:.5 F5:2", "E5:1 D5:1 C5:2",
            "F5:1 E5:.5 D5:.5 B4:1 C5:1", "C5:1 D5:3",
        ],
    },
}

SCENES = {"town": (1.0, .82), "road": (1.08, .96), "quiet": (.90, .5)}
# East Asia, West Asia and Steppe were withdrawn after listening review.
# Their historical score sketches remain above, but must not be rendered into
# live game assets by a normal build or an explicit CLI selection.
ACTIVE_CULTURES = ("indian_ocean", "latin")


def notes(row: str) -> list[tuple[float, str, float]]:
    at = 0.0
    events = []
    for item in row.split():
        name, length_text = item.split(":")
        length = float(length_text)
        if name != "-":
            events.append((at, name, length))
        at += length
    if abs(at - 4) > 1e-8:
        raise ValueError(f"bar has {at} beats: {row}")
    return events


def filtered_sample(path: Path, start: float, seconds: float, cutoff: float = 85) -> np.ndarray:
    source = audio(str(path))
    x = source[round(start * SR):round((start + seconds) * SR)].copy()
    if len(x) < SR // 4:
        raise ValueError(f"short sample: {path}")
    x = clean(x, cutoff)
    # A gentle treble roll-off reduces codec hiss without removing the pluck.
    f = np.fft.rfftfreq(len(x), 1 / SR)
    spectrum = np.fft.rfft(x)
    spectrum *= 1 / np.sqrt(1 + (f / 11500) ** 6)
    x = np.fft.irfft(spectrum, len(x))
    attack = min(int(.008 * SR), len(x) // 8)
    release = min(int(.12 * SR), len(x) // 5)
    x[:attack] *= np.linspace(0, 1, attack)
    x[-release:] *= np.linspace(1, 0, release)
    return x / max(float(np.max(np.abs(x))), .01)


def extend_gu_zither_ring(x: np.ndarray, source_key: int) -> np.ndarray:
    """Give an isolated short pluck a quiet harmonic decay, without replaying
    the following source attacks or stretching the pitch of the attack.
    """
    source_length = len(x) / SR
    target_length = 1.32
    hz = 440 * 2 ** ((source_key - 69) / 12)
    fit_start = max(0.08, source_length - .21)
    fit_end = source_length - .07
    segment = x[round(fit_start * SR):round(fit_end * SR)]
    t_fit = np.arange(len(segment)) / SR + fit_start
    t_ref = (fit_start + fit_end) / 2
    t = np.arange(round(target_length * SR)) / SR
    tail = np.zeros(len(t), dtype=np.float64)
    for harmonic in range(1, 9):
        phase = 2 * np.pi * harmonic * hz * t_fit
        coefficient = 2 * np.mean(segment * np.exp(-1j * phase))
        tail += np.real(coefficient * np.exp(1j * 2 * np.pi * harmonic * hz * t))
    tail *= np.exp(-5.0 * np.maximum(t - t_ref, 0))
    overlap = min(round(.08 * SR), len(x) // 4)
    begin = len(x) - overlap
    ramp = np.linspace(0, 1, overlap)
    out = tail
    out[:begin] = x[:begin]
    out[begin:len(x)] = x[begin:] * (1 - ramp) + tail[begin:len(x)] * ramp
    fade = round(.12 * SR)
    out[-fade:] *= np.linspace(1, 0, fade)
    return out


@lru_cache(maxsize=160)
def pluck(culture: str, target: int, variation: int) -> np.ndarray:
    if culture == "east_asia":
        # The old 2.8-second slices contained several plucks. End each zone
        # before the next measured onset (0.53s and 7.80s respectively).
        start, length, source_key = (.08, .40, 69) if target >= 69 else (7.45, .31, 67)
        x = filtered_sample(SOURCES / "china/guzheng_nanliu.mp3", start, length, 85)
        x = extend_gu_zither_ring(x, source_key)
    elif culture == "islamic":
        # The next risha strike begins about .35s later. The former .90s
        # slice unintentionally included several extra notes.
        source_key = 59
        x = filtered_sample(SOURCES / "oud/maqam_saba.wav", 31.58, .33, 90)
    elif culture == "steppe":
        # This pluck is isolated until about .35s; the former .78s slice
        # caught the next stroke and made every scored note a miniature riff.
        source_key = 61
        x = filtered_sample(SOURCES / "tovshuur/paidang_sabardang.wav", 31.95, .34, 90)
    elif culture == "indian_ocean":
        # The CC0 FLAC sitar library has separate key zones; use the nearest.
        keys = {62: 16, 64: 17, 65: 18, 67: 19, 69: 20, 71: 21,
                72: 22, 74: 23, 76: 24, 77: 25, 79: 26}
        source_key = min(keys, key=lambda k: abs(k - target))
        x = filtered_sample(SOURCES / f"sitar/Str{keys[source_key]:02d}.flac", 0, 2.2, 70)
    else:
        raise ValueError(culture)
    factor = 2 ** ((target - source_key) / 12)
    return fft_resample(x, round(len(x) / factor))


@lru_cache(maxsize=80)
def recorder(target: int) -> np.ndarray:
    samples = {66: "fs4", 70: "bb4", 72: "c5", 74: "d5", 76: "e5"}
    key = min(samples, key=lambda k: abs(k - target))
    x = filtered_sample(SOURCES / f"songbook/recorder_sustain_{samples[key]}.wav", 0, 2.6, 160)
    return fft_resample(x, round(len(x) / (2 ** ((target - key) / 12))))


@lru_cache(maxsize=80)
def psaltery(target: int) -> np.ndarray:
    samples = {66: "fs4", 70: "bb4", 72: "c5", 74: "d5"}
    key = min(samples, key=lambda k: abs(k - target))
    x = filtered_sample(SOURCES / f"songbook/psaltery_{samples[key]}.wav", 0, 2.3, 95)
    return fft_resample(x, round(len(x) / (2 ** ((target - key) / 12))))


def shape_sustain(x: np.ndarray, seconds: float) -> np.ndarray:
    count = max(1, min(len(x), round(seconds * SR)))
    y = x[:count].copy()
    tail = min(round(.11 * SR), len(y) // 3)
    y[-tail:] *= np.linspace(1, 0, tail)
    return y


def shape_pluck(x: np.ndarray, length_beats: float, beat: float) -> np.ndarray:
    """Keep a small natural overlap, then clear the next melodic attack."""
    seconds = min(1.55, max(.62, length_beats * beat + .20))
    count = max(1, min(len(x), round(seconds * SR)))
    y = x[:count].copy()
    tail = min(round(.17 * SR), len(y) // 3)
    y[-tail:] *= np.linspace(1, 0, tail)
    return y


def articulate_held_pluck(out: np.ndarray, culture: str, pitch: int,
                          at: float, length: float, beat: float,
                          gain: float, seed: int) -> None:
    """Carry scored notes with quiet real-string strokes, not a frozen tone.

    A guzheng uses a close, soft tremolo; an oud uses alternating risha
    strokes; the tovshuur has a looser down/up pulse. Follow-up attacks stay
    below the first pluck and overlap its decay.
    """
    source = pluck(culture, pitch, seed)
    place(out, shape_pluck(source, length, beat), at, gain, -.13)
    seconds = length * beat
    desired = {"east_asia": .255, "islamic": .325, "steppe": .38}[culture]
    # High resampled plucks are shorter; keep the return stroke inside their
    # audible decay instead of leaving silence between attacks.
    interval = min(desired, max(.16, len(source) / SR * .78))
    if seconds < interval + .12:
        return
    stroke = 1
    while stroke * interval < seconds - .10:
        elapsed = stroke * interval
        # Gentle emphasis on the down stroke, quieter return stroke.
        velocity = (.30 if stroke % 2 else .23) if culture == "east_asia" else (
            (.32 if stroke % 2 else .24) if culture == "islamic" else
            (.37 if stroke % 2 else .27))
        if length <= 1:
            velocity *= .72
        voice = shape_pluck(source, (seconds - elapsed) / beat, beat)
        place(out, voice, at + elapsed, gain * velocity,
              -.09 if stroke % 2 else -.17)
        stroke += 1


def guzheng_pickup(out: np.ndarray, bar: int, beat: float, variant: int,
                   gain: float) -> None:
    """A restrained three-string sweep leads into the second four-bar phrase."""
    names = ("G4", "A4", "B4") if variant == 0 else ("D5", "B4", "G4")
    start = (4 * bar + 3.58) * beat
    for index, name in enumerate(names):
        voice = shape_pluck(pluck("east_asia", midi(name), bar + index), .48, beat)
        place(out, voice, start + index * .075, gain * (.18 + index * .035), .18)


def render(culture: str, scene: str, variant: int) -> np.ndarray:
    spec = SCORES[culture]
    speed, density = SCENES[scene]
    bpm = spec["bpm"] * speed * (1.025 if variant else 1.0)
    beat = 60 / bpm
    duration = 32 * beat
    out = np.zeros((round(duration * SR), 2), dtype=np.float64)
    rows = spec["b" if variant else "a"]
    for bar, row in enumerate(rows):
        for event, (step, name, length) in enumerate(notes(row)):
            at = (4 * bar + step) * beat
            pitch = midi(name)
            if culture == "latin":
                voice = shape_sustain(recorder(pitch), min(length * beat * .94, 1.8))
                place(out, voice, at, .092, -.17)
            else:
                gain = {"east_asia": .115, "islamic": .12,
                        "steppe": .115, "indian_ocean": .12}[culture]
                accent = 1.06 if step == 0 else (.89 if step >= 2 else .96)
                phrase = (.99, .89, 1.02, .90, 1.09, 1.0, .96, .82)[bar]
                level = gain * accent * phrase
                if culture in ("east_asia", "islamic", "steppe"):
                    articulate_held_pluck(out, culture, pitch, at, length,
                                          beat, level, bar + event + variant)
                else:
                    voice = shape_pluck(pluck(culture, pitch, bar + event + variant),
                                        length, beat)
                    place(out, voice, at, level, -.13)

        # Answers occur in the melodic gaps. Their placement creates an audible
        # pulse without a continuous background pad or multiple source codecs.
        if culture == "east_asia":
            if bar == 3:
                guzheng_pickup(out, bar, beat, variant, .115 * density)
            if scene != "quiet" and bar in (1, 4, 5):
                step, note = (2.2, "D5") if bar == 1 else (0, "G4") if bar == 4 else (2.3, "D5")
                place(out, shape_pluck(pluck(culture, midi(note), bar + variant + 1),
                                      .7, beat),
                      (4 * bar + step) * beat, .014 * density, .27)
        elif culture == "islamic":
            if scene != "quiet" and bar in (1, 3, 5):
                place(out, shape_pluck(pluck(culture, midi("D4"), bar + variant + 1),
                                      .7, beat),
                      (4 * bar + 2.5) * beat, .014 * density, .20)
        elif culture == "steppe":
            if bar in (0, 4):
                # A soft second string follows the opening down stroke.
                place(out, shape_pluck(pluck(culture, midi("D4"), bar + variant),
                                      .8, beat),
                      4 * bar * beat + .055, .019 * density, .23)
            if scene != "quiet" and bar in (1, 3, 5):
                place(out, shape_pluck(pluck(culture, midi("D4"), bar + variant + 2),
                                      .7, beat),
                      (4 * bar + 2.4) * beat, .014 * density, .24)
        elif culture == "indian_ocean":
            if scene != "quiet" and bar % 2 == 0:
                place(out, cut(str(SOURCES / "songbook/tabla_dha.wav"), 0, .50, 85),
                      4 * bar * beat, .014 * density, .19)
            elif scene == "road" and bar in (3, 7):
                place(out, cut(str(SOURCES / "songbook/tabla_tin.wav"), 0, .50, 85),
                      (4 * bar + 2) * beat, .009 * density, .19)
        else:
            if scene != "quiet" or bar in (1, 5):
                step, note = (0, "D4") if bar % 2 == 0 else (2.5, "A4")
                place(out, psaltery(midi(note)), (4 * bar + step) * beat,
                      .014 * density, .27)
            if scene == "road" and bar % 2 == 0:
                place(out, cut(str(SOURCES / "songbook/frame_muted.wav"), 0, .37, 110),
                      4 * bar * beat, .006, .05)
    ramp_len = round(.08 * SR)
    out[:ramp_len] *= np.linspace(0, 1, ramp_len)[:, None]
    out[-ramp_len:] *= np.linspace(1, 0, ramp_len)[:, None]
    # Clean gain staging, no saturation/limiter to roughen transients.
    rms = max(float(np.sqrt(np.mean(out ** 2))), 1e-9)
    peak = max(float(np.max(np.abs(out))), 1e-9)
    target = .052 if scene == "quiet" else .064
    out *= min(target / rms, .72 / peak)
    return out.astype(np.float32)


def validate() -> None:
    for culture, score in SCORES.items():
        for variant in ("a", "b"):
            assert len(score[variant]) == 8
            assert score[variant][0] == score[variant][2], (culture, variant)
            for row in score[variant]:
                assert len(notes(row)) <= 5, (culture, row)
                for _, name, _ in notes(row):
                    assert name[:-1] in score["mode"], (culture, name)


def main() -> None:
    validate()
    requested = sys.argv[1:] or list(ACTIVE_CULTURES)
    unknown = set(requested) - set(ACTIVE_CULTURES)
    if unknown:
        raise ValueError(f"unknown cultures: {', '.join(sorted(unknown))}")
    for culture in requested:
        folder = OUT / culture
        folder.mkdir(parents=True, exist_ok=True)
        for scene in SCENES:
            for variant in range(2):
                path = folder / f"{scene}{'_b' if variant else ''}.ogg"
                data = render(culture, scene, variant)
                write_vorbis(path, data)
                print(f"{culture}/{path.name} {len(data)/SR:.2f}s", flush=True)


if __name__ == "__main__":
    main()
