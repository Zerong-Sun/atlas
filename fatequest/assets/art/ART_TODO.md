# 缺失贴图清单 · ART TODO（v4.0 · 2026-07-25 盘点）

本文件是**唯一的缺口总表**。完整需求与完成度对照见 [`docs/ART_REQUIREMENTS.md`](../../docs/ART_REQUIREMENTS.md)。

**放置规则**：文件放进 `assets/art/`（人物、场景、图标、UI）或 `assets/decks/<牌组>/`（成套牌面），文件名与「引用名」完全一致，格式 `.webp`。缺图时程序自动回退到 SVG 或 emoji，**不会开天窗**。

**统一风格**：13 世纪抄本 × 暮色山野（「云岭暮光」）。详见 `ART_BRIEF.md`。

**透明底**：剪影／图标／立绘必须**带真 alpha 通道**。白底出图后跑 `python3 scripts/dealpha.py --apply`。

---

## ✅ 已有（526 张根目录 + 牌组，不用再画）

### 批量 REQ 管线 · 174/174 全部完成 ✅

| 批次 | 内容 |
|---|---|
| `ART_PROMPTS_REQ.md` | 书案开场、地图底纹/迷雾、城塞小像 12、山脉 6、风神头 4、路线 3 |
| `ART_PROMPTS_REQ_P2` | 六主城 6、band 底板 21、史料卡/对话框 2 |
| `ART_PROMPTS_REQ_P3` | 签占 3、命运九等 9 |
| `ART_PROMPTS_REQ_P4P5` | 罗盘玫瑰、货格 UI 6、职业 NPC 36 |
| `ART_PROMPTS_REQ_EXPLORE` | 探索 POI 小图 36 |
| `ART_PROMPTS_REQ_REMAIN` | 区域板重绘 2、场所 NPC 16 |

### 早期管线 · 核心库存

| 类别 | 数量 | 说明 |
|---|---|---|
| `ic-*` 图标 | 143 | 经 `ART_EMOJI_MAP.json` 全局替换 emoji |
| `ui-*` | 62 | 面板、按钮、货格、史料卡、对话框九宫格等 |
| `map-*` | 54 | 羊皮纸、城塞、山脉、路线、风神头、海怪、罗盘等 |
| `scene-*` | 44 | 具名城 6 + band 21 + region 4 + 旧线 13 |
| `npc-*` | 68 | 守门人 16 + 场所 16 + 职业 36 |
| `explore-*` | 36 | 12 城 × 庙宇/市集/行馆 POI |
| `sym-*` | 42 | 含 `-full` 全幅卡面 |
| `mentor-*` | 10 | 十位师父立绘 |
| `realm-*` | 10 | 占法徽记 |
| `fate-rank-*` | 9 | 命运九等 seal |
| `ritual-lot-*` | 3 | 签筒/签条/抽签 |
| `tr-*` | 12 | 交通小像 |
| `item-*` | 10 | 部分 journey 物品 |
| 塔罗全牌 | 40 | `assets/decks/tarot/` |
| 易经卦牌 | 30 | `assets/decks/iching/`（1–30） |
| 雷诺曼 | 36 | `assets/decks/lenormand/`（Dondorf 扫描） |
| 星盘线稿 | 34 | `assets/astrodice/` |

---

## ⏳ P0 · 新规划必需（**36 张全缺** — 先做这些）

### A. 开场书案（GDD §3）

| 引用名 | 内容 | 尺寸 | 状态 |
|---|---|---|---|
| `book-rubruck.webp` … `book-conti.webp` | 七本游记书封 | 512×700 透明 | ❌ ×7 |
| `desk-parchment.webp` | 书案底图（或扩展 `scene-desk-opening`） | 1920×1080 | ❌ |
| `scene-desk-opening.webp` | 书案开场合成 | 1920×1080 | ✅ |

### B. 导入过场（GDD §3 ②）

11 张循环贴图，**1920×1080 不透明**，暗调、下方 1/4 留给箴言：

`load-port` · `load-desert` · `load-station` · `load-monastery` · `load-mosque` · `load-church` · `load-snowpeak` · `load-steppe` · `load-canal` · `load-bazaar` · `load-seaship`

**状态：❌ 0/11**

### C. 角色生成（GDD §4）

| 引用名 | 内容 | 状态 |
|---|---|---|
| `fate-wheel.webp` | 命格转盘底盘 | ❌ |
| `fate-bar-travel/rapport/wealth.webp` | 三条命运条纹章端头 | ❌ ×3 |
| `culture-latin/islamic/eastasia/steppe/indianocean.webp` | 五文化圈徽记 | ❌ ×5 |
| `faith-latin/orthodox/islam/buddhism/daoism/nestorian/hindu/folk.webp` | 八宗教徽记 | ❌ ×8 |

---

## ⏳ P1 · MVP Polo 走廊十二城（**82 张仍缺** · M2+ 不挡 M0–M1）

> 满配 id：`tabriz baghdad hormuz balkh samarkand kashgar khotan lop shangdu khanbaliq hangzhou quanzhou`（序章 venice/acre）。  
> 场景/NPC/POI 小图标已齐；缺的是**大图插图**与**随从**。M0–M1 用已有图回退。

| 类别 | 数量 | 状态 | 备注 |
|---|---|---|---|
| `city-<id>-entry.webp` | 12 | ❌ | 入城视角 960×540 |
| `site-<id>-{1,2,3}.webp` | 36 | ❌ | 探索点插图（POI **小图标** `explore-*` 已有 ✅） |
| `retainer-<id>.webp` | 18 | ❌ | 随从半身 900×1300 |
| `contract-open/divined/sealed.webp` + `seal-wax.webp` | 4 | ❌ | 招募契约 |
| `scene-badashan/kashgar/dunhuang/kinsay.webp` | 4 | ❌ | 旧名；可复用 band/具名场景 |

**已有可复用**：
- 六主城具名场景 ✅ · band 底板 21 ✅ · 探索 POI 36 ✅ · 职业/场所 NPC 52 ✅ · 师父 10 ✅

---

## ⏳ P2 · 补全与升级（不阻塞开发）

| 引用名 | 数量 | 状态 | 备注 |
|---|---|---|---|
| `decks/iching/iching-31..64-*-full.webp` | 34 | ❌ | 易经下半部 |
| `goods-*.webp` | — | ✅ **已映射** → `GOODS_ART_MAP.json`（61 项复用 `ic-*`/`item-*`） |
| `currency-ducat/dinar/dirham/cash/sycee.webp` | 5 | ❌ | 五种货币 |
| `sticker-*.webp` | 未定 | ❌ | 纪念贴纸 |
| `role-*` 职业徽记 | — | ⏭️ 跳过 | 已有 `npc-job-*` 半身像 |
| `map-*` / `tr-*` / `realm-*` 等 | — | ✅ | 已交付，待代码接线 |

---

## 接线待办（非新素材，让已有图进游戏）

| 动作 | 素材 |
|---|---|
| ✅ 市集/背包 → `GOODS_ART_MAP.json` + `FQ.goodsArt()` | 61 商品 + 7 工具/信物 |
| `MENTOR_FACE` → `mentor-*` | 10 |
| `map.js` → `map-vellum-tile` / `map-fog-ink` / 新城塞/路线/风神头 | ~40 |
| 城市探索 UI → `explore-*` + 新场所 NPC | 52 |
| 角色抽取 → `fate-rank-*` | 9 |
| 签占 → `ritual-lot-*` | 3 |
| 库存 → `ui-slot-*` / `ui-bag-panel` | 6 |
| 史料/对话框 → `ui-lore-card` / `ui-dialog-nine` | 2 |

---

## 优先级小结

| 阶段 | 内容 | 张数 |
|---|---|---|
| **先画 P0** | 书封 7 + 过场 11 + 角色生成 17 + 书案底 1 | **≈36** |
| **再画 P1** | 入城 12 + 探索插图 36 + 随从 18 + 契约 4 + 旧场景 4 | **≈82** |
| **P2 随内容** | 易经 34 + 商品 60 + 货币 5 + 贴纸 | **≈99+** |
| **并行** | 代码接线（零新图） | 526 张待用 |
