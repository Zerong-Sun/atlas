# 素材总索引 · ASSETS REQUIREMENTS

**2026-07-26 · Godot v3.0 唯一维护线。** 本文汇总美术、音频、文本三类素材的**实测库存、接线状态、缺口与文档入口**。原则：**已有尽量接线使用，不丢文件；重复副本归档并注明 canonical 路径。**

---

## 文档地图

| 类型 | 需求/现状 | 执行计划 | 资产目录 |
|---|---|---|---|
| **美术** | [`ART_REQUIREMENTS.md`](ART_REQUIREMENTS.md) | [`ART_TODO.md`](../assets/art/ART_TODO.md) | `assets/art/` · `assets/decks/` |
| **音频** | [`AUDIO_PLAN.md`](AUDIO_PLAN.md) | A1–A8 ✅ | [`assets/audio/MANIFEST.md`](../assets/audio/MANIFEST.md) |
| **文本** | [`TEXT_REQUIREMENTS.md`](TEXT_REQUIREMENTS.md) | [`STORY_REQUIREMENTS.md`](STORY_REQUIREMENTS.md) · [`PLAN.md`](PLAN.md) | `content/story/` · `content/i18n/` |
| **多语言** | [`L10N_PLAN.md`](L10N_PLAN.md) | B1–B4 ✅ | `content/story/<unit>/{en,zh}.md` |
| **现状 hub** | [`STATUS.md`](STATUS.md) | — | — |

---

## 1. 美术（2026-07-26 实测）

```
assets/art/*.webp（根目录）     600 张
  _archive/（抓图归档）         128 张   ← 生产图之外的 Chat 变体，勿删
  _sheets/（组图原片）            58 张
assets/decks/iching/             30/64 牌面
assets/decks/tarot/              78 张
```

| 接线 | 数量 | 说明 |
|---|---|---|
| Godot 运行时（`map_art.gd` 动态模式） | **57** | 地图 28 + 场景 13 + 立绘 16 |
| `audit.py` 字面量扫描 | 25 | 低估动态引用；以 Godot 57 为准 |
| **未接线** | **543** | 素材在盘，优先接线而非重出 |

**仍缺出图**（非阻塞）：`scene-region-chr` 重绘 1 · 白图泰 6+18 · 易经 31–64（34）· 货币 5 · 贴纸 9。

**归档策略**：

| 路径 | 用途 |
|---|---|
| `assets/art/_archive/chats/` | ChatGPT 对话全量变体 + `index.json`（187+ 会话） |
| `assets/art/_archive/scene-region-*-wrong-content.webp` | 已替换的错误底板备份 |
| `assets/art/_sheets/` | contact sheet 原图，裁切源 |
| `docs/archive/art-prompts/` | 与 `assets/art/ART_PROMPTS_*.md` 重复的 docs 副本（已归档） |

**Prompt 权威路径**：`assets/art/ART_PROMPTS*.md`（`docs/` 下同名文件已移入归档）。

**生成工具**：

| 路径 | 角色 |
|---|---|
| `scripts/` | 仓库内 canonical（`orchestrate_req.py` 等完整版） |
| `scripts/art-gen-kit/` | 可移植 kit（`kit_paths.py`，任意 cwd 可跑） |
| 11 个同名脚本 | 见 [`scripts/README.md`](../scripts/README.md) §「与 art-gen-kit 的关系」 |

---

## 2. 音频（2026-07-26 实测）

```
assets/audio/          37 个 .ogg
  stems/               20   （5 文化 × 4 层；drone/pulse 程序化 · melody/color 加厚）
  ambient/             17   （12 CC0 场景床 + 5 sacred_blur_*）
  sfx/                 —    （程序化，见 game/audio/sfx.gd）
```

| 里程碑 | 状态 |
|---|---|
| A1–A6 · `AudioDirector` autoload | ✅ |
| A7 · CC0 场景床 + horse_hooves/rain/river 接线 | ✅ |
| A8 · melody/color 加厚 | ✅ |
| 三轴：文化 × 场景 × 情绪 | ✅ |

详见 [`AUDIO_PLAN.md`](AUDIO_PLAN.md) · 运行时 [`game/audio/audio_director.gd`](../game/audio/audio_director.gd) · 出处 [`assets/audio/CC0_SOURCES.md`](../assets/audio/CC0_SOURCES.md)。

---

## 3. 文本（2026-07-26 实测 · T3/T4/T6 完成）

```
content/story/         109 单元 · {en,zh}.md
content/i18n/          en/zh 各 2482 条 · 缺 0
content/tables/events/ 276 条（entry 102 · site 93 · road 81）
glossary               97 条（assets/data/glossary.json）
stamps                 1322 current · 0 stale
```

| 任务 | 量 | 状态 |
|---|---|---|
| T3 city 探索点 | 21 城 × 2 = 42 | ✅ |
| T4 草原途中 | road 81 · steppe 48 | ✅ |
| T6 语料处置 | 19 城已查标注 | ✅ |

语料书：`ibn-fadlan-lore.json` **34** stories（非 199；旧数来自原始 PDF 拆解）。

---

## 4. 验收命令

```bash
cd fatequest
python3 tools/art/audit.py              # 美术完整性（需 pillow+numpy）
node tools/validate/validate.mjs        # 22 道内容门禁
node tools/lore/story.mjs check         # 译文时效
godot --headless --path . --script tests/run_tests.gd
```

---

## 5. Steam 上架素材优先级

1. **接线现有 600 张**（explore/site/chargen/市集 ic-*）— 零新图收益最大  
2. **T3 文本密度** — 21 城探索 playable 深度  
3. **T4 steppe 途中** — 草原线厚度  
4. **chr 底板重绘 + 白图泰专图** — 视觉差异化  
5. **P2 货币/贴纸/易经下半** — HUD 与收藏 polish  
