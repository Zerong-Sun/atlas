# 缺失贴图清单 · ART TODO（v4.5 · 2026-07-27）

本文件是**唯一的缺口总表**。完成度对照见 [`docs/ART_REQUIREMENTS.md`](../../docs/ART_REQUIREMENTS.md) · 总索引 [`docs/ASSETS_REQUIREMENTS.md`](../../docs/ASSETS_REQUIREMENTS.md)。

**放置**：`assets/art/` 或 `assets/decks/<牌组>/`，文件名=引用名，`.webp`。缺图 → 程序回退/emoji。

**风格**：云岭暮光。见 `ART_BRIEF.md`。透明底须真 alpha（`dealpha.py --apply`）。

**客户端**：**Godot 4.7**（`game/map/map_art.gd`）。PWA 接线表已作废。

---

## ✅ 已有（`assets/art/` 根目录 **650** 张；牌组另计）

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
| `site-*` 大图 | **36** · 含 cambaluc/cotan/lop/zayton · 已接线 |
| `explore-*` | **36** · 已接线 |
| 货币徽 `currency-*` | **5/5** · `MapArt.currency_icon` |
| 结局贴纸 `sticker-*` | **9/9** · `MapArt.sticker_icon` |
| 随从立绘 `retainer-*-{chr,isl}` | **18** · `MapArt.retainer_portrait` 优先 |
| 契约 UI `contract-*` + `seal-wax` | **4** · `HireContract` 签契屏 |
| Chat 变体归档 | **`_archive/chats/`** |

### 🔌 接线 · S1 ✅ 2026-07-26 · S1b ✅ 2026-07-27

**650/650** 经 `MapArt` + `art_wire_index.json` 全部可解析。市集走 `GOODS_ART_MAP.json`。雇佣走 `game/ui/hire_contract.gd`。

---

## ❌ 仍缺出图

### P3 · `scene-region-chr` 重绘（内容错配）

详见 [`docs/ART_REQUIREMENTS.md`](../../docs/ART_REQUIREMENTS.md) §1.1。

| 项 | 值 |
|---|---|
| 文件 | `scene-region-chr.webp` |
| 尺寸 | 1920×1080 WebP |
| 画什么 | 石砌教堂、集市广场、商队客栈（拉丁基督教世界） |
| 禁止 | 圆顶、宣礼塔、骆驼、沙漠主景 |
| 色调 | 暖褐低饱和，对齐其余 band 底板 |

### P1b / P4 · 白图泰六城（玩法已上、图未上）

`delli` · `basora` · `cabul` · `java-major` · `zancibar` · `maldive`

完整氛围与探索题材表见 [`docs/ART_REQUIREMENTS.md`](../../docs/ART_REQUIREMENTS.md) §2.A。

| 类别 | 建议张数 | 状态 |
|---|---|---|
| `city-<id>-entry.webp` | 6 | ❌ 全缺 · 960×540 |
| `site-<id>-{1,2,3}` 或 `explore-*-<id>` | 18 | ❌ · 960×540 |
| 临时回退 | — | ✅ `scene-band-*` + `npc-*-isl` / `load-*` |

> `zancibar` / `maldive` 为规划 id（城市表或尚未入库）；文件名预留给 `MapArt` 自动解析。

### P2 · 打磨资产（不挡发版）

#### A. 易经牌面下半部 · 34 张 ❌

| 项 | 说明 |
|---|---|
| **用途** | 技艺页 / 仪式揭示完整 64 卦 |
| **规格** | 512×768；与 01–30 同框 |
| **命名** | `iching-<NN>-<english-slug>-full.webp` |
| **已有** | **30/64** |
| **Prompt** | [`ART_PROMPTS_ICHING_DECK.md`](ART_PROMPTS_ICHING_DECK.md) |

#### B–C. 货币徽 / 结局贴纸 · ✅ 2026-07-27

已落盘并接线（见上表）。

#### D. 商品独立图标 · 不做新图 ⏭️

[`GOODS_ART_MAP.json`](GOODS_ART_MAP.json) 已映射。

#### P2 数量小结

| 子项 | 缺 |
|---|---|
| 易经 31–64 | **34** |
| **合计建议出图** | **34** + P3(1) + P4(24) |

**出图顺序**：P3 chr 底板 → P4 白图泰入城 6 → 探索 18 → 易经 31–64。

---

## 优先级小结

| 序 | 内容 | 量 |
|---|---|---|
| 1 | ~~Godot 接线~~ | ✅ 650/650 |
| 2 | **chr 底板重绘**（P3） | 1 |
| 3 | **白图泰 6 入城 + 18 探索**（P4） | 24 |
| 4 | P2 易经 31–64 | 34 |
