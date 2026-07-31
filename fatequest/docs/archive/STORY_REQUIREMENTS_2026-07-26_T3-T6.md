# 历史故事密度规格 · STORY REQUIREMENTS T3–T6

> **归档标识（2026-07-31）**：本文记录的 T3/T4/T6 已完成并被当前版 [`../TEXT_REQUIREMENTS.md`](../TEXT_REQUIREMENTS.md) 的完成基线和后续 backlog 取代。本文只用于追溯当时的操作规格，不作为当前实现依据。

**2026-07-26 · T3/T4/T6 已闭环。** 本文登记已完成的内容密度任务（T3 / T4 / T6）与配套门禁规格，供后续参考。执行计划见 `PLAN.md`。
语体见 `../LORE_PIPELINE.md` §4；写作格式见 `../STORY_TEXT_FORMAT.md`。

> **红线（GDD §19）**：每段文本必须标 `origin`——`source`／`authored`／`hybrid`。桩文本一律 `authored`。

> **占卜结果文案**：允许大吉／大凶等吉凶用语；仍须给出可执行的路线或时机建议，不能只有空辞。

---

## 0. 现状（2026-07-26 · T3/T4/T6 完成）

| 项 | 状态 |
|---|---|
| 城市名 / 入城正文 | ✅ 102 城 en/zh 齐；T1 二十城三书改写已完成 |
| 主城探索点 | ✅ 12 metropolis × 3 = 36 |
| **city 级探索点** | ✅ 21 座 × 2 = 42（G26） |
| 途中事件 | ✅ **81** 条；steppe band **48**（G27 对 steppe 占比发 WARN，属预期信号） |
| 占卜第二批 | ✅ jiaobei / astrodice / geomancy / runes 已接入（含拜师、接线、30 结果文、G25） |
| 19 城语料处置 | ✅ 全为 `authored` + disposition 标注（见 §3） |

---

## 1. T3 · 21 座 city × 2 探索点

### 1.1 起点

```
12 metropolis  各 3 点 = 36 点  ✅
21 city        各 0 点          ❌ 本任务 → 各 2 点 = 42 条
44 town        各 0 点          留后（DATA_MODEL §6）
25 station     不需要
```

命令核对：

```bash
node -e '
const fs=require("fs"),path=require("path");
const dir="content/tables/cities";
let by={};
for (const f of fs.readdirSync(dir).filter(x=>x.endsWith(".json"))) {
  for (const c of JSON.parse(fs.readFileSync(path.join(dir,f),"utf8")).records||[]) {
    if (c.tier!=="city" && c.tier!=="metropolis") continue;
    const n=(c.sites||[]).length;
    by[c.tier]=by[c.tier]||{}; by[c.tier][n]=(by[c.tier][n]||0)+1;
  }
}
console.log(by);
'
```

### 1.2 操作

对每一座 `tier: "city"`：

1. **选题**：从该城 lore／入城正文挑两件具体事——一个市集／生计，一个信仰／风俗。禁止「广场」「城门」通用空点。
2. **事件**：写入 `content/tables/events/site.json`（或按区拆分），形状照 `ev-balc-a`：
   - `kind: "site"`，`when.cities: ["<id>"]`，`once: true`
   - 2–3 选项；每个 `effects` **非空且带 `reason`**
3. **挂城**：该城 `sites: ["ev-<id>-a", "ev-<id>-b"]`（恰好 2）。
4. **文本**：`content/story/<id>/{en,zh}.md` 补 `ev.<id>.a/b.*` 全套 key；`story.mjs build` → `stamp zh` → `check`。
5. **门禁**：`validate.mjs`（G1／G2／G15）+ `smoke_citynav`。

### 1.3 验收

- [x] 21 座 city 各 2 点，共 42 条新 site 事件
- [x] G1／G2／G15 全绿
- [x] `smoke_citynav`：每座城能进能出
- [x] 随机抽 5 城人工：读起来是**那座城**的事

### 1.4 G26（已随 T3 实现）

| 检查 | 规则 |
|---|---|
| metropolis | `sites.length === 3` |
| city | `sites.length === 2` |
| town／station | 不强制 sites |

**负向**：给某 city 挂 3 点 → G26 报错；还原后绿。✅ 已验

---

## 2. T4 · 法德兰草原 stories → 途中事件

### 2.1 起点

```bash
node -e 'const s=require("./assets/books/ibn-fadlan-lore.json").stories||[];
const u=s.filter(x=>(x.body||"").length>=400&&(x.body||"").length<=4000);
console.log("总",s.length,"合用",u.length)'
```

入库 **34** 条（`ibn-fadlan-lore.json`）；其中长度合用约 **34**。现有途中 **46**，steppe **13**；目标途中 **81**，steppe **≥ 40**（从 34 条中改写，可辅以 authored 补量）。

### 2.2 操作

1. 从 **34** 条入库 stories 中挑 **27–35** 条改写（优先渡河、驿站、部族礼节、严寒、丧仪见闻）；不足部分用 authored 补 steppe 途中。
2. 每条 → `kind: "road"`，`when.bands: ["steppe"]`；options／effects 非空带 reason。
3. 语体同 T1；G24 复查贬语（可观察事实可留，谩骂删）。
4. 确保事件被路线 `encounters` 引用或可由 `EventMachine.pick("road")` 按 band 抽到（与现网一致）；G2b 无孤儿。
5. `test_m1_lines` 仍须走完——新事件若重扣钱粮须控量。

### 2.3 验收

- [x] 途中 **46 → 81**，steppe band **13 → ≥ 40**（实测 **48**）
- [x] G2b／G24 绿
- [x] `test_m1_lines` 全过

### 2.4 G27（已随 T4 实现）

任一 `when.bands` 占总途中事件 **≥ 50%** → **警告**（不必 fail，除非产品改为硬拦）。

**负向**：把 40 条全标 steppe 且占比 ≥50% → 应警告。✅ 生产态 steppe 约 59% 已触发 WARN（预期信号）。

---

## 3. T6 · 19 城语料处置

### 3.1 弱证据 11 座

`merva` `samara` `axuma` `dongola` `bethleem` `edessa` `kiovia` `novogardia` `tana-azov` `tarsus` `trapezus`

| 处置 | 做法 |
|---|---|
| 确有其事 | 补 `tools/lore/match_books.mjs` 的 `NAMES` 变体 → 重跑 `--write` → 城 `lore.origin: source` + `ref` |
| 确无／过弱 | 永久 `authored`，在城记录或本文表注明「已查」 |

> `merva`：法德兰「继而至木鹿」已肉眼确认；`NAMES` 已有 Merv／Marw／Merva，需**重跑绑定**而非放宽判据。

### 3.2 查无 8 座

`sachiu` `coigangiu` `ctesiphon` `ephesus` `ispahan` `moscovia` `nicaea` `petra`

- 前两座中国地名：三书本就不覆盖 → 维持 `authored`，标「三书范围外」
- 其余：换语料（《瀛涯胜览》《远游记》）或维持新撰；**本阶段不拆新书**（`docs/archive/PLAN-2026-07-T1-T6.md` §10）

### 3.3 验收

- [x] 11 弱证据每座有明确处置（全部 `authored` + `disposition: checked-weak` + `note`）
- [x] 8 查无维持诚实标签（`checked-outside-corpus` / `checked-not-found`）；无假阳性 `source`
- [x] 禁止放宽 `match_books` 命中判据（`merva` 等仍 1 处提及，不绑）

---

## 4. 已完成摘要（勿重复开工）

| 任务 | 状态 |
|---|---|
| T1 二十城入城改写 | ✅ |
| T2 占卜第二批（jiaobei／astrodice／geomancy／runes） | ✅ 引擎+拜师+接线+30×2 结果文+G25 |
| T3 21 city × 2 探索点 | ✅ +42 site + G26 |
| T4 法德兰草原途中 | ✅ road 81 · steppe 48 + G27 |
| T5 F-3／F-6 | ✅ registry 未学守卫；`test_i18n`／`test_narrative`／`test_time` |
| T6 19 城语料处置 | ✅ 已查标注，无假阳性 source |

---

## 5. 明确不做

| 不做 | 为什么 |
|---|---|
| town／station 探索点 | DATA_MODEL §6 分级 |
| 24 法全部接入 | 第二批已完成 4 法 |
| 拆《远游记》《瀛涯胜览》 | 等 S1–S5 收口再动 |
| 美术管线 | [`ART_REQUIREMENTS.md`](../ART_REQUIREMENTS.md) · [`ASSETS_REQUIREMENTS.md`](../ASSETS_REQUIREMENTS.md) |
| 文本总表 | [`../TEXT_REQUIREMENTS.md`](../TEXT_REQUIREMENTS.md) |

---

## 6. 与 PLAN／STATUS 的分工

| 文档 | 管什么 |
|---|---|
| `STATUS.md` | 现在在哪 |
| `ROADMAP.md` | 阶段顺序 |
| `PLAN.md` | 下一步怎么做、怎么验 |
| **本文** | T3／T4／T6 内容规格与 G26／G27 规格（实现前的需求落点） |
