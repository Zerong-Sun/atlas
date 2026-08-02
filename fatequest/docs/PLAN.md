# 执行计划 · PLAN

**2026-07-31 · Steam EA 阶段。** 既有 P0–P7 玩法与 T1–T6 密度任务已闭环
（旧稿存 `docs/archive/PLAN-2026-07-T1-T6.md`）。新七系统的引擎与发布安全加固已经完成，
下一步转入 **优化与实机验证 → 正式文本/美术替换 → 人工发布验收**。

**分工**：`STATUS.md` 讲「现在在哪」，`ROADMAP.md` 讲「阶段顺序」，本文讲
「下一步具体怎么做、做到什么算完、怎么验」。三份不重复。

> **2026-07-30 增补**：人物抽取、剧情后果 FIFO、worldmap 矢量地图、城市详情、
> 出行恢复、v3 五槽安全存档与六类占卜学习引擎已经落地。新的内容/美术量产顺序与完整出口
> 标准以 [`FATEQUEST_ENGINE_REQUIREMENTS.md`](FATEQUEST_ENGINE_REQUIREMENTS.md) §12–13
> 为准；本文后半保留此前美术接线阶段记录。

### 本轮之后的实际优先级

1. ~~Q1：完成 720p、200% 字号、中英、键盘与覆盖层视觉回归，并逐城点选 12 城后果链~~ ✅ 2026-08-02 `smoke_ui_overlay.gd`（覆盖层/200%/中英）；12 城后果链由 `smoke_balc_followup` 等与 T1 收口
2. T1：把课程和新增 UI 占位迁移为正式中英文本，完成文化校读。
3. A1：补齐易经 31–64，并按 24 法清单逐法替换工具、反馈和动画占位。
4. O1：完成运行性能基准、导入/导出检查和最新 PCK 导出。
5. R1：外部试玩和全分支人工通读，P0/P1 清零后形成发布候选并上传。

---

## 0. 现在的真实状态

```bash
node tools/validate/validate.mjs                        # 25 道门禁
node tools/lore/story.mjs check                         # 译文时效
godot --headless --path . --script tests/run_tests.gd   # 16 个单测
```

| 维度 | 数字 |
|---|---|
| 玩法系统 | P0–P7 **全部闭环** |
| 密度任务 | T1–T6 **全部闭环** |
| 世界 | 102 城 · 204 路线 |
| 事件 | 332（原 279 + 十二主城后果链 46 + 导师事件 6 + 大不里士商人后续 1） |
| 文本 | en/zh 各 3179 · 0 缺 · 1838 stamps current |
| Godot 美术接线 | **674/674**（S1c ✅） |
| 动画 | N0–N3 ✅ · N4–N6 待做 |
| 测试 | 16 单测 + 13 smoke · 25 道门禁全绿 |

**一句话**：系统、首批 12 城剧情闭环和资源接线已完成；当前工作转入正式课程/占法内容、易经缺图、运行时回归和发布验收。

---

## 1. 任务总表

| # | 任务 | 量 | 状态 | 章节 |
|---|---|---|---|---|
| **P1** | Godot 美术接线 | 674 张 | ✅ S1c 2026-07-30 | §2 |
| **P2** | 动画 N2–N3 | 迷雾/路线 + 界面过渡 | ✅ 2026-07-26 | §3 |
| **P3** | chr 底板重绘 | 1 张 | ✅ 2026-07-30 | §4 |
| **P4** | 白图泰六城入城/探索图 | 24 张 | ✅ 2026-07-30 | §5 |
| **P5** | 文本多轮互动与入城长文 | 12 主城城市内互动未完成；5 城入城已加长 | ⛔ 当前优先级 | §6、`TEXT_REQUIREMENTS.md` §4–§10 |

---

## 2. P1 · 美术接线 ✅

全部走 `MapArt`（`game/map/map_art.gd`）+ `art_wire_index.json`（674 stems）。
雇佣签契：`game/ui/hire_contract.gd`。

**验收**：
- [x] `explore-*` + `site-*` 全部接线
- [x] `npc-*` / `retainer-*` 接线（场所 + job + 随从）
- [x] `ic-*` → `GOODS_ART_MAP.json`
- [x] `currency-*` / `sticker-*` / `contract-*` 接线
- [x] audit 674/674 wired

---

## 3. P2 · 动画 N2–N3 ✅

| 项 | 状态 |
|---|---|
| N0 `reduce_motion` | ✅ |
| N1 地图素材静态接线 | ✅（随 S1） |
| N2 迷雾揭开 + 路线描画 | ✅ `fog.gdshader` dissolve · `WorldMap.animate_route` |
| N3 界面过渡 | ✅ `Motion.parchment_expand` / `rise` / `crossfade_in` |

**验收**：
- [x] 走一段路能看见路线被逐段描画
- [x] 探索后迷雾退开（mask 交叉溶解）
- [x] 书案→地图 / 事件弹出 / 面板无生硬跳变
- [x] `reduce_motion` 下位移改为淡入淡出

---

## 4. P3 · chr 底板重绘 ✅

**内容错配**：原图曾使用西亚圆顶、宣礼塔与骆驼，已于 2026-07-30 重绘为拉丁基督教世界。

**画什么 / 规格 / 验收**：完整写入 [`ART_REQUIREMENTS.md`](ART_REQUIREMENTS.md) §1.1 · [`assets/art/ART_TODO.md`](../assets/art/ART_TODO.md)。

---

## 5. P4 · 白图泰六城素材 ✅

| 城 | 入城图 | 探索图 × 3 |
|---|---|---|
| `delli` | 1 | 3 |
| `basora` | 1 | 3 |
| `cabul` | 1 | 3 |
| `java-major` | 1 | 3 |
| `zancibar` | 1 | 3 |
| `maldive` | 1 | 3 |

**规格与逐城氛围**：[`ART_REQUIREMENTS.md`](ART_REQUIREMENTS.md) §2.A。

---

## 6. P5 · 文本多轮互动与可选加深

| 任务 | 状态 |
|---|---|
| 入城正文加长 | ✅ 五城（axuma/merva/ctesiphon/bethleem/ephesus） |
| 图鉴扩展 | 可选续作 |
| 12 主城 site/mentor 第二页 | ⛔ 35 个 site + 12 个 mentor 待写，详见 `TEXT_REQUIREMENTS.md` |
| 21 city 探索点深化 | ⛔ 每城至少 1 个多轮探索点待排期 |
| 易经 31–64 | 规格在 ART · 非阻塞，使用卦符回退 |

详见 `TEXT_REQUIREMENTS.md` §4–§10 · `ART_REQUIREMENTS.md`。

---

## 7. 不做什么

| 不做 | 为什么 |
|---|---|
| 新玩法系统 | P0–P7 已闭环 |
| `town` / `station` 级探索点 | 分级投入是设计 |
| 拆《远游记》《瀛涯胜览》 | 等 S1–S5 收口再动 |
| iOS 构建 | 先做桌面端 |
| 美术生成管线修复 | 现有素材够用 |

---

## 8. 素材需求索引

| 需要 | 文档 | 章节 |
|---|---|---|
| 接线完成度 | `ART_REQUIREMENTS.md` | §0 · §4–5 |
| 美术缺口（重绘/新绘） | `ART_REQUIREMENTS.md` | §1–2 |
| 动画六式 | `ANIMATION_PLAN.md` | §2 · §5 |
| 音频现状 | `AUDIO_PLAN.md` | §0 |
| 文本多轮互动与正式文案 | `TEXT_REQUIREMENTS.md` | §4–§10 |
| 素材总索引 | `ASSETS_REQUIREMENTS.md` | — |
