# 美术素材需求 · ART REQUIREMENTS

**2026-07-27 · S1b 48 张新图接线 + 签契雇佣屏 · S2 动画 N2–N3 已实现 · S3/S4 缺口规格见下。**
每条素材标注四种状态之一，由 `tools/art/audit.py` 机器判定，不靠记忆：

| 状态 | 含义 |
|---|---|
| ✅ **完好** | 文件存在、可解码、无缺陷 |
| ⚠️ **棋盘格** | 编辑器的透明棋盘被烘焙成实际像素（alpha 通道本身正确，粗查发现不了） |
| ❌ **损坏** | 无法解码／全透明／尺寸退化 |
| **已接线** | `MapArt`（`game/map/map_art.gd`）可通过 `art_wire_index.json` 解析 |

```bash
python3 tools/art/audit.py           # 汇总
python3 tools/art/audit.py --md      # 需关注项的表格
python3 tools/art/audit.py --unused  # 未接线清单（S1 后应为 0）
python3 tools/art/strip_checker.py --write --glob 'assets/art/*.webp'   # 修棋盘格
```

---

## 0. 实测汇总

```
根目录 assets/art/*.webp   650 张 · ✅ 完好 650 · ⚠️ 棋盘格 0 · ❌ 损坏 0
  _archive/（Chat 变体）   128 张 · 生产图之外的安全备份，勿删
  _sheets/（组图原片）       58 张
Godot 运行时接线            650 张（MapArt + art_wire_index.json）
未接线                        0 张
```

总索引：[`ASSETS_REQUIREMENTS.md`](ASSETS_REQUIREMENTS.md)

**2026-07-23 修复记录**：

| 缺陷 | 数量 | 处理 |
|---|---|---|
| 棋盘格烘焙进像素 | **169** | `strip_checker.py` 全量清除并目视复核 |
| 路线笔触墨迹仅占画布 7–12/96 行，拉伸后不可见 | 3 | 裁到墨迹范围 |

> ⚠️ **生成管线未修**：新素材仍会带棋盘格。**每次生成后必须跑 `audit.py`。**

---

## 1. 内容错配（需重绘，非缺失）· P3

| 素材 | 问题 | 现状 |
|---|---|---|
| `scene-region-isl.webp` | 旧图是中国湖景 | ✅ 已重绘为西亚城郭与商队 |
| `scene-region-chr.webp` | 仍是西亚圆顶、宣礼塔与骆驼，不是拉丁基督教世界 | 由 `MapArt.CITY_SCENE` 优先取具名场景绕开，**待重绘** |

这两张是**内容错误不是技术缺陷**——文件完好，画错了对象。机器查不出来，只能人看。

### 1.1 `scene-region-chr.webp` 重绘规格（P3）

| 项 | 规格 |
|---|---|
| **文件名** | `scene-region-chr.webp`（覆盖现文件；旧错误图已在 `_archive/scene-region-*-wrong-content.webp`） |
| **尺寸** | **1920×1080** WebP，不透明 |
| **色调** | 暖褐低饱和，匹配其余 band 底板（`scene-region-con` / `mazu` / `isl`） |
| **用途** | 拉丁基督教世界通用城市探索底板（`MapArt.BAND_SCENE` 的 `europe` / 部分回退） |

**必须画出**：

- 石砌教堂或尖顶（Romanesque / early Gothic 侧立面，非洋葱顶）
- 集市广场：木棚、布摊、石井或喷泉
- 商队客栈（stone inn）或城门拱券
- 可选：远处城墙雉堞、拉丁十字旗帜（勿写可辨识现代纹章）

**禁止出现**：

- 圆顶清真寺、宣礼塔、新月
- 骆驼商队、沙漠沙丘为主景
- 东亚亭台或中式牌楼

**验收**：目视确认为拉丁基督教世界建筑；无圆顶／宣礼塔／骆驼；与 `scene-region-isl` 并排放置时文明差异一目了然。

**Prompt 落点**：出图后写入 `assets/art/ART_PROMPTS.md` 本条记录；跑 `audit.py` 复查棋盘格。

---

## 2. 仍缺的素材（按阻塞程度）

| # | 素材 | 数量 | 规格 | 阻塞 |
|---|---|---|---|---|
| 2.1 | `scene-region-chr.webp` 重绘 | 1 | 见 §1.1 | 拉丁世界通用底板内容错配 |
| 2.2 | 白图泰六城入城图 | 6 | 960×540 WebP · 见 §2.A | 目前用 band 底板回退 |
| 2.3 | 白图泰六城探索图 | 18 | 960×540 WebP · 见 §2.A | 目前用通用场所图回退 |
| 2.4 | 易经 31–64 牌面 | 34 | 512×768 WebP | 非阻塞，使用卦符回退 |
| 2.5 | ~~货币徽~~ | 5 | ✅ 已交付 · `MapArt.currency_icon` | — |
| 2.6 | ~~结局贴纸~~ | 9 | ✅ 已交付 · `MapArt.sticker_icon` | — |

六主城具名场景、罗盘玫瑰、签筒／签条、命运九等徽、史料小卡、职业 NPC、
货币徽、结局贴纸、随从立绘（chr/isl）、契约 UI 与四城 site 补图均已交付并接线。

### 2.A 白图泰六城素材规格（P4）

依据 [`PLAN.md`](PLAN.md) §5。入城图文件名 `city-<id>-entry.webp`；探索图优先 `site-<id>-{1,2,3}.webp`（无则 `explore-{market,inn,temple}-<id>.webp`）。

| 城 id | 入城图氛围（据入城正文 / 选段） | 探索点建议题材 × 3 |
|---|---|---|
| `delli` | 德里苏丹宫廷：王后收礼、衣袍赏赐、市集与宣礼塔天际线 | ① 宫廷账房／王后门 ② 大市集（Hindū 与穆斯林商贾） ③ 大清真寺或卡迪坐席 |
| `basora` | 幼发拉底河口：椰枣林、运河、灰泥墙宅、下海帆船 | ① 椰枣运河码头 ② 与贝都因护卫同行的客栈 ③ 河岸市集（椰枣／布／粮） |
| `cabul` | 兴都库什山口残城：废墟城墙、狭窄关隘、寒风高原 | ① 关隘石路 ② 残破巴扎 ③ 眺望雪山的驿馆 |
| `java-major` | 季风岛国：港口、香料货舱、穆斯林王庭与海船 | ① 胡椒／肉豆蔻货仓 ② 王庭礼宾 ③ 季风港湾 |
| `zancibar` | 东非斯瓦希里港（语料节点待入库）：珊瑚石砌、椰林、印度洋商船 | ① 珊瑚石商馆 ② 象牙／黄金货栈 ③ 清真寺与市集广场 |
| `maldive` | 环礁岛链（语料节点待入库）：潟湖、棕榈、珊瑚清真寺、季风帆船 | ① 潟湖码头 ② 珊瑚石清真寺 ③ 椰林村落市集 |

> **节点说明**：`delli` / `basora` / `cabul` / `java-major` 已在城市表；`zancibar` / `maldive` 为规划 id（ART 预留文件名）。出图后 `MapArt.city_entry` / `site_scene` 按 id 自动解析，无需改代码。

**统一规格**：

| 项 | 值 |
|---|---|
| 尺寸 | **960×540** WebP |
| 色调 | 与 band 底板一致的暖褐／低饱和；印度洋城可略偏青绿海色 |
| 构图 | 中景建筑 + 前景人物剪影或货摊；避免现代摄影透视 |
| 验收 | 每城目视匹配上表氛围，**禁止六城共用同一模板换色** |

---

## 3. 故事与互动所需素材

城市探索（`game/screens/city_view.gd`）已接线场所立绘与职业立绘：

| # | 素材 | 数量 | 说明 |
|---|---|---|---|
| 3.1 | 场所立绘扩充 | ✅ +16 | 码头工／官吏／医者／书记 × 4 文化 · **已接线** |
| 3.2 | 物品弹窗图 | ✅ | `GOODS_ART_MAP.json` → `ic-*` / `item-*` · **已接线** |
| 3.3 | 探索点小图 | ✅ 36 | 12 主城 × 3 · **已接线** |

---

## 4. Godot 已接线清单（`game/map/map_art.gd` · S1 ✅）

| 类别 | 数量 | 解析入口 |
|---|---|---|
| 全量 stem | **650** | `art_wire_index.json` + `MapArt.tex()` |
| 地图 | 54 | `city_icon` / `mountain_icon` / `route_brush` / `map_ornament` / `wind_head` |
| 场景 / 入城 / 探索 | scene + city-entry + explore/site | `city_scene` / `city_entry` / `site_scene` / `city_explore_bg` |
| NPC / 导师 | 68 + 10 | `event_portrait` / `job_portrait` / `mentor_portrait` |
| 市集图标 | 经 `GOODS_ART_MAP.json` | `goods_icon` / `item_icon` |
| 过场 | 11 | `transit_scene` |
| 书案 / chargen | book / fate / culture / faith | `desk_parchment` / `book_cover` / `fate_*` / `culture_icon` / `faith_icon` |
| 占卜符号 | 42 | `symbol_icon` / `ritual_lot` |
| UI / 货币 / 贴纸 | ui-* + CURRENCY_ART + STICKER_ART | `ui` / `currency_icon` / `sticker_icon` |

> 旧 PWA 接线（`js/art-map.js`）已归档；**现行客户端只有 Godot**。

---

## 5. 接线状态（S1 完成）

**未接线：0。** 先前登记的 543 张（explore / site / npc / ic / ui / sym / map 饰件等）均已通过 `MapArt` 统一解析。

完整清单：`python3 tools/art/audit.py --unused`（期望空）。

---

## 6. 音频

详见 [`AUDIO_PLAN.md`](AUDIO_PLAN.md) · [`assets/audio/MANIFEST.md`](../assets/audio/MANIFEST.md)。现状：**37** OGG（20 stem + 17 ambient 含 5 sacred_blur）· **~8.4 MB** · A1–A8 ✅ · `AudioDirector` autoload。

**红线**：不得合成可辨识语义的礼拜声响；圣所只留空间感与偶发钟磬。上线前须与美术、文本一并送敏感读者审阅。
