# 未完成需求 · OPEN REQUIREMENTS

《远行之书》剩余工作。**只列没做的。** 已做的见 §0。
本文与 `GDD.md`（设计）、`SYSTEM_TABLES.md`（字段规格）并列；三者都是活文档。

---

## 0. 已完成（不要重做）

| 项 | 产出 | 位置 |
|---|---|---|
| 世界地图数据管线 | Natural Earth 海岸线 + 124 座中世纪城市，投影后 149 KB JSON | `scripts/build_worldmap.py` → `assets/data/worldmap.json` |
| 可点击舆图 | SVG 渲染、城市可点、详情卡、墨晕迷雾、缩放居中 | `js/bof/worldmap.js` |
| 八张系统表 | 全部落库，校验零错 | `assets/data/*.json` |
| 事件闭环 | 57 事件 / 118 选项，每项都有后果文本与效果回执 | `js/bof/event.js` |
| 角色抽取 | 生辰 → 命格九等 → 身份 → 起点城市，一气呵成 | `js/bof/roll.js` |
| 出行四拍 | 择舟车 → 城市简介 → 确定出发 → 动画 | `js/bof/travel.js` |
| 占卜小游戏 | 六种，各具形制，不通过不算学会 | `js/bof/learn.js` |
| 存档 | 自动存档 + 六手动槽位 | `js/bof/save.js` |
| 美术占位 | 真名 → 顶替图 → 程序占位，三级回退 | `js/bof/art.js` |
| 结局 | 九个，三层，变量插值 | `js/bof/end.js` |

入口：`book.html`。旧的 `index.html`（灵游 FateQuest）仍在，未受影响。

---

## 1. 内容量（最大的缺口）

现有数据是**可玩的骨架**，不是 MVP 的量。缺口按 GDD §16：

| 表 | 现有 | MVP 目标 | 缺 |
|---|---|---|---|
| 城市 | 14 | 12 ✅ | — |
| 探索点事件 | 42 | 36 ✅ | — |
| 入城事件 | 15 | 12 ✅ | — |
| 途中遭遇 | **0** | 约 40 | **40** |
| 商品 | 46 | 60 | 14 |
| 路线 | 20 | — | 视城市扩充 |
| 占卜法 | 6 | 3 ✅ | — |
| 随从 | **0** | 12–18 | **全部** |
| 结局 | 9 | 8 ✅ | — |

**优先级**：途中遭遇 > 随从 > 商品补齐。

### 1.1 途中遭遇（`events-road.json`，新建）

`kind: "road"`，挂在路线上而非城市。`when` 增加 `routes[] / kinds[] / hazards[] / season[]`。
出行动画结束前插入 1–2 张，让长途不只是数字。每条至少 2 个选项，效果偏向：损货、误期、
遇人（可招募）、发现岔路（`revealRoute`）、身体（未来的 hp）。

按地带各写 6 条：`europe / west_asia / central_asia / steppe / china / india / maritime_asia`。

### 1.2 随从（`retainers.json`）

字段规格已在 `SYSTEM_TABLES.md §8`，一字未动即可用。MVP 只做：

- **公开招募**与**占卜抽选**两种方式（神秘契约留到二版）
- 三类：向导、翻译、驮夫
- 生辰封印只做一级（出生季节），三级揭示留到二版
- 库存联动：驮夫加陆路货格，船员只加海路，随从离队则货格失效，超出部分玩家须处理

引擎缺口：`js/bof/retainer.js` 未建；`save.js` 的 `retainers[]` 已预留。

### 1.3 商品补 14 种

补齐大区代表商品（GDD §9.1），东非象牙/黄金、中亚毡毯玉石、东南亚沉香檀香这几路最薄。

---

## 2. 系统缺口

### 2.1 市集尚不能交易

`cities.json` 有 `market{goods, currency, spread}`，城市页只**列出**商品。缺买卖界面与定价函数：

```
价 = base ↔ far ↔ hot 三段插值，按 距离 × 稀缺 × 声望 × 财货运 × spread
```

刹车已在数据里（`risk.spoil/theft/seizure`、`bulk`、`needs`），需要在交易与出行里生效。

### 2.2 货币兑换未实现

`goods.json` 的 `currencies[].rate` 已填。缺：跨币结算、兑换损耗、交钞出境作废（`chao-note` 的 note 已写明规则）。

### 2.3 占卜尚未影响路线

六种占法的 `effects` 已定义（`route_risk` / `weather_forecast` / `season_window_visible` …），
**但没有消费方**。需要在 `travel.js` 的 `reckon()` 与 `worldmap.js` 的详情卡里读取，否则占卜仍是装饰——
这是 GDD §8.2 的红线。

### 2.4 声望只加不减、不分地区生效

`rep.city / rep.band` 已记录，但除结局判定外无人读取。应影响：事件门槛、市集价差、招募池、路线解锁。

### 2.5 历法与时代效应

`cities.json` 的 `calendars[]` 与 `roll.js` 的 `ERAS` 已就位，但游戏内日期只是天数累加。缺：
- 一个内部日期 → 多历法解释（GDD §7.2）
- 黑死病 1347–1353 的封路与物价（`ERAS` 已写文本，无机制）
- 在位者随年代变化

### 2.6 图鉴与贴纸只存 id

`codex[] / stickers[]` 只是字符串数组，没有条目内容表。需要 `codex.json`：`id / 分类 / 标题 / 正文 / 出处`。
事件里已引用 **50 个不同的 codex id**、18 个 sticker id，**全部无定义**——收集系统目前只亮一个空壳。

---

## 3. 美术

`node scripts/audit_art.mjs` 是唯一权威清单，`--write` 重写 `ART_TODO_GENERATED.md`。

当前：**159 个引用位** = 已定稿 0 · 借用顶替 87 · 纯占位 72。

- **顶替**：`assets/data/art-aliases.json` 指向一张现成近似图，能玩。出图后删掉那一行。
- **占位**：程序画的灰底方块，只标名字。
- **替换方式**：把 `<引用名>.webp` 放进 `assets/art/`，自动生效，**不改代码**。

纯占位的 72 张按急迫度：

| 批次 | 内容 | 张数 |
|---|---|---|
| A | 商品图标 `goods-*` | 46 |
| B | 纪念贴纸 `sticker-*` | 18 |
| C | 货币 `coin-*` | 8 |

顶替中最该先画真稿的：8 张师父立绘、6 张行者立绘（角色抽取是开场第一印象）。

风格与调色见 `assets/art/ART_BRIEF.md`（未变）。

---

## 4. 技术债

| 项 | 说明 |
|---|---|
| 两套入口 | `index.html`（旧 FateQuest）与 `book.html`（本作）并存。旧作的塔、日签、牌阵尚未接入新框架；决定是移植还是弃用。 |
| ~~`sw.js` 未收录新资源~~ | 已修：`fatequest-v3` 收录 `book.html`、`js/bof/*`、`assets/data/*.json`，离线可开。 |
| ~~新引擎无 CI 覆盖~~ | 已修：`scripts/check_bof.mjs` 校验八表结构 + 经济可达性（全图可达、无城可困死无钱之人），已接入 `.github/workflows/ci.yml` 的 `validate-fatequest`。逻辑层（`fx.js` 施效、`learn.js` 计分）仍靠浏览器内手测，可再补 headless。 |
| 地图详情卡在窄屏溢出 | `max-height:74%` 可滚动，但桌面端位置可再调。 |
| `worldmap.json` 149 KB | 首屏预算 250 KB 已用掉大半。若要更多城市，考虑按地带分片懒加载。 |

---

## 5. 下一步建议顺序

1. **占卜接上路线**（§2.3）——最小改动，最大兑现设计承诺
2. **途中遭遇 40 条**（§1.1）——让长途有内容
3. **市集交易**（§2.1）——经济闭环
4. **随从 MVP**（§1.2）
5. **图鉴表**（§2.6）——把已埋的 50 个引用兑现
6. 美术批次 A/B/C
