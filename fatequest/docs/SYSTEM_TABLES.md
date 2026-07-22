# 系统表规格 · SYSTEM TABLES

《远行之书》把世界观变成可制作系统的八张表。**每张表都给出字段定义、取值域与一条真实样例**；填表即内容生产，填完即可开发。

数据放在 `assets/data/*.json`，一表一文件。所有面向玩家的文本字段一律为双语对象 `{zh, en}`。

**通用约定**

- `id`：小写连字符，全局唯一，永不复用
- `origin`：`"source"`（游记原文改写）｜`"authored"`（据原文语体新撰）｜`"hybrid"`
- `ref`：回溯来源，形如 `{book:"marco-polo", chapterId:"v1-b1-c14"}`
- `bands`：`europe｜west_asia｜central_asia｜steppe｜china｜india｜maritime_asia`
- `faiths`：`latin｜orthodox｜islam｜buddhism｜daoism｜nestorian｜hindu｜folk`
- 命运数值一律 0–31；对外显示走九等（上上…下下）

---

## 1. 城市表 `cities.json`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | `venice` |
| `name` | {zh,en} | 城市名 |
| `band` | enum | 所属地带 |
| `culture` | enum | 文化圈（latin / islamic / east_asia / steppe / indian_ocean） |
| `faiths` | enum[] | 当地主要信仰，首项为主导 |
| `coord` | [lng,lat] | 真实经纬度（地图用仿射投影转视图坐标） |
| `view` | [x,y] | 舆图视图坐标（820×420 画布） |
| `tier` | enum | `metropolis｜city｜town｜station`，决定是否开放随从招募池 |
| `entryEvent` | id | 指向事件表：入城检查 |
| `sites` | id[] | **三个探索点**（指向事件表） |
| `mentor` | id | 地方导师（指向随从表或导师条目） |
| `market` | {goods:id[], currency:id, spread:number} | 可交易商品、结算货币、买卖价差 |
| `shrine` | {faith, services:enum[]} | 信仰场所：`bless｜convert｜study｜sanctuary` |
| `exits` | id[] | 出口路线（指向路线表） |
| `specialty` | id | 该城独特商品 |
| `calendars` | enum[] | 当地通行历法，影响生辰解读文本 |
| `lore` | {placeId, origin, ref} | 绑定 `marco-polo-lore.json` 的 place 条目 |

**样例**

```json
{
  "id": "quanzhou",
  "name": { "zh": "泉州（刺桐）", "en": "Zayton" },
  "band": "china", "culture": "east_asia",
  "faiths": ["folk", "islam", "buddhism", "nestorian"],
  "coord": [118.59, 24.87], "view": [700, 262], "tier": "metropolis",
  "entryEvent": "ev-quanzhou-entry",
  "sites": ["ev-quanzhou-port", "ev-quanzhou-tianfei", "ev-quanzhou-fanfang"],
  "mentor": "npc-chen-po",
  "market": { "goods": ["silk", "porcelain", "pepper", "aloeswood"], "currency": "cash", "spread": 0.18 },
  "shrine": { "faith": "folk", "services": ["bless", "sanctuary"] },
  "exits": ["rt-quanzhou-malacca", "rt-quanzhou-hangzhou"],
  "specialty": "dehua-porcelain",
  "calendars": ["chinese", "islamic"],
  "lore": { "placeId": "zayton", "origin": "source", "ref": { "book": "marco-polo", "chapterId": "v2-b2-c82" } }
}
```

**第一章需填 102 条节点**（GDD §16.2，由 `tools/lore/build_cities.mjs` 生成），其中 `tier: metropolis` 的 **12 条主城**填全字段，其余按 `tier` 递减：`city` 免 `sites`，`town` 再免 `mentor`，`station` 只需 `id/name/band/coord/tier/exits/lore`。

12 主城：大不里士、报达、忽鲁谟斯、巴里黑、撒马尔罕、喀什噶尔、于阗、罗卜、上都、大都、行在、刺桐。

> **`sites` 的三个探索点只对 metropolis 是硬要求**；其余 tier 留空数组，第二章升格时再填。校验器按 `tier` 分级校验必填字段，不要对 station 报缺字段。

---

## 2. 角色表 `archetypes.json`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | `marco` |
| `name` | {zh,en} | 原型名 |
| `start` | cityId | 起点城市 |
| `obsession` | {zh,en} | 旅行执念一句话 |
| `goal` | {type, target} | `reach｜pilgrimage_loop｜network｜free`，及目标城市／条件 |
| `faith` | enum | 初始宗教 |
| `culture` | enum | 初始文化圈 |
| `bonus` | {stat:delta} | 优势（对三条命运条或身份值的修正） |
| `malus` | {stat:delta} | 劣势 |
| `startKit` | {coins, currency, goods:[], items:[], languages:[]} | 初始资源 |
| `endings` | id[] | 可触发的隐藏结局 |

**样例**

```json
{
  "id": "battuta",
  "name": { "zh": "白图泰式旅人", "en": "A Traveler in Ibn Battuta's Manner" },
  "start": "tangier",
  "obsession": { "zh": "完成朝觐，并从不同方向一再回到麦加。", "en": "Complete the hajj — and return to Mecca from every direction." },
  "goal": { "type": "pilgrimage_loop", "target": "mecca", "times": 3 },
  "faith": "islam", "culture": "islamic",
  "bonus": { "rapport": 4, "etiquette_islamic": 2 },
  "malus": { "wealth_luck": -2 },
  "startKit": { "coins": 40, "currency": "dinar", "goods": [], "items": ["letter-of-introduction"], "languages": ["arabic"] },
  "endings": ["end-witness-of-the-world", "end-convert-translator"]
}
```

---

## 3. 占卜表 `divinations.json`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | `bazi` |
| `name` | {zh,en} | 占法名 |
| `culture` | enum | 所属文化 |
| `learnAt` | cityId[] | 可学习地点 |
| `teacher` | npcId | 授业导师 |
| `question` | enum | 它能回答什么：`route｜timing｜person｜trade｜risk｜identity` |
| `inputs` | enum[] | 需要的输入：`birthdate｜date｜question｜object｜dream｜sky` |
| `reads` | enum[] | 可解读对象：`self｜retainer｜route｜city｜year` |
| `outputs` | {advice, confidence, horizon} | 建议文本模板、可信度、时效（今日／今年／三年） |
| `effects` | {stat:delta}[] | 对路线风险、价格透明度、交涉成功率的实际修正 |
| `resultTexts` | {cond, zh, en}[] | 结果文本池，按条件命中 |
| `cost` | {coins, time, favor} | 施行代价 |

**关键约束**：`effects` 不得为空——占卜必须改变世界状态或信息可见度，否则它是装饰（见 GDD §8.2）。

**可对照**：归档 Atlas 的 `../atlas/packages/method-data/src/divinationMethods.ts` 已有 24 条同类注册表，且带 `causalityModel` / `uncertaintyMode` / `evidenceStyle` / `questionDomain` 四维分类——比本表原设计更完备。填表时以它为底稿（人工复制，不共享构建），按 `docs/ATLAS_PORT.md` §3 的映射表补出游戏层字段（`learnAt` / `teacher` / `effects` / `cost`）。

**样例**

```json
{
  "id": "sky-dice",
  "name": { "zh": "星辰骰", "en": "Astral Dice" },
  "culture": "islamic", "learnAt": ["tabriz", "cairo"], "teacher": "npc-tebrizi",
  "question": "timing", "inputs": ["date", "question"], "reads": ["route", "year", "retainer"],
  "outputs": { "advice": "route_window", "confidence": 0.72, "horizon": "season" },
  "effects": [{ "stat": "route_risk", "delta": -2 }, { "stat": "weather_forecast", "delta": 1 }],
  "resultTexts": [
    { "cond": "earth|fire", "zh": "土火之象，宜行陆路，忌泛舟。", "en": "Earth and fire: take the land road; do not put to sea." }
  ],
  "cost": { "coins": 2, "time": 0, "favor": 0 }
}
```

**MVP 需填 3 条**：八字／易占、占星、梦占／圣签。

---

## 4. 商品表 `goods.json`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | `dehua-porcelain` |
| `name` | {zh,en} | 商品名 |
| `tier` | enum | `regional`（大区 20 种）｜`specialty`（城市独有） |
| `origin` | cityId[]｜band[] | 产地 |
| `base` | [min,max] | 本地购入价 100–200 |
| `far` | [min,max] | 普通远地卖价 200–300 |
| `hot` | {cities:[], range:[min,max]} | 高需求地区及 800–1000 区间 |
| `bulk` | number | 占用货格数 |
| `risk` | {spoil, theft, seizure} | 腐坏／被盗／被扣押概率修正 |
| `needs` | enum[] | 携带条件：`dry｜cool｜guarded｜permit` |
| `events` | id[] | 与之关联的事件（如「查验瓷器」） |

**样例**

```json
{
  "id": "dehua-porcelain",
  "name": { "zh": "德化白瓷", "en": "Dehua White Porcelain" },
  "tier": "specialty", "origin": ["quanzhou"],
  "base": [140, 190], "far": [250, 300],
  "hot": { "cities": ["cairo", "venice"], "range": [820, 980] },
  "bulk": 2, "risk": { "spoil": 0, "theft": 0.06, "seizure": 0.04 },
  "needs": ["guarded"], "events": ["ev-porcelain-inspection"]
}
```

**MVP 需填 60 条**。

---

## 5. 路线表 `routes.json`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | `rt-venice-acre` |
| `from` / `to` | cityId | 起讫 |
| `modes` | id[] | 可用交通方式（指向交通表；见下） |
| `days` | number | 基准天数（交通方式再乘系数） |
| `cost` | number | 基准费用 |
| `risk` | 0–5 | 基准风险 |
| `season` | {open:[月], bonus:[月]} | 季风／封路窗口 |
| `unlock` | {type, value}[] | 解锁条件：`map_fragment｜guide｜caravan｜permit｜language｜faith｜rumor` |
| `hazards` | enum[] | `bandits｜storm｜plague｜snow｜sand｜toll` |
| `encounters` | id[] | 途中事件池 |
| `lore` | {storyId, ref} | 绑定游记 story 条目 |

**交通方式子表** `transports.json`：`id / name / kinds(land|sea|river) / dayMul / cost / risk / cargo / needs`（如驿马需 `paiza`）。

**样例**

```json
{
  "id": "rt-hormuz-kerman",
  "from": "hormuz", "to": "kerman",
  "modes": ["caravan", "camel", "foot"], "days": 7, "cost": 6, "risk": 3,
  "season": { "open": [10,11,12,1,2,3], "bonus": [11,12] },
  "unlock": [{ "type": "guide", "value": "npc-desert-guide" }],
  "hazards": ["sand", "bandits"],
  "encounters": ["ev-sandstorm", "ev-ghost-bells", "ev-ruined-station"],
  "lore": { "storyId": "wearisome-desert-road", "ref": { "book": "marco-polo", "chapterId": "v1-b1-c18" } }
}
```

---

## 6. 事件表 `events.json`

最大的一张表，城市入口、探索点、途中遭遇、随从个人任务全部走它。

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | `ev-quanzhou-fanfang` |
| `kind` | enum | `entry｜site｜road｜court｜retainer｜festival｜crisis` |
| `title` | {zh,en} | 标题 |
| `when` | 条件对象 | 触发条件（见下） |
| `scene` | {bg, npc, region} | 场景背景、立绘、区域（决定配乐） |
| `body` | {zh,en} | 正文（叙事体） |
| `choices` | Choice[] | 2–4 个选项 |
| `once` | bool | 是否只触发一次 |
| `lore` | {placeId｜storyId, origin, ref} | 文本来源 |

**`when` 条件字段**：`cities[] / bands[] / faiths[] / minReputation / language / etiquette / season / years[] / hasItem[] / hasRetainer[] / learnedDivination[] / flags[]`

**`Choice` 结构**

| 字段 | 说明 |
|---|---|
| `label` | {zh,en} 选项文字 |
| `needs` | 前置：物品／语言／随从／占法／金钱 |
| `divination` | 可选：以某占法应对，成功率由该占法与命运条决定 |
| `pass` / `fail` | 各自的 `{text, effects[]}` |
| `effects` | 效果指令表（见下） |

**效果指令词表**：`coins｜days｜goods｜item｜reputation(city|band)｜faith｜language｜etiquette｜fate(travel|rapport|wealth)｜unlockRoute｜revealMap｜learnDivination｜recruit｜retainerMood｜sticker｜codex｜flag｜goto`

**样例**

```json
{
  "id": "ev-quanzhou-fanfang",
  "kind": "site", "title": { "zh": "番坊", "en": "The Foreign Quarter" },
  "when": { "cities": ["quanzhou"] },
  "scene": { "bg": "quanzhou-harbor", "npc": "npc-market-mazu", "region": "china" },
  "body": {
    "zh": "番坊自成一街，波斯语、阿拉伯语与闽南话在同一个屋檐下讨价还价。清真寺的宣礼声与妈祖庙的锣声隔街相闻，谁也不觉得奇怪。",
    "en": "The foreign quarter is a street unto itself, where Persian, Arabic and the local tongue haggle under one roof. The call from the mosque and the gong from the sea-goddess's temple cross the street at each other, and nobody finds it strange."
  },
  "choices": [
    { "label": { "zh": "向波斯商人打听海路", "en": "Ask the Persian traders about the sea road" },
      "needs": { "language": "persian" },
      "effects": [{ "op": "revealMap", "value": "rt-quanzhou-malacca" }, { "op": "codex", "value": "cx-monsoon" }] },
    { "label": { "zh": "以星辰骰择一个出海吉日", "en": "Roll the astral dice for a sailing day" },
      "divination": "sky-dice",
      "pass": { "effects": [{ "op": "flag", "value": "good-sailing-window" }] },
      "fail": { "effects": [{ "op": "days", "value": 2 }] } },
    { "label": { "zh": "只买一件白瓷就走", "en": "Buy one piece of white porcelain and go" },
      "effects": [{ "op": "goods", "id": "dehua-porcelain", "value": 1 }, { "op": "sticker", "value": "st-dehua" }] }
  ],
  "once": true,
  "lore": { "placeId": "zayton", "origin": "hybrid", "ref": { "book": "marco-polo", "chapterId": "v2-b2-c82" } }
}
```

**第一章需填 36 条探索点（12 主城 × 3）+ 102 条入城事件 + 约 40 条途中遭遇。**

入城事件覆盖全部节点——`station` 级只需一段短叙事，但**不可缺**：没有入城文本的节点在地图上是个哑点，会直接暴露世界的空心。

---

## 7. 结局表 `endings.json`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | `end-witness-of-the-world` |
| `layer` | 1｜2｜3 | 主动停笔／人物线／世界状态 |
| `name` | {zh,en} | 结局名 |
| `conditions` | 条件对象 | `visitedCities[] / faithChanges / netWorth / codexPct / reputation / learnedDivinations[] / retainersKept / routesOpened / flags[]` |
| `epilogue` | {zh,en} | 结语模板，支持变量插值 |
| `variables` | string[] | 可插值项：`{cities} {years} {faith} {longestRoute} {richestTrade} {lostRetainer}` |
| `sticker` | id | 结局纪念贴纸 |

**样例**

```json
{
  "id": "end-no-return",
  "layer": 3,
  "name": { "zh": "无归之人", "en": "The One Who Did Not Return" },
  "conditions": { "visitedCities": 20, "returnedToStart": false, "reputationBands": 4 },
  "epilogue": {
    "zh": "你走过 {cities} 座城，用了 {years} 年，却始终没有回到{start}。有人说在{lastCity}见过你，有人说你死在路上。两种说法都对：远行者的归宿，就是被人一再提起。",
    "en": "You crossed {cities} cities in {years} years and never came back to {start}. Some say you were last seen at {lastCity}; some say you died on the road. Both are true: a traveler's home is being spoken of, again and again."
  },
  "variables": ["cities", "years", "start", "lastCity"],
  "sticker": "st-no-return"
}
```

---

## 8. 随从表 `retainers.json`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | `npc-tebrizi` |
| `name` | {zh,en} | 姓名 |
| `roles` | enum[] | 可复合：`guide｜interpreter｜agent｜guard｜physician｜sailor｜scribe｜acolyte｜porter｜diviner` |
| `origin` | {city, culture, faith} | 出身 |
| `languages` | enum[] | 语言 |
| `recruitAt` | {cityId, venue}[] | 招募地点与场所类型 |
| `hireMode` | enum[] | 可用招募方式：`open｜divined｜sealed` |
| `wage` | {amount, currency, period} | 报酬 |
| `contract` | {months, renewable} | 合同 |
| `abilities` | {travel,guard,trade,language,medicine,cartography,faith,divination,cargo} | 各 0–31 |
| `traits` | {loyalty,courage,greed,curiosity,piety,ambition,adaptability,honesty} | 各 0–31 |
| `fate` | {company, road, success} | 三条命运条 0–31 |
| `birth` | {internalDate, sealLevel} | 内部日期 + 封印级别 0–3 |
| `sealReason` | enum | `unknown｜calendar｜lost｜hidden｜religious｜family_only｜reckoned` |
| `revealPaths` | enum[] | 可揭示途径 |
| `cargo` | {kind, slots, condition} | 库存效果与生效条件（如 `sea_only`） |
| `yearly` | {year, note, deltas}[] | 年度命运变化 |
| `questId` | id | 个人任务 |
| `leaveIf` | 条件对象 | 离队条件 |
| `relations` | {retainerId, effect}[] | 与其他随从的关系 |
| `omen` | {zh,en} | 神秘契约下显示的模糊征兆 |

**样例**

```json
{
  "id": "npc-tebrizi",
  "name": { "zh": "星家 帖必烈", "en": "Tebrizi the Star-Reader" },
  "roles": ["diviner", "interpreter"],
  "origin": { "city": "tabriz", "culture": "islamic", "faith": "islam" },
  "languages": ["persian", "arabic", "turkic"],
  "recruitAt": [{ "cityId": "tabriz", "venue": "observatory" }],
  "hireMode": ["open", "divined"],
  "wage": { "amount": 3, "currency": "dirham", "period": "month" },
  "contract": { "months": 12, "renewable": true },
  "abilities": { "travel": 14, "guard": 4, "trade": 9, "language": 22, "medicine": 6, "cartography": 11, "faith": 18, "divination": 27, "cargo": 0 },
  "traits": { "loyalty": 19, "courage": 8, "greed": 5, "curiosity": 26, "piety": 21, "ambition": 7, "adaptability": 12, "honesty": 24 },
  "fate": { "company": 18, "road": 11, "success": 22 },
  "birth": { "internalDate": "1246-03-19", "sealLevel": 1 },
  "sealReason": "calendar",
  "revealPaths": ["divination", "hometown", "trust", "learn_calendar"],
  "cargo": { "kind": "documents", "slots": 1, "condition": "always" },
  "yearly": [
    { "year": 1272, "note": { "zh": "宜同行", "en": "Fit to travel with you" }, "deltas": { "company": 3 } },
    { "year": 1274, "note": { "zh": "思乡，恐生去意", "en": "Homesick; may wish to turn back" }, "deltas": { "company": -6 } }
  ],
  "questId": "q-tebrizi-new-chart",
  "leaveIf": { "playerFaithChangedTo": ["latin"], "loyaltyBelow": 8 },
  "relations": [{ "retainerId": "npc-lin", "effect": "language_gap" }],
  "omen": { "zh": "此人熟悉沙漠中的星辰，但从不谈论自己的出生地。", "en": "He knows the desert's stars, and never speaks of where he was born." }
}
```

---

## 填表顺序建议

1. **城市表约 75 条**（12 主城填全，其余按 tier 递减） → 世界骨架**一次立全**
2. **路线表 + 交通方式** → 三条线能从头走到尾
3. **事件表入城约 75 条 + 探索点 36 条** → 城市有内容
4. **商品表 60 条 + 货币** → 经济闭环
5. **占卜表 3 条** → 命运系统接上路线
6. **随从表 12–18 人** → 队伍系统
7. **角色表 3 条 + 结局表 8 条** → 首尾闭合

前四步做完即可内部试玩；后三步做完即为 MVP。
