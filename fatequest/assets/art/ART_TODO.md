# 缺失贴图清单 · ART TODO（v4.1 · 2026-07-26）

本文件是**唯一的缺口总表**。完成度对照见 [`docs/ART_REQUIREMENTS.md`](../../docs/ART_REQUIREMENTS.md)。

**放置**：`assets/art/` 或 `assets/decks/<牌组>/`，文件名=引用名，`.webp`。缺图 → SVG/emoji。

**风格**：云岭暮光。见 `ART_BRIEF.md`。透明底须真 alpha（`dealpha.py --apply`）。

---

## ✅ 已有（580 张根目录 + 牌组）

### 批量 REQ · 174/174 ✅

（同 `ART_REQUIREMENTS.md` §2，略）

### 2026-07 后补 · 原 P0 主体已落盘 ✅

| 类别 | 状态 |
|---|---|
| 七书封 `book-*` | **7/7** |
| `desk-parchment` + `scene-desk-opening` | ✅ |
| 过场 `load-*` | **11/11** |
| `fate-wheel` + `fate-bar-*` | **4/4** |
| `culture-*` | **5/5** |
| Polo 入城图（旧拼写文件名） | **12**（见需求文档别名表） |
| 序章 `site-venice/acre-*` | **6** |
| `explore-*` | **36** |

---

## ❌ 仍缺出图

### P0 残缺 · 信仰徽（4）

| 引用名 | 状态 |
|---|---|
| `faith-daoism.webp` | ❌ |
| `faith-nestorian.webp` | ❌ |
| `faith-hindu.webp` | ❌ |
| `faith-folk.webp` | ❌ |

（`faith-latin/orthodox/islam/buddhism` 已有 ✅）

### P1 · Polo 探索大图 / 随从 / 契约

| 类别 | 缺 | 备注 |
|---|---|---|
| `site-<polo-id>-{1,2,3}.webp` | ≈30+ | 仅 venice/acre 有；满配城用 `explore-*` 顶 |
| `city-shangdu-entry` / `city-hangzhou-entry`（或表 id 直名） | 可选 | 已有 scene 回退 |
| `retainer-<id>.webp` | ~18–22 | 用 `npc-job-*` 顶 |
| `contract-open/divined/sealed` + `seal-wax` | 4 | UI 可无图 |

### P1b · 白图泰六城（M3 玩法已上、图未上）

`tangier` · `cairo` · `damascus` · `mecca` · `delhi` · `calicut`

| 类别 | 建议张数 | 状态 |
|---|---|---|
| `city-<id>-entry.webp` | 6 | ❌ 全缺 |
| `site-<id>-{1,2,3}` 或 `explore-*-<id>` | 18 | ❌ |
| 临时回退 | — | `scene-band-*` + `npc-*-isl` + `load-mosque/bazaar` |

### P2 · 内容扩充（不挡 M0–M3 发版 / 属 M4+ 打磨）

P2 补的是**牌组完整度、货币辨识、收集纪念**三类「锦上添花」资产：主循环（探索/出行/停笔）不依赖它们。  
现有回退：易经 31–64 → Unicode 卦符 / 程序线；货币 → 💰 + 币种文案；贴纸 → emoji / 纯色章；商品 → 已映射 `ic-*`/`item-*`。

#### A. 易经牌面下半部 · 34 张 ❌

| 项 | 说明 |
|---|---|
| **用途** | 技艺页 / 仪式揭示完整 64 卦收藏与翻牌；上半 01–30 已在 `assets/decks/iching/` |
| **规格** | 512×768 不透明；与 01–30 同框（云岭暮光稿本框） |
| **命名** | `iching-<NN>-<english-slug>-full.webp`（King Wen 序，与现有一致） |
| **已有** | **30/64**（`iching-01-…` … `iching-30-the-clinging-full.webp`） |
| **仍缺** | **31–64**（34 张） |
| **Prompt** | 已写好：[`ART_PROMPTS_ICHING_DECK.md`](ART_PROMPTS_ICHING_DECK.md)（Batch 含 #31 Influence 起） |
| **接线** | `data-hexagrams.js` / codex hex 格已认 64；缺文件时 UI 用字符回退 |

建议按 prompt 文档分批出图（separate mode），出完跑 `dealpha` 仅当误出白底（牌面应为不透明羊皮纸）。

#### B. 货币徽 · 5 张 ❌

| 引用名 | 对应游戏 `currency` | 用途 |
|---|---|---|
| `currency-ducat.webp` | `ducat` | 威尼斯 / 拉丁港市集 HUD、价签 |
| `currency-dinar.webp` | `dinar` | 伊斯兰城、白图泰线 |
| `currency-dirham.webp` | `dirham` | 中亚 / 随从薪资显示 |
| `currency-cash.webp` | `cash` | 汉地（上都→刺桐） |
| `currency-sycee.webp` | （银锭扩展 / 汉地大额） | 可选；表未强制，预留给打磨 |

| 项 | 说明 |
|---|---|
| **规格** | 256×256 透明；器物特写（勿画现代纸币），可读小尺寸 |
| **回退** | 文案币种名 + `ic-ritual-coin` / emoji |
| **接线** | `cities.json` / `archetypes.startKit.currency` → 市集价旁图标 |

#### C. 纪念贴纸 · 建议 9 张（随结局 id）❌

结局表已写死 `sticker` 字段；有图则可在停笔/图鉴展示，无图用 emoji 章即可。

| 引用名 | 来源结局（示例） | 意象建议 |
|---|---|---|
| `sticker-stop.webp` | `st-stop` | 合上的笔与册 |
| `sticker-polo.webp` | `st-polo` | 宫廷窗棂 / 汗八里 |
| `sticker-market.webp` | `st-market` | 秤与布匹 |
| `sticker-diviner.webp` | `st-diviner` | 三枚铜钱 |
| `sticker-map.webp` | `st-map` | 展开残图 |
| `sticker-silk.webp` | `st-silk` | 一匹丝 |
| `sticker-no-return.webp` | `st-no-return` | 断桥 / 背向落日 |
| `sticker-translate.webp` | `st-translate` | 双语残页 |
| `sticker-battuta.webp` | `st-battuta` | 朝觐圆环 / 棕榈与圆顶 |

| 项 | 说明 |
|---|---|
| **规格** | 256×256 透明；蜡印/手绘贴纸感，边缘可微毛边 |
| **文件名** | `sticker-<suffix>.webp`，suffix = 去掉 `st-` 前缀（或全名 `sticker-st-polo`——**选定后与 `effects`/`endings` 对齐一次**；推荐短名上表） |
| **扩展** | 城纪念章（`sticker-city-tabriz` 等）可后加，不阻塞 |

#### D. 商品独立图标 · 不做新图 ⏭️

| 项 | 说明 |
|---|---|
| **原设想** | `goods-<id>.webp` ×60 |
| **现状** | [`GOODS_ART_MAP.json`](GOODS_ART_MAP.json) 已把商品/工具映到现有 `ic-*` / `item-*` |
| **决策** | **P2 不再为商品单开一批**；仅当某货映射难看时个案补 1 张 `item-*` |
| **接线** | 市集/行囊统一走 `FQ.goodsArt()`（或等价）+ `ui-slot-*` |

#### P2 数量小结

| 子项 | 缺 | 状态 |
|---|---|---|
| 易经 31–64 | **34** | ❌ 有完整 prompt |
| 货币 | **5**（sycee 可算第 5） | ❌ |
| 结局贴纸 | **9**（建议集） | ❌ 表 id 已存在 |
| 独立 goods | **0** | ⏭️ 映射完成 |
| **合计建议出图** | **≈48** | 不挡发版 |

**P2 出图顺序建议**：货币 5（HUD 立刻受益）→ 贴纸 9（停笔反馈）→ 易经 31–64（牌组收藏最长）。

---


## 🔌 接线待办（非新素材 · M4 优先）

| 动作 | 素材 | 状态 |
|---|---|---|
| 书案/标题 → `book-*` + `desk-parchment` | ✅ 已有文件 | ✅ 已接 `app.js` title |
| chargen → `fate-wheel` / `fate-bar-*` / `fate-rank-*` / `culture-*` / `faith-*` | ✅ 文件（信仰缺 4 → emoji 占位） | ✅ `chargen.js` |
| 入城 → **别名表** `city-tauris-entry` ↔ `tabriz` 等 | ✅ 文件 | ✅ `js/art-map.js` `FQ.cityEntryArt` |
| 探索按钮 → `explore-*` | ✅ 文件 | ✅ `city.js` hub/market/shrine |
| 导师 → `mentor-*` | ✅ | ✅ `FQ.mentorArt` |
| 仪式签法 → `ritual-lot-*`；星骰 → `astrodice/` | ✅ | ✅ lot 已接；星骰仍 emoji |
| 过场 → `load-*` | ✅ | ⏳ 出行页未接 |
| 市集行 → `GOODS_ART_MAP` + `ui-slot-*` | 映射已有 | ✅ `FQ.goodsArt` 市集/行囊 |
| 雾地图 → 暂不接旧 `map.js`（已归档）；可选新 SVG/羊皮纸层 | ⏳ | ⏳ |
| 白图泰 → **占位中 · 同名替换** | `city-{id}-entry` 目标名 + `CITY_ENTRY_BAND` 底图 | ✅ 占位；真图生成后放同名 webp |

---

## 优先级小结

| 序 | 内容 | 量 |
|---|---|---|
| 1 | **接线**（开场/chargen/入城别名/explore/仪式） | 0 新图 |
| 2 | 补 4 张 `faith-*` | 4 |
| 3 | 白图泰 6 入城（+可选 site） | 6–24 |
| 4 | Polo `site-*` 大图 + 随从 | ≈50 |
| 5 | P2 货币→贴纸→易经 31–64（见上节） | ≈48 |
