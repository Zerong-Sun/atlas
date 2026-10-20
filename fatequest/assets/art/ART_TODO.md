# 美术待办 当前基线 2026 10 20

本轮核对以 [ART_AUDIT_2026-10-20.md](../../docs/library_audit/ART_AUDIT_2026-10-20.md) 和 [art_inventory.csv](../../docs/library_audit/art_inventory.csv) 为准。没有生成新美术，以下是待执行任务。现有看图结论为代理视觉抽检，以SHA256绑定；换图须复查，另需人类美术与史实审阅签署。

| 优先级 | 当前待办 | 数量或边界 | 验收 |
| --- | --- | --- | --- |
| P0 | 易经爻位掩码与文王序匹配 | 当前全阴0回退、全阳63误显既济 | 64掩码逐一核对，0→坤2、63→乾1，正文/图名/变卦一致 |
| P0 | 保持错误人像隔离 | 角色/事件显式审查绑定；不是按slot猜人 | 人像80项回归通过，错误多人/跨文化/性别图不得回流 |
| P1 | 关键人物专属图 | 城门搬运工、解签老妇、法兰克遗孀优先；44/54随从目前无肖像 | 正文身份、性别、年龄、服饰/道具一致，单人且跨事件稳定 |
| P1 | 多人/多场景组图拆分或重做 | 具体已确认文件见审计；`mentor-tarot`仍错配 | 不把组图直接当单人头像或单场景背景；重新逐项绑定 |
| P1 | 易经31–64正式图 | 34占位文件已齐；43/44中文名缺失、侧注裁切 | 六爻与中文名正确，缩略图可读，无占位字样 |
| P1 | 塔罗完整牌面 | 40/78正式WebP，仍缺38；test.jpg不计数 | 补齐ID、专用加载器和正逆位/缺图回归 |
| P1 | 雷诺曼和占星骰接入决策 | 36JPG与34SVG已存在，现运行页未加载 | 实际牌/符号逐项对应；若只留资料库须明确标注 |
| P1 | 逐城市场景绑定与审阅 | 18入城、54site、36explore、48scene需按语义核对 | 无未拆组图；明确eventId→场景；通用回退不冒充专属场景 |
| P2 | 其他图标/UI/卡框/来源审阅 | CSV未视觉抽检项 | 实际显示尺寸检查，来源核对，无裁切、错误符号或误导身份 |

旧con/mazu随从命名矩阵仍缺18路径，列在CSV里，但现在应先明确角色身份再决定出图数量与文件名。不得把18、44无肖像、多人待拆数量直接相加估价，它们互有重叠。

根目录674 WebP全部存在；归档129与源组图58另列，不计交付完成率。**“674/674全部接线”仅是旧索引扫描，已撤销作为运行验收结论。** 解码成功不等于内容正确或质量合格。

## 历史版本 v4 6 保留记录

> 下文保留2026-07/08原计划。“唯一缺口总表”“已接线”“0缺失”等历史状态不再适用，以本页当前基线及新审计为准。

# 缺失贴图清单 · ART TODO（v4.6 · 2026-07-30）

本文件是**唯一的缺口总表**。完成度对照见 [`docs/ART_REQUIREMENTS.md`](../../docs/ART_REQUIREMENTS.md) · 总索引 [`docs/ASSETS_REQUIREMENTS.md`](../../docs/ASSETS_REQUIREMENTS.md)。

**放置**：`assets/art/` 或 `assets/decks/<牌组>/`，文件名=引用名，`.webp`。缺图 → 程序回退/emoji。

**风格**：云岭暮光。见 `ART_BRIEF.md`。透明底须真 alpha（`dealpha.py --apply`）。

**客户端**：**Godot 4.7**（`game/map/map_art.gd`）。PWA 接线表已作废。

---

## ✅ 已有（`assets/art/` 根目录 **674** 张；牌组另计）

### 批量 REQ · 174/174 ✅

（同 `ART_REQUIREMENTS.md`）

### 2026-07 后补 · 原 P0 主体已落盘 ✅

| 类别 | 状态 |
|---|---|
| 七书封 `book-*` | **7/7** · 已接线 |
| `desk-parchment` + `scene-desk-opening` | ✅ 已接线书案 |
| 过场 `load-*` | **11/11** · `MapArt.transit_scene` |
| `fate-wheel` + `fate-bar-*` | **4/4** · chargen / HUD |
| `culture-*` / `faith-*` | **5+8** · 已接线 |
| Polo 入城图 | **12** · 已接线 |
| `site-*` 大图 | **54** · Polo 36 + 白图泰 18 · 已接线 |
| `explore-*` | **36** · 已接线 |
| 货币徽 `currency-*` | **5/5** · `MapArt.currency_icon` |
| 结局贴纸 `sticker-*` | **9/9** · `MapArt.sticker_icon` |
| 随从立绘 `retainer-*-{chr,isl}` | **18** · `MapArt.retainer_portrait` 优先 |
| 契约 UI `contract-*` + `seal-wax` | **4** · `HireContract` 签契屏 |
| 白图泰入城 `city-*-entry` | **6/6** · delli/basora/cabul/java-major/zancibar/maldive · 已接线 |
| `scene-region-chr` 重绘 | ✅ 2026-07-30 · 拉丁基督教世界 |
| Chat 变体归档 | **`_archive/chats/`** |

### 🔌 接线 · S1 ✅ 2026-07-26 · S1b ✅ 2026-07-27 · S1c ✅ 2026-07-30

**674/674** 经 `MapArt` + `art_wire_index.json` 全部可解析。市集走 `GOODS_ART_MAP.json`。雇佣走 `game/ui/hire_contract.gd`。

---

## ❌ 仍缺出图

### ~~P3 · `scene-region-chr` 重绘~~ ✅ 2026-07-30

旧错配图备份：`_archive/scene-region-chr-before-p3-redraw-20260730.webp`。Prompt：[`ART_PROMPTS_REQ_P3_CHR_REDRAW.md`](ART_PROMPTS_REQ_P3_CHR_REDRAW.md)。

### ~~P1b / P4 · 白图泰六城~~ ✅ 2026-07-30

`delli` · `basora` · `cabul` · `java-major` · `zancibar` · `maldive`

| 类别 | 张数 | 状态 |
|---|---|---|
| `city-<id>-entry.webp` | 6 | ✅ |
| `site-<id>-{1,2,3}.webp` | 18 | ✅ |

Prompt：[`ART_PROMPTS_REQ_P4_IBBATUTA.md`](ART_PROMPTS_REQ_P4_IBBATUTA.md)。

### P2 · 打磨资产（不挡发版）

#### A. 易经牌面下半部 · 34 张 🟡 占位符已补齐

| 项 | 说明 |
|---|---|
| **用途** | 技艺页 / 仪式揭示完整 64 卦 |
| **规格** | 512×768；与 01–30 同框 |
| **命名** | `iching-<NN>-<english-slug>-full.webp` |
| **已有** | **64/64**（01–30 正式图；31–64 暂为程序占位符，待正式出图替换） |
| **接线** | ✅ `MapArt.hexagram_face()` + `symbol_texture` 优先牌面；`smoke_iching_deck.gd` 回归 |
| **Prompt** | [`ART_PROMPTS_ICHING_DECK.md`](ART_PROMPTS_ICHING_DECK.md) · 续跑 [`ART_PROMPTS_ICHING_REMAIN.md`](ART_PROMPTS_ICHING_REMAIN.md) |
| **替换** | `python3 scripts/gen_iching_placeholders.py` 生成的占位符，正式图落盘同名覆盖即可 |

#### B–C. 货币徽 / 结局贴纸 · ✅ 2026-07-27

已落盘并接线（见上表）。

#### D. 商品独立图标 · 不做新图 ⏭️

[`GOODS_ART_MAP.json`](GOODS_ART_MAP.json) 已映射。

#### P2 数量小结

| 子项 | 缺 |
|---|---|
| 易经 31–64（正式图） | 34 张占位符已补齐，正式出图待跑 |
| **合计建议出图** | **34** |

**出图顺序**：易经 31–64 正式出图（当前以占位符运行）。

---

## 优先级小结

| 序 | 内容 | 量 |
|---|---|---|
| 1 | ~~Godot 接线~~ | ✅ 674/674 |
| 2 | ~~chr 底板重绘（P3）~~ | ✅ |
| 3 | ~~白图泰 6 入城 + 18 探索（P4）~~ | ✅ |
| 4 | P2 易经 31–64 | 占位符 ✅ 2026-08-02；正式出图待跑 |
