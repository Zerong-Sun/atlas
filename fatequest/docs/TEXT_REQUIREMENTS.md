# 文本素材需求 · TEXT REQUIREMENTS

**2026-07-31 · Godot v3.0。** 汇总**已交付文本资产**与**仍待写的密度任务**。执行步骤见 `[PLAN.md](PLAN.md)`；T3/T4/T6 规格见 `[STORY_REQUIREMENTS.md](STORY_REQUIREMENTS.md)`；中译流程见 `[L10N_PLAN.md](L10N_PLAN.md)`。

保证文本用词用语与当时当地习惯和风格吻合，尽量符合史实。可以有夸张或者神话色彩。

> **红线（GDD §19）**：每段标 `origin` — `source` / `authored` / `hybrid`。史料贬语仅作创作素材，玩家可见文本经 **G24** 拦截。

---

## 0. 实测库存（2026-07-31 · 当前基线）


| 资产              | 数量                                     | 状态  |
| --------------- | -------------------------------------- | --- |
| 城市入城正文          | 102 城 × en/zh                          | ✅   |
| 故事 authoring 单元 | 109（102 城 + 5 div + stamps + ibn-fadlan-road） | ✅   |
| i18n 编译产物       | en **3169** · zh **3169** · 缺 0        | ✅   |
| 译文 stamps       | **1830** current · 0 stale              | ✅   |
| 事件表             | **331**（entry 102 · site 93 · mentor 12 · road 81 · consequence 49） | ✅   |
| city 探索点        | 21 city × 2 = **42**；12 metro × 3 = 36 | ✅   |
| 途中事件 / steppe   | road **81** · steppe band **48**        | ✅   |
| 图鉴/术语           | codex 100+ · glossary **97**           | ✅   |
| 占卜结果文           | 8 法 × 30 en/zh（T2 批次）                  | ✅   |


---



## 1. 已完成（勿重复开工）


| 批次    | 内容                                               | 完成日        |
| ----- | ------------------------------------------------ | ---------- |
| T1    | 三书 20 城入城改写 + 文化校订                               | 2026-07-24 |
| T2    | jiaobei / astrodice / geomancy / runes 拜师+接线+结果文 | 2026-07-26 |
| T3    | 21 city × 2 探索点（+42 site）+ G26                   | 2026-07-26 |
| T4    | 法德兰草原途中 +35 → road 81 · steppe 48 + G27          | 2026-07-26 |
| T5    | F-3 / F-6 审计遗留                                   | 2026-07-26 |
| T6    | 19 城语料处置（11 弱证据 + 8 查无，均已查标注）                   | 2026-07-26 |
| B1–B4 | 全量 zh 翻译 + L-1/L-2/L-3                           | 2026-07-24 |
| M3    | 白图泰六城 + battuta archetype + 朝觐结局                 | 2026-07-26 |


---



## 2. 待办 · 内容密度

**无。** T3 / T4 / T6 已于 2026-07-26 闭环。验收摘要：

| 任务 | 结果 |
| --- | --- |
| T3 | 21 city `sites.length === 2`；G26 绿；`smoke_citynav` OK |
| T4 | road 46→**81**；steppe 13→**48**；G2b/G24 绿；`test_m1_lines` PASS |
| T6 | 11 弱证据 + 8 查无均 `origin: authored` + `disposition`/`note`；无假阳性 `source` |



---



## 3. 可选加深（M4+ · 不挡 Steam EA）

| 项 | 说明 | 状态 |
| --- | --- | --- |
| 入城正文加长 | 300–500 字见闻体 + lore.ref | ✅ 2026-07-26：`axuma` / `merva` / `ctesiphon` / `bethleem` / `ephesus` 五城已加长（原 <280 字） |
| 图鉴正文扩写 | 100 条骨架 → 可读段落 | 可选续作（现有 codex body 均已过骨架长度） |
| 更多对话树 | 大马士革/德里/刺桐等 | 可选续作；探索点已有 2–3 选项 |
| epilogue 变量池 | 8 结局结语打磨 | 可选续作 |
| 《远游记》《瀛涯胜览》 | 拆解留待语料需求再开 | ⛔ 等 S1–S5 收口 |


---



## 4. 写作与编译流程

```
content/story/<unit>/{en,zh}.md   ← 唯一 authoring 源
  → node tools/lore/story.mjs build
  → node tools/lore/story.mjs stamp zh
  → node tools/lore/story.mjs check
  → node tools/validate/validate.mjs
```

格式：`[STORY_TEXT_FORMAT.md](STORY_TEXT_FORMAT.md)` · 语体：`[LORE_PIPELINE.md](LORE_PIPELINE.md)` §4

T3/T4 生成器（可复跑、幂等）：`tools/lore/_gen/apply_t3.mjs` · `apply_t4.mjs`



---



## 5. 与姊妹文档分工


| 文档                       | 管什么                         |
| ------------------------ | --------------------------- |
| **本文**                   | 文本/语料**需求与完成度**             |
| `STORY_REQUIREMENTS.md`  | T3/T4/T6 **操作规格** + G26/G27 |
| `L10N_PLAN.md`           | 中译批次与译者守则                   |
| `STATUS.md`              | 全项目现状 hub                   |
| `ASSETS_REQUIREMENTS.md` | 美术+音频+文本**总索引**             |
