# Emoji icon stand-ins (temporary)

ChatGPT Plus **image generation limit** hit (~resets 2026-07-21 13:57 local).
These three Extra2 files are temporary copies until regenerated:

| File | Stand-in source |
|------|-----------------|
| `ic-extra-alchemical-symbol-for-fire.webp` | `ic-dream-fire.webp` |
| `ic-extra-microbe.webp` | `ic-dream-snake.webp` |
| `ic-extra-spool-of-thread.webp` | `ic-extra-school-satchel.webp` |

Regen command after quota resets:

```bash
cd fatequest2/scripts
.venv/bin/python submit_map_windows.py --prompts-file ART_PROMPTS_EMOJI.md \
  --style emoji --windows Extra2 --skip-existing --force  # delete stand-ins first
```
