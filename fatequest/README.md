# 远行之书 · The Book of Far Roads · v3.0

**一款中世纪欧亚旅行开放世界（1253–1453）。** 占卜不是查看结果的按钮，而是你的
移动方式、资源系统与叙事之笔。计划上架 Steam 与 App Store。

> **本目录是 Godot 版——现行且唯一在维护的实现。** 初代网页版（静态 HTML/JS/PWA）
> 已归档在 [`archive/web-version/`](archive/web-version/)，所有旧分支版本与恢复方式见
> [`archive/README.md`](archive/README.md)；它们冻结留档、不进 CI。

---

## 技术栈

- **Godot 4.7.1**，纯 GDScript，无 C#
- **四层架构**：`content/`（数据）→ `core/`（内核）→ `game/`（表现）→ 平台
- 内核铁律：不 `extends Node`、不用 `randi/randf/randomize`、不读 `Time.get_*`，
  世界状态只由 `EffectExecutor` 写。这几条由 CI 门禁 G9/G11 强制，不靠自觉。

## 运行

**编辑器**：用 Godot 4.7.1 打开本目录（存在 `project.godot`），F5 运行。

**无头测试**（不需要图形界面）：

```bash
godot --headless --path . --script tests/run_tests.gd    # 16 个内核单测
godot --headless --path . --script tests/smoke_boot.gd   # 启动冒烟
godot --headless --path . --script tests/benchmark_systems.gd # 系统性能门禁
node tools/validate/validate.mjs                         # 25 道内容门禁
node tools/lore/story.mjs check                          # 译文时效
```

## 结构

```text
fatequest/
├── project.godot            # Godot 工程入口
├── content/                 # 唯一数据真相源
│   ├── tables/              #   玩法与占法支持表：cities/routes/events/goods/
│   │                        #   retainers/divinations/lessons/transports 等
│   ├── i18n/                #   编译产物 en.json / zh.json（勿手改，见 story/）
│   ├── story/<unit>/<lang>.md  # 叙事文本的 authoring 源，带 stamps 时效戳
│   └── world/               #   地图投影与山脉（从 worldmap/ 同步而来）
├── core/                    # 内核：零 Node 依赖，可 headless 全跑
│   ├── rng/                 #   确定性 RNG（对拍 Atlas seed.ts 逐位一致）
│   ├── world/ time/ econ/   #   世界状态 · 儒略日历法 · 市场经济
│   ├── narrative/           #   effect 执行器 · 条件求值器 · 事件机 · 结局判定
│   ├── divination/          #   开放式占法注册表 + 引擎（加一法只动 6 处）
│   ├── retainer/ save/      #   随从花名册 · 快照存档 + 单向迁移链
│   └── i18n/                #   回退链 zh → en → key
├── game/                    # 表现层：地图、城市、市集、图鉴、同行、结局界面
├── tools/                   # Node/Python 管线：建表、语料匹配、译文编译、门禁
├── tests/                   # 16 单测 + 12 界面 smoke
├── export_presets.cfg       # Linux / macOS / Windows 桌面导出
├── assets/                  # 共享素材（art/books/data/audio/ephemeris）
├── worldmap/                # 地图源数据（.gdignore，同步进 content/world/）
├── docs/                    # 见下
└── archive/                 # 旧版本索引 + 初代网页版快照
```

## 文档地图

| 文档 | 讲什么 |
|---|---|
| [`docs/STATUS.md`](docs/STATUS.md) | **现在到哪一步**——唯一权威现状页 |
| [`docs/REQUIREMENTS_INDEX.md`](docs/REQUIREMENTS_INDEX.md) | 需求、验收与交付索引；区分当前文档和历史记录 |
| [`docs/12_CITY_CLOSURE_MATRIX.md`](docs/12_CITY_CLOSURE_MATRIX.md) | 十二主城选择、后果链和即时反馈接线矩阵 |
| [`docs/PLAN.md`](docs/PLAN.md) | 下一步具体怎么做、做到什么算完、怎么验 |
| [`docs/FATEQUEST_ENGINE_REQUIREMENTS.md`](docs/FATEQUEST_ENGINE_REQUIREMENTS.md) | **引擎、数据、七系统、文本、美术、排期、风险与发布验收总需求** |
| [`docs/FATEQUEST_ENGINE_AUDIT_2026-07-31.md`](docs/FATEQUEST_ENGINE_AUDIT_2026-07-31.md) | 本轮剧情接线、文本、资源与测试结果 |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | 阶段顺序（P0–P7 已闭环） |
| [`docs/GDD.md`](docs/GDD.md) | 游戏设计文档 |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`CODE_PLAN.md`](docs/CODE_PLAN.md) · [`DATA_MODEL.md`](docs/DATA_MODEL.md) | 架构 · 内核规格 · 数据模型 |
| [`docs/archive/AUDIT_2026-07.md`](docs/archive/AUDIT_2026-07.md) | 六方面验证报告与修复清单 |
| [`docs/archive/PLAN-2026-07-T1-T6.md`](docs/archive/PLAN-2026-07-T1-T6.md) · [`archive/ATLAS_PORT.md`](docs/archive/ATLAS_PORT.md) | T1–T6 执行记录 + Atlas 移植对照 |
| [`docs/LORE_PIPELINE.md`](docs/LORE_PIPELINE.md) · [`L10N_PLAN.md`](docs/L10N_PLAN.md) | 语料接入 · 多语言 |
| [`docs/ASSETS_REQUIREMENTS.md`](docs/ASSETS_REQUIREMENTS.md) | **素材总索引**（美术+音频+文本） |
| [`docs/ART_REQUIREMENTS.md`](docs/ART_REQUIREMENTS.md) · [`assets/art/ART_TODO.md`](assets/art/ART_TODO.md) | 美术需求与缺口 |
| [`docs/TEXT_REQUIREMENTS.md`](docs/TEXT_REQUIREMENTS.md) · [`STORY_REQUIREMENTS.md`](docs/STORY_REQUIREMENTS.md) | 文本库存与 T1–T6 规格（已闭环） |
| [`docs/AUDIO_PLAN.md`](docs/AUDIO_PLAN.md) · [`assets/audio/MANIFEST.md`](assets/audio/MANIFEST.md) | 配乐规划与清单 |
| [`archive/README.md`](archive/README.md) | 旧分支版本、最终提交与恢复方式 |

## 现状一览

玩法已闭环：世界能走、城市能逛、文字能读、货能贩、人能带、书能合上。
102 城 · 204 路线 · 331 事件 · 60 商品 · 54 随从 · 24 种占法注册，其中 8 法已用
真实引擎接入玩法（易占/八字/签占/塔罗/筊杯/星骰/沙盘/卢恩）。en/zh 各 3169 条
文本。**25 道门禁、16 单测、12 smoke 全绿。** 详见
[`docs/STATUS.md`](docs/STATUS.md)。

## 红线

仅供娱乐与文明探索，不构成任何现实建议。宗教意象遵循 GDD 红线：不拟人化神明、
圣所场景保持敬畏、不合成可辨识语义的礼拜声响。史料中的时代性宗教贬语一律改写
而非引用——由门禁 G24 强制。
