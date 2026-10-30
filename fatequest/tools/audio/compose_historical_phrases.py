#!/usr/bin/env python3
"""Render contiguous traditional performance phrases without retriggering notes."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
SOURCES = {
    "islamic": ROOT / "tools/audio/samples/oud",
    "steppe": ROOT / "tools/audio/samples/tovshuur",
    "indian_ocean": ROOT / "tools/audio/samples/sitar_performance",
    "latin": ROOT / "tools/audio/samples/viol_consort",
}


def recordings_for(culture: str) -> list[dict]:
    return json.loads((SOURCES[culture] / "PERFORMANCES.json").read_text(encoding="utf-8"))["recordings"]


def validate_sources() -> None:
    for culture in SOURCES:
        validate_culture(culture)


def validate_culture(culture: str) -> None:
    used: list[str] = []
    for recording in recordings_for(culture):
        path = SOURCES[culture] / recording["file"]
        if hashlib.sha256(path.read_bytes()).hexdigest() != recording["sha256"]:
            raise ValueError(f"historical recording hash mismatch: {path}")
        if recording["license"] not in ("CC BY 2.5", "CC BY 3.0", "Public domain"):
            raise ValueError(f"unexpected historical recording license: {path}")
        used.extend(recording["uses"])
    if sorted(used) != ["quiet", "road", "town"]:
        raise ValueError(f"missing or duplicated {culture} scene: {used}")


def render_phrase(recording: dict, scene: str, source_dir: Path) -> np.ndarray:
    source, sr = sf.read(source_dir / recording["file"], dtype="float32")
    if sr != 44100:
        raise ValueError("phrase recordings require 44.1 kHz")
    if source.ndim == 2:
        source = source.mean(axis=1)
    start, end = recording["uses"][scene]
    if not (0 <= start < end <= len(source) / sr):
        raise ValueError(f"invalid phrase bounds for {scene}")
    # Preserve the recorded phrasing, fingering and note overlap. The source
    # has a substantial DC offset, so remove it before the gentle rumble cut.
    phrase = source[round(start * sr):round(end * sr)].astype(np.float64)
    phrase -= float(np.mean(phrase))
    freqs = np.fft.rfftfreq(len(phrase), 1 / sr)
    spectrum = np.fft.rfft(phrase)
    spectrum *= freqs / np.sqrt(freqs * freqs + 35.0**2)
    if recording.get("lowpass_hz"):
        cutoff = float(recording["lowpass_hz"])
        spectrum /= np.sqrt(1.0 + (freqs / cutoff) ** 4)
    phrase = np.fft.irfft(spectrum, n=len(phrase))
    fade = round(.24 * sr)
    ramp = np.sin(np.linspace(0, np.pi / 2, fade)) ** 2
    phrase[:fade] *= ramp
    phrase[-fade:] *= ramp[::-1]
    target_rms = .075 if scene == "quiet" else .11
    rms = max(float(np.sqrt(np.mean(phrase * phrase))), 1e-9)
    peak = max(float(np.max(np.abs(phrase))), 1e-9)
    phrase *= min(target_rms / rms, .70 / peak)
    return phrase.astype(np.float32)


def compose_culture(culture: str) -> None:
    validate_culture(culture)
    output_dir = ROOT / "assets/audio/folk" / culture
    output_dir.mkdir(parents=True, exist_ok=True)
    for recording in recordings_for(culture):
        for scene in recording["uses"]:
            path = output_dir / f"{scene}.ogg"
            audio = render_phrase(recording, scene, SOURCES[culture])
            sf.write(path, audio, 44100, format="OGG", subtype="VORBIS")
            print(f"{culture}/{scene}: traditional phrase, {len(audio) / 44100:.2f}s")


if __name__ == "__main__":
    for culture_name in SOURCES:
        compose_culture(culture_name)
