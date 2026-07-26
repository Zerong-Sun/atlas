# tools/audio

Build-time audio for FateQuest (`docs/AUDIO_PLAN.md` §7).

## Setup

```bash
python3 -m venv tools/audio/.venv
tools/audio/.venv/bin/pip install -r tools/audio/requirements.txt
# needs: ffmpeg, oggenc (vorbis-tools) preferred for mono Vorbis
```

## Pipelines

### Ambient beds (CC0 → seamless OGG)

```bash
# Download curated BigSoundBank CC0 samples (optional: FREESOUND_API_KEY for search)
tools/audio/.venv/bin/python tools/audio/fetch_cc0.py search rain
tools/audio/.venv/bin/python tools/audio/fetch_cc0.py download --all-ambient

# Compose seamless mono loops into assets/audio/ambient/
tools/audio/.venv/bin/python tools/audio/compose_loops.py --all-ambient
```

### Stems

```bash
# Full procedural pack (drone/pulse/melody/color + sacred_blur) — legacy generator
tools/audio/.venv/bin/python tools/audio/generate_all.py

# Hybrid: regenerate only richer melody + color (keeps drone/pulse)
tools/audio/.venv/bin/python tools/audio/generate_melody_color.py
tools/audio/.venv/bin/python tools/audio/generate_melody_color.py --culture east_asia
```

Outputs land in `assets/audio/` (see `MANIFEST.md`).

Secular scale gestures only — no liturgical or sacred recitation.
