# 代码规划 · CODE PLAN

`ARCHITECTURE.md` 定了分层与边界，本文定**内核的类型、接口与两套语法**：effect 指令集与条件求值器。
数据表结构见 `DATA_MODEL.md`。

> **本文是实现契约。** 与 `ARCHITECTURE.md` 不同——那份可以讨论，这份一旦落地，改动即为破坏性变更（需要存档迁移）。

---

## 0. 语言约定

纯 GDScript（`ARCHITECTURE.md` D2）。内核有三条铁律：

1. **不 `extends Node`**——一律 `RefCounted` 或静态工具类
2. **不 `import`／`preload` `game/` 下任何东西**
3. **不调用 `randi()` / `randf()` / `Time.get_*`**——随机走 `Rng`，时间走 `WorldClock`

第 3 条最容易破。CI 用 grep 硬拦（§9 G5）：`core/` 里出现 `randi|randf|randomize|Time\.get` 直接失败。

命名：类 `PascalCase`，方法与变量 `snake_case`，常量 `SCREAMING_SNAKE`，私有前缀 `_`。
所有内核类型开 `class_name`，便于静态类型标注——**内核代码必须全量类型标注**，不允许裸 `var`。

---

## 1. 内核模块与依赖序

依赖只能从下往上，箭头右侧依赖左侧。**禁止环**。

```
rng ──┬─→ time ──┬─→ fate ─────┬─→ divination ──┐
      │          │             │                 │
      │          └─→ econ ─────┤                 ├─→ narrative ─→ save
      │                        │                 │
      └────────────→ world ────┴─→ retainer ─────┘
```

| 模块 | 职责 | 不负责 |
|---|---|---|
| `rng` | 确定性随机、命名子种子 | 任何游戏语义 |
| `time` | 内部日期、历法换算、节气、查历表 | 「过了多少天」的业务判断 |
| `world` | 城市图、路线图、迷雾、情报可见度 | 走不走得动（那是 narrative 的条件） |
| `fate` | 三条命运条、九等、生辰、封印揭示 | 占卜算法 |
| `econ` | 商品、价格、货币、货格 | 交易 UI 与议价对话 |
| `divination` | 引擎算法 + 产出转 effects | 何时可占、代价（在 narrative） |
| `retainer` | 随从、合同、年度命运、关系 | 招募流程（在 narrative） |
| `narrative` | 条件求值、效果执行、事件机、结语 | 渲染 |
| `save` | 快照序列化与迁移 | — |

---

## 2. 核心类型

### 2.1 `Rng`

```gdscript
class_name Rng extends RefCounted

static func hash_seed(s: String) -> int      # mulberry32 的 hashSeed，移植自 Atlas seed.ts
func _init(seed: String) -> void
func next() -> float                          # [0,1)
func next_int(n: int) -> int                  # [0,n)
func pick(arr: Array) -> Variant
func shuffle(arr: Array) -> Array             # 返回新数组，不原地改
func fork(label: String) -> Rng               # 命名子种子
```

`fork()` 是关键。**每个随机点必须用 fork 出来的子流，不得共用父流**：

```gdscript
var market_rng := run_rng.fork("%s:market:%s" % [city_id, clock.date_key()])
```

这样玩家在市场多刷新一次，不会改变海上的风暴——两条流互不干涉。共用一条流会让**任何一处随机次数的变化污染全局**，是确定性最常见的破口。

### 2.2 `WorldClock` 与 `GameDate`

```gdscript
class_name GameDate extends RefCounted
var jdn: int                                  # 儒略日数，唯一权威表示

func to_gregorian() -> Dictionary             # {year, month, day}
func to_chinese() -> Dictionary               # {ganzhi, year, month, day, leap, term}
func to_islamic() -> Dictionary               # {year, month, day}
func to_indian() -> Dictionary                # {nakshatra, tithi, month}
func solar_term() -> int                      # 24 节气索引，-1 = 非节气日
func moon_phase() -> float                    # 0..1
```

> **`jdn` 是唯一权威。** 所有历法都是它的**读法**，不是并列存储。这是 GDD §7.2「一个内部日期，多种历法解释」的实现落点——存两份日期，迟早会不一致。

```gdscript
class_name WorldClock extends RefCounted
var date: GameDate
func advance(days: int) -> Array[GameEvent]   # 推进并返回期间触发的时序事件
func season_for(band: String) -> int
```

`advance()` 返回事件是刻意的：季风开闭、瘟疫年、节庆、随从年度命运变化都挂在推进上，**不能让调用方自己记得去查**。

### 2.3 `Ephemeris`

```gdscript
class_name Ephemeris extends RefCounted
static func longitude(body: int, jdn: int) -> float   # 黄经，度
static func moon_phase(jdn: int) -> float
static func solar_longitude(jdn: int) -> float
static func equation_of_time(jdn: int) -> float       # 真太阳时用
```

读 `assets/ephemeris.res`（`ARCHITECTURE.md` §5.3 构建期生成）。月亮逐日、其余每 8 日采样加三次插值。**运行时不做天文计算**。

### 2.4 `WorldState`

```gdscript
class_name WorldState extends RefCounted

var seed: String
var clock: WorldClock
var player: PlayerState
var revealed: Dictionary          # city_id/route_id -> 情报级别 0..3
var flags: Dictionary             # flag -> bool
var city_reputation: Dictionary   # city_id -> int
var band_reputation: Dictionary   # band -> int
var retainers: Array[RetainerState]
var market_memory: Dictionary     # city_id -> 上次见到的价格与日期
var once_fired: Dictionary        # event_id -> true
```

**`WorldState` 只能被 `EffectExecutor` 写。** 其余模块一律只读。这条靠 code review + CI（§9 G9）保证：`core/` 下除 `narrative/effect_executor.gd` 外，任何对 `state.` 的赋值都要报错。

---

## 3. Effect 指令集（完整规格）

`ARCHITECTURE.md` §2.1 把它定为世界状态的唯一写入口。这里给全表。

### 3.1 指令结构

```gdscript
{ "op": "coins", "value": -12, "reason": "boat-fare", "chance": 1.0 }
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `op` | ✅ | 指令名，见 §3.2 |
| `value` | 多数 | 数值或 id |
| `id` | 部分 | 目标对象（商品、随从、路线） |
| `scope` | 部分 | `city｜band｜global`，用于声望 |
| `reason` | ✅ | **审计字段**，回答「玩家的钱为什么少了」 |
| `chance` | — | 0..1，缺省 1.0；**必须公示**（GDD 红线） |

> **`reason` 强制必填**是本设计最便宜也最值钱的一条。没有它，第 12 个系统上线时就没人能追查数值变动。CI 门禁 G10 校验。

### 3.2 指令全表

**资源类**

| op | value | 语义 |
|---|---|---|
| `coins` | int | 金币增减（**内部单位为分，整数**） |
| `days` | int | 时间推进，触发 `WorldClock.advance` |
| `goods` | int | `id` 指定商品的数量增减 |
| `item` | string | 获得／失去物品（负数用 `remove_item`） |
| `remove_item` | string | 移除物品 |
| `cargo_slots` | int | 货格增减（随从离队时回收） |

**身份类**

| op | value | scope |
|---|---|---|
| `reputation` | int | `city｜band` ——**不存在 global 声望**（GDD §7.1 明确分地区计算） |
| `faith` | string | 改宗，触发随从 `leaveIf` 检查 |
| `language` | string | 习得语言 |
| `etiquette` | int | `scope` 指定文化圈 |
| `fate` | int | `id` = `travel｜rapport｜wealth`，值域钳在 0–31 |

**世界类**

| op | value | 语义 |
|---|---|---|
| `unlock_route` | route_id | 路线可走 |
| `reveal_map` | city_id/route_id | 情报级别 +1（0 未知 → 3 完全） |
| `learn_divination` | div_id | 习得占法 |
| `flag` | string | 置标志位；`unflag` 清除 |
| `goto` | city_id | 强制移动（船难、驱逐、被扣押） |

**人物类**

| op | value | 语义 |
|---|---|---|
| `recruit` | retainer_id | 入队 |
| `dismiss` | retainer_id | 离队，**自动回收其 `cargo`** |
| `retainer_mood` | int | `id` 指定随从 |
| `reveal_birth` | int | 生辰封印级别降低（3→0 三层揭示） |

**旅程账本类**（内核自用，内容层不写）

结语必须说出这一局**实际走过**的路（GDD §14），因此这些事实在发生当时记录，
而不是结束时反推。三条都只由内核发出：`leg` 由 `Travel.depart`，`bought`/`trade`
由 `Market`。内容层写不出它们，也不该写。

| op | value | 附加字段 | 语义 |
|---|---|---|---|
| `leg` | 公里数 | `id` 路线、`days` | 记录走完的一段；只保留最长的一段 |
| `bought` | 单价（分） | `id` 商品、`band` | 记录成本基准（滑动均价）与购入地带 |
| `trade` | 利润（分） | `id` 商品 | 记录一笔卖出的净利；只保留最高的一笔 |

> `goto` 同时承担到达记账：首次移动时把出发地登记为 `start_city`，并把起讫两城
> 记入 `visited`。**不复用 `revealed`**——看地图会让城市 revealed，而游记不该
> 声称去过一个只是听说过的地方。

**记录类**

| op | value |
|---|---|
| `sticker` | sticker_id |
| `codex` | codex_id |

### 3.3 `EffectExecutor`

```gdscript
class_name EffectExecutor extends RefCounted

func execute(state: WorldState, effects: Array, ctx: EffectContext) -> EffectResult
func preview(state: WorldState, effects: Array, ctx: EffectContext) -> EffectResult
```

`preview()` 在**状态深拷贝**上跑同一批指令，用于「若选此项会怎样」与 AI 平衡模拟。它与 `execute()` 走**同一份代码**——两套实现必然漂移。

```gdscript
class_name EffectResult extends RefCounted
var applied: Array[Dictionary]     # 实际生效的指令（chance 未命中的不在内）
var rejected: Array[Dictionary]    # 因资源不足等被拒的
var log_lines: Array[String]       # 玩家可见的变动说明，由 reason 生成
```

**执行语义**（必须严格遵守，否则存档不可复现）：

1. 指令**按序**执行，不并行、不重排
2. `chance` 判定用 `ctx.rng.fork(event_id + ":" + index)`——**同一指令在同一事件中的判定结果是稳定的**
3. 任一指令因前置不足被拒，**不回滚已执行的**——拒绝要在数据设计时用 `when` 避免，而不是靠事务
4. `days` 会触发 `WorldClock.advance`，其返回的时序事件**入队列，不在当前指令流中展开**——否则会递归

---

## 4. 条件求值器语法

`when` 是可求值表达式树，不是 GDScript（`ARCHITECTURE.md` §2.2）。

### 4.1 叶子条件

```json
{ "cities": ["quanzhou", "kinsay"] }
```

同一对象内的多个键是 **AND**；数组内的多个值是 **OR**。这个约定覆盖 90% 的写法，作者无需嵌套。

| 键 | 类型 | 语义 |
|---|---|---|
| `cities` / `bands` / `faiths` | string[] | 当前所在／当前信仰 ∈ 集合 |
| `min_reputation` | `{scope, id, value}` | 声望阈值 |
| `language` / `etiquette` | string / `{id,value}` | 语言习得／礼仪阈值 |
| `season` | int[] | 当前月份 ∈ 集合 |
| `years` | `[min,max]` | 游戏内年份区间 |
| `has_item` / `lacks_item` | string[] | 物品 |
| `has_retainer` | `{role?, id?}` | 队中有某角色或某人 |
| `learned_divination` | string[] | 已习得占法 |
| `flags` / `not_flags` | string[] | 标志位 |
| `fate` | `{id, min?, max?}` | 命运条区间 |
| `coins` | `{min?, max?}` | 金币 |

### 4.2 组合子

```json
{ "any": [ {...}, {...} ] }
{ "all": [ {...}, {...} ] }
{ "not": {...} }
```

**不提供 `or` / `and` 别名**，只有 `any` / `all` / `not` 三个词。同义词会让内容库出现两种写法，校验与检索都变难。

### 4.3 求值器接口

```gdscript
class_name ConditionEvaluator extends RefCounted

func evaluate(cond: Variant, state: WorldState) -> bool
func explain(cond: Variant, state: WorldState) -> Array[String]
```

`explain()` 返回**未满足的具体原因**（「需要波斯语」「声望不足 12/20」），直接驱动 UI 的灰置选项提示。GDD 要求语言不足时「情报残缺，而非报错」——`explain()` 是那套体验的数据来源。

**空条件 `{}` 或 `null` 恒真。** 大量事件无条件触发，不该被迫写占位。

---

## 5. 占卜适配层

`ARCHITECTURE.md` §5.2 的硬约束：引擎产出必须转成非空 `effects[]`。

```gdscript
class_name DivinationAdapter extends RefCounted

func cast(method_id: String, inputs: Dictionary, state: WorldState, rng: Rng) -> DivinationResult
```

```gdscript
class_name DivinationResult extends RefCounted
var method_id: String
var raw: Dictionary              # 引擎原始产出（卦象、四柱、牌阵）
var reading: Array[String]       # 玩家可见的解读文本 key
var effects: Array[Dictionary]   # 非空，CI 断言
var confidence: float
var horizon: String              # day｜season｜year｜three_years
```

`archive/ATLAS_PORT.md` §3 的 `uncertaintyMode → question` 映射表在此实现：

```gdscript
const MODE_TO_QUESTION := {
    "yes-no": "risk", "timing": "timing", "trend": "trade",
    "strategic-positioning": "route", "psychological-mirroring": "person",
    "event-narrative": "identity",
}
```

**占卜的 effects 大多是信息类**（`reveal_map`、`flag`），不是资源类。这是 GDD §8.2 的要求：占卜改变的是**你对世界的解释方式**与**可见信息**，不是直接给钱。适配器里对纯资源类 effects 应当警惕——那通常意味着把占卜写成了老虎机。

---

## 6. 事件机

```gdscript
class_name EventMachine extends RefCounted

func candidates(kind: String, state: WorldState) -> Array[EventDef]
func fire(event_id: String, state: WorldState) -> EventInstance
func choose(inst: EventInstance, choice_index: int) -> EffectResult
```

选择流程：

1. `candidates()` 按 `kind` + `when` 过滤，`once` 且已触发的剔除
2. 多个候选时按 `priority` 降序，同级用 `rng.fork("event:" + city + ":" + date_key)` 挑
3. `choose()` 先验 `needs`，再判 `divination`（若该选项挂了占法），最后执行 `pass`／`fail` 的 effects

**`divination` 选项的成败**由该占法的 `confidence` 与玩家对应命运条共同决定，公式集中在一处：

```gdscript
static func divination_success_chance(conf: float, fate_value: int) -> float:
    return clampf(conf * (0.6 + 0.4 * fate_value / 31.0), 0.05, 0.95)
```

上下钳制是刻意的——**永不给 0% 或 100%**。命格「下下」也要有 5% 的翻盘，「上上」也会翻车，这是 GDD §4.2「低等不是废号」在数值上的兑现。

---

## 7. 存档

```gdscript
class_name SaveGame extends RefCounted
const CURRENT_VERSION := 1

static func serialize(state: WorldState) -> Dictionary
static func deserialize(data: Dictionary) -> WorldState   # 自动跑迁移链
static func migrate(data: Dictionary, from: int) -> Dictionary
```

`ARCHITECTURE.md` §7 已定快照为准。补两条实现约束：

- **迁移链单向且可组合**：`v1→v2`、`v2→v3` 各写一个函数，`deserialize` 依次套用。不写 `v1→v3` 的跳跃版本
- **未知字段保留**：反序列化时不认识的键原样存回，让旧版客户端读新档不会丢数据

---

## 8. 表现层接口

`game/` 与 `core/` 的唯一接缝：

```gdscript
# game/autoload/game_context.gd —— 唯一的 Node，持有内核实例
extends Node

var state: WorldState
var executor: EffectExecutor
var events: EventMachine

signal state_changed(result: EffectResult)
signal event_fired(inst: EventInstance)
signal day_advanced(date: GameDate)
```

**表现层不得直接改 `state`**，只能调 `GameContext` 的方法并订阅信号。渲染从 `EffectResult.log_lines` 驱动飘字与动效——这样「金币 −12（船资）」的提示是**内核给的**，不需要 UI 层重复一份文案逻辑。

---

## 9. CI 门禁（补充 ARCHITECTURE §9）

在 G1–G8 之上，本文新增三条**代码层**门禁：

| 门禁 | 检查 | 实现 |
|---|---|---|
| G9 | `core/` 下只有 `effect_executor.gd` 能写 `WorldState` | grep 赋值模式 |
| G10 | 每条 effect 有非空 `reason` | schema + 运行时断言 |
| G11 | `core/` 不出现 `randi\|randf\|randomize\|Time\.get\|extends Node` | grep |

G11 是 §0 三条铁律的机器化。**这三条比任何单元测试都值钱**——它们防的是架构腐蚀，而架构腐蚀不会被功能测试发现。

---

## 10. 实现顺序

严格按依赖序，每步可独立测试：

| # | 内容 | 验收 |
|---|---|---|
| 1 | `Rng` | 与 Atlas `seed.ts` 同种子同序列（跨语言对拍） |
| 2 | `GameDate` + `WorldClock` | 儒略日往返、干支与节气对已知日期 |
| 3 | `tools/ephemeris` + `Ephemeris` | 与 astronomy-engine 抽样比对，误差 < 0.01° |
| 4 | `ConditionEvaluator` | 语法全覆盖单测 + `explain()` 文案 |
| 5 | `EffectExecutor` | 全指令单测；`preview` 不污染原状态 |
| 6 | `WorldState` + `SaveGame` | 序列化往返等价；迁移链 |
| 7 | `EventMachine` | 两城一路线走通（骨架里程碑） |
| 8 | `DivinationAdapter` + 易占 | effects 非空；同种子可复现 |

**第 1 步的跨语言对拍**值得专门说：先用 Node 跑 Atlas 的 `createRng` 生成前 1000 个数存成 fixture，GDScript 侧断言逐位相同。这一步做扎实，后面所有「为什么两次结果不一样」的问题都不会出现。
