# 执行计划 · PLAN

**2026-07-26 全文复核。** 此前本文写的是 P2-A 刺桐纵切，那一阶段早已完成；
旧稿存 `docs/archive/PLAN-2026-07-P2A-zayton.md`。

**分工**：`STATUS.md` 讲「现在在哪」，`ROADMAP.md` 讲「阶段顺序」，本文讲
**「下一步具体怎么做、做到什么算完、怎么验」**。三份不重复。

**本文的写法**：每项任务给出 ① 起点状态（可复现的命令与数字）② 逐步操作
③ 验收标准 ④ 配套测试与门禁。不写「优化」「完善」这类无法判断是否做完的词。

---

## 0. 现在的真实状态

```bash
node tools/validate/validate.mjs                        # 22 道门禁
node tools/lore/story.mjs check                         # 译文时效
node tools/lore/match_books.mjs                         # 三书绑定报告
godot --headless --path . --script tests/run_tests.gd   # 15 个单测
```

| 维度 | 数字 |
|---|---|
| 玩法系统 | 交易 · 随从 · 结局 · 图鉴 · 存档 · 占卜八法 —— **全部闭环** |
| 世界 | 102 城（12 metropolis · 21 city · 44 town · 25 station）· 204 路线 |
| 事件 | 199 条：入城 102 · 探索点 51 · 途中 46 |
| 语料背书 | 83/102 城有 `origin: "source"`（波罗 63 + 三书 20），19 城 `authored` |
| 文本 | en/zh 各 2132 条，缺 0、中英同文 0 |
| 测试 | 15 单测 + 10 smoke，全过 |
| 门禁 | G1–G3、G7–G18、G20–G25 全绿 |

**一句话**：机器都通了，世界的密度不够——12 座主城各有 3 个探索点，另外 90 座一个都没有。

---

## 1. 任务总表

按「玩家能感知的收益 ÷ 工作量」排序。**T2 起可并行**（文本与玩法互不阻塞）。

| # | 任务 | 量 | 阻塞谁 | 章节 |
|---|---|---|---|---|
| **T1** | 20 城入城正文按三书选段改写 | 20 城 × 2 语言 | — | §2 ✅ 2026-07-24 |
| **T2** | 占卜第二批接入玩法 | 4 法 | 无 | §3 ✅ 2026-07-26 |
| **T3** | 次级城探索点 | 21 座 city 各 2 点 | 无 | §4 · 需求 → `STORY_REQUIREMENTS.md` §1 |
| **T4** | 法德兰草原 stories 转途中事件 | 约 40 条 | 无 | §5 · 需求 → `STORY_REQUIREMENTS.md` §2 |
| **T5** | 补 F-3 / F-6 两项审计遗留 | 小 | 无 | §6 ✅ 2026-07-26 |
| **T6** | 11 条弱证据复核 + 8 条查无处置 | 19 城 | 无 | §7 · 需求 → `STORY_REQUIREMENTS.md` §3 |

---

## 2. T1 · 20 城入城正文改写

> **状态（2026-07-24）**：✅ 已完成。en 据 `passages.json` 改写 → zh 见闻体翻译 →
> 六维文化校订（`proofed: true`）→ 语体审阅优化入库。`story.mjs check` 779 current ·
> 0 stale · 0 missing；G7 / G21 / G24 全绿。流程与守则仍保留——T3/T4 继续照此走。

### 2.1 起点

三书段落级绑定已完成（`LORE_PIPELINE.md` §6）。20 城的选段在
`assets/books/passages.json`，每条含：

| 字段 | 用途 |
|---|---|
| `book` / `chapterId` / `title` | 出处 |
| `quote` | **命中词前后各 90 字符**——一行核验用 |
| `text` | 命中段落 + 前后各一段，改写的实际素材 |
| `hits` | 提及次数（证据强度） |
| `invective` | **非空 = 含时代性贬语，必须改写不得引用** |

```bash
node -e 'const p=require("./assets/books/passages.json").generated;
for(const [c,ps] of Object.entries(p))
  console.log(c.padEnd(18), ps[0].book.padEnd(12), (ps[0].invective||[]).length?"⚠ 需改写":"", ps[0].quote.slice(0,80))'
```

当前 20 条中 **8 条**含贬语：`accon` `hierusalem` `tyrus` `constantinopolis`
`babylonia-cairus`（朱拜尔，十字军语境）· `cabul` `delli` `basora` `java-major`（白图泰）。

### 2.2 逐城操作

对每一座城：

1. **读选段**。先读 `quote` 确认这条引证成立，再读 `text` 取材。
   > 若 `quote` 读下来发现绑错了（例如讲的是邻城），**不要将就**——回
   > `tools/lore/match_books.mjs` 的 `NAMES` 补该城的名称变体重跑，或将其退回
   > `origin: "authored"`。一条错引证比没有引证坏得多。

2. **写英文源** `content/story/<city>/en.md`。已存在则改对应 `## ev.<city>.entry.body` 段。
   语体守则见 `L10N_PLAN.md` §2 与 `LORE_PIPELINE.md` §4：
   - 第二人称、观察语体、不写心理活动、不用现代词汇
   - **改写不是翻译也不是摘录**：史料给的是事实与语气，句子必须是新写的
   - 含 `invective` 的：保留「此地有两教相邻、彼此戒备」这类**可观察的事实**，
     删去谩骂。作者的敌意本身可以写成城中氛围，不能写成台词。

3. **写中文** `content/story/<city>/zh.md`，据英文源翻译。

4. **编译 + 盖章 + 查时效**：
   ```bash
   node tools/lore/story.mjs build
   node tools/lore/story.mjs stamp zh
   node tools/lore/story.mjs check
   ```
   > **顺序不可颠倒**：先改源文，再 build，再 stamp。改 `content/i18n/*.json`
   > 的修复活不过下一次构建——2026-07-24 已经栽过一次（`AUDIT` §9.2 末尾）。

5. **过门禁**：
   ```bash
   node tools/validate/validate.mjs
   ```
   G24 会拦下任何漏进 i18n 的贬语；G7 拦术语不一致；G21 拦译文过期。

### 2.3 验收

- [x] 20 城的 `ev.<city>.entry.body` 在 en/zh 均为新写正文，非占位、非原文摘录
- [x] `node tools/lore/story.mjs check` → `0 stale · 0 missing`
- [x] `node tools/validate/validate.mjs` → G7 / G21 / G24 全绿
- [x] 抽城人工比对选段与成文：**读不出是从哪一句抄的**（并做过语体/文化审阅优化）
- [ ] `smoke_citynav` 仍过（正文变长不得撑破布局）——上架前复跑

---

## 3. T2 · 占卜第二批接入玩法

> **状态（2026-07-26）**：✅ 已完成。`jiaobei`／`astrodice`／`geomancy`／`runes` 真引擎 + 拜师 +
> ≥2 接线 + 各 30 条 en/zh 结果文（允许吉凶用语）+ G25（含负向）+
> `test_divination_reach`／`smoke_divination`。注册表仍为 24 法。

### 3.1 起点：接口是通的，路是断的

```bash
node -e 'const d=require("./content/tables/divinations.json").records;
const on=d.filter(x=>x.mvp), off=d.filter(x=>!x.mvp);
console.log("接入玩法",on.length,":",on.map(x=>x.id).join(" "));
console.log("仅注册",off.length,":",off.map(x=>x.id).join(" "))'
```

| 层 | 状态 |
|---|---|
| `DivinationRegistry` | ✅ 24 法全部注册，开放式，无上限 |
| `DivinationMethod` 契约 | ✅ `id/inputs/reads/cast/to_effects/reading_keys` 六件 |
| 真实引擎 | ✅ 4 个：`iching` `bazi` `lot` `tarot` |
| 通用引擎 `SoftDivinationMethod` | ⚠️ 其余 20 法共用；`cast` 出随机数，`to_effects` 只发一条 codex |
| **可学到** | ❌ **只有 4 法有 `learnAt` + `teacher`** |
| **玩法中被使用** | ❌ **183 条事件里只有 3 条带 `divination` 选项** |

**结论**：20 法虽然注册了，玩家**永远学不到**——`event_machine.gd:82` 会拒绝未学的占法。
它们现在是 API 可调用、玩法不可达。这不是 bug（设计如此，`mvp: false`），但第二批要接的
就是这个。

### 3.2 加一种占法要动几处

**这是接口设计的验收点：加一法不改内核、不改 UI、不出现任何 `match method_id`。**

| # | 动什么 | 文件 | 必须？ |
|---|---|---|---|
| 1 | 写引擎 | `core/divination/methods/<id>.gd`，`extends DivinationMethod` | ✅ |
| 2 | 注册一行 | `core/divination/bootstrap.gd` 的 `register_all()` | ✅ |
| 3 | 落库 | `content/tables/divinations.json`：`mvp: true` + `learnAt` + `teacher` | ✅ |
| 4 | 拜师事件 | `content/tables/events/mentors_divination.json` | ✅ 否则学不到 |
| 5 | 结果文本 | `content/story/div-<id>/{en,zh}.md`，30 条 | ✅ |
| 6 | 用它的选项 | 某些事件的 `choices[].divination` | ✅ 否则学了没处用 |
| 7 | 内核 / UI | —— | ❌ **一行都不该改** |

> 第 7 行是硬要求。若发现必须改内核才能加一法，说明 `DivinationMethod` 契约缺了东西，
> **应当扩契约而不是在内核里开分支**（`method.gd` 开头那段注释就是这个意思）。

### 3.3 第二批选哪几法

按「文化圈覆盖 + 已有数据支撑 + 与玩法真的相关」三条挑：

| 占法 | 文化圈 | 回答什么 | 为什么选它 | 数据现状 |
|---|---|---|---|---|
| **geomancy** 沙盘 | 伊斯兰 | 是/否，风险 | 西亚 34 城最多，却无一本地占法可学 | 无专表，需建 16 象 |
| **astrodice** 星辰骰 | 伊斯兰 | 时机 | 已有 planet/sign/house 三元组，最接近可用 | soft 已产出三元组 |
| **jiaobei** 筊杯 | 东亚 | 是/否 | 与签占同庙可学，成本最低 | soft 已有 yin/yang 逻辑 |
| **runes** 卢恩 | 拉丁／北方 | 事件走向 | 草原—罗斯线唯一非伊斯兰非东亚的占法 | 需建 24 符表 |

**先做 `jiaobei` 与 `astrodice`**——两者的 `cast` 逻辑在 `soft.gd` 里已经是对的，
缺的只是真实 `to_effects`、拜师、结果文本。以它们验证「加一法只动 6 处」的流程，
再做需要新建符表的 `geomancy` 与 `runes`。

### 3.4 逐法操作

以 `jiaobei`（筊杯）为例：

**① 引擎** `core/divination/methods/jiaobei.gd`

```gdscript
class_name JiaobeiMethod
extends DivinationMethod

## 筊杯：一问一答，只答是否与「再问」。
##
## 它和签占同属庙宇，但回答的问题不同：签占给的是训诫，筊杯给的是许可。
## 三种结果里有一种是「圣杯（准）」、一种是「笑杯（再问）」、一种是「阴杯（不准）」，
## 而「再问」不是没有答案 —— 它是这套方法承认自己这一次没有话说，
## 这一点必须落进 effects，否则它就退化成一枚硬币。

func id() -> String: return "jiaobei"
func inputs() -> Array: return ["question"]
func reads() -> Array: return ["route", "city"]

func cast(ctx: DivinationContext) -> Dictionary:
    var a := ctx.rng.next_int(2)      # 0 平面向上 = 阳
    var b := ctx.rng.next_int(2)
    var outcome := "holy" if a != b else ("laugh" if a == 1 else "yin")
    return {"method": id(), "cups": [a, b], "outcome": outcome}

func to_effects(raw: Dictionary, ctx: DivinationContext) -> Array:
    # 非空是硬规则（GDD §8.2 / G3）。「再问」也必须有后果——它花掉了时间。
    match String(raw.get("outcome", "")):
        "holy":  return [{"op": "reveal_map", "value": ctx.subject, "reason": "jiaobei-granted"},
                         {"op": "codex", "value": "cx-jiaobei", "reason": "jiaobei-recorded"}]
        "yin":   return [{"op": "flag", "value": "fl-jiaobei-refused", "reason": "jiaobei-refused"},
                         {"op": "codex", "value": "cx-jiaobei", "reason": "jiaobei-recorded"}]
        _:       return [{"op": "days", "value": 1, "reason": "jiaobei-asked-again"},
                         {"op": "codex", "value": "cx-jiaobei", "reason": "jiaobei-recorded"}]
```

> 上面这段是**实际编译通过的**（Godot 4.7.1，`--check-only`）。文档里的代码会腐烂，
> 所以照抄前先自查一次：
>
> ```bash
> godot --headless --path . --check-only --script core/divination/methods/<新文件>.gd
> ```
>
> 这条命令确实在检查——故意把 `ctx.rng.next_int` 改成不存在的方法，它会报
> `Parse Error`。（顺带：`match` 各分支都 `return` 之后不要再补一句 `return []`，
> 那行永远到不了。）

**② 注册**：`bootstrap.gd` 的 `register_all()` 加 `DivinationRegistry.register(JiaobeiMethod.new())`，
并从 `SOFT_METHODS` 移除 `["jiaobei", "yesno"]`。

**③ 落库**：`divinations.json` 的 `jiaobei` 改 `mvp: true`，补
`learnAt: ["zayton", "kinsay"]`、`teacher: "npc-zayton-mentor"`。

**④ 拜师事件**：照 `ev-zayton-mentor-lot` 的形状加一条，效果含
`{"op": "learn_divination", "value": "jiaobei", "reason": "..."}`。

**⑤ 结果文本**：`content/story/div-jiaobei/{en,zh}.md`，30 条。
须含路线建议或训诫；**允许**大吉／大凶等吉凶用语，但不能只有空辞。

**⑥ 事件接线**：至少 2 条事件的 `choices[].divination` 指向它，否则学了无处用。

### 3.5 测试（与实现同批提交，不留到后面）

**a. 扩 `tests/test_divination.gd`**——现有测试已有「新注册一法」的可拓展性用例，
第二批每法补三条：

```gdscript
# 每一法都要过的三条
_ok(not (r["effects"] as Array).is_empty(), "<id> 产出非空 effects")      # G3 的运行期对应
_ok(r2["raw"] == r["raw"], "同种子同结果")                                # 决定论
for e in r["effects"]: _ok(e.has("reason"), "每条 effect 带 reason")      # G10 的运行期对应
```

**b. 新增 `tests/test_divination_reach.gd`**——现有测试**只验引擎，不验可达性**，
而 20 法不可达正是这次要修的问题。它应当断言：

| 断言 | 为什么 |
|---|---|
| 每个 `mvp: true` 的占法都有 `learnAt` 非空 | 否则学不到 |
| 每个 `learnAt` 的城 id 存在 | 否则指向空地 |
| 每个 `mvp: true` 都有至少一条事件用 `learn_divination` 授予它 | 拜师流程真的存在 |
| 每个 `mvp: true` 都有至少一条事件的 `choices[].divination` 用它 | 学了有处用 |
| **模拟**：从起点走到 `learnAt` 城 → 触发拜师 → 起卦成功 | 端到端真的通 |

最后一条是关键。前四条是静态引用检查，只有第五条能证明**玩家真的能用上**——
这与 M1 的教训一致：G13 证明图上有路，而 `test_m1_lines` 才证明人走得过去。

**c. 新增 `tests/smoke_divination.gd`**——走真实界面：打开占卜面板、选一法、
起卦、确认解读文本上屏且无残留 key（形如 `div.*`）。

**d. 门禁 G25**：把 (b) 的前四条静态断言搬进 `validate.mjs`，使内容层改动
（例如把某法的 `learnAt` 清空）在 CI 立刻可见，而不是等到有人去玩。

> **上线即负向验证**：新门禁必须当场做一次反向测试——临时清空某法的 `learnAt`，
> 确认 G25 报错，再还原。**没做过负向测试的门禁不算数**（`AUDIT` §10）。

### 3.6 验收

- [x] 第二批每法：引擎 + 注册 + 落库 + 拜师 + 30 条结果文本 + ≥2 处事件接线
- [x] `core/` 与 `game/` 除 `bootstrap.gd` 与 F-3 的 `registry.gd` 外无按 method_id 分支
- [x] `test_divination` 扩充，`test_divination_reach` 新增，两者全过
- [x] `smoke_divination` 走通界面
- [x] G25 上线并完成负向验证
- [x] `DivinationRegistry.ids().size()` 仍为 24（第二批是把 soft 换成真引擎，不是加法）

---

## 4. T3 · 次级城探索点

### 4.1 起点

```
12 metropolis  各 3 点 = 36 点  ✅
21 city        各 0 点          ❌ 本任务
44 town        各 0 点          留后
25 station     不需要（设计如此，DATA_MODEL §6 分级）
```

### 4.2 操作

`city` 级每座 **2 个**探索点（metropolis 是 3 个，差异要看得出来）：

1. 选点：从该城 `lore` 绑定的选段里挑**两件具体的事**——一个市集/生计，
   一个信仰/风俗。不要「广场」「城门」这种任何城市都能填的空点。
2. 写事件：`content/tables/events/site.json` 加记录，`kind: "site"`，
   `when.cities: ["<city>"]`，2–3 个选项，每个选项的 effects **非空且带 reason**。
3. 挂到城市：该城 `sites: ["ev-<city>-<a>", "ev-<city>-<b>"]`。
4. 写文本：`content/story/<city>/{en,zh}.md` 补对应 key。
5. 跑 `validate` + `story.mjs check` + `smoke_citynav`。

### 4.3 验收

- [ ] 21 座 city 各 2 点，共 42 条新 site 事件
- [ ] G1（分级必填）、G2（引用完整）、G15（无桩）全绿
- [ ] `smoke_citynav` 过：**每座城都能进能出**——这是当初大不里士死局的教训
- [ ] 随机抽 5 城人工试玩：探索点读起来是**那座城**的事，不是通用模板

---

## 5. T4 · 法德兰草原 stories 转途中事件

### 5.1 起点

```bash
node -e 'const s=require("./assets/books/ibn-fadlan-lore.json").stories;
const u=s.filter(x=>(x.body||"").length>=400&&(x.body||"").length<=4000);
console.log("总",s.length,"长度适合改途中事件",u.length)'
```

入库 **34** 条（`ibn-fadlan-lore.json`）；长度 400–4000 字符的约 **34** 条。草原是波罗最薄的一块——
现有 **46** 条途中事件里 steppe 仅 **13**，而法德兰 921–922 年走的正是伏尔加—保加尔线。

### 5.2 操作

1. 从 **34** 条入库 stories 中挑 **27–35** 条改写（不足用 authored 补 steppe 途中）：优先「路上会发生的事」（渡河、驿站、部族礼节、
   严寒、丧仪见闻），避开纯世系与年表。
2. 每条改写成一个 `kind: "road"` 事件，`when.bands: ["steppe"]`。
3. 同 §2 的语体守则；**同样禁止原样引用**——法德兰写异教风俗时的措辞也需
   G24 复查。
4. 挂到相关路线的 `encounters`。

### 5.3 验收

- [ ] 途中事件 41 → 81，其中草原 band ≥ 40
- [ ] G2b（无孤儿事件）绿：每条新事件都被某条路线引用
- [ ] G24 绿
- [ ] `test_m1_lines` 仍过：途中事件变多不得让三条线走不完（新事件若扣钱扣粮，
      可能把线走死——**这正是 G14 与 M1 测试存在的理由**）

---

## 6. T5 · 审计遗留两项

> **状态（2026-07-26）**：✅ F-3（`DivinationRegistry.cast` 未学守卫）与 F-6（`test_i18n`／`test_narrative`／`test_time`）已落地。

### 6.1 F-3 · 内核不校验「未拜师即起卦」

**现状**：`event_machine.gd:82` 会拒绝未学的占法，但 `DivinationRegistry.cast()`
本身不看 `learned_divinations`。目前只有一个调用方，所以够用；一旦占卜面板
直接调 registry（T2 的 `smoke_divination` 就会），这道检查就漏了。

**做法**：`DivinationContext` 已持有 `state`，在 `cast()` 里加一次检查，
未学则 `push_error` 并返回空。**纵深防御，不是替换** ——
`event_machine` 那道保留。

**测试**：`test_divination` 加一条负向用例——未学而 `cast`，断言返回空且报错。

### 6.2 F-6 · 三个内核模块无专项测试

| 模块 | 应测什么 |
|---|---|
| `core/i18n` | 回退链 `zh → en → key` 三级；`fmt()` 参数解析；`missing_keys()` 统计 |
| `core/narrative`（条件求值器） | `any` / `all` / `not` 全语法；`any:[]` 为假、`all:[]` 为真；未知键报错不放行 |
| `core/time` | 儒略日往返（1253 / 1453 边界）；`to_julian()` 与 `to_gregorian()` 差值；`civil(culture)` 各文化圈 |

三者都是**别处依赖但没人直接测**的模块。条件求值器尤其值得专测：它是数据驱动的
解释器，一个语义错误会让某类事件永远不触发，而所有功能测试照样是绿的。

---

## 7. T6 · 19 城语料处置

| 类 | 数 | 处置 |
|---|---|---|
| 弱证据 | 11 | 人工读原书确认。**确有其事**→ 补 `match_books.mjs` 的 `NAMES` 变体重跑；**确无**→ 永久标 `authored` 并在城记录里写明已查过 |
| 查无 | 8 | `sachiu` `coigangiu` `ctesiphon` `ephesus` `ispahan` `moscovia` `nicaea` `petra`。前两座是中国地名，三书本就不覆盖；其余需换语料（《瀛涯胜览》《远游记》）或维持新撰 |

弱证据 11 座：`merva` `samara` `axuma` `dongola` `bethleem` `edessa` `kiovia`
`novogardia` `tana-azov` `tarsus` `trapezus`。

> `merva` 已肉眼确认是真实行程记述（法德兰「继而至木鹿」），只是单次提及。
> 这类应当**补变体后重跑**，而不是放宽判据——判据一放宽，塔尔苏斯与特拉布宗
> 那两条假阳性就会一起回来。

---

## 8. 门禁增补计划

现有 22 道（G25 已随 T2 落地）。后续密度任务应补：

| 门禁 | 检查 | 何时建 | 负向测试 |
|---|---|---|---|
| **G25** ✅ | `mvp: true` 的占法必须可学、可用（§3.5d） | 已随 T2 实现 | 已完成：清空某法 `learnAt` → 报错 |
| **G26** | `city` 级城市探索点数量（2）与 metropolis（3）分级正确 | T3 随实现 | 给某 city 挂 3 点 → 应报错 |
| **G27** | 途中事件的 band 分布不得过度倾斜（任一 band ≥ 50% 即警告） | T4 随实现 | 把 40 条全塞 steppe → 应警告 |

**每加一道门禁，当场做一次负向测试**——这条来自 `AUDIT` §10，本项目已经因此
抓到过两次真问题（G9/G11 上线即抓到内核读系统时钟；G23 上线即抓到两条永不可达的结局；
G24 上线即抓到 8 条含贬语的选段）。

---

## 9. 测试策略：三层，各管各的

本项目已形成三层测试，新工作按同样的层分：

| 层 | 位置 | 管什么 | 什么时候不够 |
|---|---|---|---|
| **内核单测** | `tests/test_*.gd` | 纯逻辑、决定论、边界 | 它证明不了玩家够得着 |
| **门禁** | `tools/validate/validate.mjs` | 内容层的引用完整与规则一致 | 它证明不了运行期行为 |
| **界面 smoke** | `tests/smoke_*.gd` | 玩家真按得到、真读得到 | 它跑得慢，只覆盖主路径 |

**两条来自实战的规矩**：

1. **「连通」不等于「走得通」。** G13 断言图上有路，`test_m1_lines` 才断言一个
   带着钱包的旅人走得完。任何「X 已接入」的验收，都要有一条模拟玩家的用例。
2. **smoke 要按玩家看得见的东西定位控件。** 随从 smoke 的第一版点的是列表里第一个
   「雇」按钮，而起始城的候选人恰好都不带货格，于是测试通过而机制根本没走到。
   现版按界面打印的「+N 格」定位——界面不显示加成，测试同样失败。

---

## 10. 不做什么

| 不做 | 为什么 |
|---|---|
| iOS 构建 | 按指示先做桌面端 |
| 24 法全部接入玩法 | 第二批只做 4–6 法；接口无上限是设计，不是排期承诺 |
| `town` / `station` 级探索点 | 分级投入是 `DATA_MODEL.md` §6 的设计，不是欠债 |
| 美术生成管线修复 | 按指示只在需求文档登记（`ART_REQUIREMENTS.md` §0） |
| 拆《远游记》《瀛涯胜览》 | 等 T1/T4 验证过三书流程再动 |

---

## 11. 素材需求索引

| 需要 | 文档 | 章节 |
|---|---|---|
| 六主城场景图（缺 6 张） | `ART_REQUIREMENTS.md` | §2.1 |
| `scene-region-isl` / `chr` 重绘（内容画错，非缺失） | `ART_REQUIREMENTS.md` | §1 |
| 占卜符号 `sym-*` 35 张接线（T2 用得上） | `ART_REQUIREMENTS.md` | §5 |
| 职业 NPC 立绘 36 张（T3 探索点用得上） | `ART_REQUIREMENTS.md` | §2 表 2.7 行 |
| 探索点小图 36 张 | `ART_REQUIREMENTS.md` | §3 |
