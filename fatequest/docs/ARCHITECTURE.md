# 技术架构 · ARCHITECTURE

《远行之书》从「网页占卜小游戏」重建为「可上架 Steam / App Store 的开放世界旅行游戏」的技术架构。
本文只定架构与边界；代码规划见 `CODE_PLAN.md`，数据规划见 `DATA_MODEL.md`（待写）。

对应策划案：`GDD.md`（玩法）· `SYSTEM_TABLES.md`（八张表）· `LORE_PIPELINE.md`（语料）· `ATLAS_PORT.md`（占卜资产）。

---

## 0. 决策摘要

| # | 决策 | 结论 | 代价 |
|---|---|---|---|
| D1 | 引擎 | **Godot 4（锁定一个 4.4/4.5 stable 补丁版）** | Atlas 的 TS 引擎需重写为 GDScript |
| D2 | 语言 | **纯 GDScript**；性能热点走 GDExtension（Rust/C++），**不引入 C#** | C# 会削弱 iOS 导出的可靠性，收益不足 |
| D3 | 旧代码 | **内核重写，数据抢救**：`js/data-*.js`、`assets/`、中译语料保留；`app/journey/tower/quest/state/engines` 废弃 | 3,200 行逻辑作废（本就是 2.0 占卜小游戏的架构） |
| D4 | 地图 | 采用 `fatequest-worldmap`，但**必须先东扩** | 见 §4.1，这是采用前提 |
| D5 | 世界表现 | **2D 舆图**（Node2D + Shader），非 3D 地形 | heightmap 降级为绘制底稿，不做地形网格 |
| D6 | 天文 | **构建期预计算历表**，运行时零天文库 | 见 §5.3 |
| D7 | 内容 | 内容全部是数据（JSON → Godot Resource），程序不硬编码任何叙事 | 需要 schema 校验与 CI 门禁 |

---

## 1. 分层

四层，依赖单向向下，**不允许反向引用**。这条边界是整个架构唯一的硬约束。

```
L3  platform/   平台外壳    Steam / iOS / Android 差异、成就、云存档、IAP（无）
      ↓
L2  game/       表现层      Godot 场景、Control、Shader、音频、输入、动效
      ↓
L1  core/       内核        纯 GDScript，零 Node 依赖，确定性，可 headless 测试
      ↓
L0  content/    数据        JSON + Schema，作者可编辑，程序不硬编码内容
```

**L1 不得 `extends Node`，不得引用 `game/` 任何符号。** 内核用 `RefCounted` / 静态类实现，接收数据、返回新状态与事件列表，由 L2 订阅渲染。这样内核可以在无窗口的 CI 里全量跑完一局游戏——这是「高质量引擎」在本作的具体含义，不是画面，是**可测试的确定性模拟**。

---

## 2. 内核三条设计原则

### 2.1 效果指令表是世界状态的唯一写入口

`SYSTEM_TABLES.md §6` 已经定义了效果指令词表：

```
coins｜days｜goods｜item｜reputation(city|band)｜faith｜language｜etiquette
fate(travel|rapport|wealth)｜unlockRoute｜revealMap｜learnDivination｜recruit
retainerMood｜sticker｜codex｜flag｜goto
```

**把它从「事件系统的一个字段」提升为「内核的指令集」。** 任何系统——占卜、贸易、随从、结局——想改变世界状态，只能发射 effect 指令，由唯一的 `EffectExecutor` 执行。

收益是复利的：

- **存档**：世界状态 = 初始种子 + 指令流，回放即可复现
- **测试**：断言指令流，而不是断言 UI
- **调参**：所有数值改动都落在指令上，可统计、可平衡
- **撤销/预览**：「若选此项会怎样」可以干跑一遍指令
- **概率公示**（GDD 红线）：指令里带概率，UI 直接展示，不需要额外维护一份说明

代价：早期比直接改字段麻烦。**这是值得付的**——第 12 个系统上线时，没有这条约束的项目已经无法回答「玩家的钱为什么少了 3 枚」。

### 2.2 条件求值器与效果执行器是数据驱动的解释器

`when` 条件（`cities[] / faiths[] / minReputation / language / season / years[] / hasItem[] / learnedDivination[] / flags[]`）是一棵可求值的表达式树，不是 GDScript 代码。

**内容作者写 JSON，不写代码。** 加一个探索点、一条路线、一个结局，不需要程序员参与，也不需要重新导出。GDD §16 的 MVP 要 36 个探索点 + 12 条入城 + 40 条遭遇，完整版是这个数字的十倍——不做成解释器，内容生产会撞死在编译上。

### 2.3 确定性

`(种子, 玩家输入序列) → 完全相同的世界`。

- RNG 全部走内核的 `Rng`（移植 Atlas 的 `seed.ts` mulberry32，见 §5.2），**禁止调用 Godot 的 `randi()`**
- 每个随机点带**命名子种子**（`"tabriz:market:1273-04-11"`），使得无关系统的随机互不干扰——玩家在市场多刷新一次，不会改变海上的风暴
- 浮点：内核数值用整数与定点（命运 0–31、金币、天数都是整数），价格用整数分。**内核不出现累积性浮点运算**

收益：bug 可复现（附种子即可）、平衡可批量模拟（跑一万局统计套利收益率，GDD §9.2 的验收标准直接自动化）。

---

## 3. 目标目录结构

```
fatequest/
├── project.godot
├── docs/                     GDD / SYSTEM_TABLES / LORE_PIPELINE / ATLAS_PORT / 本文
│
├── core/                     ── L1 内核：纯 GDScript，零 Node，可 headless 测试
│   ├── rng/                  确定性随机、命名子种子
│   ├── time/                 内部日期、历法换算、节气、真太阳时（读 §5.3 历表）
│   ├── fate/                 三条命运条 0–31、九等、生辰、封印与揭示
│   ├── divination/
│   │   ├── engines/          移植自 Atlas 的算法（八字/易占/…）
│   │   └── adapters/         引擎产出 → 游戏 effects（ATLAS_PORT §3 映射表）
│   ├── world/                城市图、路线图、探索点、情报可见度与迷雾
│   ├── econ/                 商品、价格、货币兑换、货格
│   ├── retainer/             随从、合同、年度命运、随从间关系
│   ├── narrative/            条件求值器、效果执行器、事件机、结语生成
│   └── save/                 存档快照 + 指令日志
│
├── game/                     ── L2 表现层
│   ├── autoload/             GameContext（内核实例的唯一持有者）
│   ├── screens/              书案 / 导入 / 角色生成 / 城市 / 地图 / 市场 / 图鉴
│   ├── map/                  舆图渲染、路线、迷雾、罗盘、城塞小像
│   ├── ui/                   主题化 Control 组件
│   ├── audio/                程序化合成（每文明一套调式）
│   └── shaders/              羊皮纸、旧墨晕染、占卜六式动效
│
├── content/                  ── L0 数据：作者编辑，程序不碰
│   ├── schema/               八张表的 JSON Schema
│   ├── tables/               cities / archetypes / divinations / goods
│   │                         routes / transports / events / endings / retainers
│   ├── lore/                 marco-polo-lore.json 及切段产物
│   └── i18n/                 zh / en 文本（含 glossary.json）
│
├── assets/                   美术、音频、字体、生成的历表
├── worldmap/                 从 fatequest-worldmap vendored 进来（§4）
├── tools/                    构建期工具（Node/Python，不进包）
│   ├── ephemeris/            历表预计算
│   ├── validate/             schema + 引用完整性 + effects 非空
│   ├── lore/                 语料切段与中译管线
│   └── atlas-port/           TS 数据表 → JSON 的一次性转写
├── tests/                    GUT headless 测试
└── platform/                 steam/ ios/ android/
```

**`js/`、`css/`、`index.html`、`sw.js`、`manifest.webmanifest` 在迁移完成后删除**（D3）。删除前先把 `data-*.js` 抽成 `content/tables/`，把 `data-lore-zh-trunk.js` 的人工校译抽成 `content/i18n/`——那是数月的工作量，不能随代码一起丢。

---

## 4. 地图管线

### 4.1 ⚠️ 前置阻塞：worldmap 覆盖不到中国

实测 `fatequest-worldmap/data/`：

| 项 | 现状 | 需求 |
|---|---|---|
| bbox east | **100°E** | 需 ~130°E |
| 最东城市 | **德里 77.2°E** | 需泉州 118.6°E、大都 116.4°E |
| 城市数 | 96 | 需补东亚与东南亚 |
| 设定 | mappa mundi「欧洲已知世界」 | GDD 是欧亚非全域 |

GDD §16 重排后的十二城里，**上都、大都、行在、刺桐四座全在框外**；44 座 city-class 语料城中 **27 座在中国**（GDD §16.2）。**不东扩就等于丢掉内容最厚的那一半，且主干走廊的终点无处安放。**

修法（数据工程，非重做）：

1. 改 `worldmap/scripts/gen_vector_data.py` 的 `CITIES/MOUNTAINS/RIVERS/SEAS/REGIONS`，补东亚、东南亚、印度洋条目
2. `world_config.json` bbox 东界改 130°，南界降至 −10°（覆盖马六甲、苏门答腊）
3. 跑 `build_real_terrain.py` 取 Natural Earth 海岸线 + 真实 DEM（**需先装 `shapely/rasterio`，当前环境缺**）
4. 重跑 `gen_heightmap.py` / `build_web_map.py`

**设定上的调和**：保留 mappa mundi 的**视觉语言**（耶路撒冷居中、东方在上、环海、旧墨晕染），但地理范围必须到刺桐。这不算破坏设定——中世纪舆图本就把「已知世界」画到 Serica/Cathay；玩家开图的过程正好就是 GDD **P2「地图来自询问」**：世界不预先展开。

### 4.2 vendoring

`fatequest-worldmap/` 目前在仓库外且**未被 git 跟踪**。作为构建输入必须纳管：整树复制进 `fatequest/worldmap/` 并提交（1.9 MB，可接受），而非 submodule——它是会被本项目持续修改的内容数据，不是外部依赖。

### 4.3 2D 舆图，heightmap 降级

GDD §5.3 要的是**羊皮纸手绘舆图**：山用侧视立面、城塞小像随文明变、四文明连续纹样、罗盘玫瑰、风神头、海怪。这是 2D 插画风，**不是 3D 地形**。

因此：

| 数据 | 原定用途 | 本作实际用途 |
|---|---|---|
| `*.geojson` | GIS 图层 | **核心资产**：城市/路线节点坐标、河海山脉标注锚点 |
| `heightmap.png` | 引擎地形导入 | 降级为**绘制底稿**：山脉走向、阴影生成源、程序化纹理遮罩 |

坐标：GeoJSON 经纬度 → 视图坐标走一次仿射投影（`SYSTEM_TABLES.md §1` 的 `coord` / `view` 双字段已预留此设计）。**`view` 由脚本从 `coord` 生成，不手填**，否则 96+ 城市对不齐。

迷雾（P2 的机制载体）：一张 revealed-mask 纹理 + 旧墨晕染 shader，已走过的路永久留亮。mask 存在存档里，是**世界状态的一部分**，不是渲染缓存。

---

## 5. Atlas 移植策略

### 5.1 移植量比 ATLAS_PORT 估的小——大部分是数据不是代码

`ATLAS_PORT.md` 记 24 引擎 5,973 行 TS，读作「要重写 6000 行 GDScript」是**高估**。实测函数声明密度：

| 文件 | 行数 | 函数声明 | 性质 |
|---|---|---|---|
| `iching.ts` | 98 | 4 | 64 卦表 → **JSON**，逻辑仅 ~34 行 |
| `runes.ts` | 87 | 1 | 几乎纯数据 |
| `tarot-deck.ts` | 84 | 3 | 纯牌表 |
| `ziwei.ts` | 124 | 2 | 星曜表为主 |
| `bazi.ts` | 911 | 23 | **真逻辑**：节气、真太阳时、藏干、十神 |
| `liuyao.ts` | 281 | 6 | 真逻辑：纳甲 |
| `qimen.ts` | 335 | 15 | 真逻辑 |

**分流**：数据表用 `tools/atlas-port/` 一次性脚本转 JSON（语言无关，零重写风险）；只有 `bazi / liuyao / qimen / geomancy / lenormand` 等少数文件需要真正的人工重写，约 **1,800–2,200 行**。这是周级工作，不是月级。

### 5.2 移植顺序（对齐 MVP 只要 3 种占法）

| 优先 | 内容 | 说明 |
|---|---|---|
| 0 | `seed.ts` → `core/rng/` | 30 行，整个内核的地基，**第一个移植** |
| 1 | 全部数据表 → `content/tables/` | 脚本转写，无风险 |
| 2 | `iching` + `liuyao` | MVP 占法一 |
| 3 | `bazi` + `bazi-branch-relations` | MVP 占法二，精度提升最大 |
| 4 | 梦占 / 圣签（`lot` + `lotSignsLibrary`） | MVP 占法三 |
| 5 | 其余 20 种 | `divinations.json` 里标 `mvp: false`，随章节扩充 |

**ATLAS_PORT §3 的框架改造是硬约束，不可跳过**：Atlas 回答「我的人生会怎样」，本作回答「我下一段路该怎么走」。每个引擎产出必须经 `core/divination/adapters/` 转成非空的 `effects[]`，由 CI 断言（§9）。

### 5.3 历表预计算——消灭唯一的外部依赖

`western.ts` 是 24 个引擎里唯一依赖外部库的（`astronomy-engine`）。Godot 没有对应库，硬移植 VSOP87 是数周工作。

**更好的解法：把 astronomy-engine 降级为构建期工具，运行时不存在。**

游戏的时间窗口是**固定的 1253–1453**（GDD §2.1）。这 200 年的天体位置是**常量**，可以离线算完打表：

```
tools/ephemeris/  (Node + astronomy-engine, 只在构建期跑)
   ↓
assets/ephemeris.res   日月五星黄经 + 月相 + 太阳黄经
   ↓
core/time/  查表 + 插值
```

体积：月亮逐日、其余每 8 日采样加三次插值，约 **1–2 MB**。

**这一张表同时服务所有历法与占法**——因为它们本质上问的是同一个问题：

| 消费方 | 取用 |
|---|---|
| 八字节气 | 太阳黄经过 15° 整数倍的时刻 |
| 真太阳时 | 均时差 |
| 西洋星盘 | 七曜黄经 + 宫位 |
| 伊斯兰历 / 印度月宿 | 月相、朔望、月亮黄经 |
| 中国历法 | 朔日、闰月 |
| 航海征兆 | 月相、潮汐相位 |

这正是 GDD §7.2「**一个内部日期，多种历法解释**」在实现层的落点：不是七套算法，是一张表七种读法。P3「文化差异落在机制上」因此变成一个可验证的技术事实——同一个随从在中国占卜师与波斯占星师处得到不同措辞、相近指向，是因为**他们读的是同一张表的不同列**。

---

## 6. 资产管线

当前 `assets/` **179 MB**（art 161 MB / decks 13 MB / books 5.6 MB），286 张贴图。上架必须处理：

| 问题 | 措施 |
|---|---|
| iOS 包体与 OTA 下载限制 | 城市包按需加载；核心包只装 12 主城，其余 tier 按区下载 |
| WebP 在 Godot 中解码开销 | 转 **KTX2/Basis** 压缩纹理（GPU 直读，显存占用降一个量级） |
| 散图过多导致 draw call 高 | 打**图集**（TextureAtlas），按屏幕分组 |
| `books/*.txt` 5.6 MB 原文 | **不进包**——那是 `tools/lore/` 的输入，产物才进包 |
| 未来章节扩容 | Godot PCK 补丁包分发，Steam 走 depot，iOS 走 ODR |

`assets/books/marco-polo-lore.json`（461 KB，136 places + 98 stories）**进包**——它是内容源，运行时要读。

---

## 7. 存档

**不做纯回放存档。** 指令流回放对开放世界是陷阱：任何平衡性补丁都会让旧档漂移，而本作明确要长期更新章节。

采用**快照为准 + 指令日志为辅**：

- **快照**：完整世界状态序列化，向后兼容靠 `saveVersion` + 迁移函数链。这是唯一权威
- **指令日志**：滚动保留最近 N 条 effect 指令，仅供 bug 上报与调试回放，**不参与读档**
- **自动存档点**：抵达城市、离城、重大事件后、占卜结算后
- **云同步**：Steam Cloud / iCloud，冲突时按游戏内日期取新

---

## 8. 本地化

`SYSTEM_TABLES.md` 已定所有玩家可见文本为 `{zh, en}` 双语对象。**保持这个结构，但落地时拆开**：

- 数据表里存 **key**，不存文本；文本进 `content/i18n/{lang}.json`
- 理由：双语内联对象在第三种语言（日/韩/德）出现时要改所有表；而本作文本量是十万字级
- `glossary.json`（已有 ~90 条）升级为**术语强制表**，CI 校验译文用词一致（Zayton = 刺桐/泉州 不得混用）
- 字体：中文需思源宋体子集化，全量 CJK 字体 15 MB+ 不可接受

---

## 9. 测试与 CI 门禁

内核零 Node 依赖的回报在这里兑现——**整局游戏可在 headless CI 里跑完**。

| 门禁 | 检查 | 拦截 |
|---|---|---|
| G1 Schema | 八张表符合 `content/schema/` | 字段错误 |
| G2 引用完整性 | 所有 id 交叉引用存在（`exits→routes`、`sites→events`、`mentor→retainers`） | 断链 |
| G3 **effects 非空** | 每条占法的 `effects[]` 非空 | **占卜退化为装饰**（GDD §8.2 硬约束） |
| G4 可达性 | 三条角色线从起点可走到终局，无死锁 | 玩家卡关 |
| G5 确定性 | 同种子跑两次结果逐位相同 | 内核混入非确定性 |
| G6 经济平衡 | 一万局蒙特卡洛，套利收益率在区间内 | GDD §9.2 验收 |
| G7 术语一致 | 译文对照 glossary | 译名漂移 |
| G8 语料标注 | 每条文本有 `origin` 与 `ref` | GDD §19 史料/演绎必须可分辨 |

G3–G8 是本作特有的——它们把策划案里的**设计红线变成机器可执行的断言**。这是「高质量引擎」比画面更重要的部分。

---

## 10. 风险登记

| # | 风险 | 影响 | 应对 |
|---|---|---|---|
| R1 | ~~worldmap 东扩未做~~ | — | ✅ **已解决**（2026-07）：bbox 东扩至 122°E／南扩至 −8°，城市 96→144，十二城全部入框；真实 DEM 仍待跑 `build_real_terrain.py`（需联网 + OpenTopo key） |
| R2 | ~~MVP 十二城与语料不匹配~~ | — | ✅ **已解决**（2026-07）：GDD §16 重写，十二城改为全部有地点章背书的走廊；世界规模扩到约 75 节点，深度按 `tier` 分章节灌注 |
| R3 | 内容体量 | 完整版是 MVP 的十倍文本 | 数据驱动解释器（§2.2）+ 内容作者不写代码 |
| R4 | 占卜退化为装饰 | 毁掉核心玩法 | G3 门禁 + adapters 层强制 |
| R5 | 宗教呈现 | 上架风险、玩家伤害 | GDD §19；上线前敏感读者审阅**列为发布门禁** |
| R6 | 179 MB 资产 | iOS 包体 | §6 管线 |
| R7 | Godot iOS 导出踩坑 | 上架延期 | **M1 就跑通一次空壳 iOS 归档**，不要留到最后 |
| R8 | 单人项目体量 | 做不完 | 严守 GDD §16 MVP 范围；24 种占法只接 3 种 |

---

## 11. 下一步

架构定了，按此顺序推进：

1. ~~改 GDD §16~~ ✅ 已完成（2026-07）
2. ~~worldmap 东扩~~ ✅ 已完成（2026-07）。**遗留**：`heightmap.png` 仍是合成原型（无海陆掩膜），生产地形需联网跑 `build_real_terrain.py --dem opentopo`（要 `shapely/rasterio` + OpenTopography key）
3. **`CODE_PLAN.md`**：内核模块的类型与接口、effect 指令集的完整规格、条件求值器语法
4. **`DATA_MODEL.md`**：八张表的 JSON Schema、id 命名规范、引用图、迁移策略
5. **骨架落地**：Godot 工程 + `core/rng` + effect 执行器 + 一条最小可玩路径（两城一路线）
6. **M1 验收**（GDD §16）：八张表落库、**约 75 节点**、三条线可从头走到尾

> 架构的意义是让「很大的世界观」变成「可以制作的系统」。八张表是内容的骨架，效果指令表是代码的骨架——两者都做出来，剩下的就只是填。
