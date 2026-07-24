# ChatGPT harvest notes

Updated: 2026-07-21 14:53 UTC

| Chat | Label | Split rule |
|---|---|---|
| `6a5efcf7` | F1-scenes-batch4 | 1× composite 1672×941 → 2×2 cut → Batch4 region scenes |
| `6a5efd06` | F2-gatekeepers | img0: 3×3 → Batch1（已有）；**img1–3**：1672×941 横图已下载至 `_sheets/`，各为独立 2×2 四联（md5 与 F1 不同），因 F1 Batch4 已齐未再切割 |
| `6a5f7e1a` | UI-batch4 | 5×2 contact sheet (last sheet) → ui-tab-* / ui-icon-* |
| `6a5f7b8e` | F2-tea-inn | 4× 1536×1024 → each 1×2 cut → Batch2 tea+inn (8 NPCs) |

## Run log

```json
[
  {
    "chat": "6a5efcf7",
    "label": "F1-scenes-batch4",
    "sheets": [
      {
        "path": "harvest-6a5efcf7-img0-1672x941-8fe1ca80981e.webp",
        "size": [
          1672,
          941
        ],
        "md5": "8fe1ca80981e"
      }
    ],
    "saved": [
      "skip-existing:scene-region-chr.webp",
      "scene-region-isl.webp",
      "scene-region-con.webp",
      "scene-region-mazu.webp"
    ],
    "notes": "1× composite 1672×941 → 2×2 cut → Batch4 region scenes",
    "image_count": 1
  },
  {
    "chat": "6a5efd06",
    "label": "F2-gatekeepers",
    "sheets": [
      {
        "path": "harvest-6a5efd06-img0-1024x1536-13877a664e51.webp",
        "size": [
          1024,
          1536
        ],
        "md5": "13877a664e51"
      },
      {
        "path": "harvest-6a5efd06-img1-1672x941-326bbdccd3cd.webp",
        "size": [
          1672,
          941
        ],
        "md5": "326bbdccd3cd"
      },
      {
        "path": "harvest-6a5efd06-img2-1672x941-7635619b0bf5.webp",
        "size": [
          1672,
          941
        ],
        "md5": "7635619b0bf5"
      },
      {
        "path": "harvest-6a5efd06-img3-1672x941-eeb9460c9824.webp",
        "size": [
          1672,
          941
        ],
        "md5": "eeb9460c9824"
      }
    ],
    "saved": [],
    "notes": "img0: 3×3 NPC grid → Batch1 (8 cells); img1+: 2×2 scene composites if applicable",
    "image_count": 4
  },
  {
    "chat": "6a5f7e1a",
    "label": "UI-batch4",
    "sheets": [
      {
        "path": "harvest-6a5f7e1a-img0-1983x793-9f0d81057131.webp",
        "size": [
          1983,
          793
        ],
        "md5": "9f0d81057131"
      },
      {
        "path": "harvest-6a5f7e1a-img1-1536x1024-525b3c356fe9.webp",
        "size": [
          1536,
          1024
        ],
        "md5": "525b3c356fe9"
      },
      {
        "path": "harvest-6a5f7e1a-img2-1536x1024-76812bc87030.webp",
        "size": [
          1536,
          1024
        ],
        "md5": "76812bc87030"
      }
    ],
    "saved": [
      "ui-tab-home.webp",
      "ui-tab-codex.webp",
      "ui-tab-profile.webp",
      "ui-icon-back.webp",
      "ui-icon-close.webp",
      "ui-icon-info.webp",
      "ui-icon-lock.webp",
      "ui-icon-settings.webp",
      "ui-icon-coin.webp",
      "ui-icon-lot.webp",
      "skip-existing:ui-tab-home.webp",
      "skip-existing:ui-tab-codex.webp",
      "skip-existing:ui-tab-profile.webp",
      "skip-existing:ui-icon-back.webp",
      "skip-existing:ui-icon-close.webp",
      "skip-existing:ui-icon-info.webp",
      "skip-existing:ui-icon-lock.webp",
      "skip-existing:ui-icon-settings.webp",
      "skip-existing:ui-icon-coin.webp",
      "skip-existing:ui-icon-lot.webp"
    ],
    "notes": "5×2 contact sheet (last sheet) → ui-tab-* / ui-icon-*",
    "image_count": 3
  },
  {
    "chat": "6a5f7b8e",
    "label": "F2-tea-inn",
    "sheets": [
      {
        "path": "harvest-6a5f7b8e-img0-1536x1024-6a31d2cfced0.webp",
        "size": [
          1536,
          1024
        ],
        "md5": "6a31d2cfced0"
      },
      {
        "path": "harvest-6a5f7b8e-img1-1536x1024-256b0bba3f9f.webp",
        "size": [
          1536,
          1024
        ],
        "md5": "256b0bba3f9f"
      },
      {
        "path": "harvest-6a5f7b8e-img2-1536x1024-b4b103d6f32f.webp",
        "size": [
          1536,
          1024
        ],
        "md5": "b4b103d6f32f"
      },
      {
        "path": "harvest-6a5f7b8e-img3-1536x1024-37ef38a01807.webp",
        "size": [
          1536,
          1024
        ],
        "md5": "37ef38a01807"
      }
    ],
    "saved": [
      "skip-existing:npc-tea-chr.webp",
      "skip-existing:npc-tea-isl.webp",
      "skip-existing:npc-tea-con.webp",
      "skip-existing:npc-tea-mazu.webp",
      "npc-inn-chr.webp",
      "npc-inn-isl.webp",
      "npc-inn-con.webp",
      "npc-inn-mazu.webp"
    ],
    "notes": "4× 1536×1024 → each 1×2 cut → Batch2 tea+inn (8 NPCs)",
    "image_count": 4
  }
]
```
