#!/usr/bin/env python3
"""Render the original opening score with clean recorded instruments."""

import soundfile as sf

from compose_regional_songbook import ROOT, SR, render_intro, validate_sources


def main() -> None:
    validate_sources()
    path = ROOT / "assets/audio/intro/title_theme.wav"
    path.parent.mkdir(parents=True, exist_ok=True)
    audio = render_intro()
    sf.write(path, audio, SR, subtype="PCM_16")
    print(f"{path}: {len(audio) / SR:.2f}s stereo PCM")


if __name__ == "__main__":
    main()
