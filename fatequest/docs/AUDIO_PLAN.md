# 配乐规划 · AUDIO PLAN

依 GDD §18「程序化合成，每文明一套调式／音色／速度，每场景一套节奏」展开，并补上第三条轴：**情绪**。

**前置**：`GDD.md` §18（音频）· §19（宗教呈现红线）· `ARCHITECTURE.md` §6（资产管线）· `ROADMAP.md` §9（可拓展性约束）。
**素材缺口**登记在 `ART_REQUIREMENTS.md` §6，本文产出的需求回填到那里。

---

## 0. 现状与约束

| 项 | 现状 |
|---|---|
| 音频资产 | `assets/audio/`：**37** OGG（20 stem + 17 ambient 含 5 sacred_blur）· **~8.4 MB** |
| 运行时 | `game/audio/audio_director.gd`（A1–A6）· Autoload `AudioDirector` |
| 旧版实现 | `archive/web-version/js/audio.js` — **作废** |
| 包体压力 | ~8 MB 量级；iOS/Steam 分发可接受 |
| 内核约束 | 音频**不得**写 `WorldState`；表现层只订阅信号 |

**实测的三条轴取值**（来自 `content/tables/`，不是设想）：

```
文化 culture   islamic 34 · east_asia 27 · steppe 23 · indian_ocean 18   （+ latin：序章用）
地带 band      china 55 · west_asia 47 · central_asia 34 · india 20 · steppe 19 · maritime 4
场景 scene.bg  caravan-city 51 · canal-city 32 · desert-town 30 · monsoon-port 15
               desert-night 15 · palace-gate 9 · steppe-camp 7 · oasis-town 7
               spice-harbour 3 · temple-interior 2 · cave-shrine 1 · caravanserai 1
事件 kind      entry 102 · road 40 · site 37
```

---

## 1. 红线（先于一切技术决策）

GDD §19 对宗教呈现的要求在音频上**比在美术上更容易踩雷**，因为音乐能直接引用真实的礼拜声响。

| 禁止 | 理由 |
|---|---|
| **可辨识语义**的宣礼词句、经文唱诵、礼仪圣咏的完整曲目或歌词 | 是活信仰的礼拜行为本身，不是配乐 |
| 把任一传统的调式当作「异域风味贴纸」而与机制脱节 | GDD P3：文化差异要落在机制上，不是换皮 |
| 圣所场景使用戏谑、诡异或悬疑音色 | GDD P4：对活着的信仰保持敬畏 |

| 允许 | 说明 |
|---|---|
| 宣礼 / 诵经 / 礼仪圣咏的**调性与轮廓** | 作为文化致意的 gesture，落在 color / sacred_blur 层 |
| **重度滤波、远景、混响**后的模糊人声床 | 听不出字句、不构成完整礼仪；圣所与 `reverence` 情绪使用 |
| 各地世俗器乐的音色与调式指向 | 主层（drone/pulse/melody）仍以世俗器乐为主 |

> **调式选择是一种致意，不是一种代表。** 把 maqām 或 rāga 简化成一个音阶，本身就是简化；模糊的礼仪调性同样是致意，不是记录。文档里写清楚这一点，比假装忠实要诚实。

**发布门禁**：音频与美术、文本一并纳入 GDD §19 的上线前敏感读者审阅，**尤其是圣所场景与 sacred_blur 层**。

---

## 2. 技术路线：分层素材 + 运行时自适应组合

GDD 写「程序化合成」。**纯 GDScript 做 DSP 是错的选择**——逐样本运算在 GDScript 里慢，且合成出的调式器乐往往单薄，反而伤害 §1 的尊重要求。

**采用混合方案**：

```
构建期（tools/audio/）          运行时（game/audio/）
──────────────────────         ─────────────────────────────
每文化 4 层 stem 循环     →    AudioStreamInteractive 切换
（drone/pulse/melody/color）    + 总线滤波与音量包络做情绪
                          →    程序化只做小装饰音
                               （钟、锣、风、驼铃、浪）
```

| | 分层 stem | 纯程序化 |
|---|---|---|
| 音质 | 好 | 单薄 |
| 体积 | 约 17 MB（见 §5） | ~0 |
| 变化性 | 靠组合 | 无限 |
| GDScript 开销 | 低 | 高 |

**这仍然符合 GDD 的本意**：变化来自**组合**而非一首首曲子，不需要庞大曲库，也不会在 400 天旅程里听腻同一段旋律。Godot 4.3+ 的 `AudioStreamInteractive` 正是为此设计，本项目锁 4.7.1，可直接用。

---

## 3. 轴一 · 文化：调式、音色、速度

每文化一套。**取世俗器乐传统，避开礼拜声响**（§1）。

| 文化 | 调式指向 | 音色指向 | 速度 | 节拍感 |
|---|---|---|---|---|
| `islamic` | Hijaz / Bayati 的音程色彩（增二度）· 模糊宣礼轮廓 | 弹拨（乌德类）· 竹笛类（奈伊类）· 框鼓 · sacred_blur | 72–84 | 不规则长句，句尾拖 |
| `east_asia` | 五声（宫商角徵羽），偶用清角变宫 · 模糊唱诵轮廓 | 丝弦（古琴/琵琶类）· 横笛 · 编钟余韵 · sacred_blur | 56–68 | 疏，留白多，散板感 |
| `steppe` | 五声 + 泛音列 | 马头琴类弓弦 · 泛音人声（器乐化 / 模糊远景） · 低鼓 | 60–76 | 长音铺底 + 马蹄型节奏 |
| `indian_ocean` | 持续音上的旋律移动（rāga 之**结构**思路，不引用具体 rāga） | 持续音（tanpura 类）· 拨弦 · 手鼓 | 80–96 | 循环渐密 |
| `latin` | 中世纪教会调式（多利亚 / 混合利底亚） | 拨弦（诗琴类）· 擦弦（维埃尔类）· 管风琴远景 · **模糊圣咏轮廓** | 64–72 | 二部 organum 式平行 |

**跨文化过渡**：玩家跨 band 时不硬切。用 8–15 秒交叉淡入，且**两套 stem 短暂并存**——这是 GDD P3 在听觉上的落点：文化边界是渐变的，不是墙。

> 番坊（`ev-zayton-fanfang`）是最好的例子：波斯语、阿拉伯语与本地话在同一屋檐下讨价还价。那里应当**同时**听见 `islamic` 与 `east_asia` 的层，各 50%。

---

## 4. 轴二 · 场景：节奏与密度

场景不改调式，改**密度、混响与节奏层**。14 个 `scene.bg` 取值归为 6 类：

| 场景类 | 涵盖 | 密度 | 混响 | 节奏层 | 环境音 |
|---|---|---|---|---|---|
| **市镇** | `caravan-city` 51 · `canal-city` 32 · `desert-town` 30 · `oasis-town` 7 | 高 | 干 | 有脉动 | 人声嘈杂、牲口、叫卖 |
| **港口** | `monsoon-port` 15 · `spice-harbour` 3 · `scene-quanzhou-harbor` 5 | 中高 | 中 | 缓摇 | 浪、缆绳、桅杆吱声、海鸟 |
| **旷野** | `desert-night` 15 · `steppe-camp` 7 | **低** | 长 | **无** | 风、远处驼铃、火 |
| **宫廷** | `palace-gate` 9 | 中 | 大 | 仪式性 | 脚步回声、金属 |
| **圣所** | `temple-interior` 2 · `cave-shrine` 1 | 低 | **极长** | 无 | 仅空间感与偶发钟磬 |
| **驿馆** | `caravanserai` 1 · `desert-market` 1 | 中 | 干 | 松 | 谈话、器皿 |

**旷野必须敢于安静。** 沙漠夜 15 条事件，那是全作最需要留白的时刻——GDD 的旅行不是冒险配乐，是长路。

**圣所**：drone + 模糊礼仪调性床（`sacred_blur_*`）+ 偶发钟磬；不加 pulse/melody。戏谑/悬疑音色仍禁止（§1）。

---

## 5. 轴三 · 情绪：从现有数据推导，不新增字段

用户要「情绪」。**不要给 139 条事件手填 mood**——那是没人会填的字段。情绪从已有数据推出：

| 情绪 | 推导规则（数据已存在） | 听觉表现 |
|---|---|---|
| `wonder` 惊叹 | effect 含 `codex` / `sticker`；或城市 `tier == metropolis` 的入城 | 加 color 层，高频泛音，音量渐强 |
| `tension` 紧张 | 路线 `risk >= 4`；或 `hazards` 含 `bandits`/`pirates`/`storm` | 低频推进，melody 层撤除，滤波器压暗 |
| `loss` 失落 | `EffectResult.rejected` 非空；或 `coins` 净减超过持有的 1/3 | 减层，速度降 8%，长衰减 |
| `relief` 松弛 | 抵达 `tier` ≥ city 且 `risk` 高的路段刚结束 | 恢复全层，一次上行 |
| `reverence` 肃穆 | 场景类为圣所；或 effect 含 `faith` | 仅空间层与钟磬 |
| `neutral` 平常 | 其余 | 基准 |

**实现要点**：情绪是**总线上的一层调制**（音量、低通截止、速度微调、层数），不是换曲子。这样情绪切换永远不会打断音乐的连续性。

```gdscript
# game/audio/mood.gd —— 从内核事件推导，不写 WorldState
static func derive(res: EffectExecutor.EffectResult, route: Dictionary, city: Dictionary) -> String:
    if not res.rejected.is_empty(): return "loss"
    if int(route.get("risk", 0)) >= 4:  return "tension"
    for e in res.applied:
        if e["op"] in ["codex", "sticker"]: return "wonder"
        if e["op"] == "faith":              return "reverence"
    if city.get("tier") == "metropolis":    return "wonder"
    return "neutral"
```

---

## 6. 确定性带来的额外收益

内核已保证 `(种子, 输入) → 同一世界`（`ARCHITECTURE.md` §2.3）。把音乐的变奏也**从世界状态取种**，会得到一个免费的好性质：

> **同一座城在同一天，永远是同一段声音。**

玩家会记得「刺桐的声音」。这不是技术炫耀——它让地方产生记忆锚点，正是一部旅行游戏最需要的东西。

```gdscript
var music_rng := Rng.new("music:%s:%d" % [city_id, jdn])
```

**注意**：音乐 RNG 必须独立 fork，**不得**与玩法 RNG 共用——否则听觉变奏会改变事件抽取，那是 `CODE_PLAN.md` §2.1 明令禁止的串流污染。

---

## 7. 素材需求（回填 `ART_REQUIREMENTS.md` §6）

### 7.1 文化 stem — 5 文化 × 4 层 × 60 秒循环 = 20 条

| 层 | 内容 | 备注 |
|---|---|---|
| `drone` | 持续低音／持续音 | 必须能单独长时间播放（旷野只留这层） |
| `pulse` | 节奏层 | 市镇与港口用 |
| `melody` | 旋律动机 | 紧张时撤除 |
| `color` | 装饰音色 | 惊叹时加入 |

**规格**：单声道 OGG Vorbis ~96 kbps，60 秒无缝循环。
**体积估算**：5 × 4 × 60s × 96kbps ≈ **17 MB**。相对 179 MB 现状可接受。

### 7.2 环境音 — 约 12 段

风沙 · 海浪 · 缆绳桅杆 · 市集人声（**不可辨识语义**）· 驼铃 · 马蹄 · 河水 · 雨 · 火 · 脚步回声 · 器皿 · 海鸟

**建议采用 CC0 音源**（Freesound CC0 / 自录），避免版权纠缠；`ART_REQUIREMENTS.md` §6 已提出同样建议。

### 7.3 程序化装饰（无需素材）

钟 · 锣 · 磬 · 木鱼 · 硬币 · 翻页 · 骰子 · 签筒竹声 —— 这些用 Godot 内合成即可，且**每次略有不同**才自然。签筒竹声与占卜动效绑定（`ATLAS_PORT.md` §1.3 的六式）。

---

## 8. 实施顺序

音频**不阻塞任何玩法**，可与 P2 横铺并行。建议：

| 序 | 内容 | 验收 | 状态 |
|---|---|---|---|
| A1 | 音频总线与静音／音量设置 | 有开关，默认可关 | ✅ `default_bus_layout.tres` + 静音钮 |
| A2 | 程序化装饰音（§7.3） | 点选项有反馈声 | ✅ `game/audio/sfx.gd` |
| A3 | 单文化单层 drone（先做 `east_asia`） | 进刺桐有持续声底 | ✅ stem 播放 |
| A4 | 场景类密度切换（§4 的 6 类） | 沙漠夜明显更空 | ✅ `scene_density.gd` |
| A5 | 五文化全层 + 跨文化交叉淡入 | 跨 band 听得出变化 | ✅ 10s 交叉；番坊双床 |
| A6 | 情绪调制（§5） | 高风险路段听感变紧 | ✅ `mood.gd` + Music 低通 |

**A1 先做**：可访问性不是收尾工作。有人对持续音敏感，必须能一键静音。

---

## 9. 与内核的边界

音频层遵守 `ARCHITECTURE.md` 的分层铁律：

- `game/audio/` 属 L2 表现层，**不得**被 `core/` 引用
- 只订阅 `GameContext` 的 `state_changed` / `day_advanced` / `event_fired` 信号
- **不得**写 `WorldState`；情绪是渲染派生量，不是世界状态
- 音乐 RNG 独立 fork（§6）

---

## 10. 不做什么

- **不做**每城独立配乐（102 城 × 曲 = 范围灾难；**文化 × 场景 × 情绪**的组合已足够区分；同一城同一天由 music RNG 锚定记忆）
- **不做**可辨识语义的礼拜录音或完整礼仪曲目（§1；调性与模糊床允许）
- **不做**动态配乐系统的通用框架（只服务本作需求）
- **不做**语音（无配音计划）
- **暂不做**自适应过渡的乐理级对齐（拍点同步留到音乐层稳定后）
