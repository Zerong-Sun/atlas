# Contact sheets (组图原图)

Batch generation saves raw 5×2 contact sheets here before cropping.

Filename pattern: `{prompts_stem}--{batch-slug}.webp`

Re-crop with:

```bash
cd fatequest/scripts
.venv/bin/python crop_contact_sheet.py --all-sheets --prompts-file ART_PROMPTS_UI.md --embed-descriptions
```

Descriptions and target sizes come from `ART_PROMPTS_UI.md` / `ART_PROMPTS_CARDS.md`.
