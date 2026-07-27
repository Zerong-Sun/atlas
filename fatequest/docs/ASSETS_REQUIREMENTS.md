# 素材总索引 · ASSETS REQUIREMENTS

**2026-07-27 · Godot v3.0 唯一维护线。** 本文汇总美术、音频、文本三类素材的**实测库存、接线状态、缺口与文档入口**。原则：**已有尽量接线使用，不丢文件；重复副本归档并注明 canonical 路径。**

---

## 文档地图

| 类型 | 需求/现状 | 执行计划 | 资产目录 |
|---|---|---|---|
| **美术** | [`ART_REQUIREMENTS.md`](ART_REQUIREMENTS.md) | [`ART_TODO.md`](../assets/art/ART_TODO.md) | `assets/art/` · `assets/decks/` |
| **音频** | [`AUDIO_PLAN.md`](AUDIO_PLAN.md) | A1–A8 ✅ | [`assets/audio/MANIFEST.md`](../assets/audio/MANIFEST.md) |
| **文本** | [`TEXT_REQUIREMENTS.md`](TEXT_REQUIREMENTS.md) | [`STORY_REQUIREMENTS.md`](STORY_REQUIREMENTS.md) · [`PLAN.md`](PLAN.md) | `content/story/` · `content/i18n/` |
| **多语言** | [`L10N_PLAN.md`](L10N_PLAN.md) | B1–B4 ✅ | `content/story/<unit>/{en,zh}.md` |
| **动画** | [`ANIMATION_PLAN.md`](ANIMATION_PLAN.md) | N0–N3 ✅ | `game/fx/` · `game/shaders/` |
| **现状 hub** | [`STATUS.md`](STATUS.md) | — | — |

---

## 1. 美术（2026-07-27 实测 · S1b 完成）

```
assets/art/*.webp（根目录）     650 张
  _archive/（抓图归档）         128 张   ← 生产图之外的 Chat 变体，勿删
  _sheets/（组图原片）            58 张
assets/decks/iching/             30/64 牌面
assets/decks/tarot/              78 张
```

| 接线 | 数量 | 说明 |
|---|---|---|
| Godot 运行时（`MapArt` + `art_wire_index.json`） | **650** | 全量可解析 |
| **未接线** | **0** | S1b ✅ 2026-07-27 |

**仍缺出图**（规格见 `ART_REQUIREMENTS.md`）：`scene-region-chr` 重绘 1 · 白图泰 6+18 · 易经 31–64（34）。货币／贴纸／随从／契约已交付；雇佣签契屏见 `game/ui/hire_contract.gd`。

**归档策略**：

| 路径 | 用途 |
|---|---|
| `assets/art/_archive/chats/` | ChatGPT 对话全量变体 + `index.json` |
| `assets/art/_archive/scene-region-*-wrong-content.webp` | 已替换的错误底板备份 |
| `assets/art/_sheets/` | contact sheet 原图，裁切源 |
| `docs/archive/art-prompts/` | 与 `assets/art/ART_PROMPTS_*.md` 重复的 docs 副本（已归档） |

**Prompt 权威路径**：`assets/art/ART_PROMPTS*.md`。

---

## 2. 音频（2026-07-26 实测）

```
assets/audio/          37 个 .ogg
  stems/               20   （5 文化 × 4 层）
  ambient/             17   （12 CC0 场景床 + 5 sacred_blur_*）
  sfx/                 —    （程序化，见 game/audio/sfx.gd）
```

| 里程碑 | 状态 |
|---|---|
| A1–A8 | ✅ |
| 三轴：文化 × 场景 × 情绪 | ✅ |

详见 [`AUDIO_PLAN.md`](AUDIO_PLAN.md)。

---

## 3. 文本（2026-07-26 · T3/T4/T6 + P5 入城加长）

```
content/story/         109 单元 · {en,zh}.md
content/i18n/          en/zh 各 2482 条 · 缺 0
content/tables/events/ 276 条（entry 102 · site 93 · road 81）
glossary               97 条
stamps                 1322 current · 0 stale
```

| 任务 | 量 | 状态 |
|---|---|---|
| T3–T6 | — | ✅ |
| P5 入城加长 | 5 城 | ✅ axuma/merva/ctesiphon/bethleem/ephesus |

---

## 4. 验收命令

```bash
cd fatequest
python3 tools/art/audit.py              # 美术完整性（需 pillow+numpy）
node tools/validate/validate.mjs        # 24 道内容门禁
node tools/lore/story.mjs check         # 译文时效
godot --headless --path . --script tests/run_tests.gd
```

---

## 5. Steam 上架素材优先级

1. ~~接线现有素材~~ ✅ 650/650
2. ~~动画 N2–N3~~ ✅
3. **chr 底板重绘 + 白图泰专图** — 视觉差异化（规格已写）
4. **易经下半** — 牌组完整度 polish
5. **可选加深续作** — `TEXT_REQUIREMENTS.md` §3
