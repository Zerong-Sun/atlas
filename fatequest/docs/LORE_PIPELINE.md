# 游记语料接入管线 · LORE PIPELINE

如何把 `assets/books/marco-polo-lore.json` 变成游戏里的城市叙事、途中事件与图鉴条目；以及**当语料不覆盖时怎么办**。

---

## 1. 现有语料

| 项 | 值 |
|---|---|
| 文件 | `assets/books/marco-polo-lore.json`（464 KB） |
| 底本 | Yule–Cordier 英译《马可·波罗游记》 |
| 来源 | Project Gutenberg #10636 + #12410 —— **公有领域** |
| 章节覆盖 | 234 章 |
| `places` | **136** 条（有 `placeNames[]`，可与城市节点对齐） |
| `stories` | **98** 条（无地名索引，属叙事片段） |
| 运行时 | `js/data-marco-lore.js`（`scripts/build-lore-runtime.mjs`）— 映射游戏节点 → place，挂全文 `bodyEn` |
| 扩点（方案 A） | `js/data-journey-extra.js` 新增约 22 站（格鲁吉亚→阿丹等），outcome 可「读游记全章」；`chipangu` 坐标已收进 viewBox；缺市集站已补默认 `FQ.PRICES` |
| `bands` | europe · west_asia · central_asia · steppe · china · india · maritime_asia |
| 中译 | `zhStatus: "pending"` —— **尚无中文** |

**地带分布**

| band | places | stories |
|---|---|---|
| china | 52 | 43 |
| india | 21 | 6 |
| steppe | 19 | 31 |
| west_asia | 17 | 6 |
| central_asia | 16 | 2 |
| maritime_asia | 10 | 3 |
| europe | 1 | 7 |

正文中位长度约 1800 字符（约合两屏叙事）。

---

## 2. 覆盖度实测：MVP 十二城

**这是本次规划最重要的发现。** 把 GDD §16 的 MVP 城市逐一对照语料：

| 城市 | 语料状况 | 处理方式 |
|---|---|---|
| 大不里士 Tabriz | ✅ place `tauris` + `monastery-of-st-barsamo` | 直接改写 |
| 撒马尔罕 Samarkand | ✅ place `samarcan` | 直接改写 |
| 泉州 Zayton | ✅ place `great-haven-of-zayton` | 直接改写 |
| 大都 Khanbaliq | ✅ place `cambaluc` + `cambaluc-2` | 直接改写 |
| 威尼斯 Venice | ⚠️ 无地点章，但 **5 条 story + 9 条 place 正文提及** | 用序章故事拼装 |
| 君士坦丁堡 | ⚠️ 无地点章，**2 条 story** | 用序章故事拼装 |
| 阿卡 Acre | ⚠️ 无地点章，**4 条 story** | 用序章故事拼装 |
| 开罗 Cairo | ❌ 零覆盖 | 需新撰或换语料 |
| 麦加 Mecca | ❌ 零覆盖 | 需新撰或换语料 |
| 大马士革 Damascus | ❌ 零覆盖 | 需新撰或换语料 |
| 德里 Delhi | ❌ 零覆盖 | 需新撰或换语料 |
| 古里 Calicut | ❌ 零覆盖 | 需新撰或换语料 |

**结论：只有 4/12 有直接地点章，3/12 可由故事拼装，5/12 完全没有。**

原因很简单：波罗的书写的是**从西向东的亚洲**，欧洲只是序章，而开罗、麦加、大马士革、德里、古里是**伊本·白图泰的地盘**。

### 对 MVP 的修正建议（三选一）

| 方案 | 做法 | 代价 | 推荐 |
|---|---|---|---|
| **A. 顺着语料走** | MVP 城市改为语料最厚的一条线：阿卡 → 大不里士 → 忽鲁谟斯 → 巴达赫尚 → 喀什 → 敦煌 → 上都 → 大都 → 行在 → 泉州 | 放弃伊斯兰线首发 | ⭐ **推荐**：36 个探索点全部有史料底子 |
| **B. 先补语料** | 按同样管线拆解伊本·白图泰《里哈拉》（Gibb 英译 1929 年版，**注意版权**；或 Defrémery–Sanguinetti 法译 1853–1858，公有领域） | 多 2–3 周文本工程 | 二期做 |
| **C. 新撰补齐** | 五座城按 Yule 语体新撰，标 `origin:"authored"` | 史料密度不均，玩家会读得出来 | 仅作补丁 |

**本案采用 A + C**：MVP 走中国—中亚主干（语料最厚），开罗／麦加等留给第二章（白图泰线），届时用方案 B 补语料。

---

## 3. 三条接入通道

### 3.1 `places[]` → 城市叙事与探索点

```
place.body  →  ① 入城叙事（截首段，约 300 字）
               ② 探索点文本源（按主题切段：市集／信仰／物产／风俗）
               ③ 地理图鉴条目
place.placeNames[] → 城市节点对齐用的地名索引
place.source.chapterId → 「史料小卡」的回溯锚点
```

**切段规则**：Yule 的章节通常按「统治—物产—风俗—奇事」推进，正好对应三个探索点。人工切分，不做自动摘要——自动摘要会丢掉细节，而细节正是这本书的价值。

### 3.2 `stories[]` → 事件与传说

```
story.body  →  ① 途中遭遇（road 事件）
               ② 宫廷事件（court 事件）
               ③ 传说图鉴（如「山中老人」「不灭之火」）
```

草原 31 条、中国 43 条 story 是事件表最好的矿脉。

### 3.3 引用与标注

每条游戏文本携带：

```json
"lore": { "placeId": "zayton", "origin": "source", "ref": { "book": "marco-polo", "chapterId": "v2-b2-c82" } }
```

`origin` 三值：

| 值 | 含义 | 玩家可见标注 |
|---|---|---|
| `source` | 改写自原文 | 「据《马可·波罗游记》第 X 章」 |
| `authored` | 据原文语体新撰 | 「据原文语体新撰」 |
| `hybrid` | 原文骨架 + 新增细节 | 「据原文演绎」 |

**这条不可省略**：史料与演绎必须让玩家分得清（GDD §19）。

---

## 4. 中译工作流

主干站（大不里士→刺桐走廊 + 序章）已由 `js/data-lore-zh-trunk.js` 人工校译，`zhStatus: "done"`；其余 places 仍为 hybrid 短导语 / `pending`。

**不要机器全量翻译。** 顺序：

1. **人工校译主干**（方案 A 已完成走廊主站 bodyZh）——玩家一定会读到的
2. 途中事件按需翻译，一次一批
3. 图鉴长文可延后，先上英文 + 中文摘要
4. 术语表先行：地名、官职、货币、物产的中译必须全局统一（如 Zayton = 刺桐／泉州，Cambaluc = 汗八里／大都）

**语体规范**：模仿 Yule 译本的见闻体——「你须知道……」「此地出产……」「其人……」。第一人称，避免现代词汇与心理描写。中译参考冯承钧译本的文言白话腔，但不照抄（冯译本 1936 年，版权状态需确认）。

**回归**：

```bash
node fatequest/scripts/validate-outcomes.mjs
node fatequest/scripts/smoke-outcomes.mjs
```

---

## 5. 术语表（先行建立）

`assets/data/glossary.json`：

| 字段 | 例 |
|---|---|
| `source` | `ZAYTON` |
| `zh` | 刺桐 |
| `zhAlt` | 泉州 |
| `en` | Zayton |
| `modern` | Quanzhou |
| `kind` | `place｜title｜currency｜good｜people` |
| `note` | 波罗所记刺桐，即今泉州 |

先填 100 条高频项，再随内容扩充。

---

## 6. 待办

- [x] 方案 A：主干加厚 ~22 站 + `data-marco-lore.js` 全文挂载 + outcome「读游记全章」
- [x] 方案 A 收尾：地图坐标入框 + 有 market 站补齐 `FQ.PRICES`（可玩性硬化）
- [x] 按方案 A 重排十二城，改写 GDD §16（2026-07；并把世界规模从 12 城扩到约 75 节点，深度按 `tier` 分章节灌注）
- [ ] 从 136 places 中挑出主干 12 城对应章节，人工切成 36 段
- [ ] 把 136 条按类别落到各表：44 城市 → 城市表；48 省（有治所者升城）→ 地区／城市表；14 路途地形 → 路线表 `encounters`／`hazards`；25 风俗宫廷 → 事件表 court + 图鉴；4 地标 → 探索点
- [x] 建 `glossary.json`（`assets/data/glossary.json`，约 90 条主干用语）
- [x] 主干站中文正文校译（`js/data-lore-zh-trunk.js` 覆盖大不里士→刺桐等；prologue 威尼斯/阿卡另附）
- [ ] 其余 places 全量中译与 36 段细切
- [ ] 从 98 stories 中挑 40 条改写为途中事件
- [ ] 二期：拆解伊本·白图泰语料（选公有领域法译本）
- [x] 隐藏路：`data-secret-paths.js`（`needPath` = `{node}_secret`）+ 地图金线高亮
