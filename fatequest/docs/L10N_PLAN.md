# 中文版制作方案 · L10N PLAN

**以刺桐为模版**做中文版。写明流程、分批、质量门槛、工具与译者守则。

> **状态（2026-07-31）**：中译批次 **B1–B4 全部完成**；剩余项 **L-1 / L-2 / L-3 全部完成**。
> en/zh 各 **3169** 条，缺 0、中英同文 0；译文时效 **1830** current · 0 stale · 0 missing；
> 三书 20 城入城正文已改写并文化校订。本文保留流程与守则——它们是新增文本与第三语言的依据。
> 各批最终状态见 §3 · §9。

**前置**：`LORE_PIPELINE.md` §4（中译工作流与语体）· `DATA_MODEL.md` §4（文本存 key）· `STORY_REQUIREMENTS.md` §9。

---

## 0. 实测现状（2026-07-31）

```bash
node tools/lore/l10n.mjs report            # 覆盖率
node tools/lore/story.mjs check            # 译文时效
node tools/validate/validate.mjs           # 含 G7 术语 / G18 ASCII 泄漏 / G24 贬语
```

```
en 条目 3169 · zh 条目 3169 · 缺 0 · 中英同文 0
译文时效 1830 current · 0 stale · 0 missing
```

**已有资产**：

| 资产 | 说明 |
|---|---|
| `content/story/<unit>/<lang>.md` | authoring 源，**108** 个单元，frontmatter 带逐条 `stamps` |
| `content/i18n/{en,zh}.json` | 编译产物，**不手改**（§3.3） |
| `assets/data/glossary.json` | 97 条术语（地名 + 概念） |
| `tools/lore/story.mjs` | `check` / `build` / `stamp` |
| `tools/lore/l10n.mjs` | `export` / `import` / `report` |
| `tools/validate/validate.mjs` | G7 术语一致 · G18 ASCII 泄漏 · G21 译文时效 · G24 贬语拦截 |
| `core/i18n/i18n.gd` | 回退链 `zh → en → key`，增量交付就绪 |

---

## 1. 刺桐：唯一完整的模版

刺桐覆盖了游戏里每一种文本类型。译刺桐时定下的规矩，就是译其余 11 城的规矩。

### 1.1 翻译完成清单（55/55 条）

| 类型 | 条数 | 示例 ZH | key |
|---|---|---|---|
| 入城标题 | 1 | 刺桐港 | `ev.zayton.entry.title` |
| 入城正文 | 1 | 自福州向东南行五日…… | `ev.zayton.entry.body` |
| 探索点（标题 + 正文） | 3 | 码头 / 番坊 / 天妃宫 | `ev.zayton.harbour.*` |
| 探索点选项 | 9 | 向大汗的税吏报关 | `ev.zayton.*.choice.*` |
| 导师（标题 + 正文 + 选项） | 3 | 解签的老妇 | `ev.zayton.mentor.*` |
| 城市名 | 1 | 刺桐（泉州） | `city.zayton.name` |
| 市集（名 + 描述 + 12 商品） | 14 | 刺桐码头 + 朱砂、德化白瓷…… | `city.zayton.market.*` `market.zayton.item.*` |
| 庙宇（名 + 描述） | 2 | 天妃宫 | `city.zayton.shrine.*` |
| 奇观 | 1 | 你听人说过亚历山大港…… | `city.zayton.wonder` |
| 图鉴（名 + 正文） | 1+1 | 大汗的什一税 | `codex.cx-zayton-tithe.*` |
| 贴纸 | 3 | 如焚林之桅 | `sticker.st-zayton-*` |
| 随从（名 + 背景 + 任务 + 标志 + 命运） | 5 | 刺桐的船主马吉德 | `retainer.zayton-mentor.*` |
| NPC（名 + 预兆） | 2 | 解签的老妇 | `npc.npc-zayton-mentor.*` |

### 1.2 一条城市文本的生产线

以刺桐为模版，翻译一座城市意味着：

1. **标题**（1 句，保留 Yule 原文起句气势）
2. **入城正文**（300–400 字，第二人称见闻体，沿途描写 → 抵达 → 惊叹）
3. **三个探索点**（各 200–300 字 + 选项）
4. **城市名**（冯承钧系译名 + 括号附现代地名）
5. **市集**（名 + 简介 + 12 商品描述）
6. **庙宇**（名 + 简介）
7. **奇观**（城市宣传语，1 段）
8. **图鉴**（「统治—物产—风俗—奇事」各一图鉴）
9. **贴纸**（3 张，各一句）

> **请注意**：刺桐图鉴正文（`codex.cx-fanfang/hundred-shiploads/lots/monsoon/pepper-freight/sea-goddess/zayton-tithe.*`）已随 B2 全译；§9 旧「未译 6 条」作废。

---

## 2. 语体规范

英文先导文本摹 Yule 译本的见闻体。中译**不是回译成现代汉语**，而是找到对应的汉语行纪腔。

### 2.1 三条硬规矩

| # | 规矩 | ✓ 正 | ✗ 误 |
|---|---|---|---|
| 1 | **第二人称见闻体** | 「你须知道，此地……」 | 「玩家可以在这里……」 |
| 2 | **无现代词汇** | 「关税」「牙人」「舶司」 | 「海关」「中介」「进出口」 |
| 3 | **无心理描写** | 「番坊自成一街」 | 「你感到一阵新奇」 |

### 2.2 参照与不照抄

参考冯承钧译《马可波罗行纪》的文言白话腔，**但不照抄**——冯译本 1936 年，版权状态需确认（`LORE_PIPELINE.md` §4 已记）。取其语感，不取其句子。

### 2.3 刺桐定稿对照

> **EN**：`The haven of Zayton is frequented by all the ships of India, which bring hither spicery and every kind of costly ware; and you must know that for one shipload of pepper that goes to Alexandria for Christendom, there come a hundred such to this haven.`
>
> **ZH**：「刺桐港者，天竺诸船皆集于此，载香料与百般贵货而来。你须知道：往亚历山大港去、供基督教国用的胡椒，每有一船，来此港者便有百船，且不止百船。」

要点：`you must know that` → 「你须知道」（Yule 招牌句式）；`Christendom` → 「基督教国」不作「西方」。

### 2.4 译者守则（从 13 条正文中提取）

以下守则并非从零推演——每条都对应刺桐译文中实际使用的手法，并附索引：

| # | 守则 | 示例 | 来源 |
|---|---|---|---|
| 1 | Yule `you must know` → 「你须知道」或「你要知道」，不可混用「您」 | 「你须知道：往亚历山大港去……」 | `entry.body` |
| 2 | Yule 长段一句 → 中文断句加破折号或分号，不模仿英语逗号链 | 「——你便明白人们为何这般说起此地了」 | `entry.body` |
| 3 | `India` → 「天竺」；`Persia` → 「波斯」；`Arab` → 「大食」——不用现代国名 | 「天竺诸船皆集于此」 | `entry.body` |
| 4 | `Kaan` / `Great Kaan` → 「大汗」；`clerks` → 「书吏」——不用「皇帝」「海关官员」 | 「大汗的书吏摆着他们的桌子」 | `entry.body` |
| 5 | 数字表述照搬不改写：`ten in the hundred` → 「什税其一」「十取其一」 | 「大汗征收什一税，十取其一」 | `harbour.body` |
| 6 | `fortune-telling` → 「卜卦」；`asking` → 「问一问」——把术语降维，不降温度 | 「水手们不把这叫作卜卦。他们管这叫问一问。」 | `mazu.body` |
| 7 | 专名可附括号注记，不替代主名：「刺桐（泉州）」「行在（杭州）」 | `city.zayton.name` | 城市名规范 |
| 8 | `Manzi` → 「蛮子」（Yule 沿用的蒙古语称谓，此处作为历史身份保留） | 「蛮子绢一匹」 | `fanfang.choice.silk` |
| 9 | 不以「的」串成长定语；拆成短句，让被修饰的名词落在句末 | 「波斯语、阿拉伯语与本地话在同一屋檐下讨价还价」 | `fanfang.body` |
| 10 | 引号用直角引号「」——这是见闻体中文的历史排版习惯 | 全文统一 | 全局 |

---

## 3. 分批 B1–B4：状态与剩余工作

**2026-07-24 按实测重写。** 此前本节记的是 622 条待译（B1 94 / B2 206 / B3 180 / B4 142），
那是横铺全城之前的数字。现在实测：

```bash
node -e 'const en=require("./content/i18n/en.json"),zh=require("./content/i18n/zh.json");
const k=Object.keys(en);
console.log("en",k.length,"zh",Object.keys(zh).length,
 "缺",k.filter(x=>!zh[x]).length,"同文",k.filter(x=>zh[x]===en[x]).length)'
```

```
en 1943 · zh 1943 · 缺 0 · 中英同文 0
```

### 3.1 四批的最终状态

| 批 | 内容 | 原计划待译 | 实测 | 完成于 |
|---|---|---|---|---|
| **B1** | 12 主城 `ev.*`（入城 + 探索点 + 导师） | 94 | ✅ 0 | 2026-07-23 全城 story 补齐 |
| **B2** | 途中事件 + 图鉴 + 占卜文本 | 206 | ✅ 0 | 同上；占卜文本部分见 §3.2 |
| **B3** | 90 次级城入城文本 | 180 | ✅ 0 | 同上 |
| **B4** | 随从 66 + 商品 60 + 结局 7 + 贴纸 33 | 142 | ✅ 0 | 结局 27 条于 2026-07-24 补齐 |

**中译 B1–B4 已全部完成。** 102 城的 `story/<unit>/zh.md` 均为 `status: translated`，
逐条 `stamps` 齐备，G21 时效检查 779 current · 0 stale · 0 missing。

### 3.2 一处方向相反的缺口（2026-07-24 修复）

按「中英同文」筛查时出现 151 条，逐条看下来**缺的全是英文，不是中文**——
中文字坐在 `en.json` 里：

| 组 | 条数 | 症状 |
|---|---|---|
| `div.iching.hex.*` | 64 | 英文位是「乾」「坤」「未济」 |
| `div.tarot.card.*` | 78 | 英文位是「愚者」「圣杯国王」 |
| `div.tarot.card.*.up/.rev` | — | 拼成「愚者 upright: energy flows」这种中英混排 |
| `div.tarot.spread.*` | 9 | 英文位是「凯尔特十字」「双选门」 |

根因在 `tools/divination/build_p3_content.mjs`：`en[c.nameKey] = c.name` 直接
把中文写进英文位；而卦名那 64 条**从来没有任何工具写过**——是很久以前手工塞进
`en.json` 的，任何一次重建都修不了它。

**处理**：

1. `tools/divination/name_en.mjs` 给两张表补 `nameEn`（142 条）。塔罗是**生成**
   不是誊写——22 张大阿卡纳 + 四花色 × 14 阶完全规则，手抄 78 条只是制造 78 次
   打错的机会。
2. 卦名用**拼音 + 平实释义**（`Qián · Force`），**不用**「The Creative」那套——
   那是卫礼贤（Wilhelm）的译法，其译本仍在版权期内。拼音是名字本身，不属于任何人。
   释义刻意平实：卦名是解读的把手，英文玩家看到 `Qián · Force` 抓得住；看到一行
   小诗，则是在占卜开口之前就先给了他一个解释。
3. 两个 builder 改为**重建时保留 `nameEn`**，缺失即抛错——此前重建会静默丢弃。

修复后中英同文 0 条。

### 3.3 之后的翻译工作走什么流程

新增文本一律走 `STORY_TEXT_FORMAT.md` 的 authoring 格式，**不直接改 `content/i18n/*.json`**：

```
content/story/<unit>/en.md   ← 先写英文源
content/story/<unit>/zh.md   ← 据源翻译，frontmatter 记 stamps
node tools/lore/story.mjs build     # 编译进 i18n
node tools/lore/story.mjs stamp zh  # 原文校订后重新盖章
node tools/lore/story.mjs check     # 时效检查
```

> **2026-07-24 的教训**：上一轮 G7 术语修复改的是 `content/i18n/zh.json`（编译产物），
> 结果下一次 `story.mjs build` 把三条中文覆盖回了截短版。**改产物的修复活不过下一次
> 构建。** 顺序永远是：先改源文（`story/<unit>/<lang>.md`），再 build，再 stamp。

### 3.4 剩余的语言相关工作

| # | 事项 | 量 | 状态 |
|---|---|---|---|
| L-1 | 三书新绑定 20 城的 zh 正文重写 | 20 城 | ✅ **2026-07-24 完成**：en 据 `passages.json` 改写 → zh 见闻体翻译 → 六维文化校订（`proofed: true`）→ build/stamp；G24/G18/G7/G21 全过 |
| L-2 | 第三语言（日／韩／西）可行性 | — | ✅ 分析见下 §3.4.1 |
| L-3 | 中文字体与竖排的上架审校 | — | ✅ 审校清单见下 §3.4.2 |

#### 3.4.1 L-2 · 第三语言可行性（日／韩／西）

**回退链已就位**（[`core/i18n/i18n.gd`](../core/i18n/i18n.gd)）：

```
请求语言 → en → key 本身
```

加一门语言只需：`content/story/<unit>/<lang>.md` × 103 + `content/i18n/<lang>.json`（由 `story.mjs build` 编译）+ `I18n.load_lang("<lang>")`。无需改内核。

| 语言 | 优势 | 风险 / 成本 | 粗估工作量 |
|---|---|---|---|
| **日语 (ja)** | 汉字文化圈，地名可部分共用；见闻体有「候文／雅文」传统可对照 | 需 CJK 字体（与 L-3 联动）；敬语层级与第二人称「你须知道」的对应要另定 | ~1943 条；长正文 183 条须人工；约 6–10 人周 |
| **韩语 (ko)** | 回退链同样适用；谚文排版清晰 | 非汉字圈，专名需统一音译表；无现成「行纪腔」对标，语体需另立守则 | ~1943 条；约 8–12 人周（含语体试点） |
| **西班牙语 (es)** | 拉丁字母，无字体阻塞；拉美／西班牙市场 | 文本膨胀约 +25–35%，UI 标签与对话框需留白；Yule 见闻体 → 西语编年史腔需试点 | ~1943 条；UI 回流测 1–2 人周；全文约 6–9 人周 |

**建议顺序**：es（无字体依赖，可先验证工具链）→ ja（字体与 L-3 一并）→ ko。
**不建议**：在 glossary 未扩到目标语言前批量机翻长正文。

#### 3.4.2 L-3 · 中文字体与竖排上架审校

对照 [`ART_REQUIREMENTS.md`](ART_REQUIREMENTS.md) 与当前 `game/` 实现：

| # | 检查项 | 现状 | 行动 |
|---|---|---|---|
| F1 | 中文字体资源是否入库 | `game/` 内**未发现** Theme / DynamicFont / FontFile 引用；依赖系统回退 | 上架前须嵌入开源 CJK 字体（推荐 Source Han Serif / Noto Serif CJK SC， OFL） |
| F2 | 简繁覆盖 | 文案为简体；未测繁体环境 | 若上架台／港：另出 `zh-Hant` 或接受系统繁简转换（后者不推荐） |
| F3 | 竖排需求 | 见闻体适合横排阅读；GDD／ART **未要求**正文竖排 | **不做全局竖排**；若史料小卡（ART §2.6）要「卷轴感」，仅该组件可选 `vertical` 布局 |
| F4 | 缺字／豆腐块 | 未跑字体覆盖扫描 | 用 `zh.json` 全量字符集对所选字体做 coverage 脚本，缺字即换字或补字 |
| F5 | 平台合规 | Steam / App Store 要求字体可再分发或系统字体声明 | 嵌入 OFL 字体并在 credits 注明；勿用未授权商用字 |
| F6 | UI 与长正文混排 | 拉丁专名（tamghā、ihrām）夹在中文中 | 保持音译+括注；字体须同时覆盖拉丁扩展 |

**上架前最低交付**：F1 嵌入 + F4 覆盖扫描通过 + F5 credits。竖排非阻塞。

---

## 4. 工具

### 4.1 导出

```bash
node tools/lore/l10n.mjs export --lang zh --batch B1 > b1.tsv
```

产出 5 列 TSV：

```
key	batch	context	english	translation
ev.tauris.entry.body	B1	entry/tauris/正文	Tauris is a great and noble city...
```

`context` 列形如 `entry/city/正文`，告诉你这句话出现在哪座城、哪个事件类型下。

### 4.2 翻译 TSV

在任何编辑器（或 spreadsheet）中填入 `translation` 列。 **不要改 key 列、不要删行、不要改顺序。**

### 4.3 回填

```bash
node tools/lore/l10n.mjs import --lang zh b1.done.tsv
```

- 只写 `zh.json`，不碰 `en.json`
- 已有译文不覆盖（除非 `--force`）
- 空白行跳过

### 4.4 覆盖报告

```bash
node tools/lore/l10n.mjs report --lang zh
```

输出每批剩余数、长正文计数。每次提交前跑一次——数字不进记忆，进终端。

---

## 5. 质量门禁

### 5.1 CI 门禁（`tools/validate/validate.mjs`）

| 门禁 | 检查 | 级别 |
|---|---|---|
| **G7** | 中文翻译中出现英文原文提及的地名/术语，必须用 `glossary.json` 批准的译名 | 地名 → ERROR · 概念 → WARNING |
| **G18** | `.body` `.desc` `.wonder` 等长正文若 ASCII > 60%，判定为漏译 | ERROR |
| G17 | 事件表中引用的每个 text key 在 `en.json` 中存在 | ERROR |

### 5.2 G7 详解

G7 的工作方式：

1. 从 `glossary.json` 读取 95 条术语
2. 对每条 `zh.json` 中的译文，检查其英文原文是否包含 glossary 中的英文术语
3. 包含 → 中文必须包含 glossary 批准的译名（或括号内的别名）

地名级别为 **ERROR**——Zayton 一会儿「刺桐」一会儿「泉州」，玩家会以为两个地方，CI 直接阻断。概念术语级别为 **WARNING**——提示人工复核。

**2026-07-24 实测**：G7 **0 errors · 0 warnings**（与全部门禁一并全绿）。

### 5.3 人工质量

| 检查项 | 工具 | 说明 |
|---|---|---|
| 术语一致 | G7 (CI) | 自动，每次 commit |
| 四字 key 未译 | 目视 | `zh.json` 中 `值 === 英文原文` 意味着回退链生效 |
| 语体合规 | 人工抽检 | 无现代词汇、第二人称见闻体、无心理描写 |
| 长正文机翻率 | G18 (CI) | 自动，ASCII > 60% 即阻断 |

---

## 6. 运行时行为

`core/i18n/i18n.gd` 的回退链已就位：

```
请求语言 → 英文 → key 本身
```

- 中文缺失时**显示英文原文**，不显示裸 key
- 界面标注「(尚未译出，暂显英文原文)」
- `I18n.untranslated_keys()` 运行时统计待译量
- `I18n.fmt()` 处理带参数 key

**中译可以增量交付**——每条译文落库即刻生效，不必等全译完。

---

## 7. 机器翻译的边界

| 允许 | 不允许 |
|---|---|
| 机翻做**初稿**，人工逐条校订 | 机翻直接入库 |
| 短串（选项、贴纸名）机翻 + 抽检 | 长正文（>100 词）机翻不校 |
| 术语按 glossary 强制替换 | 让机翻自由决定译名 |
| 机翻作「没思路时的起点」 | 机翻作「交付的定义」 |

**长正文 183 条必须人工**。见闻体的语感是这部作品的价值所在——机翻会把「你须知道」变成「您需要知道的是」，把「刺桐港者」变成「刺桐港是」。

---

## 8. 验收

| 批 | 验收标准 | 如何验证 | 2026-07-24 |
|---|---|---|---|
| B1 | 三条线走完，12 主城无英文回退 | 刺桐 smoke + i18n 覆盖 | ✅ |
| B2 | 途中事件 / 图鉴 / 占卜全中文 | `l10n.mjs report` + G18 | ✅ |
| B3 | 随机点开任一节点均为中文 | 次级城 story `status: translated` | ✅ |
| B4 | 随从 / 市集 / 结局同步完成 | 同上 + endings unit 27 条 | ✅ |

**每批结束跑**（全量完成后仍应在 CI 保留）：

```bash
node tools/validate/validate.mjs && node tools/lore/l10n.mjs report --lang zh
```

---

## 9. 批次收口（2026-07-24）

### 9.1 全部批次最终状态

| 批 / 项 | 内容 | 状态 |
|---|---|---|
| **B1** | 12 主城 `ev.*` | ✅ |
| **B2** | 途中事件 + 图鉴 + 占卜（含刺桐图鉴全文、`div.*` 英位修复） | ✅ |
| **B3** | 90 次级城入城 | ✅ |
| **B4** | 随从 / 商品 / 结局 / 贴纸 | ✅ |
| **L-1** | 三书 20 城入城正文改写 + 文化校订 | ✅ |
| **L-2** | 第三语言可行性 | ✅ 见 §3.4.1 |
| **L-3** | 中文字体与竖排审校清单 | ✅ 见 §3.4.2（上架嵌入字体为发布前工程，非本批翻译范围） |

```bash
node tools/lore/l10n.mjs report --lang zh
# zh: 1943/1943 translated (100.0%)

node tools/lore/story.mjs check
# 779 current · 0 stale · 0 missing

node tools/validate/validate.mjs
# G7 / G18 / G21 / G24 … all gates pass
```

**中文版翻译批次至此全部完成。** 新增文本继续走 §3.3 流程；第三语言与字体嵌入按 §3.4 执行。

### 9.2 历史操作手册（保留备查）

对每座主城（以报达为例）的旧操作步骤仍有效，供日后加城复用：

```bash
node tools/lore/l10n.mjs export --lang zh --batch B1 > b1_all.tsv
# 翻译 translation 列 → import → validate
node tools/lore/l10n.mjs import --lang zh b1_all.tsv
node tools/validate/validate.mjs
```

### 9.3 不建议做的事

- **不要**一条条打开 JSON 手改——改源文 `story/<unit>/<lang>.md`，再 `build` / `stamp`
- **不要**让机翻批量处理长正文——见闻体经不起翻译机
- **不要**在 glossary 不全时大量翻译——译名漂移后返工成本是译时校对成本的 3 倍
- **不要**在未过 G24 时把三书选段原文贴进玩家字符串

---

## 10. 术语表维护

`assets/data/glossary.json` 目前 97 条。翻译过程中发现的新术语，**立即新增**：

```json
{ "id": "xxx", "kind": "place|people|good|title|currency",
  "en": "English term / alternate",
  "zh": "中文译名（可附注）",
  "aliases": ["alternate English"],
  "note": "出处或语境" }
```

- `kind: "place"` → G7 ERROR 级检查
- `kind: "people" | "good" | "title" | "currency"` → G7 WARNING 级检查

`zh` 字段格式约定：主名 + 括号注记（如「刺桐（泉州）」），G7 会将括弧内外都视为有效匹配。
