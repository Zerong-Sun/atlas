# tools/audio

Build-time synthesis for FateQuest music stems and ambients (`docs/AUDIO_PLAN.md` §7).

## Setup

```bash
python3 -m venv tools/audio/.venv
tools/audio/.venv/bin/pip install -r tools/audio/requirements.txt
# needs: ffmpeg (optional), oggenc from vorbis-tools (preferred for mono Vorbis)
```

## Generate

```bash
tools/audio/.venv/bin/python tools/audio/generate_all.py
# tools/audio/.venv/bin/python tools/audio/generate_all.py --only stems
# tools/audio/.venv/bin/python tools/audio/generate_all.py --culture east_asia
```

Outputs land in `assets/audio/` (see `MANIFEST.md`).

Secular scale gestures only — no liturgical or sacred recitation.
