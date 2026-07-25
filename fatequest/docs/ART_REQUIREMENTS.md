# 美术素材需求 · ART REQUIREMENTS

**2026-07-25 盘点更新。** 本文是 v3.0《远行之书》的素材总需求与完成度对照；批量生成清单见 `assets/art/ART_PROMPTS_REQ*.md`，缺口摘要见 `assets/art/ART_TODO.md`。

---

## 0. 实测汇总（2026-07-25）

| 位置 | 数量 | 说明 |
|---|---|---|
| `assets/art/*.webp` | **526** | 根目录贴图（不含 `_archive/`、`_sheets/`） |
| `assets/decks/tarot/` | 40 | 大/小阿卡纳 `-full` 牌面 |
| `assets/decks/iching/` | 30 | 卦 1–30（缺 31–64） |
| `assets/decks/lenormand/` | 36 | Dondorf 公版扫描（jpg） |
| `assets/astrodice/` | 34 | 行星/星座/宫位 SVG 线稿 |
| `ART_PROMPTS_REQ*.md` 批次 | **174/174 ✅** | P0 地图 + P2 场景 + P3 签占/命格 + P4/P5 UI/职业 NPC + 探索 POI + 区域/NPC 补绘 |

**放置规则**：文件名与代码「引用名」完全一致，格式 `.webp`，放进 `assets/art/` 或 `assets/decks/<牌组>/`。缺图时程序回退 SVG/emoji，不会开天窗。

**风格**：13 世纪抄本 × 暮色山野（「云岭暮光」）。详见 `assets/art/ART_BRIEF.md`。

**透明底**：剪影/图标/立绘须带真 alpha；白底出图后跑 `python3 scripts/dealpha.py --apply`。

---

## 1. 批量 REQ 管线 · 已全部交付 ✅

以下文件由 `ART_PROMPTS_REQ*.md` 定义，经 `scripts/orchestrate_req.py` 生成，**174 项均已落盘**：

| 批次文件 | 内容 | 数量 |
|---|---|---|
| `ART_PROMPTS_REQ.md` | 书案开场、羊皮纸/迷雾、城塞小像 12、山脉 6、风神头 4、路线笔触 3 | 27 |
| `ART_PROMPTS_REQ_P2.md` + `P2_REMAIN.md` | 六主城场景 6、band 底板 21、史料小卡 + 对话框九宫格 2 | 29 |
| `ART_PROMPTS_REQ_P3.md` | 签筒/签条/抽签 3、命运九等徽记 9 | 12 |
| `ART_PROMPTS_REQ_P4P5.md` | 罗盘玫瑰、货格 UI 6、9 职业 × 4 文化 NPC 36 | 43 |
| `ART_PROMPTS_REQ_EXPLORE.md` | 12 城 × 庙宇/市集/行馆 POI 小图 | 36 |
| `ART_PROMPTS_REQ_REMAIN.md` | 区域板重绘 2、码头/官吏/医者/书记 NPC 16 | 18 |
| **小计** | | **174** |

---

## 2. 早期管线 · 已有（REQ 之外）

| 类别 | 数量 | 前缀/路径 | 接线状态 |
|---|---|---|---|
| 全局图标 | 143 | `ic-*` | ✅ `ART_EMOJI_MAP.json` + `juice.js` |
| 塔符号 | 42 | `sym-*`（含 `-full`） | ✅ 命途塔 / 占卜 UI |
| UI 套件 | 62 | `ui-*` | ⚠️ 部分已用，货格/史料卡待接 |
| 地图装饰 | 54 | `map-*` | ⚠️ `map.js` 仍混用 SVG 回退 |
| 场景 | 44 | `scene-*`（含 21 band + 4 region + 具名城） | ✅ `data-scenes.js` → `scene.js` |
| 城市守门人 | 16 | `npc-{inn,market,tea,temple}-{chr,isl,con,mazu}` | ✅ `data-scenes.js` KEEPERS |
| 场所/职业 NPC | 52 | `npc-dock/official/healer/scribe-*` + `npc-job-*` | ⏳ 待 v3 城市探索接入 |
| 探索 POI | 36 | `explore-{temple,market,inn}-<city>` | ⏳ 待城市视图标牌 |
| 交通小像 | 12 | `tr-*` | ⏳ 可选（现有 `ic-travel-*` 可顶替） |
| 师父立绘 | 10 | `mentor-*` | ✅ 可接（替换 `MENTOR_FACE` 借位） |
| 占法徽记 | 10 | `realm-*` | ✅ `ART_EMOJI_MAP.json` |
| 物品图标 | 10 | `item-*` | ⏳ 待商品表映射 |
| 命运九等 | 9 | `fate-rank-*` | ⏳ 待角色抽取 UI |
| 签占 | 3 | `ritual-lot-*` | ⏳ 待签占仪式 UI |
| 流派/模式 | 7 | `arch-*` `mode-*` `card-back*` | ✅ 主页 / 塔 |
| 雷诺曼 | 36 | `assets/decks/lenormand/*.jpg` | ✅ 沙龙 |
| 塔罗 | 40 | `assets/decks/tarot/*-full.webp` | ✅ 仪式 |
| 易经 | 30 | `assets/decks/iching/1–30` | ⚠️ 缺 31–64 |

> `ART_CATALOG.json` 仍标注 363 条（2026-07 旧快照）。全量重建：`python3 scripts/build_art_catalog.py`

---

## 3. 仍缺素材（按阻塞程度）

### ⛔ P0 · 阻塞开场三拍（36 张，未启动）

| 素材 | 数量 | 规格 | 用途 |
|---|---|---|---|
| `book-{rubruck,polo,battuta,odoric,zhenghe,tafur,conti}.webp` | 7 | 512×700 透明 | 七本游记书封 |
| `desk-parchment.webp` | 1 | 1920×1080 不透明 | 书案底（或用现有 `scene-desk-opening` 扩展） |
| `load-{port,desert,station,monastery,mosque,church,snowpeak,steppe,canal,bazaar,seaship}.webp` | 11 | 1920×1080 不透明 | 导入过场循环 |
| `fate-wheel.webp` + `fate-bar-{travel,rapport,wealth}.webp` | 4 | 透明 | 命格转盘与三条命运条端头 |
| `culture-{latin,islamic,eastasia,steppe,indianocean}.webp` | 5 | 512×512 透明 | 五文化圈徽记 |
| `faith-{latin,orthodox,islam,buddhism,daoism,nestorian,hindu,folk}.webp` | 8 | 512×512 透明 | 八宗教身份徽记（器物意象，不画神明） |

> 书案单图 `scene-desk-opening.webp` ✅ 已有，可作 MVP 合成底；七书封与过场仍缺。

### 🔶 P1 · MVP 十二城体验（82 张）

| 素材 | 数量 | 说明 |
|---|---|---|
| `city-<id>-entry.webp` | 12 | 入城视角 960×540 |
| `site-<id>-{1,2,3}.webp` | 36 | 探索点插图 960×540 |
| `retainer-<id>.webp` | 18 | 随从半身立绘 900×1300 |
| `contract-{open,divined,sealed}.webp` + `seal-wax.webp` | 4 | 招募契约纸 |
| `scene-{badashan,kashgar,dunhuang,kinsay}.webp` | 4 | 旧规划城名（新主干可复用 band/具名场景） |

**已有、可直接复用**：
- 六主城具名场景 ✅（`scene-baldacum-river` 等）
- 21 张 band 通用底板 ✅
- 36 张探索 **POI 小图标** ✅（`explore-*`，非插图）
- 52 张场所/职业 NPC ✅
- 10 张师父立绘 ✅

### 🔷 P2 · 内容扩充（不阻塞骨架）

| 素材 | 数量 | 说明 |
|---|---|---|
| `assets/decks/iching/iching-31..64-*-full.webp` | 34 | 易经下半部 |
| `goods-<id>.webp` | 60 | 商品图标（**已建 `GOODS_ART_MAP.json` ↔ `ic-*`/`item-*`，零新图**） |
| `currency-{ducat,dinar,dirham,cash,sycee}.webp` | 5 | 五种货币 |
| `sticker-*.webp` | 未定 | 纪念贴纸（按城市/食物/路线分类） |
| `role-*` 职业徽记 | 0 | **已由 `npc-job-*` 半身像替代**，单独 512 徽记可不做 |

---

## 4. 内容复核（人眼）

| 素材 | 状态 |
|---|---|
| `scene-region-isl.webp` | ✅ 已重绘（2026-07 REQ_REMAIN） |
| `scene-region-chr.webp` | ✅ 已重绘 |
| 错配旧版 | 归档于 `_archive/scene-region-*-wrong-content.webp` |

---

## 5. 接线优先级（让已生成素材进游戏）

| 优先级 | 动作 | 涉及素材 |
|---|---|---|
| 1 | 师父对话改用 `mentor-*` | 10 张 |
| 2 | 地图层改用 `map-vellum-tile` / `map-fog-ink` / `map-city-*-{s,m,l}` / `map-route-*` / `map-wind-*` / `map-rose` | ~40 张 |
| 3 | 城市探索 UI 接 `explore-*` POI + `npc-dock/official/healer/scribe-*` | 52 张 |
| 4 | 角色抽取 UI 接 `fate-rank-*` | 9 张 |
| 5 | 签占仪式接 `ritual-lot-*` | 3 张 |
| 6 | 市集/库存接 `ui-slot-*` `ui-bag-panel` `ui-cargo-tag` | 6 张 |
| 7 | 史料卡接 `ui-lore-card` / 对话框接 `ui-dialog-nine` | 2 张 |
| 8 | `ic-*` 143 张接商品/图鉴映射表 | 见 §3 P2 |

---

## 6. 生成工具链

```bash
cd fatequest/scripts
.venv/bin/python orchestrate_req.py --prompts-file ../assets/art/ART_PROMPTS_REQ.md --skip-existing
.venv/bin/python crop_contact_sheet.py   # 分切 contact sheet
.venv/bin/python dealpha.py --apply      # 抠白底
python3 build_art_catalog.py             # 刷新 ART_CATALOG.json
```

---

## 7. 缺口数量小结

| 优先级 | 类别 | 缺 | 已有 |
|---|---|---|---|
| **P0** | 开场/过场/角色生成 UI | **36** | 1（`scene-desk-opening`） |
| **P1** | 城市场景/探索/随从 | **82** | 115+（场景/NPC/POI/师父） |
| **P2** | 易经/商品/货币/贴纸 | **99+** | 526 根目录 + 牌组 |

**下一批建议先画 P0（36 张）**，否则 GDD §3 开场三拍无法成立；P1 城市插图与随从可并行；P2 随 `goods.json` 与图鉴系统落地再补。

---

## 8. M0–M1 与美术（2026-07 PWA 迁移）

**M0–M1 不阻塞于新图**：UI 使用已有 `scene-*` / `explore-*` / `npc-*` / `mentor-*` / `ic-*`，缺则 emoji/SVG 回退。

| 阶段 | 美术要求 |
|------|----------|
| M0–M1（当前） | 接线优先（§5）；P0/P1 **记入缺口、不挡发版** |
| M2+ | 补齐 P0 开场三拍 → P1 Polo 十二城入城/探索插图与随从 → P2 |

Polo 走廊满配城 id（与 `cities.json` 一致）：  
`tabriz baghdad hormuz balkh samarkand kashgar khotan lop shangdu khanbaliq hangzhou quanzhou`。  
P1 的 `city-<id>-entry` / `site-<id>-*` 应按此 id 命名，而非旧 GDD 的开罗/麦加列表。

命途塔相关 `sym-*` / `arch-*` 仍保留资产；**塔模式已退出主路径**（见 `archive/v2-pwa/`）。
