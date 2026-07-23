# 故事文本的多语言存储 · STORY TEXT FORMAT

**以刺桐为样板。** 本文只讲故事正文怎么存、怎么配、怎么加语言；短 UI 串仍走 `content/i18n/*.json`，两者刻意分开，理由见 §1。

前置：`L10N_PLAN.md`（中译流程）· `DATA_MODEL.md` §4（文本存 key）· `LORE_PIPELINE.md` §4（语体）。

---

## 1. 一条原则：写作格式 ≠ 运行时格式

运行时要的是一张扁平映射，O(1) 查表、不解析。
写作要的是换行、免转义、以及**改一句只显示那一句**的 diff。

这是两件事。让一种格式同时干，受损的永远是写作。

```
content/story/<unit>/<lang>.md    ← 人写这里
        ↓  tools/lore/story.mjs build
content/i18n/<lang>.json          ← 游戏读这里（不手改）
```

### 为什么不直接在 JSON 里写

刺桐的入城正文在 `zh.json` 里是这样一行：

```json
"ev.zayton.entry.body": "自福州向东南行五日，穿过樟树夹道的山谷、经过一个接一个的城镇，道路将你带到水边——你便明白人们为何这般说起此地了。刺桐港者……"
```

四个具体代价：

| 问题 | 后果 |
|---|---|
| 整段挤在一行 | 改一个字，git diff 显示整段重写，审校无从下手 |
| 引号换行要转义 | 作者写作时要想着 JSON 语法 |
| 无处记元信息 | 谁译的、审没审、**原文改了没有**——全无 |
| 短串与长文混装 | 1741 条里，`"买"` 和 600 字散文同级 |

第三条是致命的：**一条原文已变的旧译，比缺译更糟——它读起来像完成品。**

---

## 2. authoring 格式

`content/story/zayton/en.md`（源语言）：

```markdown
---
unit: zayton
lang: en
role: source
status: reviewed
voice: yule
notes: >
  Observational register after the Yule–Cordier translation: second person,
  present tense, no modern vocabulary, no interiority.
---

## ev.zayton.entry.title

The Haven of Zayton

## ev.zayton.entry.body

Five days south-east of Fuju, through valleys of camphor trees and a constant
succession of towns, the road brings you down to the water …
```

`content/story/zayton/zh.md`（译文）：

```markdown
---
unit: zayton
lang: zh
source: en
source_rev: 33088fc302d9
status: translated
translator: 人工校译
notes: >
  行纪腔，非现代白话。「你须知道」是 Yule 的招牌句式，中译须保留；
  Christendom 作「基督教国」不作「西方」。
stamps:
  ev.zayton.entry.title: 4904400daea2
  ev.zayton.entry.body: d6ec25a10ebc
---

## ev.zayton.entry.title

刺桐港

## ev.zayton.entry.body

自福州向东南行五日，穿过樟树夹道的山谷……
```

### 字段

| 字段 | 作用 |
|---|---|
| `unit` | 内容单元（一座城／一段路／一个系统），对应目录名 |
| `lang` | 语言码，对应文件名与产出的 `<lang>.json` |
| `status` | `draft` ｜ `translated` ｜ `reviewed` |
| `voice` / `notes` | **语体规则放在译者眼前**，而不是放在一份他要记得去开的文档里 |
| `stamps` | 每条译文所据**原文的哈希** |

---

## 3. `stamps` 是这套设计的核心

翻译时记下原文哈希；原文一旦改动，哈希对不上，该条即被标为 **STALE**。

实测：

```bash
# 改动英文一处措辞
-  their masts … look like a burnt forest
+  their masts … look like a forest after fire

$ node tools/lore/story.mjs check
  zayton/zh: 10 entries, status=translated, 1 need attention
      STALE    city.zayton.wonder
  9 current · 1 stale · 0 missing
```

**扁平 JSON 无法表达这件事**，所以在现有格式下，一条静默过期的译文与一条最新译文完全无法区分。

门禁 **G21** 把它变成 CI 硬错误：原文改了而译文未更新，构建即失败。

---

## 4. 命令

```bash
node tools/lore/story.mjs check      # 状态与过期报告
node tools/lore/story.mjs build      # 编译进 content/i18n/*.json
node tools/lore/story.mjs stamp zh   # 翻译完成后记录原文哈希
```

典型流程：

1. 改 `en.md` → `build` → 游戏里看得到
2. 译 `zh.md` → `stamp zh` → `build`
3. 日后 `en.md` 再改 → `check` 报 STALE → 重译该条 → 重新 `stamp`

---

## 5. 加一门新语言

以日语为例，**三步**：

```bash
cp content/story/zayton/en.md content/story/zayton/ja.md
# 改 frontmatter: lang: ja / source: en / status: draft / 删掉 role
# 逐节翻译正文
node tools/lore/story.mjs stamp ja && node tools/lore/story.mjs build
```

运行时无需改动：`I18n.load_lang("ja")` 即可，回退链自动为 **ja → en → key**。

> **字体是唯一的额外工作**：CJK 需子集化（`ARCHITECTURE.md` §8）。日文假名与中文汉字可共用思源字族，但**不可共用同一子集**——日文汉字字形与简体不同。

---

## 6. 分工：哪些文本走哪条路

| 类型 | 存放 | 理由 |
|---|---|---|
| 事件标题／正文／选项 | `content/story/` | 长、要语体一致、要审校 |
| 图鉴、贴纸、城市描述 | `content/story/` | 同上 |
| UI 短串（「买」「归位」） | `content/i18n/*.json` 直接写 | 短、量大、无语体问题、机翻可用 |
| 商品名、语言名等术语 | `content/i18n/*.json` + `glossary.json` | 由 G7 强制一致 |

**判据**：这句话需要审校吗？需要 → `story/`；不需要 → `i18n/`。

---

## 7. 迁移现状

刺桐 10 条已迁入 `content/story/zayton/`，en/zh 双全并盖章。

其余仍在扁平 JSON，可增量迁移——`build` 只覆盖 `story/` 里出现过的 key，不动其他条目。建议顺序同 `L10N_PLAN.md` §3 的 B1–B4 分批。

---

## 8. 一个已修正的判断

`STATUS.md` 曾报「zh 长正文 0 条」，那是错的：我用**字符数**判断长文，而汉字密度约为英文的 4 倍——刺桐那段 608 字符的英文，对应 154 字符的中文是**完整翻译**而非摘要（「不止」「桅杆密如焚过的树林」原文每个从句都在）。

跨语言的完成度不能用字符数量，应当用**条目覆盖率 + stamps 时效性**——也就是本文这套。
