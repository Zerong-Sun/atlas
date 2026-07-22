# 技术路线图 · ROADMAP

从当前骨架到「能在电脑上打开、玩通一条线」的完整施工顺序。

`ARCHITECTURE.md` 定架构，`CODE_PLAN.md` 定接口，`DATA_MODEL.md` 定校验，**本文定顺序**：先做什么、再做什么、怎么做、做到什么算完。

素材缺口不在本文，另见 `ART_REQUIREMENTS.md` 与 `STORY_REQUIREMENTS.md`。

---

## 0. 现状盘点（2026-07）

### 已完成

| 项 | 状态 |
|---|---|
| 架构四层与边界 | ✅ `ARCHITECTURE.md` |
| effect 指令集规格 | ✅ `CODE_PLAN.md` §3 |
| 条件求值器语法 | ✅ `CODE_PLAN.md` §4 |
| 八张表 schema 与引用图 | ✅ `DATA_MODEL.md` |
| `core/rng` | ✅ 与 Atlas 逐位对拍，Godot 实测通过 |
| `core/narrative` 求值器 + 执行器 | ✅ Godot 实测通过 |
| `core/world/world_state` | ✅ |
| 内容校验器（6 道门禁） | ✅ 含负向测试 |
| 世界地图 | ✅ 158 城、真实 DEM、东至刺桐 |
| 城市表 | ✅ **102 节点**（生成器产出） |
| 事件表 | ⚠️ 139 条，其中 **133 条是桩** |

### 未开始

| 表 | 条数 | 阻塞了什么 |
|---|---|---|
| `routes` | **1** | ⛔ **最大阻塞**：102 城只有 1 条路线，地图连不起来，三条线无从走 |
| `divinations` | 0 | 占卜系统 |
| `goods` | 0 | 经济系统 |
| `retainers` | 0 | 随从系统 |
| `archetypes` | 0 | 开局 |
| `endings` | 0 | 收尾 |

代码侧 `core/` 只有 4 个文件，`game/` 只有 1 个 autoload——**没有任何可见画面**。

> **本轮的首要目标不是把系统做全，是让游戏能被打开。**
> 一个能跑起来、走两座城的丑界面，价值高于八张填满但打不开的表。

---

## 1. 阶段总览

```
P0  能打开          Godot 主场景、跑起来看到东西          ← 最先做
P1  能走路          路线表 + 地图 + 移动                  ← 解除最大阻塞
P2  能读故事        事件机 + 选项 + 效果反馈
P3  能占卜          占法注册表 + 3 种引擎 + 影响路线
P4  能交易          商品、货币、货格、旅行成本刹车
P5  能结伴          随从招募、契约、库存联动
P6  能收尾          图鉴、贴纸、结语生成、结局判定
```

每阶段都以**可玩**为验收，不以「代码写完」为验收。P0 结束时游戏能开；P1 结束时能从罗卜走到沙州；以此类推。任何阶段做完游戏打不开，就是没做完。

---

## 2. P0 · 能打开（最优先）

**目标**：`godot --path fatequest` 双击能进游戏，看到书案，点「开始远行」进到一张地图，地图上有城市点。

### 做什么

| # | 内容 | 文件 |
|---|---|---|
| 0.1 | 内容加载器：JSON → 内核对象 | `core/content/content_db.gd` |
| 0.2 | i18n 最小实现：key → 文本，缺失时显示 key | `core/i18n/i18n.gd` |
| 0.3 | 主场景与场景切换 | `game/screens/boot.tscn` `main.gd` |
| 0.4 | 书案（开场第一拍，GDD §3①） | `game/screens/desk.tscn` |
| 0.5 | 地图渲染：读 `cities.json` 画点 | `game/map/world_map.gd` |
| 0.6 | 经纬度 → 视图坐标的仿射投影 | `core/world/projection.gd` |

### 怎么做

**投影**先用最简单的等距圆柱（`ARCHITECTURE.md` §4.3 说 `view` 由脚本从 `coord` 生成，这里就是那个脚本的运行时版）：

```gdscript
# bbox 来自 worldmap/data/world_config.json
x = (lon - west) / (east - west) * map_width
y = (north - lat) / (north - south) * map_height
```

**先不做**羊皮纸美术、迷雾 shader、东向上旋转。P0 只要能看见点和名字。视觉在 P1 末尾统一处理。

**i18n 缺失策略**：找不到 key 时**显示 key 本身而不是空白**。102 城的名字现在全是 `city.lop.name` 这种 key，显示出来才知道缺哪些——空白会让人以为渲染坏了。

### 验收

- [ ] 双击 Godot 项目能运行，无报错
- [ ] 看到书案，点击进入地图
- [ ] 地图上 102 个点位置正确（与 `preview_static.png` 目视一致）
- [ ] 点城市能看到它的 id 与 tier

---

## 3. P1 · 能走路（解除最大阻塞）

**目标**：从罗卜走到沙州，时间推进，地图留下走过的痕迹。

### 3.1 路线表——本阶段的主要工作量

现在只有 1 条路线。102 城需要一张**连通图**。

**不要手写。** 写 `tools/lore/build_routes.mjs`，规则：

1. **走廊主链**：GDD §16.4 十二城按顺序两两相连——这是主干，必须存在
2. **邻接补边**：对每座城，连接地理最近的 2–3 座同 band 或相邻 band 的城
3. **海路**：`maritime_asia` / `india` 的港口之间按海岸线顺序连
4. **参数由数据推导**：
   - `days` = 大圆距离 ÷ 交通方式日行程（陆路 30 km/日、海路 120 km/日）
   - `cost` = `days` × 基准日耗 × 地形系数
   - `risk` = 沙漠/山口/海路各有基线，再按 `hazards` 叠加
5. **`hazards`** 由沿途地形推导：跨越 `mountains.geojson` 的取 `snow`，穿过沙漠 band 的取 `sand`

**校验必须加一条 G13 连通性**：三条角色线的起点到终点必须存在路径。这是 GDD M1 的验收标准，应当由机器断言而非人工试玩。

### 3.2 移动与时间

| # | 内容 | 文件 |
|---|---|---|
| 1.1 | `WorldClock` + `GameDate`（儒略日、历法换算） | `core/time/` |
| 1.2 | 路线可达性判定（`unlock` + 季节窗口） | `core/world/route_graph.gd` |
| 1.3 | 行进结算：扣钱扣天、触发途中事件 | `core/world/travel.gd` |
| 1.4 | 地图上的路线绘制与已走过高亮 | `game/map/` |
| 1.5 | 迷雾：`revealed` 驱动的遮罩 | `game/shaders/fog.gdshader` |

**历法先做儒略日 + 公历 + 干支**，伊斯兰历与印度历留接口空实现——P3 占卜才真正需要它们。

### 验收

- [ ] 三条线（波罗/草原/海路）起点到终点均连通（G13 自动断言）
- [ ] 从罗卜出发能走到沙州，扣 30 天、扣船资
- [ ] 走过的路在地图上永久留亮
- [ ] 未探索区域被迷雾遮盖

---

## 4. P2 · 能读故事

**目标**：进城弹入城事件，能选选项，看到效果反馈。

| # | 内容 | 文件 |
|---|---|---|
| 2.1 | `EventMachine`（`CODE_PLAN.md` §6） | `core/narrative/event_machine.gd` |
| 2.2 | 事件 UI：标题、正文、2–4 选项 | `game/screens/event.tscn` |
| 2.3 | 灰置选项 + `explain()` 提示 | 同上 |
| 2.4 | 效果飘字（由 `EffectResult.log_lines` 驱动） | `game/ui/effect_toast.gd` |
| 2.5 | 史料小卡：显示 `lore.origin` 与章节出处 | `game/ui/source_card.gd` |

**2.5 不是装饰**，是 GDD §19 的红线：史料与演绎必须让玩家分得清。桩事件全部标 `origin: authored`，正好会显示为「据原文语体新撰」——诚实且不需要额外工作。

### 验收

- [ ] 进城弹入城事件，选项可点
- [ ] 缺语言/缺钱的选项灰置并说明原因
- [ ] 效果有可见反馈（「金币 −400（购入河玉）」）
- [ ] 每段文本能看到来源标注

---

## 5. P3 · 能占卜（可拓展性的关键阶段）

**目标**：学会易占，在岔路口起一卦，卦象**改变你看到的路线信息**。

### 5.1 占法注册表——数量不设上限的实现方式

这是「保留添加方法的接口」的落点。**不要把占法写成 if-else 或 match**。

```gdscript
# core/divination/method.gd —— 所有占法的契约
class_name DivinationMethod extends RefCounted

func id() -> String:                     return ""
func inputs() -> Array[String]:          return []   # birthdate|date|question|object|dream|sky
func reads() -> Array[String]:           return []   # self|retainer|route|city|year
func cast(ctx: DivinationContext) -> Dictionary: return {}   # 引擎原始产出
func to_effects(raw: Dictionary, ctx: DivinationContext) -> Array: return []
```

```gdscript
# core/divination/registry.gd
class_name DivinationRegistry extends RefCounted

static var _methods: Dictionary = {}

static func register(m: DivinationMethod) -> void:
    assert(not _methods.has(m.id()), "duplicate divination id: " + m.id())
    _methods[m.id()] = m

static func get_method(id: String) -> DivinationMethod:
    return _methods.get(id)

static func all() -> Array:
    return _methods.values()
```

**加一种占法 = 新增一个文件 + 一行 `register()` + 一条 `divinations.json` 记录。** 内核与 UI 都不需要改。

`to_effects()` 是 `ATLAS_PORT.md` §3 那张映射表的落地——它保证**任何**新占法都必须产出非空 effects，否则 G3 门禁拦下。可拓展性与设计红线在这里是同一件事。

### 5.2 本轮实现的占法

旧版 `js/engines.js` 已有 10 种简化实现，先移植这些，**不追 Atlas 的 24 种**：

| 占法 | 来源 | 优先 |
|---|---|---|
| 易占（周易起卦） | 旧版 `tossCoins`/`resolveCast` + Atlas `iching.ts` | 1 |
| 八字 | 旧版 `bazi` + Atlas `bazi.ts`（需历表） | 2 |
| 签占 | 旧版 `drawLot` + Atlas `lotSignsLibrary` | 3 |
| 梦占 | 旧版 `readDream` | 4 |
| 塔罗 | 旧版 `drawTarot` | 5 |
| 筊杯 | 旧版 `throwJiaobei` | 5 |
| 星辰骰 | 旧版 `rollAstroDice` | 5 |
| 卢恩 | 旧版 `drawRunes` | 5 |
| 梅花易数 | 旧版 `meihua` | 5 |
| 西洋星盘 | 旧版 `sunSign`（简化）→ 待历表 | 6 |

**优先级 1–3 是 GDD §16.6 的三种**，做完即达标；4–6 有素材就顺手接，没做完不阻塞。

### 5.3 历表

`ARCHITECTURE.md` §5.3 的构建期预计算。八字的节气与真太阳时依赖它。

```
tools/ephemeris/gen.mjs  (Node + astronomy-engine, 仅构建期)
   → assets/ephemeris.bin   1253–1453，日月五星黄经 + 月相
   → core/time/ephemeris.gd 查表 + 三次插值
```

### 验收

- [ ] 拜师学会易占（未学不可用）
- [ ] 岔路口起卦，结果**改变路线的风险显示或情报级别**
- [ ] 占卜结果不是「吉/凶」而是路线建议（GDD §8.2）
- [ ] 新增第 11 种占法只需加 1 个文件 + 1 行注册（写个假占法验证）

---

## 6. P4 · 能交易

| # | 内容 |
|---|---|
| 4.1 | `goods.json` 60 条（`tools/` 按 band 生成骨架 + 人工调价） |
| 4.2 | 货币与兑换损耗（5 种） |
| 4.3 | 价格模型：本地 100–200 / 远地 200–300 / 高需求 800–1000 |
| 4.4 | 货格与 `bulk` |
| 4.5 | **旅行成本刹车**——GDD §9.2 的硬要求 |
| 4.6 | 市场 UI |

**4.5 用 G6 门禁验收**：一万局蒙特卡洛跑套利收益率，落在合理区间才算过。内核确定性在这里第一次真正兑现价值——这个模拟不需要开图形界面。

---

## 7. P5 · 能结伴

随从表 12–18 人，只做**公开招募 + 占卜抽选**两种方式与 3 类随从（向导、翻译、驮夫）。神秘契约与生辰揭示留到第二章。

关键是 **`cargo` 联动**：随从离队/患病/背叛时相关货格失效，玩家必须处理超出的货物（GDD §11.7）。这是随从系统唯一不可省略的机制——没有它，随从就退化成数值卡。

---

## 8. P6 · 能收尾

图鉴、贴纸、停笔结语生成、3 个隐藏结局。结语用模板插值（`endings.json` 的 `variables`），必须能反映玩家**实际走过的路线**，否则就是罐头文案。

---

## 9. 贯穿始终的可拓展性约束

这些不是某个阶段的任务，是每个阶段都要守的：

| 约束 | 怎么保证 |
|---|---|
| 内容不进代码 | 任何叙事文本出现在 `.gd` 里 = review 打回 |
| 占法可插拔 | 注册表（§5.1）；新增占法不改内核 |
| 表可增字段 | schema 用 `additionalProperties` 白名单，加字段先改 schema |
| 世界可扩城 | 城市/路线由生成器产出；加城 = 改地图 + 重跑生成器 |
| 语言可增 | 文本全走 key；加语言 = 加一个 `i18n/{lang}.json` |
| 存档可迁移 | `saveVersion` + 单向迁移链（`CODE_PLAN.md` §7） |
| 内核可测 | 不 `extends Node`，headless 可跑完整局 |

**每加一个系统，先问：它能否只通过发 effect 指令改变世界？** 能，就照做；不能，说明它需要新指令——那就先扩指令集并更新 schema，而不是绕过执行器直接改状态。

---

## 10. 桌面端优先

按指示**先不做 iOS**。但有两件事现在做成本极低、以后做很贵：

1. **输入抽象**：不要在 UI 里直接读鼠标坐标，走 Godot 的 `InputMap` action。以后接手柄/触屏只改映射。
2. **安全区与分辨率**：UI 用锚点与容器布局，不写死像素。

除此之外一律按桌面做，`ARCHITECTURE.md` R7 那条「M1 就跑通一次 iOS 归档」推迟到 P4 之后再说。

---

## 11. 立即要做的三件事

按顺序：

1. **P0.1–P0.6**：让游戏能打开（内容加载器 + 主场景 + 地图）
2. **P1.1 路线生成器**：解除 102 城 1 条路线的阻塞
3. **补 `i18n/zh.json` 的 102 个城市名**：现在全是 key，地图上会显示 `city.lop.name`

第 3 项是 `STORY_REQUIREMENTS.md` 的第一条目。
