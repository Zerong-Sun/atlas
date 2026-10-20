# 配乐规划 · AUDIO PLAN

依 GDD §18「程序化合成，每文明一套调式／音色／速度，每场景一套节奏」展开，并补上第三条轴：**情绪**。

**前置**：`GDD.md` §18（音频）· §19（宗教呈现红线）· `ARCHITECTURE.md` §6（资产管线）· `ROADMAP.md` §9（可拓展性约束）。
**素材缺口**登记在 `ART_REQUIREMENTS.md` §6，本文产出的需求回填到那里。

---

## 0. 现状与约束

**2026-10-20事实复核**：[音频审计](library_audit/AUDIO_AUDIT_2026-10-20.md)与[逐文件清单](library_audit/audio_inventory.csv)是当前验收依据。37个OGG均存在且可解码，但本轮未听审；下文调式、混响、无缝循环与音质描述属于设计目标，不能作为已完成证明。A1–A8状态已在§8改为分项事实。

| 项 | 现状 |
|---|---|
| 音频资产 | `assets/audio/`：**37** OGG（20 stem + 17 ambient 含 5 sacred_blur）· CC0 场景床 + 混合 stem |
| 运行时 | Autoload `AudioDirector` · 20个AudioStreamPlayer音乐槽 + 4个ambient槽；headless禁用文件播放 |
| 旧版实现 | `archive/web-version/js/audio.js` — **作废** |
| 包体压力 | 成品OGG共9,740,026字节（约9.74 MB）；分发目标尚待完整包体核验 |
| 内核约束 | 音频**不得**写 `WorldState`；表现层只订阅信号 |
| 管线 | `tools/audio/fetch_cc0.py` · `compose_loops.py` · `generate_melody_color.py` |

**2026-10-20内容统计**：103座城市；431条事件。城市culture为islamic34、east_asia27、steppe23、indian_ocean19、latin0；未发现序章选择latin声床的调用。事件kind为entry103、road81、site107、consequence134、mentor6。

当前事件scene.bg：caravan-city63、canal-city49、desert-town41、steppe-camp28、monsoon-port27、desert-night23、oasis-town10、palace-gate9、spice-harbour8、scene-quanzhou-harbor6、temple-interior3、desert-market1、caravanserai1、cave-shrine1。统计是内容覆盖，**不是声景触发覆盖**；`set_place`目前只由到达流程调用。

---

## 1. 红线（先于一切技术决策）

因为音乐能直接引用真实的礼拜声响。

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
每文化 4 层 stem 循环     →    AudioStreamPlayer × 20 + Tween
（drone/pulse/melody/color）    + 总线滤波与音量包络做情绪
                          →    程序化只做小装饰音
                               （钟、锣、风、驼铃、浪）
```

| | 分层 stem | 纯程序化 |
|---|---|---|
| 音质 | 需素材与混音听审 | 需合成与混音听审 |
| 体积 | 目前全部OGG约9.74 MB | 无离线文件；仍有运行时PCM缓冲 |
| 变化性 | 靠组合 | 无限 |
| GDScript 开销 | 低 | 高 |

**设计意图**：变化来自**组合**而非一首首曲子，控制曲库规模。当前实现采用多个`AudioStreamPlayer`与Tween，并未使用`AudioStreamInteractive`。多日循环是否疲劳、层间连续性是否自然仍需听审。

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

**跨文化过渡目标**：玩家跨文化地区时不硬切。当前代码按city.culture切换，不直接按band切换；用 8–15 秒交叉淡入，且**两套 stem 短暂并存**——这是 GDD P3 在听觉上的落点：文化边界是渐变的，不是墙。

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

> **目标：同一座城在同一天具有可复现的听觉片段。当前仅独立RNG种子成立，播放定位仍受已播放层历史影响，不能视为完整验收。**

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

**规格目标**：单声道 OGG Vorbis ~96 kbps，60 秒无缝循环。当前20条stem均为44.1 kHz/mono/60秒；端点连续性与实际循环听审未通过验收。
**体积估算**：5 × 4 × 60s × 96kbps ÷ 8 ≈ **14.4 MB**（理论固定码率，不是实际包体）。相对 179 MB 现状可接受。

### 7.2 环境音 — 约 12 段

风沙 · 海浪 · 缆绳桅杆 · 市集人声（**不可辨识语义**）· 驼铃 · 马蹄 · 河水 · 雨 · 火 · 脚步回声 · 器皿 · 海鸟

**建议采用 CC0 音源**（Freesound CC0 / 自录），避免版权纠缠；`ART_REQUIREMENTS.md` §6 已提出同样建议。

### 7.3 程序化装饰（无需素材）

钟 · 锣 · 磬 · 木鱼 · 硬币 · 翻页 · 骰子 · 签筒竹声 —— 这些用 Godot 内合成即可，且**每次略有不同**才自然。签筒竹声与占卜动效绑定（`archive/ATLAS_PORT.md` §1.3 的六式）。

---

## 8. 实施顺序

音频**不阻塞任何玩法**，可与 P2 横铺并行。建议：

| 序 | 内容 | 验收 | 状态 |
|---|---|---|---|
| A1 | 音频总线与静音／音量设置 | 有开关，默认可关 | 部分：总线、静音UI、音量API；缺音量UI/持久化，待设备验证 |
| A2 | 程序化装饰音（§7.3） | 点选项有反馈声 | 部分：11类生成器，page/coin/click/wood/tick有调用；另6类未接线，未听审 |
| A3 | 单文化单层drone | 进刺桐有持续声底 | 文件与播放器具备；循环与真实设备播放待验 |
| A4 | 场景类密度切换 | 沙漠夜明显更空 | 配置7类含journey；站点切换接线不全，无真实混响效果 |
| A5 | 五文化全层 + 跨文化交叉淡入 | 跨文化听得出变化 | 20文件、10秒Tween具备；latin未触发、番坊站点未接入，待听审 |
| A6 | 情绪调制 | 高风险路段听感变紧 | 推导/低通/增益具备；color零乘数、sacred槽溢出、切换连续性待修 |
| A7 | CC0场景床与ambient接线 | 环境符合地点与路线 | 12文件、11名称映射；seabirds未接线，海路马蹄/港口固定雨河声待修；来源链待补 |
| A8 | melody/color加厚 | 旋律层达到审听标准 | 10条合成候选文件存在；构建seed稳定性和实际听感未验收 |

### 当前优先待办

1. 补事件/站点、番坊的`set_place`接线；按陆海路线、港口类型与天气选环境音。
2. 复核16条端点差值大于0.1的循环；修color开启、sacred槽位、ambient重启和SFX序列问题。
3. 确定latin与未调用SFX的使用范围；实现音量UI及设置持久化。
4. 固定构建seed、保存原始/成品hash与稳定来源许可证据；保留替代录音标签。
5. 逐文件、循环、五文化组合、圣所场景做真实设备听审与敏感读者审阅；通过后再签署A1–A8。

**A1 先做**：可访问性不是收尾工作。有人对持续音敏感，必须能一键静音。

---

## 9. 与内核的边界

音频层遵守 `ARCHITECTURE.md` 的分层铁律：

- `game/audio/` 属 L2 表现层，**不得**被 `core/` 引用
- 当前由`main.gd`显式调用`set_place`、`set_travel`、`on_effect_result`等；并未实现原计划所述GameContext音频信号订阅
- **不得**写 `WorldState`；情绪是渲染派生量，不是世界状态
- 音乐 RNG 独立 fork（§6）

---

## 10. 不做什么

- **不做**每城独立配乐（102 城 × 曲 = 范围灾难；**文化 × 场景 × 情绪**的组合已足够区分；同一城同一天由 music RNG 锚定记忆）
- **不做**可辨识语义的礼拜录音或完整礼仪曲目（§1；调性与模糊床允许）
- **不做**动态配乐系统的通用框架（只服务本作需求）
- **不做**语音（无配音计划）
- **暂不做**自适应过渡的乐理级对齐（拍点同步留到音乐层稳定后）
