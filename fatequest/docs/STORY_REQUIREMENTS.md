# 文本素材需求 · STORY REQUIREMENTS

**2026-07-26 重写。** 权威执行步骤仍在 `PLAN.md`；本文登记**尚未实现的内容密度任务**（T3 / T4 / T6）与配套门禁规格，使后续可直接开干。
语体见 `LORE_PIPELINE.md` §4；写作格式见 `STORY_TEXT_FORMAT.md`。

> **红线（GDD §19）**：每段文本必须标 `origin`——`source`／`authored`／`hybrid`。桩文本一律 `authored`。

> **占卜结果文案**：允许大吉／大凶等吉凶用语；仍须给出可执行的路线或时机建议，不能只有空辞。

---

## 0. 现状（2026-07-26）

| 项 | 状态 |
|---|---|
| 城市名 / 入城正文 | ✅ 102 城 en/zh 齐；T1 二十城三书改写已完成 |
| 主城探索点 | ✅ 12 metropolis × 3 = 36 |
| **city 级探索点** | ❌ 21 座仍为 `sites: []` → **§1 T3** |
| 途中事件 | 41 条；steppe band 仅 12 → **§2 T4** |
| 占卜第二批 | ✅ jiaobei / astrodice / geomancy / runes 已接入（含拜师、接线、30 结果文、G25） |
| 19 城语料处置 | 仍全为 `authored` → **§3 T6** |

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

- [ ] 21 座 city 各 2 点，共 42 条新 site 事件
- [ ] G1／G2／G15 全绿
- [ ] `smoke_citynav`：每座城能进能出
- [ ] 随机抽 5 城人工：读起来是**那座城**的事

### 1.4 G26（随 T3 实现；本轮只定规格）

| 检查 | 规则 |
|---|---|
| metropolis | `sites.length === 3` |
| city | `sites.length === 2` |
| town／station | 不强制 sites |

**负向**：给某 city 挂 3 点 → G26 应报错；还原后绿。

---

## 2. T4 · 法德兰草原 stories → 途中事件

### 2.1 起点

```bash
node -e 'const s=require("./assets/books/ibn-fadlan-lore.json").stories;
const u=s.filter(x=>(x.body||"").length>=400&&(x.body||"").length<=4000);
console.log("总",s.length,"合用",u.length)'
```

约 199 条中 **146** 条长度合用。现有途中 41，steppe 约 12；目标途中 **81**，其中 steppe **≥ 40**。

### 2.2 操作

1. 从 146 条挑 **40** 条：优先渡河、驿站、部族礼节、严寒、丧仪见闻；避开纯世系年表。
2. 每条 → `kind: "road"`，`when.bands: ["steppe"]`；options／effects 非空带 reason。
3. 语体同 T1；G24 复查贬语（可观察事实可留，谩骂删）。
4. 确保事件被路线 `encounters` 引用或可由 `EventMachine.pick("road")` 按 band 抽到（与现网一致）；G2b 无孤儿。
5. `test_m1_lines` 仍须走完——新事件若重扣钱粮须控量。

### 2.3 验收

- [ ] 途中 41 → 81，steppe band ≥ 40
- [ ] G2b／G24 绿
- [ ] `test_m1_lines` 全过

### 2.4 G27（随 T4 实现；本轮只定规格）

任一 `when.bands` 占总途中事件 **≥ 50%** → **警告**（不必 fail，除非产品改为硬拦）。

**负向**：把 40 条全标 steppe 且占比 ≥50% → 应警告。

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
- 其余：换语料（《瀛涯胜览》《远游记》）或维持新撰；**本阶段不拆新书**（PLAN §10）

### 3.3 验收

- [ ] 11 弱证据每座有明确处置（source 或 authored+已查）
- [ ] 8 查无维持诚实标签；无假阳性 `source`
- [ ] 禁止放宽 `match_books` 命中判据

---

## 4. 已完成摘要（勿重复开工）

| 任务 | 状态 |
|---|---|
| T1 二十城入城改写 | ✅ |
| T2 占卜第二批（jiaobei／astrodice／geomancy／runes） | ✅ 引擎+拜师+接线+30×2 结果文+G25 |
| T5 F-3／F-6 | ✅ registry 未学守卫；`test_i18n`／`test_narrative`／`test_time` |

---

## 5. 明确不做

| 不做 | 为什么 |
|---|---|
| town／station 探索点 | DATA_MODEL §6 分级 |
| 24 法全部接入 | 第二批已完成 4 法 |
| 拆《远游记》《瀛涯胜览》 | 等 T4 流程再验证后再动 |
| 美术管线 | `ART_REQUIREMENTS.md` |

---

## 6. 与 PLAN／STATUS 的分工

| 文档 | 管什么 |
|---|---|
| `STATUS.md` | 现在在哪 |
| `ROADMAP.md` | 阶段顺序 |
| `PLAN.md` | 下一步怎么做、怎么验 |
| **本文** | T3／T4／T6 内容规格与 G26／G27 规格（实现前的需求落点） |
