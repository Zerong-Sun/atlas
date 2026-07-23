# 中文版制作方案 · L10N PLAN

**以刺桐为模版**，把 1678 条英文文本做成中文版。写明流程、分批、质量门槛、工具与译者守则。

**前置**：`LORE_PIPELINE.md` §4（中译工作流与语体）· `DATA_MODEL.md` §4（文本存 key）· `STORY_REQUIREMENTS.md` §9。

---

## 0. 实测现状（2026-07-23）

```
en 条目   1678
zh 条目   1056          覆盖率 62.9％
待译       622          其中长正文(.body) 183 · 短串 439
```

**刺桐**：55 条全部译毕（100%），是中英双全的唯一城市——也是下面一切规范的依据。

**待译分布**：

| 前缀 | 条数 | 性质 |
|---|---|---|
| `ev.*` | **435** | 事件标题／正文——每个玩家一定读到 |
| `retainer.*` | 66 | 随从（P5 才用） |
| `good.*` | 60 | 商品描述 |
| `sticker.*` | 33 | 贴纸名 |
| `codex.*` `ending.*` `item.*` `div.*` | 28 | 图鉴、结局、物品、占卜术语 |

**城市名**：104 条全部译毕（100%），地图上不再出现拉丁占位。

**已有资产**：

| 资产 | 说明 |
|---|---|
| `content/i18n/zh.json` | 1056 条译文 |
| `assets/data/glossary.json` | 95 条术语（38 地名 + 57 概念） |
| `tools/lore/l10n.mjs` | `export` / `import` / `report` 三子命令 |
| `tools/validate/validate.mjs` | 含 G7（术语一致，error）与 G18（ASCII 泄漏，error）门禁 |
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

> **请注意**：图鉴正文（`codex.cx-*.body`）尚有 5 条刺桐图鉴未译（番坊、百倍之船、解签、季风、运价、海上女神），见 §9。

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

## 3. 分批：按玩家读到的顺序

**不要按 key 字母序翻译。** 622 条按接触概率分四批：

| 批 | 内容 | 待译 | B1 内部已译率 | 何时需要 |
|---|---|---|---|---|
| **B1** | **12 主城**全部 `ev.*`（入城 + 3 探索点 + 导师） | **94** | 刺桐 100% · 11 城各 60–67% | 立刻——玩家沿三条线必读 |
| **B2** | 途中事件 `ev.road.*` + 图鉴正文 `codex.*` + 占卜文本 `div.*` | 206 | — | 立刻——行路必遇 |
| **B3** | 90 次级城入城文本 | 180 | — | 横铺后 |
| **B4** | 随从 66 + 商品 60 + 结局 7 + 贴纸 33 | 142 | — | P4/P5/P6 |

### 3.1 B1 逐城待译明细

B1 的 94 条是长正文，分布在 11 座城，模式高度一致：

| 城 | 待译 | 内容 | 起点？ |
|---|---|---|---|
| **大不里士** `tauris` | 8 | entry + 3 sites 标题正文 | ✅ 波罗/草原线起点 |
| **报达** `baldacum` | 8 | entry + 3 sites 标题正文 | ✅ 分支枢纽 |
| **忽鲁谟斯** `ormus` | 8 | entry + 3 sites 标题正文 | ✅ 海路线起点 |
| 上都 `chandu` | 8 | entry + 3 sites 标题正文 | 草原线终点方向 |
| 汗八里 `cambaluc` | 8 | entry + 3 sites 标题正文 | 波罗线终点 |
| 行在 `kinsay` | 8 | entry + 3 sites 标题正文 | 海路线终点方向 |
| 巴里黑 `balc` | 8 | entry + 3 sites 标题正文 | |
| 撒马尔罕 `samarcanda` | 8 | entry + 3 sites 标题正文 | |
| 可失合儿 `cascar` | 8 | entry + 3 sites 标题正文 | |
| 于阗 `cotan` | 8 | entry + 3 sites 标题正文 | |
| 罗卜 `lop` | 14 | entry + 2 sites (bazaar/shrine) 标题正文 + 选项 | 沙漠独城，site 数不同 |

**每条待译正文约 200–400 英文词，对照 Marco Polo 原章落笔。**

### 3.2 B2 组成

| 子类 | 待译 | 备注 |
|---|---|---|
| `ev.road.*` 途中事件 | ~120 | 40 个事件 × 3（title + body + choice） |
| `codex.cx-*.body` 图鉴正文 | 6 | 刺桐 5 条 + 其他 1 条 |
| `div.*` 占卜文本 | ~60 | 易占/八字/签占/塔罗的结果描述与 codex |
| `ev.*.choice.*` 路径相关选项 | ~20 | |

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

当前 G7 输出：2 errors + ~18 warnings，零 error 后即可通过。

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

| 批 | 验收标准 | 如何验证 |
|---|---|---|
| B1 | 三条线走完，12 主城无英文回退 | 刺桐 smoke test 通过 → 复制到其余 11 城 |
| B2 | 途中事件全中文 | 随机触发 5 个 road event 全程中文 |
| B3 | 随机点开任一节点均为中文 | 遍历 `station`/`town`/`city` 各 3 个 |
| B4 | 各系统上线时同步完成 | 随从 / 市集 / 结局各自验收 |

**每批结束跑**：

```bash
node tools/validate/validate.mjs && node tools/lore/l10n.mjs report --lang zh
```

---

## 9. 翻译优先级与下一步

### 9.1 立即（本周）

1. **B1 长正文 94 条**——11 座主城各 8 条（entry + 3 sites 标题正文），翻译流程见下
2. **刺桐图鉴 6 条正文**（B2 中 `codex.cx-fanfang.body` 等）——译完即刺桐文本 100% 完工
3. **B2 途中事件 40 条**——`ev.road.*`，行路必遇，覆盖三条线沿途

### 9.2 B1 翻译操作手册

对每座主城（以报达为例）：

```bash
# 1. 导出该城的待译条目
node tools/lore/l10n.mjs export --lang zh --batch B1 > b1_all.tsv

# 2. 在编辑器中只翻译 baldacum 的行（8 条标题正文）

# 3. 对照 Marco Polo 原章写译文
#    报达 = Yule Book I Chapter VIII "Of the Great City of Baudas"
#    在 assets/books/marco-polo-lore.json 中搜 baldacum 即可找到原文章节名

# 4. 回填
node tools/lore/l10n.mjs import --lang zh b1_all.tsv

# 5. 校验
node tools/validate/validate.mjs
```

### 9.3 后续批次

| 优先序 | 批 | 触发条件 |
|---|---|---|
| 4 | B2 末尾 `ev.road.*` 事件 | B1 全部完成后 |
| 5 | B2 占卜文本 `div.*` | P3 占卜玩法上线前 |
| 6 | B3 次级城 90 座 | 11 主城横铺完成后 |
| 7 | B4 随从 / 商品 / 结局 | 各自系统上线前 |

### 9.4 不建议做的事

- **不要**先把 60 条 `good.*` 全译——商品文本玩家读到概率远低于事件正文
- **不要**一条条打开 JSON 手改——用 `export → 翻译 → import`
- **不要**让机翻批量处理长正文——见闻体经不起翻译机
- **不要**在 glossary 不全时大量翻译——译名漂移后返工成本是译时校对成本的 3 倍

---

## 10. 术语表维护

`assets/data/glossary.json` 目前 95 条。翻译过程中发现的新术语，**立即新增**：

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
