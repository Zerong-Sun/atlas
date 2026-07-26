# 美术素材需求 · ART REQUIREMENTS

**2026-07-26 盘点更新（M0–M3 后）。** v3.0《远行之书》素材总需求与完成度对照；缺口摘要见 [`assets/art/ART_TODO.md`](../assets/art/ART_TODO.md)。批量生成清单见 `assets/art/ART_PROMPTS_REQ*.md`。

---

## 0. 实测汇总（2026-07-26）

| 位置 | 数量 | 说明 |
|---|---|---|
| `assets/art/*.webp` | **580** | 根目录贴图（不含 `_archive/`、`_sheets/`） |
| `assets/decks/tarot/` | 40 | 大/小阿卡纳 `-full` |
| `assets/decks/iching/` | 30 | 卦 1–30（仍缺 31–64） |
| `assets/decks/lenormand/` | 36 | Dondorf 公版扫描（jpg） |
| `assets/astrodice/` | 34 | 行星/星座/宫位 SVG |
| `ART_PROMPTS_REQ*.md` 批次 | **174/174 ✅** | 早期批量管线已全部落盘 |

**放置规则**：文件名与代码「引用名」一致，`.webp`，放进 `assets/art/` 或 `assets/decks/<牌组>/`。缺图回退 SVG/emoji。

**风格**：13 世纪抄本 × 暮色山野（「云岭暮光」）。见 `assets/art/ART_BRIEF.md`。

**命名注意**：磁盘上大量入城图仍用**旧游记拼写**（`tauris`/`baldacum`/`cambaluc`…），游戏表用 **Polo id**（`tabriz`/`baghdad`/`khanbaliq`…）。接线须建别名表，勿假定文件名=表 id。

---

## 1. 与里程碑的关系

| 阶段 | 状态 | 美术要求 |
|------|------|----------|
| **M0–M1** | ✅ 已交付 | 可玩不挡新图；emoji/SVG 回退 |
| **M2** | ✅ 仪式五拍可玩 | `ritual-lot-*` / 星骰资产**接线优先**；不全量新图 |
| **M3** | ✅ 白图泰六城 + 图鉴文 | 白图泰城**尚无专用贴图**；可暂用 `scene-band-*` / `npc-*-isl` |
| **M4** | ⏳ 打磨 | P0 残缺信仰徽、P1 大图/随从、Battuta 城专图、正式接线 |

---

## 2. 批量 REQ 管线 · 已交付 ✅

| 批次 | 内容 | 数量 |
|---|---|---|
| `ART_PROMPTS_REQ.md` | 书案/迷雾/城塞/山脉/风神/路线 | 27 |
| `ART_PROMPTS_REQ_P2` + remain | 六主城场景、band、史料卡/对话框 | 29 |
| `ART_PROMPTS_REQ_P3` | 签占、命运九等 | 12 |
| `ART_PROMPTS_REQ_P4P5` | 罗盘、货格 UI、职业 NPC | 43 |
| `ART_PROMPTS_REQ_EXPLORE` | 12 城 × 庙/市/馆 POI | 36 |
| `ART_PROMPTS_REQ_REMAIN` | 区域板、场所 NPC | 18 |
| **小计** | | **174** |

---

## 3. 库存分类与接线状态

| 类别 | 约数 | 接线状态（相对 v3 主路径） |
|---|---|---|
| `ic-*` | 143 | ✅ `ART_EMOJI_MAP` / `juice.js` |
| `sym-*` | 42 | ✅ 占卜 UI（塔模式已归档，资产保留） |
| `ui-*` | 62 | ⚠️ 货格/史料卡待接 v3 市集/图鉴 |
| `map-*` | 54 | ⏳ 旧 `map.js` 已归档；v3 雾地图为 pill UI，未接羊皮纸层 |
| `scene-*` | 44+ | ✅ `data-scenes.js`；具名城可作入城回退 |
| `npc-*` | 68+ | ⏳ 守门人已用；场所/职业 NPC 待接 city hub |
| `explore-*` | 36 | ⏳ 文件齐；city 探索 UI **未挂标牌** |
| `mentor-*` | 10 | ⏳ 可替换 `MENTOR_FACE` |
| `realm-*` | 10 | ✅ |
| `tr-*` | 12 | ⏳ 出行 UI 可选 |
| `item-*` / `GOODS_ART_MAP` | 10+61 | ⚠️ 商品映射已有，v3 市集行待统一调用 |
| `fate-rank-*` | 9 | ⏳ chargen 待接 |
| `ritual-lot-*` | 3 | ⏳ `ritual.js` 签法微操待挂图 |
| 塔罗 / 雷诺曼 / 易经 1–30 | 40+36+30 | ✅ 技艺页仪式 |
| **开场 P0 主体** | 见 §4 | ✅ **多数已落盘**（2026-07 后补） |

---

## 4. 缺口（按阻塞 · 2026-07-26 实测）

### 4.1 原 P0 · 开场三拍 — **大部分已有文件**

| 素材 | 需求 | 磁盘 | 备注 |
|---|---|---|---|
| `book-{rubruck,polo,battuta,odoric,zhenghe,tafur,conti}.webp` | 7 | **7/7 ✅** | 待书案 UI 接线 |
| `desk-parchment.webp` | 1 | ✅ | 另有 `scene-desk-opening.webp` |
| `load-*.webp`（11 主题） | 11 | **11/11 ✅** | 待导入过场循环接线 |
| `fate-wheel` + `fate-bar-*` | 4 | **4/4 ✅** | 待 chargen 接线 |
| `culture-*`（5） | 5 | **5/5 ✅** | 待身份 UI |
| `faith-*`（8） | 8 | **4/8** | 缺：`daoism` `nestorian` `hindu` `folk` |

**P0 真正还缺画：4 张信仰徽。** 其余是 **接线（M4）**，不是出图。

### 4.2 P1 · Polo 走廊体验大图

| 素材 | 需求 | 磁盘 | 备注 |
|---|---|---|---|
| `city-<id>-entry.webp` | 12（表 id） | **12 张入城图已有，多为旧拼写名** | 见下方别名；缺表 id 直出的 `shangdu`/`hangzhou` 文件名（有 `scene-shangdu-palace` / `scene-hangzhou-lake` / `scene-kinsay` 可回退） |
| `site-<id>-{1,2,3}.webp` | 36 | **6/36**（仅 venice/acre） | 满配城仍靠 `explore-*` 小图标 |
| `retainer-<id>.webp` | ~18–22 | **0** | 可用 `npc-job-*` / `mentor-*` 顶替 |
| `contract-*` + `seal-wax` | 4 | **0** | 招募 UI 可纯 CSS |
| `explore-*` POI | 36 | **36 ✅** | 待挂到探索按钮 |

**入城图文件名 ↔ 表 id（接线表）**

| 表 id | 现有文件（示例） |
|------|------------------|
| venice / acre | `city-venice-entry` / `city-acre-entry` |
| tabriz | `city-tauris-entry` |
| baghdad | `city-baldacum-entry` |
| hormuz | `city-hormos-entry` |
| balkh | `city-balc-entry` |
| samarkand | `city-samarcanda-entry` |
| kashgar | `city-cascar-entry` |
| khotan | `city-cotan-entry` |
| lop | `city-lop-entry` |
| khanbaliq | `city-cambaluc-entry` |
| quanzhou | `city-zayton-entry` |
| shangdu / hangzhou | 无 `city-*-entry` → 用 `scene-shangdu-palace` / `scene-hangzhou-lake` 或 `scene-kinsay` |

### 4.3 P1b · 白图泰六城（M3 内容已上线）

| 城 id | 专用入城/探索图 | 建议回退 |
|------|-----------------|----------|
| tangier cairo damascus mecca delhi calicut | **0/6** | `scene-band-*`（伊斯兰/印度洋）+ `npc-*-isl` + 通用 `load-mosque` / `load-bazaar` |

**M4 应补**：6×入城 + 18×site（或先做 6 入城 + 复用 explore 风格 POI）。

### 4.4 P2 · 不阻塞

| 素材 | 数量 | 状态 |
|---|---|---|
| 易经 31–64 | 34 | ❌ |
| 货币 `currency-*` | 5 | ❌ |
| 贴纸 `sticker-*` | 未定 | ❌（结局已有 sticker id，可先 emoji） |
| 商品独立 `goods-*` | — | ⏭️ 已用 `GOODS_ART_MAP.json` |

---

## 5. 接线优先级（零新图 / 少新图）

| 序 | 动作 | 素材 |
|---|---|---|
| 1 | chargen 接 `fate-rank-*` / `fate-wheel` / `culture-*` / `faith-*` | 已有 |
| 2 | 书案/标题接 `book-*` + `desk-parchment` | 已有 |
| 3 | 入城/探索接 `city-*-entry` 别名表 + `explore-*` | 已有 |
| 4 | 导师/市集接 `mentor-*` + `ui-slot-*` + goods map | 已有 |
| 5 | 签占仪式接 `ritual-lot-*`；星骰接 `assets/astrodice/` | 已有 |
| 6 | 过场循环接 `load-*` | 已有 |
| 7 | 白图泰临时 band/npc 回退 → 再画专图 | 回退先做 |
| 8 | 补 4 张缺失 `faith-*` | **需出图** |

---

## 6. 生成工具链

```bash
cd fatequest/scripts
.venv/bin/python orchestrate_req.py --prompts-file ../assets/art/ART_PROMPTS_REQ.md --skip-existing
.venv/bin/python dealpha.py --apply
python3 build_art_catalog.py   # 刷新 ART_CATALOG.json（仍可能是旧快照）
```

---

## 7. 缺口数量小结（修订）

| 优先级 | 类别 | 仍缺出图 | 已有待接线 |
|---|---|---|---|
| **P0** | 信仰徽残缺 | **4** | 书封/过场/命轮/文化 ≈32 张待接 |
| **P1** | Polo site 大图 / 随从 / 契约 | **≈52** | 入城别名 12 + explore 36 + scene 回退 |
| **P1b** | 白图泰城专图 | **≈24**（先 6 入城亦可） | isl band/npc 回退 |
| **P2** | 易经下半 / 货币 / 贴纸 | **≈40+** | 商品映射已完成 |

**下一批建议**：① 接线表（别名 + chargen/书案/explore）；② 补 4 信仰徽；③ 白图泰 6 入城；④ Polo `site-*` 大图与随从。
