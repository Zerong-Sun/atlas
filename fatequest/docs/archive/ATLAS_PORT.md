# Atlas 资产移植方案 · ATLAS PORT PLAN

> **归档对照说明（非构建契约）。** Atlas 已整树迁入同仓库 [`../atlas/`](../../atlas/)，短期冻结，仅供人工阅读与按需复制。本文盘点可移植资产与框架差异；**FateQuest 与 Atlas 无共享构建、无相互 import。** 需要引擎或元数据时，从 `../atlas/...` 复制进本目录后自行维护。
>
> **另注（2026-07-24）：** 本文中的 `fatequest/js/...` 均指**初代网页版**的实现，
> 现已归档到 [`../archive/web-version/js/`](../archive/web-version/)。Godot 版的占卜
> 移植落点是 `core/divination/`（开放式注册表 + 引擎），与这些 `js/` 路径无关。

---

## 1. 资产盘点（实测）

### 1.1 引擎 `../atlas/packages/engines/` — 24 个，5,973 行 TypeScript

| 引擎 | 行数 | 说明 |
|---|---|---|
| `bazi.ts` | 911 | 四柱排盘：节气、真太阳时、藏干、十神 |
| `bazi-compatibility.ts` | 612 | 合婚／关系合盘 |
| `qimen.ts` + `qimen-interpret.ts` | 562 | 奇门遁甲盘 + 解读 |
| `western.ts` | 324 | 西洋星盘（**唯一依赖外部库** `astronomy-engine`） |
| `bazi-interpret.ts` | 289 | 八字解读规则 |
| `liuyao.ts` | 281 | 六爻纳甲 |
| `bazi-branch-relations.ts` | 208 | 地支刑冲合害 |
| `lenormand.ts` | 160 | 雷诺曼牌阵 |
| `geomancy.ts` | 148 | 土占 |
| `tarot-interpret.ts` / `tarot.ts` / `tarot-deck.ts` / `tarot-adapters.ts` | 336 | 塔罗全套 |
| `ziwei.ts` | 124 | 紫微斗数 |
| `fengshui.ts` | 119 | 风水罗盘 |
| `jiaobei.ts` | 113 | 筊杯 |
| `meihua.ts` | 103 | 梅花易数 |
| `iching.ts` | 98 | 周易起卦 |
| `numerology.ts` | 90 | 数理 |
| `runes.ts` | 87 | 卢恩 |
| `astrodice.ts` | 80 | 星辰骰 |
| `scrying.ts` / `coffee.ts` / `xiangmian.ts` / `palmistry.ts` / `oracle.ts` | ~300 | 水晶／咖啡渣／相面／手相／神谕卡 |
| `rule-match.ts` / `seed.ts` | 100 | 规则匹配与确定性随机 |

**依赖状况（关键）**：除 `western.ts` 需 `astronomy-engine`、测试文件用 `node:assert` 外，**其余全部只 import 内部 `@atlas/shared-types` 的类型**——类型 import 在编译后即擦除。

> **结论：22/24 个引擎是零运行时依赖的纯函数，可直接移植。**

### 1.2 方法数据库 `../atlas/packages/method-data/` — 1,169 行

| 文件 | 行数 | 内容 |
|---|---|---|
| `divinationMethods.ts` | 171 | **24 种占法注册表**，带强类型元数据 |
| `methodCognition.ts` | 366 | 各占法的认知模型／适用边界 |
| `questionFrames.ts` | 184 | 提问框架（怎么问才问得对） |
| `culturalProfiles.ts` | 166 | 语言／文化视角／术语模式 |
| `lotSignsLibrary.ts` | 89 | 签诗库 |
| `methodExperiences.ts` | 74 | **动效规范**（见 1.3） |

注册表中的 24 种占法：
`bazi · bazi-relationship · tarot · dream · iching · qimen · ziwei · liuyao · meihua · western · vedic · numerology · runes · geomancy · lot · jiaobei · xiangmian · palmistry · fengshui · astrodice · lenormand · oracle · coffee · scrying`

每种带这些**类型化元数据**（比本作 `SYSTEM_TABLES.md §3` 原定义更完备）：

```ts
causalityModel:  birth-structure | time-position | celestial-cycle | symbolic-projection
               | ritual-confirmation | folk-association | spatial-flow | textual-admonition
uncertaintyMode: trend | timing | yes-no | psychological-mirroring | admonition
               | event-narrative | strategic-positioning | reflection
evidenceStyle:   calculated-chart | cast-symbol | drawn-card | classic-text
               | ritual-result | observed-sign | dream-symbol | user-narrative
questionDomain:  life-structure | career | relationship | specific-event | timing
               | inner-state | dream | space | daily-guidance
```

### 1.3 动效规范 `methodExperiences.ts` + `method-experience.css`

这正是「动画方式」。每种占法配：

```ts
{ id, glyph, accentColor, accentSecondary,
  motion: "shuffle" | "orbit" | "ripple" | "flip" | "smoke" | "static",
  reducedMotionFallback: "fade" | "none" }
```

CSS 侧已有配套关键帧（**纯 CSS，零依赖，可直接复制**）：

- 通用六式：`method-shuffle-bg/glyph` · `method-orbit-bg/glyph` · `method-ripple-bg/pulse` · `method-flip-glyph` · `method-smoke-rise` · `method-rise`
- 专用式：`astrodice-roll` · `jiaobei-toss` · `lot-shake` · `deck-shuffle` · `deck-draw` · `card-flip-in` · `card-arrive`

### 1.4 其他

- `../atlas/packages/theme/traditions.ts` — 各传统的配色令牌
- `../atlas/apps/web/src/data/methodReferenceLibraries` — 参考文献库
- `../atlas/packages/method-core/` — 报告快照与分享（**本作不需要**，Atlas 是工具向）

---

## 2. 与本作现状的落差

游戏初代网页版（现归档于 `../archive/web-version/`）仅有 `js/engines.js` **227 行**，是 7 种占法的简化实现（八字按常年近似节气、纳甲从简）。Atlas 的 `bazi.ts` 单文件就 911 行，含真太阳时与精确节气。
Godot 版已将四个 MVP 引擎手工移植至 `core/divination/methods/`（iching/bazi/lot/tarot），其余 20 法走 `SoftDivinationMethod` 软占通道。

| | 初代网页版 | Godot 版（本作） | Atlas |
|---|---|---|---|
| 占法数 | 10（含雷诺曼） | 4 MVP + 20 软占 | 24 |
| 引擎总量 | 227 行 JS | 442 行 GDScript（四法）+ soft.gd | 5,973 行 TS |
| 八字 | 简化节气近似 | GDScript 手抄自 Atlas（108 行，含四柱） | 节气 + 真太阳时 + 藏干 + 十神 |
| 周易 | 起卦 + 卦名 | GDScript 手抄起卦 + 互体（97 行） | 起卦 + 纳甲 + 六爻断 |
| 元数据 | 无 | 四维类型化分类（divinations.json） | 更强的元数据体系 |
| 动效 | 各页手写 | 六式动效参数就绪（Atlas 源），动画实现推迟至 ANIMATION_PLAN N5 | 六式规范 + CSS 关键帧库 |
| 注册表 | 硬编码 switch | 开放式 `DivinationRegistry`，新增占法只需一行注册 | 无注册表模型 |

**移植收益是数量级的**，尤其八字、六爻、奇门、紫微这四项——从零重写要数周，移植是天级。

---

## 3. ⚠️ 必须改造：框架差异

**这是本方案唯一的设计风险，不改会毁掉游戏性。**

Atlas 是**占卜工具**：方法的产出是「回答用户的真实问题」，元数据里的 `questionStyle`、`questionDomain` 都指向现实生活（事业、感情、内在状态）。

《远行之书》是**旅行游戏**：占卜的产出必须是**改变路线信息或世界状态**——GDD §8.2 与 `SYSTEM_TABLES.md §3` 都写了硬约束：`effects` 不得为空，否则占卜只是装饰。

> **原样搬运 Atlas 的方法框架 = 把「占卜是装饰」这个老问题重新引进来。**

正确做法是**分层**：

```
Atlas 层（移植，不动）          游戏层（新写）
─────────────────────         ──────────────────────────
engines/*.ts   算法产出         →  effects[]     改路线风险／价格透明度／情报可见度
divinationMethods 元数据        →  learnAt[]     哪座城能学
methodExperiences 动效          →  teacher       师从谁
lotSignsLibrary   签诗文本      →  cost          金钱／时间／护佑代价
                               →  reads[]       可解读对象（自己／随从／路线／年份）
```

Atlas 的 `causalityModel` / `uncertaintyMode` 恰好能**直接推导**游戏层的 `question` 字段：

| Atlas `uncertaintyMode` | 游戏 `question` | 典型用法 |
|---|---|---|
| `yes-no` | `risk` | 筊杯问此路可行否 |
| `timing` | `timing` | 择吉日出海 |
| `trend` | `trade` | 未来三年财货运 |
| `strategic-positioning` | `route` | 西路利贸易，北路利求学 |
| `psychological-mirroring` | `person` | 判断随从是否可托 |
| `event-narrative` | `identity` | 梦占揭示随从生辰 |

**这张映射表是移植的核心产物**——它把 Atlas 的认知分类接到游戏的路线系统上。

---

## 4. 分三层移植

### 层一 · 立即移植（低风险、高收益）

> **注（Godot 化后更新）：** 本表格原目标位置 `fatequest/css/` 与 `fatequest/js/` 属初代网页版，现已归档至 `archive/web-version/`。Godot 版落点如下。

| 资产 | 目标位置（Godot 版） | 现状 |
|---|---|---|
| **reduce-motion 策略** | `game/fx/motion.gd` | ✅ `Motion.reduce_motion` + `duration_scale` 已落地（ANIMATION_PLAN N0） |
| **六式 motion 关键帧** | `game/fx/` 动画节点（ANIMATION_PLAN §2.3 N5） | 🔲 推迟至 ANIMATION_PLAN P3 占卜仪式渲染时落地；曲线与时长用 Atlas CSS 的参数，转为 Godot `AnimationPlayer` / `Tween` |
| **`methodExperiences.ts`**（24 条 glyph / accent / motion） | `content/tables/divinations.json` 每条记录的 `experience` 字段，或独立表 `content/tables/divination/method_experiences.json` | 🔲 未移植——divinations.json 现有 24 条均不含 glyph / accentColor / motion。数据在 Atlas 源中（`methodExperiences.ts`），待 UI 渲染占卜结果需要字形与色彩时补入 |
| **`lotSignsLibrary.ts`** | `content/tables/divination/lot_signs.json` | ✅ 已建成（90 签，三庙） |
| **`theme/traditions.ts`** | 参考取值，不覆盖「云岭暮光」 | ✅ 配色已参考，不占用主色板 |

**工作量**：层一同期已完成约 2/5 项；六式 motion 关键帧属 ANIMATION_PLAN N5 动画范畴，非移植范畴；methodExperiences 为数据表扩充，一小时内可补。

### 层二 · 引擎移植（本次最大收益）

**MVP 只接三种**（GDD §16）：八字／易占 · 占星 · 梦占／圣签。对应移植：

| 优先 | 引擎 | 备注 |
|---|---|---|
| 1 | `iching.ts` + `liuyao.ts` | 98 + 281 行，零依赖，直接替换游戏简化版 |
| 2 | `bazi.ts` + `bazi-branch-relations.ts` | 911 + 208 行，精度提升最大 |
| 3 | `astrodice.ts` · `jiaobei.ts` · `meihua.ts` · `runes.ts` · `tarot*.ts` · `lenormand.ts` | 已在游戏中有简化版，逐个替换 |
| 4 | `western.ts` | **需 `astronomy-engine`（~200 KB）**，超首屏预算，改为按需加载或保留简化版 |

**移植方式（无共享构建）：**

- 需要某引擎时，从 `../atlas/packages/engines` **人工复制**对应 TS，转为 GDScript 放进 `core/divination/methods/`，由 FateQuest 自行维护。Godot 版 MVP 四法已按此方式完成手抄。
- **不要**用 esbuild/workspace 把 Atlas 源码打成共享 bundle，也不要两边单点维护同一份源码。

**工作量**：按模块手工移植，八字等大文件需单独回归。

### 层三 · 元数据合并（需要判断，不能自动）

把 `divinationMethods.ts` 的 24 条注册表**扩展**为游戏的占卜表（`content/tables/divinations.json`）：

1. 保留 Atlas 的 `causalityModel` / `uncertaintyMode` / `evidenceStyle` / `culturalNote`
2. 按 §3 映射表推导游戏的 `question`
3. **新增游戏层字段**：`learnAt` · `teacher` · `reads` · `effects` · `cost` · `resultTexts`
4. 删除 Atlas 的工具向字段：`questionStyle`（现实生活提问框架）、`status`（ready/preview/planned）

**工作量**：24 条 × 每条约 20 分钟 = 约 1 天。但 **MVP 只需先做 3 条**。

---

## 5. 范围警告

Atlas 有 24 种占法，MVP 只要 3 种（GDD §16）。

> **对照阅读与按需复制是划算的；不要重建与 Atlas 的构建耦合。**
> 但把 24 种都接进玩法是范围灾难：每种占法都要有师父、学习地点、结果文本、对路线的实际影响（§3 硬约束），这是 24 × 完整内容生产。

**建议**：需要时从归档复制引擎/动效到本目录；玩法层严格按 MVP 只接 3 种，其余在 `divinations.json` 里标 `mvp: false`，随章节扩充。

---

## 6. 执行清单

> **收口审计（2026-07-25）：** 全量核对 Godot 工作树实际状态。三栏解析：
> ✅ = 已落地可证实 · 🔲 = 推迟（有明确落点但非本期） · ~~线~~ = 路径归档后不再适用。

- 🔲 从 `../atlas` 复制 `method-experience.css` 关键帧 → Godot 动画节点（ANIMATION_PLAN N5）
  - **现状**：CSS 源在 `atlas/apps/web/src/styles/method-experience.css`。reduce-motion 策略已在 `game/fx/motion.gd` 落地（ANIMATION_PLAN N0）。六式 motion 的时长 / 曲线参数将在 ANIMATION_PLAN §2.3 N5 中以 Godot `AnimationPlayer` / `Tween` 重建——届时直接引用 Atlas CSS 中的关键帧参数值。
- 🔲 转写 `../atlas/.../methodExperiences.ts` → Godot 占卜体验数据
  - **现状**：24 条 glyph / accentColor / accentSecondary / motion / reducedMotionFallback 仍在 Atlas 源 (`atlas/packages/method-data/src/methodExperiences.ts`)。Godot 的 `content/tables/divinations.json` 24 条记录均不含体验字段。推荐落点：在 `divinations.json` 每条记录中新增 `experience: { glyph, accentColor, accentSecondary, motion, reducedMotionFallback }` 字段，或建独立表 `content/tables/divination/method_experiences.json`。数据现成，纯体力活，一小时内可补。
- ✅ 转写 `lotSignsLibrary` → Godot `content/tables/divination/lot_signs.json`
- ✅ 引擎手抄进 `core/divination/methods/`（MVP 四法完整；其余 soft cast）
- ✅ 解耦 `@atlas/shared-types`：GDScript 就地类型，无共享构建
- ✅ `western` / 天文库：非 MVP soft chart，未引入 `astronomy-engine`
- ✅ 用移植结果替换遗留 `js/engines.js`（Godot 线已接 Registry）
  - **核实**：旧版 `archive/web-version/js/engines.js`（227 行）已归档。Godot 的 `DivinationRegistry` + `core/divination/methods/*.gd` 是唯一占卜引擎源，经 `tests/test_divination.gd` 全覆盖验证。无任何 Godot 代码引用旧 `js/engines.js`。
- ✅ 写 §3 的 `uncertaintyMode → question` 映射（见 `tools/divination/build_p3_content.mjs`）
- ✅ 生成 `content/tables/divinations.json`：24 条元数据 + 4 条 MVP 完整游戏层字段
- ✅ 回归：`effects` 非空 + G3 MVP 路线向约束（`validate.mjs`）

---

## 7. 一句话结论

**引擎与动效值得全量移植，元数据值得合并，但方法框架必须重写。**
Atlas 回答「我的人生会怎样」，本作回答「我下一段路该怎么走」——同样的算法，不同的问题。

---

## 8. 收口汇总（2026-07-25）

本文当初是在「初代网页版 → Godot」的**切换关口**写的，因此目标路径部分指向已归档的 `fatequest/css/` 与 `fatequest/js/` 目录。以下按 §6 清单逐项收口。

### 8.1 已完成（8 / 11 项）

| # | 项 | 落点 | 验证 |
|---|---|---|---|
| 1 | lotSignsLibrary | `content/tables/divination/lot_signs.json` | 90 签三庙，文件 1,626 行 |
| 2 | MVP 引擎手抄 | `core/divination/methods/{iching,bazi,lot,tarot}.gd` | 442 行 GDScript，tests/test_divination.gd 全覆盖 |
| 3 | Soft 引擎 | `core/divination/methods/soft.gd` | 20 法，每种有 cast + codex 效果 |
| 4 | 解耦 shared-types | 就地 GDScript 类型 | 无 import `@atlas/`，无共享构建 |
| 5 | western 非 MVP | 软占通道 | 未引入 astronomy-engine |
| 6 | 替换 js/engines.js | Godot Registry | 旧版已归档，Godot 为唯一占卜引擎 |
| 7 | uncertaintyMode → question 映射 | `tools/divination/build_p3_content.mjs` | 8 类映射 + 24 条推导 |
| 8 | divinations.json | `content/tables/divinations.json` | 24 条，1,573 行，含 atlasEngine / causalityModel / uncertaintyMode / evidenceStyle / questionDomain |
| 9 | G3 回归 | `tools/validate/validate.mjs` | effects 非空 + MVP 路线向约束，CI 门禁全绿 |

### 8.2 推迟（2 项，非阻塞）

| # | 项 | 推迟原因 | 何时做 |
|---|---|---|---|
| 1 | 六式 motion 关键帧 | 属 ANIMATION_PLAN N5 动画实现范畴，非移植范畴。reduce-motion 策略已在 `game/fx/motion.gd`（ANIMATION_PLAN N0）。六式曲线的时长 / easing 参数可直接从 Atlas CSS 中取值，在 Godot 中重画为 `AnimationPlayer` / `Tween`。 | P3 占卜仪式需要动画渲染时 |
| 2 | methodExperiences 数据（24 条 glyph / accent / motion） | 数据在 Atlas 源中现成（`methodExperiences.ts`），但 divinations.json 的 24 条记录尚不含体验字段。当前 UI (`DivinationResultView`) 以纯文本渲染占卜结果，不需要字形与色彩。 | UI 需要富渲染占卜卡片时，补一个字段即可（≤1 小时） |

### 8.3 结论

ATLAS_PORT 计划的**核心目标已全部达成**：
- 引擎移植：四法手抄 + 20 法软占 + 开放式 Registry，新增占法零摩擦
- 元数据合并：24 条 Atlas 四维分类已写入 divinations.json，uncertaintyMode → question 映射在 build 脚本中自动化推导
- 框架解耦：游戏层方法表与 Atlas 算法层在 §3 中明确分离，`to_effects()` 是唯一结合点，G3 门禁强制执行
- 剩余 2 项推迟属 UI 渲染与数据富化范畴，不阻塞当前功能，各自有明确的落点与成本估算

**此计划已完成收口，不再跟踪。**今后如需补六式 motion 或 methodExperiences 数据，参见 ANIMATION_PLAN.md 与本文 §4 层一更新表格。
