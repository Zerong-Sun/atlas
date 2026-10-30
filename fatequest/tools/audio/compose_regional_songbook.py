#!/usr/bin/env python3
"""Build two recorded-instrument folk cues per culture and scene.

All audio sources and licenses are listed in samples/songbook/SOURCE.json or
the existing samples/*/PERFORMANCES.json manifests. A cue uses a coherent
source recording for its lead; lossy MP3 beds and old overlays stay out.
"""

from __future__ import annotations

import hashlib
import json
import math
import subprocess
from functools import lru_cache
from pathlib import Path

import imageio_ffmpeg
import numpy as np
import soundfile as sf

from compose_china_ensemble import SCORES as CHINA_A, parse_bar
from compose_folk_themes import THEMES, SITAR_KEYS, GUQIN_ZONES

ROOT = Path(__file__).resolve().parents[2]
SOURCES = ROOT / "tools/audio/samples"
OUT = ROOT / "assets/audio/folk"
SR = 44100
SCENES = ("town", "road", "quiet")
PERFORMANCES = {
    "islamic": ("oud", "maqam_saba.wav"),
    "steppe": ("tovshuur", "paidang_sabardang.wav"),
    "latin": ("viol_consort", "mainerio_saltarello.wav"),
}

# These second tunes have a different melodic contour from the first score.
CHINA_B = {
    "town": [
        "G4:1 B4:.5 A4:.5 G4:1 D5:1", "E5:1 D5:.5 B4:.5 A4:1 G4:1",
        "A4:.5 B4:.5 D5:1 E5:1 D5:1", "B4:1 A4:.5 G4:.5 B4:2",
        "D5:1 B4:.5 A4:.5 G4:1 B4:1", "E5:.5 D5:.5 B4:1 A4:1 G4:1",
        "B4:.5 D5:.5 E5:1 D5:.5 B4:.5 A4:1", "B4:1 A4:1 G4:2",
    ],
    "road": [
        "G4:.5 B4:.5 D5:1 B4:.5 A4:.5 G4:1", "A4:.5 B4:.5 D5:.5 E5:.5 D5:1 B4:1",
        "E5:.5 D5:.5 B4:1 D5:.5 B4:.5 A4:1", "G4:1 A4:.5 B4:.5 D5:1 -:1",
        "B4:.5 D5:.5 E5:.5 D5:.5 B4:1 G4:1", "A4:.5 B4:.5 D5:1 E5:.5 D5:.5 B4:1",
        "G4:.5 A4:.5 B4:1 D5:.5 B4:.5 A4:1", "B4:.5 A4:.5 G4:1 G4:2",
    ],
    "quiet": [
        "G4:2 B4:1 A4:1", "D5:2 B4:1 G4:1", "A4:1 B4:1 D5:2",
        "E5:1 D5:1 B4:2", "G4:1 A4:1 B4:2", "D5:2 E5:1 D5:1",
        "B4:1 A4:1 G4:2", "B4:1 A4:1 G4:2",
    ],
}
INDIA_B = {
    "town": [
        "0/1 2/.5 3/.5 4/1 2/1", "5/.5 4/.5 3/1 2/.5 1/.5 0/1",
        "2/.5 3/.5 5/1 6/.5 5/.5 4/1", "3/1 2/1 1/1 0/1",
        "4/.5 5/.5 7/1 6/.5 5/.5 4/1", "2/1 3/.5 4/.5 5/1 3/1",
        "4/.5 2/.5 1/1 2/.5 1/.5 0/1", "1/1 2/1 0/2",
    ],
    "road": [
        "0/.5 2/.5 4/1 5/.5 4/.5 2/1", "3/.5 5/.5 6/1 5/.5 4/.5 2/1",
        "4/.5 5/.5 7/.5 6/.5 5/1 4/1", "2/1 1/.5 2/.5 3/1 0/1",
        "5/.5 7/.5 9/1 7/.5 6/.5 5/1", "4/.5 3/.5 2/1 5/.5 4/.5 3/1",
        "2/.5 4/.5 5/1 3/.5 1/.5 2/1", "1/.5 2/.5 0/1 0/2",
    ],
    "quiet": [
        "0/2 2/1 3/1", "4/2 2/1 1/1", "0/2 -/1 2/1",
        "3/2 4/1 2/1", "5/2 4/1 3/1", "2/2 1/1 0/1",
        "2/1 4/1 3/2", "1/1 2/1 0/2",
    ],
}
INTRO_ROWS = [
    "Bb4:1 D5:.5 Eb5:.5 F5:1 D5:1", "C5:1 D5:1 Bb4:1 -:1",
    "Eb5:.5 F5:.5 G5:1 F5:1 D5:1", "C5:1 Bb4:1 F4:2",
    "Bb4:.5 C5:.5 D5:1 F5:1 G5:1", "F5:1 Eb5:.5 D5:.5 C5:1 Bb4:1",
    "D5:.5 C5:.5 Bb4:1 C5:1 D5:1", "F5:1 D5:1 Bb4:2",
    "F5:1 G5:.5 F5:.5 Eb5:1 D5:1", "C5:.5 D5:.5 F5:1 Eb5:1 C5:1",
    "Bb4:1 D5:.5 F5:.5 G5:1 F5:1", "Eb5:1 D5:1 C5:1 -:1",
    "D5:.5 Eb5:.5 F5:1 D5:1 Bb4:1", "C5:1 Eb5:1 F5:1 G5:1",
    "F5:.5 Eb5:.5 D5:1 C5:1 Bb4:1", "D5:1 C5:1 Bb4:2",
]


def midi(name: str) -> int:
    semitone = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
    accidental = 1 if "#" in name else (-1 if "b" in name else 0)
    return 12 * (int(name[-1]) + 1) + semitone[name[0]] + accidental


@lru_cache(maxsize=None)
def audio(path: str) -> np.ndarray:
    data, sr = sf.read(path, dtype="float32")
    if data.ndim == 2:
        data = np.mean(data, axis=1)
    if sr != SR:
        data = fft_resample(data, round(len(data) * SR / sr))
    return np.asarray(data, dtype=np.float64)


def fft_resample(x: np.ndarray, count: int) -> np.ndarray:
    """Band-limited pitch/time resampling, with high bins removed on descent."""
    source = len(x)
    if source == count:
        return np.asarray(x, dtype=np.float64).copy()
    spectrum = np.fft.rfft(x)
    bins = count // 2 + 1
    if bins < len(spectrum):
        spectrum = spectrum[:bins]
    else:
        spectrum = np.pad(spectrum, (0, bins - len(spectrum)))
    return np.fft.irfft(spectrum, n=count) * (count / source)


def clean(x: np.ndarray, cutoff: float = 60) -> np.ndarray:
    x = x - np.mean(x)
    frequencies = np.fft.rfftfreq(len(x), 1 / SR)
    spectrum = np.fft.rfft(x)
    spectrum *= frequencies**2 / (frequencies**2 + cutoff**2)
    return np.fft.irfft(spectrum, n=len(x))


def clean_performance(x: np.ndarray) -> np.ndarray:
    y = clean(x, 82)
    frequencies = np.fft.rfftfreq(len(y), 1 / SR)
    spectrum = np.fft.rfft(y)
    spectrum *= .80 + .20 * frequencies**2 / (frequencies**2 + 180.0**2)
    return np.fft.irfft(spectrum, n=len(y))


def transpose(x: np.ndarray, source_midi: float, target_midi: float) -> np.ndarray:
    ratio = 2 ** ((target_midi - source_midi) / 12)
    return fft_resample(x, max(1, round(len(x) / ratio)))


def place(out: np.ndarray, sample: np.ndarray, at: float, gain: float, pan: float = 0) -> None:
    begin = round(at * SR)
    if begin >= len(out) or begin < 0:
        return
    end = min(begin + len(sample), len(out))
    signal = sample[:end - begin] * gain
    # Equal-power panning; center is deliberately below hard-left/hard-right.
    out[begin:end, 0] += signal * math.sqrt((1 - pan) / 2)
    out[begin:end, 1] += signal * math.sqrt((1 + pan) / 2)


@lru_cache(maxsize=None)
def cut(path: str, start: float, length: float, hp: float = 60) -> np.ndarray:
    x = audio(path)[round(start * SR):round((start + length) * SR)].copy()
    if not len(x):
        raise ValueError(f"empty sample: {path} at {start}")
    x = clean(x, hp)
    edge = min(round(.005 * SR), len(x) // 4)
    x[:edge] *= np.linspace(0, 1, edge)
    x[-edge:] *= np.linspace(1, 0, edge)
    return x / max(np.max(np.abs(x)), .01)


def finalise(out: np.ndarray, quiet: bool) -> np.ndarray:
    fade = round(.24 * SR)
    ramp = np.sin(np.linspace(0, np.pi / 2, fade)) ** 2
    out[:fade] *= ramp[:, None]
    out[-fade:] *= ramp[::-1, None]
    # Match broad perceived level across source recordings, then respect peak
    # headroom. Peak-only normalisation made the Latin consort much louder
    # than the oud recording despite identical peak values.
    rms = max(float(np.sqrt(np.mean(out * out))), 1e-9)
    peak = max(float(np.max(np.abs(out))), 1e-9)
    target_rms = .052 if quiet else .071
    gain = target_rms / rms
    if peak * gain > .70:
        # One unusually loud oud attack should not make the entire passage
        # sound half as loud. Gentle peak soft limiting touches those attacks.
        out = .72 * np.tanh(out * gain / .72)
    else:
        out *= gain
    return out.astype(np.float32)


def shorten(x: np.ndarray, seconds: float, release: float = .13) -> np.ndarray:
    """Let a pluck ring for its scored slot, then release before the next one."""
    count = min(len(x), max(1, round(seconds * SR)))
    y = x[:count].copy()
    tail = min(round(release * SR), len(y) // 3)
    if tail:
        y[-tail:] *= np.linspace(1.0, 0.0, tail)
    return y


def intro_finalise(out: np.ndarray) -> np.ndarray:
    """The original 40-second opening mix; regional revisions do not affect it."""
    fade = round(.24 * SR)
    ramp = np.sin(np.linspace(0, np.pi / 2, fade)) ** 2
    out[:fade] *= ramp[:, None]
    out[-fade:] *= ramp[::-1, None]
    peak = max(np.max(np.abs(out)), 1e-9)
    out *= .68 / peak
    return out.astype(np.float32)


def chinese_note(instrument: str, target: int, variation: int) -> np.ndarray:
    if instrument == "pipa":
        x = cut(str(SOURCES / "china/pipa_commons.ogg"), 0.0 if variation % 2 == 0 else 2.37, .88, 90)
        key = 76  # isolated E5 attack measured in original pipa recording
    elif instrument == "guzheng":
        x = cut(str(SOURCES / "china/guzheng_nanliu.mp3"), 0.0 if variation % 2 == 0 else 7.39, 2.8, 75)
        key = 69 if variation % 2 == 0 else 67
    else:
        zone = min(range(len(GUQIN_ZONES)), key=lambda i: abs(math.log2(440 * 2 ** ((target - 69) / 12) / GUQIN_ZONES[i][2])))
        start, end, hz = GUQIN_ZONES[zone]
        x = cut(str(SOURCES / "guqin/Zheng_diao.ogg"), start, end - start, 55)
        key = 69 + 12 * math.log2(hz / 440)
    return transpose(x, key, target)


def render_china(scene: str, variant: int) -> np.ndarray:
    bpm = CHINA_A[scene]["bpm"] + (3 if variant else 0)
    beat = 60 / bpm
    out = np.zeros((round(32 * beat * SR), 2), dtype=np.float64)
    rows = CHINA_A[scene]["lead"] if variant == 0 else CHINA_B[scene]
    for bar, row in enumerate(rows):
        base = bar * 4 * beat
        for step, name, length in parse_bar(row):
            target = midi(name)
            # The two cues use different instruments, but never stack
            # recordings with incompatible noise/codec character.
            lead = "guzheng" if (scene == "quiet" and variant == 0) or (scene != "quiet" and variant == 1) else "pipa"
            note = shorten(chinese_note(lead, target, bar % 2), min(1.50, max(.65, length * beat * 1.04)), .17)
            place(out, note, base + step * beat, .13 if lead == "pipa" else .12, 0.0)
    return finalise(out, scene == "quiet")


@lru_cache(maxsize=None)
def sitar(key: int) -> np.ndarray:
    source_key = min(SITAR_KEYS, key=lambda k: abs(k - key))
    x = cut(str(SOURCES / f"sitar/Str{SITAR_KEYS[source_key]:02d}.flac"), 0, min(2.25, sf.info(SOURCES / f"sitar/Str{SITAR_KEYS[source_key]:02d}.flac").duration), 75)
    return transpose(x, source_key, key)


def render_india(scene: str, variant: int) -> np.ndarray:
    score = THEMES["indian_ocean"]
    bpm = score["bpm"] + (4 if variant else 0)
    beat = 60 / bpm
    duration = 32 * beat
    out = np.zeros((round(duration * SR), 2), dtype=np.float64)
    rows = score["melodies"][scene] if variant == 0 else INDIA_B[scene]
    scale = score["scale"]
    for bar, row in enumerate(rows):
        at = 0.0
        for token in row.split():
            degree, beats = token.split("/")
            length = float(beats)
            if degree != "-":
                d = int(degree)
                note = 61 + scale[d % len(scale)] + 12 * (d // len(scale))
                voice = shorten(sitar(note), min(1.60, max(.75, length * beat * 1.08)), .20)
                place(out, voice, (bar * 4 + at) * beat, .16 if scene != "quiet" else .13, -.18)
            at += length
        if not math.isclose(at, 4):
            raise ValueError(f"bad Indian score: {row}")
    tabla = {"dha": .034, "tin": .023, "ta": .023}
    rhythm = ("dha", "tin") if variant == 0 else ("dha", "ta")
    for bar in range(8):
        if scene == "quiet" or (scene == "town" and bar in (3, 7)):
            continue
        for step, name in zip((0, 2), rhythm):
            if name == "dha" and bar % 2:
                continue
            x = cut(str(SOURCES / f"songbook/tabla_{name}.wav"), 0, .45, 85)
            place(out, x, (bar * 4 + step) * beat, tabla[name], .29)
    return finalise(out, scene == "quiet")


def render_intro() -> np.ndarray:
    """A clear forty-second entrance cue from recorded recorder and psaltery."""
    beat = 60 / 96
    out = np.zeros((round(64 * beat * SR), 2), dtype=np.float64)
    recorder_samples = {
        66: "recorder_sustain_fs4.wav", 70: "recorder_sustain_bb4.wav",
        72: "recorder_sustain_c5.wav", 74: "recorder_sustain_d5.wav",
        76: "recorder_sustain_e5.wav",
    }
    psaltery_samples = {
        66: "psaltery_fs4.wav", 70: "psaltery_bb4.wav",
        72: "psaltery_c5.wav", 74: "psaltery_d5.wav",
    }
    drum_path = str(SOURCES / "songbook/frame_muted.wav")
    for bar, row in enumerate(INTRO_ROWS):
        base = bar * 4 * beat
        for step, name, length in parse_bar(row):
            duration = min(length * beat * .88, 1.45)
            target = midi(name)
            source_key = min(recorder_samples, key=lambda key: abs(key - target))
            note = cut(str(SOURCES / "songbook" / recorder_samples[source_key]), 0, duration, 145).copy()
            release = min(round(.11 * SR), len(note) // 3)
            note[-release:] *= np.linspace(1, 0, release)
            place(out, transpose(note, source_key, target), base + step * beat, .093, -.24)
        # Two low psaltery answers anchor the bar. The former D5 pluck at
        # beat 2.75 made an unrelated high ping at a fixed interval.
        for step, name in ((0, "Bb4"), (2, "F4")):
            target = midi(name)
            source_key = min(psaltery_samples, key=lambda key: abs(key - target))
            note = cut(str(SOURCES / "songbook" / psaltery_samples[source_key]), 0, 1.55, 85)
            place(out, transpose(note, source_key, target), base + step * beat, .054, .32)
        if bar % 2 == 0:
            place(out, cut(drum_path, 0, .36, 100), base, .033, .10)
    return intro_finalise(out) * .55


def render_performance(culture: str, scene: str, variant: int) -> np.ndarray:
    folder, filename = PERFORMANCES[culture]
    record = json.loads((SOURCES / folder / "PERFORMANCES.json").read_text())["recordings"][0]
    start, end = record["uses"][scene]
    length = end - start
    full = audio(str(SOURCES / folder / filename))
    if variant:
        # Select a separate passage rather than replaying almost the same
        # excerpt shifted by eight seconds. These are still variations of the
        # credited performance, not newly composed recordings.
        if culture == "latin":
            start = start + length if start + 2 * length < len(full) / SR else start - length
        else:
            start = start + length if start + 2 * length < len(full) / SR else 2.5 if culture == "steppe" else 0.0
    phrase = clean_performance(full[round(start * SR):round((start + length) * SR)])
    out = np.zeros((len(phrase), 2), dtype=np.float64)
    place(out, phrase, 0, 1.0, 0.0)
    return finalise(out, scene == "quiet")


def validate_sources() -> None:
    manifest = json.loads((SOURCES / "songbook/SOURCE.json").read_text())
    for item in manifest["sources"]:
        path = SOURCES / "songbook" / item["file"]
        if hashlib.sha256(path.read_bytes()).hexdigest() != item["sha256"]:
            raise ValueError(f"source hash mismatch: {path}")
    for culture, (folder, filename) in PERFORMANCES.items():
        record = json.loads((SOURCES / folder / "PERFORMANCES.json").read_text())["recordings"][0]
        path = SOURCES / folder / filename
        if hashlib.sha256(path.read_bytes()).hexdigest() != record["sha256"]:
            raise ValueError(f"source hash mismatch: {path}")
    for manifest, filename in ((SOURCES / "china/SOURCE.json", "pipa_commons.ogg"),
                               (SOURCES / "china/SOURCE.json", "guzheng_nanliu.mp3"),
                               (SOURCES / "guqin/SOURCE.json", "Zheng_diao.ogg")):
        record = json.loads(manifest.read_text())
        entry = next((x for x in record.get("sources", []) if x.get("file") == filename), record)
        if hashlib.sha256((manifest.parent / filename).read_bytes()).hexdigest() != entry["sha256"]:
            raise ValueError(f"source hash mismatch: {filename}")
    sitar_manifest = json.loads((SOURCES / "sitar/SOURCE.json").read_text())
    for entry in sitar_manifest["files"]:
        if entry["file"].endswith(".flac"):
            path = SOURCES / "sitar" / entry["file"]
            if hashlib.sha256(path.read_bytes()).hexdigest() != entry["sha256"]:
                raise ValueError(f"source hash mismatch: {path}")


def write_vorbis(path: Path, data: np.ndarray) -> None:
    command = [imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "error",
               "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "pipe:0",
               "-c:a", "libvorbis", "-qscale:a", "8", "-y", str(path)]
    subprocess.run(command, input=np.asarray(data, dtype="<f4").tobytes(), check=True)


def main(only_culture: str | None = None) -> None:
    validate_sources()
    for culture in ("east_asia", "islamic", "steppe", "indian_ocean", "latin"):
        if only_culture is not None and culture != only_culture:
            continue
        folder = OUT / culture
        folder.mkdir(parents=True, exist_ok=True)
        for scene in SCENES:
            for variant in range(2):
                if culture == "east_asia":
                    data = render_china(scene, variant)
                elif culture == "indian_ocean":
                    data = render_india(scene, variant)
                else:
                    data = render_performance(culture, scene, variant)
                name = f"{scene}{'_b' if variant else ''}.ogg"
                write_vorbis(folder / name, data)
                print(f"{culture}/{name}: {len(data)/SR:.2f}s, stereo", flush=True)


if __name__ == "__main__":
    main()
