# 文本素材需求 · TEXT REQUIREMENTS

**2026-07-26 · Godot v3.0。** 汇总**已交付文本资产**与**仍待写的密度任务**。执行步骤见 [`PLAN.md`](PLAN.md)；T3/T4/T6 规格见 [`STORY_REQUIREMENTS.md`](STORY_REQUIREMENTS.md)；中译流程见 [`L10N_PLAN.md`](L10N_PLAN.md)。

> **红线（GDD §19）**：每段标 `origin` — `source` / `authored` / `hybrid`。史料贬语仅作创作素材，玩家可见文本经 **G24** 拦截。

---

## 0. 实测库存（2026-07-26）

| 资产 | 数量 | 状态 |
|---|---|---|
| 城市入城正文 | 102 城 × en/zh | ✅ |
| 故事 authoring 单元 | 108（102 城 + 5 div + endings） | ✅ |
| i18n 编译产物 | en **2132** · zh **2132** · 缺 0 | ✅ |
| 译文 stamps | **972** current · 0 stale | ✅ |
| 事件表 | **199**（entry 102 · site 51 · road 46） | ✅ |
| 图鉴/术语 | codex 100+ · glossary **97** | ✅ |
| 占卜结果文 | 8 法 × 30 en/zh（T2 批次） | ✅ |

---

## 1. 已完成（勿重复开工）

| 批次 | 内容 | 完成日 |
|---|---|---|
| T1 | 三书 20 城入城改写 + 文化校订 | 2026-07-24 |
| T2 | jiaobei / astrodice / geomancy / runes 拜师+接线+结果文 | 2026-07-26 |
| T5 | F-3 / F-6 审计遗留 | 2026-07-26 |
| B1–B4 | 全量 zh 翻译 + L-1/L-2/L-3 | 2026-07-24 |
| M3 | 白图泰六城 + battuta  archetype + 朝觐结局 | 2026-07-26 |

---

## 2. 待办 · 内容密度

### 2.1 T3 · 21 座 city × 2 探索点

| | |
|---|---|
| **现状** | 12 metropolis × 3 = 36 点 ✅；21 city `sites: []` ❌ |
| **目标** | +42 site 事件 + story keys + 挂城 |
| **验收** | G1/G2/G15/G26 · `smoke_citynav` |

城 id：`aden` `badashan` `cail` `calatu` `camadi` `campichu` `camul` `chamba` `chinangli` `esher` `kenjanfu` `kerman` `keshimur` `melibar` `saianfu` `siju` `sinju` `suju` `taican` `tanpiju` `tenduc`

### 2.2 T4 · 法德兰草原途中

| | 实测 | 目标 |
|---|---|---|
| 途中事件 | **46** | **81** |
| steppe band | **13** | **≥ 40** |
| 语料池 | `ibn-fadlan-lore.json` **34** stories | 挑 ~27–35 改写 |

> 旧文档「199 条」为 PDF 章节拆解数；入库 playable 语料为 **34** 条。

### 2.3 T6 · 19 城语料处置

- **弱证据 11 座**：重跑 `match_books.mjs` 或维持 `authored`+「已查」  
- **查无 8 座**：诚实新撰，不伪造 `source`

---

## 3. 可选加深（M4+ · 不挡 Steam EA）

| 项 | 说明 |
|---|---|
| 入城正文加长 | 300–500 字见闻体 + lore.ref |
| 图鉴正文扩写 | 100 条骨架 → 可读段落 |
| 更多对话树 | 大马士革/德里/刺桐等 |
| epilogue 变量池 | 8 结局结语打磨 |
| 《远游记》《瀛涯胜览》 | 拆解留待 T4 流程验证后 |

---

## 4. 写作与编译流程

```
content/story/<unit>/{en,zh}.md   ← 唯一 authoring 源
  → node tools/lore/story.mjs build
  → node tools/lore/story.mjs stamp zh
  → node tools/lore/story.mjs check
  → node tools/validate/validate.mjs
```

格式：[`STORY_TEXT_FORMAT.md`](STORY_TEXT_FORMAT.md) · 语体：[`LORE_PIPELINE.md`](LORE_PIPELINE.md) §4

---

## 5. 与姊妹文档分工

| 文档 | 管什么 |
|---|---|
| **本文** | 文本/语料**需求与完成度** |
| `STORY_REQUIREMENTS.md` | T3/T4/T6 **操作规格** + G26/G27 |
| `L10N_PLAN.md` | 中译批次与译者守则 |
| `STATUS.md` | 全项目现状 hub |
| `ASSETS_REQUIREMENTS.md` | 美术+音频+文本**总索引** |
