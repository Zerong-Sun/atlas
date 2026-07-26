# 远行之书 FateQuest · v3.0（PWA M0–M3+，M4 打磨中）

中世纪欧亚旅行开放世界。主路径：角色抽取 → 城市探索 → 雾地图 → 出行 / 五拍占卜 → 停笔结语。

- **第一章** Polo 走廊（威尼斯→刺桐 + 上都/杭州）
- **第二章** 白图泰线（丹吉尔→开罗→大马士革→麦加→德里→卡利卡特）
- v2 占途/命途塔已退出主路径，见 [`archive/v2-pwa/`](archive/v2-pwa/README.md)

## 运行

```bash
cd fatequest
npx serve .
# 勿用 file://（JSON 表需 fetch）
```

```bash
node scripts/validate-tables.mjs
node scripts/test-v3-effects.mjs
# 重建 Battuta/图鉴等内容（可选）：
node scripts/build-m2-m3-content.mjs
```

验收：[`docs/V3_MVP_CHECKLIST.md`](docs/V3_MVP_CHECKLIST.md) · [`docs/V3_M2_M3_CHECKLIST.md`](docs/V3_M2_M3_CHECKLIST.md)

文本缺口：[`docs/TEXT_REQUIREMENTS.md`](docs/TEXT_REQUIREMENTS.md)  
美术缺口：[`docs/ART_REQUIREMENTS.md`](docs/ART_REQUIREMENTS.md) · [`assets/art/ART_TODO.md`](assets/art/ART_TODO.md)

## 游戏内容规模

| 维度 | 数量 | 说明 |
|------|------|------|
| 城市 | **20** | Polo 14 + Battuta 6 |
| 事件 | **107** | 含 road / tree 对话树 |
| 图鉴 | **100** | codex 条目 |
| 结局 | **9** | 停笔 + 隐藏 |
| 身份 | **4** | marco / merchant / pilgrim-road / battuta |
| 术语 | **114** | 含朝觐词 |
| 占卜法 | 10+ | tarot / lenormand / i ching / astrodice / runes |
| 美术资产 | **580+** | `assets/art/*.webp` + deck 图 |
| 塔罗牌 | 40 | 大/小阿卡纳 |
| 易经 | 30 | 卦 1–30（31–64 缺）|
| 雷诺曼 | 36 | Dondorf 公版 |
| 星骰 | 34 | 行星/星座/宫位 SVG |

## 项目结构

```text
assets/
├── data/              # 系统表 + transports + codex（cities/events/routes/goods…）
├── art/               # 580+ .webp 美术素材（场景/UI/图标/入城/角色…）
│   ├── _sheets/       # 批量生成组图原始归档
│   └── _archive/      # ChatGPT 对话备份
├── decks/             # 牌组（tarot/iching/lenormand）
├── books/             # 游记语料 JSON（marco-polo / ibn-battuta / …）
└── astrodice/         # 星骰 SVG
js/                   # 核心运行时（~29 个模块）
├── app.js             # PWA 主入口
├── state.js           # 全局状态管理
├── chargen.js         # 角色抽取
├── city.js            # 城市探索
├── travel.js          # 出行
├── ritual.js          # 五拍占卜仪式
├── effects.js         # 效果引擎
├── scene.js           # 演出/过场
├── engines.js         # 占卜引擎（tarot/iching/astrodice/runes）
├── quest.js           # 任务/结局
├── i18n.js            # 中英双语
├── juice.js           # Emoji 回退与 UI 美化
├── data-loader.js     # 数据加载
├── fx.js              # 视觉特效
├── atmo.js            # 氛围
├── audio.js           # 音效
└── data-*.js          # 各类静态数据
scripts/              # 工具脚本
├── validate-tables.mjs    # 系统表校验
├── test-v3-effects.mjs    # 效果引擎测试
├── build-m2-m3-content.mjs  # Battuta/图鉴重建
├── build-lore-runtime.mjs # 游记语料构建
├── validate-outcomes.mjs  # 结局校验
├── art-gen-kit/           # ★ ChatGPT 批量生图工具包
│   ├── orchestrate_req.py # 主调度器（多窗口轮询续跑）
│   ├── chatgpt_gen_art.py # 单批/legacy 提交
│   ├── batch_art_utils.py # Prompt 解析 + 组图裁切
│   ├── crop_contact_sheet.py
│   ├── postprocess_art.py # 抠白底/去棋盘格/审计
│   ├── dealpha.py
│   ├── run_parallel.py    # 多文件并行
│   └── launch_chrome_debug.sh
archive/v2-pwa/      # 旧 journey / tower / map / stories
docs/                # 设计文档
├── GDD.md            # 游戏设计文档
├── SYSTEM_TABLES.md  # 系统表规格
├── ATLAS_PORT.md     # Atlas → FateQuest 迁移说明
├── LORE_PIPELINE.md  # 游记处理管线
├── REQ_ANALYSIS.md   # 需求分析
├── TEXT_REQUIREMENTS.md
├── ART_REQUIREMENTS.md
└── V3_*_CHECKLIST.md # 里程碑验收清单
```

## 里程碑状态

| 阶段 | 状态 | 内容 |
|------|------|------|
| **M0** | ✅ | 八张系统表 + transports |
| **M1** | ✅ | Polo 走廊可玩闭环（角色→探索→出行→停笔）|
| **M2** | ✅ | 五拍占卜仪式 + 三法对接 + 改路 |
| **M3** | ✅ | Battuta 六城 + 图鉴 + 对话树 + 白图泰身份 |
| **M4** | ⏳ | 文本打磨、接线（alias/chargen/explore）、信仰徽、P1 大图 |

M4 优先级：① 接线表；② 补 4 信仰徽；③ 白图泰 6 入城图；④ 图鉴正文扩写。

## 批量生成美术流程

Prompt 模板 → ChatGPT（Chrome CDP）→ 裁切/WebP → 后处理（抠白底/去棋盘格）。

详见 [`scripts/art-gen-kit/README.md`](scripts/art-gen-kit/README.md)。

## 其他文档

- [GDD](docs/GDD.md) · [系统表规格](docs/SYSTEM_TABLES.md) · [迁移说明](docs/ATLAS_PORT.md)
- [验证修复清单 M0–M1](docs/VERIFY_FIXLIST.md) · [验证修复清单 M2–M3](docs/VERIFY_FIXLIST_M23.md)
