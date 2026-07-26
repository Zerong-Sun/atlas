# 美术素材需求 · ART REQUIREMENTS

**2026-07-26 按合并后素材实测更新。** 每条素材标注四种状态之一，由
`tools/art/audit.py` 机器判定，不靠记忆：

| 状态 | 含义 |
|---|---|
| ✅ **完好** | 文件存在、可解码、无缺陷 |
| ⚠️ **棋盘格** | 编辑器的透明棋盘被烘焙成实际像素（alpha 通道本身正确，粗查发现不了） |
| ❌ **损坏** | 无法解码／全透明／尺寸退化 |
| **已接线** | `game/` `core/` `content/` 中确有引用 |

```bash
python3 tools/art/audit.py           # 汇总
python3 tools/art/audit.py --md      # 需关注项的表格
python3 tools/art/audit.py --unused  # 未接线清单
python3 tools/art/strip_checker.py --write --glob 'assets/art/*.webp'   # 修棋盘格
```

---

## 0. 实测汇总

```
根目录 assets/art/*.webp   600 张 · ✅ 完好 600 · ⚠️ 棋盘格 0 · ❌ 损坏 0
  _archive/（Chat 变体）   128 张 · 生产图之外的安全备份，勿删
  _sheets/（组图原片）       58 张
Godot 运行时接线             57 张（map_art.gd 动态模式）
audit.py 字面量扫描          25 张（低估动态引用；以 57 为准）
未接线                       543 张
```

总索引：[`ASSETS_REQUIREMENTS.md`](ASSETS_REQUIREMENTS.md)

**2026-07-23 修复记录**：

| 缺陷 | 数量 | 处理 |
|---|---|---|
| 棋盘格烘焙进像素 | **169** | `strip_checker.py` 全量清除并目视复核 |
| 路线笔触墨迹仅占画布 7–12/96 行，拉伸后不可见 | 3 | 裁到墨迹范围 |

> ⚠️ **生成管线未修**：新素材仍会带棋盘格。**每次生成后必须跑 `audit.py`。**

---

## 1. 内容错配（需重绘，非缺失）

| 素材 | 问题 | 现状 |
|---|---|---|
| `scene-region-isl.webp` | 旧图是中国湖景 | ✅ 已重绘为西亚城郭与商队 |
| `scene-region-chr.webp` | 仍是西亚圆顶、宣礼塔与骆驼，不是拉丁基督教世界 | 由 `MapArt.CITY_SCENE` 优先取具名场景绕开，待重绘 |

这两张是**内容错误不是技术缺陷**——文件完好，画错了对象。机器查不出来，只能人看。

---

## 2. 仍缺的素材（按阻塞程度）

| # | 素材 | 数量 | 规格 | 阻塞 |
|---|---|---|---|---|
| 2.1 | `scene-region-chr.webp` 重绘 | 1 | 1920×1080 WebP，暖褐低饱和 | 拉丁世界通用底板内容错配 |
| 2.2 | 白图泰六城入城图 | 6 | 960×540 WebP | 目前用 band 底板回退 |
| 2.3 | 白图泰六城探索图 | 18 | 960×540 WebP | 目前用通用场所图回退 |
| 2.4 | 易经 31–64 牌面 | 34 | 512×768 WebP | 非阻塞，使用卦符回退 |
| 2.5 | 货币徽 | 5 | 256×256 透明 WebP | HUD 打磨 |
| 2.6 | 结局贴纸 | 9 | 256×256 透明 WebP | 收尾打磨 |

六主城具名场景、罗盘玫瑰、签筒／签条、命运九等徽、史料小卡、36 张职业 NPC
立绘与货格 UI 均已交付；当前主要问题是接线而不是缺图。

---

## 3. 故事与互动所需素材

城市探索（`game/screens/city_view.gd`）已有场所立绘，并新增码头工／官吏／医者／
书记与 9 职业 × 4 文化的通用立绘。要让 102 城进一步减少重复，需要：

| # | 素材 | 数量 | 说明 |
|---|---|---|---|
| 3.1 | 场所立绘扩充 | ✅ +16 | **码头工／官吏／医者／书记** × 4 文化已到位，待接线 |
| 3.2 | 物品弹窗图 | 约 60 | 商品各一，`ic-*` 143 张中应有可复用 |
| 3.3 | 探索点小图 | ✅ 36 | 12 主城 × 3 已到位，待接线 |

> **3.2 优先**：143 张 `ic-*` 图标尚未接线，先做**图标↔商品 id 的映射表**再决定要不要新绘——很可能大部分能复用。

---

## 4. Godot 已接线清单（`game/map/map_art.gd` · 2026-07-26）

| 素材 | 数量 | 用途 |
|---|---|---|
| `map-vellum-tile` · `map-fog-ink` | 2 | 地图底与迷雾 shader |
| `map-city-{chr,con,isl,mazu}-{s,m,l}` | 12 | 城塞小像 |
| `map-mtn-*` · `map-route-*` · `map-dune` · `map-wind-*` | 16 | 山脉/路线/沙丘/风神 |
| `scene-*` 具名 + `scene-region-{chr,con,mazu}` | 13 | 城市探索背景 |
| `npc-{inn,market,tea,temple}-{chr,con,isl,mazu}` | 16 | 场所立绘 |

**文件在盘、Godot 未接**（优先接线）：`explore-*` 36 · `site-*` 22 · `load-*` 11 · `book-*` 7 · `fate-*`/`culture-*`/`faith-*` chargen · `mentor-*` 10 · `npc-job-*` 36 · `ic-*` 143 · `ui-*`/`sym-*` · 其余 map 饰件。

> 旧 PWA 接线（`js/art-map.js`）已归档；**现行客户端只有 Godot**。

---

## 5. 未接线的 543 张（根目录）

| 前缀 | 数量 | 何时接 |
|---|---|---|
| `ic-*` | 143 | 市集与图鉴（见 §3.2；接 `GOODS_ART_MAP.json`） |
| `npc-*` | 52 | 职业/码头/官吏等（68 总量 − 16 已接） |
| `ui-*` | 62 | 界面美化 |
| `sym-*` | 42 | 占卜 UI |
| `map-*` | 26 | 海怪、船、森林等（54 总量 − 28 已接） |
| `explore-*` | 36 | 十二主城探索点 |
| `site-*` | 22 | 7 城 × 3（venice/acre/tauris/baldacum/hormos/balc/samarcanda + cascar-1） |
| 其余 | 160 | 入城、过场、导师、书封、交通等 |

完整清单：`python3 tools/art/audit.py --unused`

---

## 6. 音频

详见 [`AUDIO_PLAN.md`](AUDIO_PLAN.md) · [`assets/audio/MANIFEST.md`](../assets/audio/MANIFEST.md)。现状：**37** OGG（20 stem + 17 ambient 含 5 sacred_blur）· **~8.4 MB** · A1–A6 ✅ · `AudioDirector` autoload。

**红线**：不得合成可辨识语义的礼拜声响；圣所只留空间感与偶发钟磬。上线前须与美术、文本一并送敏感读者审阅。
