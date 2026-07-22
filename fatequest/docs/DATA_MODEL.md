# 数据规划 · DATA MODEL

`SYSTEM_TABLES.md` 定字段语义（**给作者看**），本文定校验层（**给机器看**）：id 规范、JSON Schema、引用图、迁移策略。

> **分工**：作者问「这个字段填什么」→ 看 `SYSTEM_TABLES.md`；程序问「怎么保证填对了」→ 看本文。

---

## 1. 落盘布局

```
content/
├── schema/                    JSON Schema Draft 2020-12
│   ├── _defs.json             共享定义：LocalizedText / Ref / Effect / Condition
│   ├── cities.schema.json
│   ├── archetypes.schema.json
│   ├── divinations.schema.json
│   ├── goods.schema.json
│   ├── routes.schema.json
│   ├── transports.schema.json
│   ├── events.schema.json
│   ├── endings.schema.json
│   └── retainers.schema.json
├── tables/
│   ├── cities/                按 band 分文件，避免单文件过大
│   │   ├── west_asia.json
│   │   ├── central_asia.json
│   │   ├── steppe.json
│   │   ├── china.json
│   │   └── maritime.json
│   ├── events/                按 kind 分文件
│   │   ├── entry.json
│   │   ├── site.json
│   │   ├── road.json
│   │   └── court.json
│   ├── routes.json
│   ├── transports.json
│   ├── goods.json
│   ├── divinations.json
│   ├── retainers.json
│   ├── archetypes.json
│   └── endings.json
├── lore/
│   ├── marco-polo-lore.json   语料源（只读，不手改）
│   └── segments/              人工切段产物，按 place 归档
└── i18n/
    ├── zh.json
    ├── en.json
    └── glossary.json
```

**分文件而非单文件**：`events` 第一章约 150 条、完整版上千条。单文件会让 git diff 不可读、多人编辑必冲突。分文件后合并冲突只发生在真正同区域的改动上。

---

## 2. id 命名规范

全局唯一，永不复用（`SYSTEM_TABLES.md` 通用约定）。本文补齐**前缀表**：

| 表 | 前缀 | 例 |
|---|---|---|
| 城市 | 无前缀，直接用地名 | `zayton`、`cambaluc`、`tauris` |
| 路线 | `rt-` | `rt-lop-sachiu` |
| 事件 | `ev-` | `ev-zayton-fanfang` |
| 随从／NPC | `npc-` | `npc-tebrizi` |
| 商品 | 无前缀 | `dehua-porcelain` |
| 占法 | 无前缀 | `iching`、`bazi` |
| 结局 | `end-` | `end-no-return` |
| 贴纸 | `st-` | `st-dehua` |
| 图鉴 | `cx-` | `cx-monsoon` |
| 物品 | `it-` | `it-letter-of-introduction` |
| 标志位 | `fl-` | `fl-good-sailing-window` |
| 原型 | 无前缀 | `polo`、`steppe`、`merchant` |

规则：

1. 小写 ASCII + 连字符，**不用下划线**（下划线留给 GDScript 标识符，避免混淆）
2. **城市 id 用波罗原书名的小写形式**（`zayton` 而非 `quanzhou`）——与 `worldmap/data/cities.geojson` 的 `name_medieval` 对齐，一个 id 贯穿地图与内容表
3. 路线 id 为 `rt-{from}-{to}`，方向按主行进方向；双向路线**只建一条**，`reverse: true` 表示可逆
4. 事件 id 为 `ev-{city}-{slug}`，途中事件用 `ev-road-{slug}`

> **第 2 条是硬约束。** 地图层与内容层共用 id 是把两套数据焊死的唯一办法；一旦允许 `quanzhou` 与 `zayton` 并存，就要维护一张翻译表，而翻译表一定会漂。中文名走 i18n，不进 id。

---

## 3. 共享定义 `_defs.json`

```json
{
  "$id": "https://fatequest/schema/_defs.json",
  "$defs": {
    "Id":            { "type": "string", "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$" },
    "TextKey":       { "type": "string", "pattern": "^[a-z0-9._-]+$" },
    "Band":          { "enum": ["europe","west_asia","central_asia","steppe","china","india","maritime_asia"] },
    "Faith":         { "enum": ["latin","orthodox","islam","buddhism","daoism","nestorian","hindu","folk"] },
    "Culture":       { "enum": ["latin","islamic","east_asia","steppe","indian_ocean"] },
    "Tier":          { "enum": ["metropolis","city","town","station"] },
    "Fate":          { "type": "integer", "minimum": 0, "maximum": 31 },
    "Origin":        { "enum": ["source","authored","hybrid"] },

    "Ref": {
      "type": "object",
      "required": ["book","chapterId"],
      "properties": {
        "book":      { "type": "string" },
        "chapterId": { "type": "string" }
      }
    },

    "Lore": {
      "type": "object",
      "required": ["origin"],
      "properties": {
        "placeId": { "$ref": "#/$defs/Id" },
        "storyId": { "$ref": "#/$defs/Id" },
        "origin":  { "$ref": "#/$defs/Origin" },
        "ref":     { "$ref": "#/$defs/Ref" }
      },
      "allOf": [{
        "if":   { "properties": { "origin": { "const": "source" } } },
        "then": { "required": ["ref"] }
      }]
    },

    "Effect": {
      "type": "object",
      "required": ["op","reason"],
      "properties": {
        "op": { "enum": [
          "coins","days","goods","item","remove_item","cargo_slots",
          "reputation","faith","language","etiquette","fate",
          "unlock_route","reveal_map","learn_divination","flag","unflag","goto",
          "recruit","dismiss","retainer_mood","reveal_birth",
          "sticker","codex"
        ]},
        "value":  {},
        "id":     { "$ref": "#/$defs/Id" },
        "scope":  { "enum": ["city","band"] },
        "reason": { "type": "string", "minLength": 2 },
        "chance": { "type": "number", "minimum": 0, "maximum": 1 }
      },
      "allOf": [{
        "if":   { "properties": { "op": { "const": "reputation" } } },
        "then": { "required": ["scope"] }
      }]
    },

    "Condition": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "any": { "type": "array", "items": { "$ref": "#/$defs/Condition" } },
        "all": { "type": "array", "items": { "$ref": "#/$defs/Condition" } },
        "not": { "$ref": "#/$defs/Condition" },
        "cities":  { "type": "array", "items": { "$ref": "#/$defs/Id" } },
        "bands":   { "type": "array", "items": { "$ref": "#/$defs/Band" } },
        "faiths":  { "type": "array", "items": { "$ref": "#/$defs/Faith" } },
        "season":  { "type": "array", "items": { "type": "integer", "minimum": 1, "maximum": 12 } },
        "years":   { "type": "array", "items": { "type": "integer" }, "minItems": 2, "maxItems": 2 },
        "flags":     { "type": "array", "items": { "$ref": "#/$defs/Id" } },
        "not_flags": { "type": "array", "items": { "$ref": "#/$defs/Id" } },
        "has_item":   { "type": "array", "items": { "$ref": "#/$defs/Id" } },
        "lacks_item": { "type": "array", "items": { "$ref": "#/$defs/Id" } },
        "learned_divination": { "type": "array", "items": { "$ref": "#/$defs/Id" } },
        "language":  { "$ref": "#/$defs/Id" },
        "min_reputation": {
          "type": "object", "required": ["scope","value"],
          "properties": { "scope": { "enum": ["city","band"] }, "id": { "$ref": "#/$defs/Id" }, "value": { "type": "integer" } }
        },
        "fate":  { "type": "object", "properties": { "id": { "enum": ["travel","rapport","wealth"] }, "min": {"type":"integer"}, "max": {"type":"integer"} } },
        "coins": { "type": "object", "properties": { "min": {"type":"integer"}, "max": {"type":"integer"} } }
      }
    }
  }
}
```

**注意 `Condition` 开了 `additionalProperties: false`。** 这样把 `city`（漏写复数）或 `minReputation`（驼峰）写错时**立刻报错**，而不是静默恒真——静默恒真的条件是最难查的一类内容 bug，因为事件会在不该出现的地方出现，且没有任何报错。

---

## 4. 文本与 i18n

`SYSTEM_TABLES.md` 原定所有文本为 `{zh, en}` 内联对象。`ARCHITECTURE.md` §8 已改为**存 key**：

```json
{ "id": "ev-zayton-fanfang", "title": "ev.zayton.fanfang.title", "body": "ev.zayton.fanfang.body" }
```

对应 `content/i18n/zh.json`：

```json
{ "ev.zayton.fanfang.title": "番坊", "ev.zayton.fanfang.body": "番坊自成一街……" }
```

**key 命名 = id 去前缀 + 点分字段名**，可由脚本从表反查，避免手编。

代价是作者写内容要开两个文件。缓解：`tools/lore/` 提供一个双向同步脚本，作者可写内联稿，提交前跑一次拆分。**但仓库里的权威形态是拆分后的**——内联形态只是编辑期的便利。

---

## 5. 引用图

CI 门禁 G2 校验的全部边。箭头 = 「必须存在」。

```
archetypes ──start──────────────→ cities
           ──endings[]──────────→ endings

cities ──entryEvent────────────→ events(kind=entry)
       ──sites[]───────────────→ events(kind=site)
       ──mentor────────────────→ retainers
       ──market.goods[]────────→ goods
       ──exits[]───────────────→ routes
       ──specialty─────────────→ goods
       ──lore.placeId──────────→ lore/marco-polo-lore.json:places

routes ──from,to───────────────→ cities
       ──modes[]───────────────→ transports
       ──encounters[]──────────→ events(kind=road)
       ──lore.storyId──────────→ lore:stories

events ──choices[].effects[].id→ goods|items|routes|retainers|divinations
       ──choices[].divination──→ divinations
       ──scene.npc─────────────→ retainers

divinations ──learnAt[]────────→ cities
            ──teacher──────────→ retainers

retainers ──origin.city────────→ cities
          ──recruitAt[].cityId→ cities
          ──questId───────────→ events
          ──relations[].id────→ retainers

goods ──origin[]───────────────→ cities|bands
      ──events[]───────────────→ events

endings ──sticker──────────────→ stickers
```

**双向校验**：除「存在性」外还查**孤儿**——没有任何 `exits` 指向的城市、没有被任何 `sites`／`encounters` 引用的事件。孤儿不是错误（可能是预留），但必须在报告里列出，否则内容库会静默积累死数据。

**环检测**：`routes` 构成的图允许环（世界本就是网），但 `events.goto` 链不允许环，否则玩家会被弹来弹去。

---

## 6. 按 tier 分级校验

GDD §16.3 定了深度按 `tier` 递减，校验器必须相应分级——**否则 station 会被报出一堆缺字段**。

| 字段 | metropolis | city | town | station |
|---|---|---|---|---|
| `id/name/band/coord/tier/exits/lore` | ✅ | ✅ | ✅ | ✅ |
| `entryEvent` | ✅ | ✅ | ✅ | ✅ |
| `market` | ✅ | ✅ | ✅ | — |
| `shrine` | ✅ | ✅ | — | — |
| `mentor` | ✅ | — | — | — |
| `sites`（3 条） | ✅ | — | — | — |
| `specialty` | ✅ | 可选 | — | — |

`entryEvent` 对所有 tier 必填：没有入城文本的节点在地图上是个哑点，会直接暴露世界的空心（`SYSTEM_TABLES.md §6`）。

---

## 7. 与地图数据的对齐

`worldmap/data/cities.geojson`（158 条）与 `content/tables/cities/*.json`（102 条）是**两套数据**，靠 id 对齐：

- 地图侧权威：`coord`、`name_medieval`、`name_modern`、地形关系
- 内容侧权威：`tier`、`sites`、`market`、`exits`、`lore`
- **`view` 坐标由脚本从 `coord` 仿射投影生成**，不手填（`ARCHITECTURE.md` §4.3）

校验 G12：每个 `content` 城市 id 必须在 `cities.geojson` 里有 `name_medieval` 小写化后的对应项。反向不要求——地图上可以有尚未做内容的城市（那正是「世界比内容大」的体现，也是后续章节的升格池）。

---

## 8. 迁移策略

内容表与存档是**两套版本**，不要混：

| | 版本字段 | 谁读 | 破坏性变更时 |
|---|---|---|---|
| 内容表 | `contentVersion`（每个表文件头） | 构建期校验 + 导入 | 改 schema，跑一次性迁移脚本，**重新提交数据** |
| 存档 | `saveVersion` | 运行时 | 写迁移函数（`CODE_PLAN.md` §7） |

内容表迁移是**构建期**的事，数据在仓库里，可以直接改写重提；存档迁移是**运行时**的事，数据在玩家机器上，只能写代码兼容。把这两件事分清，能避免为了兼容旧内容格式而在运行时留下永久性的兼容分支。

**id 一旦发布进玩家存档，即冻结。** 需要改名时：保留旧 id，加 `aliasOf` 字段指向新 id，运行时解析。**永不直接改 id** ——存档里存的是 id。

---

## 9. 校验器实现

`tools/validate/` 一个 Node 脚本，跑完输出报告：

```
G1  schema        ✓ 9 tables, 312 records
G2  references    ✗ 3 errors
      cities/china.json: zayton.exits -> "rt-zayton-malacca" 不存在
      events/site.json:  ev-kinsay-lake.choices[1].divination -> "dream" 未在 divinations.json 注册
      retainers.json:    npc-lin.relations[0].retainerId -> "npc-chen" 不存在
G2b orphans       ⚠ 7 warnings（未被引用的事件，可能是预留）
G3  effects≠∅     ✓ 3/3 divinations
G10 effect.reason ✗ 1 error
      events/road.json: ev-road-sandstorm.choices[0].effects[2] 缺 reason
G12 map alignment ✓ 75/75 城市在 cities.geojson 中有对应
```

**报告要给出文件、路径与具体值**——只说「引用错误」的校验器没人愿意用。

---

## 10. 实施顺序

1. `_defs.json` + `cities.schema.json`，先让 12 主城过校验
2. 校验器骨架（G1 + G2），能跑就行，报告可粗糙
3. 其余 7 张 schema
4. G3 / G10 / G12 三条特有门禁
5. i18n 拆分脚本 + `glossary` 一致性（G7）
6. 孤儿与环检测（G2b）

> 先把**校验器**做出来，再大规模填表。反过来做，等于用人工 review 去顶一件机器该干的活——136 条语料落到八张表上会产生上千条交叉引用，人是查不过来的。
