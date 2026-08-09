# 美术素材需求 · ART REQUIREMENTS

**2026-07-30 · P3 `scene-region-chr` 重绘 + P4 白图泰 24 张落盘接线（根目录 674）· 易经 31–64 仍缺。**
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
根目录 assets/art/*.webp   674 张 · ✅ 完好 674 · ⚠️ 棋盘格 0 · ❌ 损坏 0
  _archive/（Chat 变体）   128 张 · 生产图之外的安全备份，勿删
  _sheets/（组图原片）       58 张
Godot 运行时接线            674 张（MapArt + art_wire_index.json）
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
| `scene-region-chr.webp` | 曾是西亚圆顶、宣礼塔与骆驼 | ✅ 2026-07-30 已重绘为拉丁基督教世界（石砌教堂、集市、客栈/城门） |

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
| 2.1 | ~~`scene-region-chr.webp` 重绘~~ | 1 | ✅ 2026-07-30 | — |
| 2.2 | ~~白图泰六城入城图~~ | 6 | ✅ 2026-07-30 · 960×540 | — |
| 2.3 | ~~白图泰六城探索图~~ | 18 | ✅ 2026-07-30 · 960×540 | — |
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
| 全量 stem | **674** | `art_wire_index.json` + `MapArt.tex()` |
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

**未接线：0。** 根目录 **674** stems 均已写入 `art_wire_index.json`（含 2026-07-30 白图泰 24 张；`scene-region-chr` 为覆盖重绘）。

完整清单：`python3 tools/art/audit.py --unused`（期望空）。

---

## 6. 音频

详见 [`AUDIO_PLAN.md`](AUDIO_PLAN.md) · [`assets/audio/MANIFEST.md`](../assets/audio/MANIFEST.md)。现状：**37** OGG（20 stem + 17 ambient 含 5 sacred_blur）· **~8.4 MB** · A1–A8 ✅ · `AudioDirector` autoload。

**红线**：不得合成可辨识语义的礼拜声响；圣所只留空间感与偶发钟磬。上线前须与美术、文本一并送敏感读者审阅。

---

## 7. 人物立绘矩阵（2026-08-07 实测）

> 机器 audit（文件存在性/可解码）全绿，但**内容覆盖度**存在三类缺口：随从 con/mazu 缺 18 张、女性代表不足、`mentor-tarot` 内容错配。本矩阵为「种族 × 性别 × 风格」权威底稿，改角色/出图后须同步本表。

### 7.1 守门人 `npc-*` · 16 张（4 场所 × 4 文明）· 已接线

| 场所 | chr 基督之境 | isl 新月之境 | con 儒道之境 | mazu 妈祖之海 |
|---|---|---|---|---|
| 市集 `market` | 男·布商乔凡尼 | 男·香料贩优素福 | 男·丝行掌柜周三 | 男·船货牙人阿海 |
| 圣所 `temple` | 男·执事修士 | 男·寺守阿卜杜勒 | 男·道观知客 | 男·天妃宫庙祝 |
| 茶肆 `tea` | **女**·酒馆老板娘 | 男·驿栈茶博士 | 男·野店说书人 | **女**·码头茶棚阿婆 |
| 客栈 `inn` | 男·客栈掌柜 | 男·驿栈主人 | 男·行馆管事 | 男·船家客栈老板 |

16 张中仅 `tea-chr`、`tea-mazu` 两张为女性。

### 7.2 职业 `npc-job-*` · 36 张（9 职业 × 4 文明）· 已接线

| 职业 | chr | isl | con | mazu |
|---|---|---|---|---|
| 向导 `guide` | ✅ | ✅ | ✅ | ✅ |
| 通译 `translator` | ✅ | ✅ | ✅ | ✅ |
| 脚夫 `porter` | ✅ | ✅ | ✅ | ✅ |
| 水手 `sailor` | ✅ | ✅ | ✅ | ✅ |
| 护卫 `guard` | ✅ | ✅ | ✅ | ✅ |
| 医者 `healer` | ✅ | ✅ | ✅ | ✅ |
| 书记 `scribe` | ✅ | ✅ | ✅ | ✅ |
| 修士 `acolyte` | ✅ | ✅ | ✅ | ✅ |
| 卜者 `diviner` | ✅ | ✅ | ✅ | ✅ |

Prompt 无性别指定，形象几乎全为男性单一版本。

### 7.3 随从 `retainer-*` · 18 张（9 短名 × 仅 chr/isl）· **缺口**

代码入口：`game/map/map_art.gd` `retainer_portrait()` → `RETAINER_ART_SHORT` 短名 → `retainer-<short>-<set>.webp`，缺图回退 `npc-job-*` 再回退 `npc-market-*`。

| 短名 | 职业 | chr | isl | con | mazu |
|---|---|---|---|---|---|
| `guide` | 向导 | ✅ | ✅ | ❌ 缺 | ❌ 缺 |
| `porter` | 脚夫 | ✅ | ✅ | ❌ 缺 | ❌ 缺 |
| `guard` | 护卫 | ✅ | ✅ | ❌ 缺 | ❌ 缺 |
| `scribe` | 书记 | ✅ | ✅ | ❌ 缺 | ❌ 缺 |
| `lang` | 通译 | ✅ | ✅ | ❌ 缺 | ❌ 缺 |
| `heal` | 医者 | ✅ | ✅ | ❌ 缺 | ❌ 缺 |
| `sail` | 水手 | ✅ | ✅ | ❌ 缺 | ❌ 缺 |
| `monk` | 修士 | ✅ | ✅ | ❌ 缺 | ❌ 缺 |
| `seer` | 卜者 | ✅ | ✅ | ❌ 缺 | ❌ 缺 |

> `retainers.json` 有 58+ 随从记录，文化覆盖 islamic / steppe / east_asia / indian_ocean / latin。`CULTURE_SET` 将 steppe→isl、indian_ocean→mazu、east_asia→con，故 **east_asia / indian_ocean 随从当前回退到通用职业立绘**。

### 7.4 导师 `mentor-*` · 10 张 · 已接线（1 张待重绘）

| 方法 | 人物 | 性别 |
|---|---|---|
| `mentor-tarot` | 大不里士的法兰克遗孀牌师（**旧图为中国面孔，待重绘**） | 女 |
| `mentor-lenormand` | 牌铺女儿卡特琳娜 | 女 |
| `mentor-runes` | 瓦良格卫兵哈拉尔 | 男 |
| `mentor-astrodice` | 星家帖必烈 | 男 |
| `mentor-western` | 码头星占娜迪拉 | 女 |
| `mentor-meihua` | 西行僧明远 | 男 |
| `mentor-iching` | 太史院耶律先生 | 男 |
| `mentor-dream` | 圆梦人撒里蛮 | 男 |
| `mentor-bazi` | 命馆先生沈五 | 男 |
| `mentor-jiaobei` | 天妃宫庙祝陈婆 | 女 |

### 7.5 缺口汇总

| # | 缺口 | 数量 | 处理 |
|---|---|---|---|
| 1 | 随从立绘 con / mazu 两套（`retainer-{guide,porter,guard,scribe,lang,heal,sail,monk,seer}-{con,mazu}.webp`） | 18 | 2026-08-07 生成 + 接线 |
| 2 | `mentor-tarot.webp` 内容错配（中国面孔 → 法兰克遗孀） | 1 | 同批重绘 |
| 3 | 女性立绘代表不足（96 张人物立绘仅 ~6 女） | — | 后续出图按性别双版补齐，代码已支持 `-{m,f}` 后缀 |

### 7.6 命名与接入约定（gender 维度）

- 文件名：`retainer-<short>-<set>-{m,f}.webp`（无后缀 = 旧版回退，不破坏现有 36 张）。
- 代码：`retainer_portrait(rid, culture, gender := "")` 优先精确匹配，`-m` 次之，无后缀兜底。
- 数据：`content/tables/retainers.json` 每条记录补 `gender` 字段（`m` / `f` / 空），用于雇佣契约与队伍界面选图。
