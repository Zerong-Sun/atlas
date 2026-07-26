# 文本与语料需求 · TEXT REQUIREMENTS

**2026-07-26（M0–M3 后）。** 游戏文案、游记语料、图鉴与结局的完成度对照。系统表 schema 见 `SYSTEM_TABLES.md`；接入管线见 `LORE_PIPELINE.md`；玩法验收见 `V3_MVP_CHECKLIST.md` / `V3_M2_M3_CHECKLIST.md`。

---

## 0. 总览

| 层 | 状态 | 说明 |
|----|------|------|
| **M0 表结构** | ✅ | 八表 + transports + **codex.json** |
| **M1 Polo 可玩文** | ✅ | 14 城事件可跑通（偏短见闻体） |
| **M2 占卜文** | ✅ | `divinations.json` ×3 + 仪式/分支文案 |
| **M3 白图泰 + 图鉴 + 对话树** | ✅ 最小章 | 6 城 + 桥 + 开罗/麦加 3 拍树 + 100 条 codex |
| **M4 文本打磨** | ✅ 本轮 | 入城 300–500、site≥150、图鉴扩写、大马士革树；全量中译/结局池仍延后 |

当前库内规模（约）：**20** 城 · **107** 事件 · **100** 图鉴 · **9** 结局 · **4** 身份 · **114** 术语。

---

## 1. 系统表文案

| 表 | 文件 | M3 状态 | 剩余需求 |
|----|------|---------|----------|
| 城市 | `cities.json` | Polo 14 + Battuta 6 ✅ | 白图泰 `specialty`/市集名可再本地化 |
| 事件 | `events.json` | **110** ✅（+大马士革树） | 入城 **≈300–340 汉字** ✅；site ≥150 ✅ |
| 路线 | `routes.json` | Polo + Battuta 脊 + 巴格达桥 ✅ | 路名/遭遇文可再润色 |
| 商品 | `goods.json` | 60+ ✅（含伊斯兰/印度货） | 稀有货 flavor 句 |
| 占卜 | `divinations.json` | 3 MVP ✅ | M4：扩到更多 `METHODS` 与表行 |
| 随从 | `retainers.json` | Polo 导师 + 6 Battuta 向导 ✅ | 人物小传加长；立绘接线见美术文档 |
| 身份 | `archetypes.json` | marco / merchant / pilgrim-road / **battuta** ✅ | 执念/结局列表打磨 |
| 结局 | `endings.json` | 停笔 + 隐藏 + **end-battuta-witness** ✅ | 变量池与多段 epilogue |
| 图鉴 | `codex.json` | **102** 条 ✅（+damascus） | 正文已扩写可读段；可继续按分类润色 |
| 术语 | `glossary.json` | **114**（含朝觐词） ✅ | 可持续加 |

**效果词表（含 M2）**：原 SYSTEM_TABLES 词 + `routeMod` · `omenStat`（运行时）；事件作者侧仍主要用 `unlockRoute` / `revealMap` / `codex` / `goto` / `divination` 分支。

---

## 2. 游记语料

| 语料 | 文件 | 运行时 | 状态 |
|------|------|--------|------|
| 马可·波罗 | `assets/books/marco-polo-lore.json` | `data-marco-lore.js` | ✅ 结构化；走廊 **zh trunk** 部分完成 |
| 波罗中译主干 | `js/data-lore-zh-trunk.js` | 已挂 `index.html` | ✅ 序章+走廊枢纽；其余 place **pending** |
| 伊本·白图泰 | `ibn-battuta-lore.json` | `data-battuta-lore.js` | ✅ 已提取并接线；事件多为改写/节选 |
| 白图泰中译 trunk | `data-lore-zh-battuta-trunk.js` | 已挂 | ✅ **6 枢纽短文**；全书 zh 仍 pending |
| 其他游记 JSON | jubayr / fadlan / pinto / yingya… | 未进主路径 | ⏳ M4+ 扩章 |
| 方案 A Polo 走廊 | `LORE_PIPELINE` | — | ✅ 已采纳并落地 |
| 方案 B 白图泰章 | 同上 | — | ✅ **最小六城章已落地**；非全 46 place |

重建内容脚本：`node scripts/build-m2-m3-content.mjs`（会重写 Battuta 相关行，慎用）。  
M4 文本：`node scripts/build-m4-text.mjs` · 验收：`node scripts/check-m4-text.mjs`。

---

## 3. 图鉴（GDD §13）

| 项 | 状态 |
|----|------|
| 表 `codex.json` | ✅ 100 id（含 events 发出的 `cx-*`） |
| UI Records →「图鉴」 | ✅ `app.js` loreCodex |
| 分类 geography / religion / goods / travel / people… | ✅ 字段有；文案短 |
| 解锁 → 隐藏结局 / 旁路 | ⚠️ 部分靠 `codexPct` 类条件未全接；目前以 flag/visited 为主 |

**剩余**：按分类把 `body` 扩到可读段落（中英），并与 lore.ref 对齐游记句。

---

## 4. 对话树与事件深度

| 项 | 状态 |
|----|------|
| 单屏 `choices[]` | ✅ 主路径 |
| `goto: event:<id>` 链式 | ✅ 已实现 |
| 开罗断案 3 拍 | ✅ `ev-cairo-tree-*` |
| 麦加朝觐 3 拍 | ✅ `ev-mecca-tree-*` |
| 大马士革香市 3 拍 | ✅ `ev-damascus-tree-*` |
| Polo 满配 entry/site 加厚 | ✅ M4：entry 300+ / site 150+ |
| 多城多树 / `scene.js` 演出 | ⏳ 德里/刺桐等可续 |

---

## 5. 占卜相关文案（M2）

| 项 | 状态 |
|----|------|
| 三法 name / resultTexts / cost | ✅ |
| 仪式预兆 i18n（含 astrodice） | ✅ |
| 路上/城内 pass·fail 短句 | ✅ 部分事件 |
| 十法全套学习说明 | ⏳ 技艺页仍用旧 i18n；表仅 3 行 |

---

## 6. 明确不做 / 延后（文本）

- 258+ place 全量人工中译  
- 白图泰 46 place 全量进 `cities.json`  
- 郑和章 / 自由海商扩点正文  
- 结局生成 LLM 管线  
- 旧 journey `data-quests-stories` 回流（已归档）

---

## 7. M4 文本优先级（本轮完成 / 剩余）

1. ✅ 图鉴 `codex.json` 正文扩写  
2. ✅ Polo / Battuta **入城** 300+ 字见闻体 + `lore.ref`  
3. ✅ 大马士革枢纽对话树（德里/刺桐仍可续）  
4. ⏳ 结局 epilogue 变量与隐藏条件可读性  
5. ⏳ 术语表与 UI 浮层提示联动  

验收：`node scripts/validate-tables.mjs` · `node scripts/check-m4-text.mjs` · `node scripts/test-v3-effects.mjs` + 手工走 Polo 占卜改路、Battuta 朝觐/大马士革香市树、Records 图鉴。
