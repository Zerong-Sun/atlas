# 生成式工具使用记录 · AI_USAGE

**2026-08-07 · 对应需求书 §11.2 资产记录规范与 §13.6 发布候选第 8 项。**

本文如实记录《远行之书》开发中使用的生成式工具、用途边界、记录存放位置与人工审阅/修改情况，
供 Steam EA 上架审核与后续发行合规使用。**原则：生成记录与人工修改说明逐项可查；不输入无授权
在世艺术家作品作为风格复制目标；不使用未授权商业发布的模型输出。**

---

## 1. 使用的生成式工具与用途

| 类别 | 工具 | 用途 | 产出物 |
|---|---|---|---|
| 美术图像 | ChatGPT 图像生成（DALL·E 系） | 中世纪抄本风美术资产：UI 饰纹、场景背景、城市插图、NPC 肖像、faith 徽记、contact sheet 组图 | `assets/art/*.webp`（674 张生产图） |
| 美术 Prompt | Midjourney / SD / Flux 语体 | 以 `assets/art/ART_PROMPTS*.md` 保存的可复制 Prompt 表（3 变体/图） | `assets/art/ART_PROMPTS*.md` |
| 文本/代码 | Claude / 其他代码助手 | i18n 双语文案起草、占法结果文本、工具脚本与门禁脚本 | `content/story/` · `content/i18n/` · `tools/` · `tests/` |

> 说明：Prompt 表文档同时兼容 Midjourney/SD/Flux 语体，但项目实际投产的生成对话以 ChatGPT
> 会话归档为主（见 §2）。美术成图全部经过人工裁切、校准与接线验收（§3）。

## 2. 美术生成对话归档（可追溯）

- **位置**：`assets/art/_archive/chats/`（每段对话一个目录 + `index.json`）
- **规模**：`index.json` 记录 31 段对话、45 张已存图，`archived_at` 2026-07-26
- **对话类型**：Faith Emblem Icons、Image Generation Request、Medieval Travel Book Covers、
  UI Ornaments、Manuscript Backgrounds / City Gate Illustrations、13th-century city entries /
  NPC Portraits、Contact Sheet 系列等
- **注意**：`index.json` 含少量与美术无关的杂项对话（归档时并录），发布前需人工甄别并在
  本表勾选归档（§5 签署区）。

## 3. 人工修改与审阅链

生成图 **不直接进包**，须经过：人工裁切（`_sheets/` → 单图）→ 样式/内容校验（拒绝
棋盘格、错误文字、现代符号、拟人化神明）→ `art_wire_index.json` 接线 → 文化审阅人签署。

| 环节 | 证据 |
|---|---|
| Prompt 权威表 | `assets/art/ART_PROMPTS*.md`（3 变体/图，含红线） |
| 对话原档 | `assets/art/_archive/chats/`（`index.json` + 全量变体） |
| 错误底板备份 | `assets/art/_archive/scene-region-*-wrong-content.webp` |
| 接线审计 | `python3 tools/art/audit.py` → 674/674 完好 · 0 棋盘格 · 0 损坏 · 674 接线 |
| 门禁拦截 | `validate.mjs` G24（时代性宗教贬语）0 errors |
| 术语一致性 | `assets/data/glossary.json`（筊/周易/季风/商队/驿栈等） |

## 4. 合规边界（需求书 §11.2）

- 只使用项目允许商业发布的模型与素材；不输入无授权在世艺术家作品作为风格复制目标。
- 不生成：拟人化神明、现代旗帜、错误宗教符号、不可控文字、透明棋盘格烘焙像素。
- 生成记录与人工修改说明按要求保留在 §2/§3 所列路径。

## 5. 签署区（人工填写）

| 归档项 | 证据位置 | 复核人 | 日期 |
|---|---|---|---|
| 美术对话归档甄别（剔除杂项对话） | `assets/art/_archive/chats/index.json` | | |
| Prompt 表与投产图一一对应 | `assets/art/ART_PROMPTS*.md` | | |
| 接线审计 674/674 | `python3 tools/art/audit.py` | | |
| 文化审阅（宗教符号/史料 origin） | `content/world/passages.json` + G24 门禁 | | |
