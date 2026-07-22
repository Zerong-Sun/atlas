# 缺少的贴图清单 · MISSING TEXTURES

本文件**只列还没有的**。文件放进 `fatequest/assets/art/`，文件名与「引用名」完全一致，格式 `.webp`。
放进去即生效；没有的地方目前由程序化 SVG 顶着（能看，但你的画会好很多）。

---

## ✅ 已接入（2026-07 素材批次，不用再画）

- **图标 171 个** `ic-*.webp` —— 经 `ART_EMOJI_MAP.json` 全局替换所有 emoji（导航/HUD/仪式/地点/交通/塔内/梦象/22 张大阿卡纳/怪物/特效）
- **场景背景 16 张** `scene-*.webp` —— 12 座城 + 4 个文明通用路景，已用于到站叙事、城镇对话、途中遭遇
- **NPC 立绘 16 张** `npc-*.webp` —— 四文明 × 市集/庙宇/茶肆/行馆守门人
- **地图贴图 12 张** `map-*.webp` —— 羊皮纸底、海面、四文明纹样、岩山/雪山/沙丘/森林/河道/礁石
- **UI 表面 10 张** `ui-bg-*.webp` + 按钮 10 张 `ui-btn-*` + 图标 `ui-icon-*` / 角饰 `ui-orn-*`
- **塔罗全副 22 张** `decks/tarot/tarot-*-full.webp` —— 抽牌与图鉴直接用画作
- **易经卦牌 30 张** `decks/iching/iching-01..30-*-full.webp` —— 起卦结果显示对应卦牌
- **塔符号 18 + 卡背 + 流派徽记 3** `sym-*`, `card-back-full`, `arch-*`
- 雷诺曼 36 张（`decks/lenormand/`）、星盘 34 张（`assets/astrodice/`）

## ⏳ 还缺（按优先级）

| 引用名 | 用途 | 内容要求 | 尺寸 |
|---|---|---|---|
| `mentor-tarot/lenormand/runes/astrodice/western/meihua/iching/dream/bazi/jiaobei.webp`（10 张） | 十位师父立绘 | 现暂借同文明守门人立绘顶替；各人设定见 `js/data-mentors.js` | 900×1300 透明 |
| `realm-tarot/western/astrodice/jiaobei/meihua/lenormand.webp`（6 张） | 星图秘境图标 | `ART_EMOJI_MAP.json` 已指向这些名字但文件未出；现由近似纹章顶替 | 512×512 透明 |
| `decks/iching/iching-31..64-*-full.webp`（34 张） | 易经卦牌下半部 | 命名沿用现有规则；缺的卦目前退回线描卦象 | 同现有卦牌 |
| `item-beads.webp` | 行脚念珠（占具） | 现由符袋纹章顶替 | 256×256 透明 |
| `map-city-chr/isl/con/mazu.webp`、`map-court-con.webp`、`map-shrine.webp` | 地图城塞小像 | 现由 SVG 立面顶替（见下表 C） | 256×220 透明 |
| `map-beast-serpent/whale/roc/griffin.webp`、`map-rose.webp`、`map-wind-head.webp`、`map-cartouche.webp`、`map-border.webp` | 地图异兽与装饰 | 现由 SVG 顶替（见下表 D） | 见下表 |
| `tr-*.webp`（12 张） | 交通小像 | 现由 `ic-travel-*` 纹章顶替，可不做 | 见下表 E |

**统一风格**：13 世纪抄本地图（mappa mundi / 波特兰海图）手绘感——羊皮纸底、铁胆墨线、矿物色淡彩、可见笔触与晕染；**不要**现代矢量扁平风、不要写实照片、不要发光特效。
**统一色**：羊皮纸 `#E9DBB8`／墨 `#4A3A1C`／赭 `#8A6234`／朱批 `#B3402E`／海青 `#3F5F6B`。

---

## A. 地图底与纹理（优先级 P0）

| 引用名 | 用途 | 内容要求 | 尺寸/格式 |
|---|---|---|---|
| `map-vellum.webp` | 地图羊皮纸底（现为渐变+污渍） | 真实羊皮纸扫描感：纤维、水渍、虫蛀小孔、边缘焦黄；**中央大片干净**留给城市 | 1640×840 不透明 |
| `map-sea.webp` | 海面平铺纹（现为 CSS 波纹） | 中世纪海图画法：细密平行波线+鱼鳞叠纹，可四方连续 | 256×256 可平铺 |
| `map-orn-chr.webp` | 基督之境纹样底（现为四叶花窗 SVG） | 哥特花窗棂/四叶饰连续纹，蓝灰墨线 | 256×256 可平铺，半透明 |
| `map-orn-isl.webp` | 新月之境纹样底 | 伊斯兰 girih 八角星几何密铺，绿墨线 | 256×256 可平铺，半透明 |
| `map-orn-con.webp` | 儒道之境纹样底 | 祥云卷草 + 回纹边，赭墨线 | 256×256 可平铺，半透明 |
| `map-orn-mazu.webp` | 妈祖之海纹样底 | 鱼鳞浪纹 + 缠枝水草，青墨线 | 256×256 可平铺，半透明 |

## B. 地形立体件（P0，替换现有 SVG symbol）

> 均为**侧视/立面**画法（中世纪不画俯视），底边平齐，带右下投影；透明底。

| 引用名 | 内容要求 | 尺寸 |
|---|---|---|
| `map-mtn-snow.webp` | 雪山连峰（帕米尔用）：三峰错落、峰顶留白、左明右暗排线 | 512×280 透明 |
| `map-mtn-rock.webp` | 岩山连峰（阿尔卑斯/中原用）：褐岩、皴线 | 512×280 透明 |
| `map-dune.webp` | 沙丘三重（克尔曼荒漠）：金沙、风纹 | 512×180 透明 |
| `map-forest.webp` | 针叶林丛（欧洲）：5–7 棵成簇 | 320×220 透明 |
| `map-river.webp` | 河道笔刷（大运河）：两端渐细的墨带 | 512×64 透明 |
| `map-reef.webp` | 礁石浅滩（妈祖之海） | 320×140 透明 |

## C. 城塞小像（P1，每文明一套，替换现有 SVG）

> 立面小像，含地面投影；名条由程序渲染，**画面里不要写字**。

| 引用名 | 内容要求 | 尺寸 |
|---|---|---|
| `map-city-chr.webp` | 基督之境城塞：垛口城墙+尖顶钟楼+拱门 | 256×220 透明 |
| `map-city-isl.webp` | 新月之境城塞：穹顶+宣礼塔+尖拱门 | 256×220 透明 |
| `map-city-con.webp` | 儒道之境城塞：飞檐城楼+夯土城墙 | 256×220 透明 |
| `map-city-mazu.webp` | 港口城塞：码头栈桥+福船桅杆+妈祖庙檐 | 256×220 透明 |
| `map-court-con.webp` | 宫阙（上都/大都专用）：多重飞檐+白台基 | 320×260 透明 |
| `map-shrine.webp` | 圣所（通用）：小庙/龛，可配任一文明 | 200×180 透明 |

## D. 图上异兽与装饰（P1）

| 引用名 | 内容要求 | 尺寸 |
|---|---|---|
| `map-beast-serpent.webp` | 海蛇：波间三折蛇身，抄本怪兽画法（非写实） | 420×160 透明 |
| `map-beast-whale.webp` | 巨鲸／海怪：喷水、鱼鳞、圆眼 | 380×200 透明 |
| `map-beast-roc.webp` | 大鹏（鲁克鸟）：展翅侧影，爪抓一物 | 420×260 透明 |
| `map-beast-griffin.webp` | 狮鹫：半鹰半狮，守金堆 | 320×260 透明 |
| `map-rose.webp` | 罗盘玫瑰：八角星+朱色北针+外环刻度 | 320×320 透明 |
| `map-wind-head.webp` | 风神头像：鼓腮吹气的侧脸（可旋转复用） | 160×160 透明 |
| `map-cartouche.webp` | 标题卷轴牌：空白卷轴，两端卷曲 | 640×120 透明 |
| `map-border.webp` | 地图外框饰带：可横向平铺的编织/缠枝纹 | 512×48 可平铺 |

## E. 交通方式图标（P1，行进段小像与选择列表）

> 侧视剪影小像，朝右；行进时会沿路径移动。

| 引用名 | 交通 | 尺寸 |
|---|---|---|
| `tr-caravan.webp` | 驼队（2–3 峰骆驼+驼夫） | 256×160 透明 |
| `tr-mule.webp` | 骡队 | 256×160 透明 |
| `tr-yam.webp` | 驿马（站赤快马，鞍旁挂金牌） | 256×160 透明 |
| `tr-yak.webp` | 牦牛队（雪地） | 256×160 透明 |
| `tr-foot.webp` | 徒步行者（拄杖背囊） | 200×160 透明 |
| `tr-galley.webp` | 桨帆船（地中海，双排桨） | 320×180 透明 |
| `tr-dhow.webp` | 缝合帆船（三角帆） | 320×180 透明 |
| `tr-junk.webp` | 中国大舶（四桅十二帆） | 360×200 透明 |
| `tr-barge.webp` | 运河漕船（平底、篷顶） | 300×160 透明 |
| `tr-roc.webp` | 大鹏载人（爪提船/人） | 360×260 透明 |
| `tr-griffin.webp` | 狮鹫载人 | 320×240 透明 |
| `tr-serpent.webp` | 海蛇曳舟（蛇拖船） | 400×200 透明 |

## §F1. 场景背景 · 16 张（P0 — 对话/到站/遭遇整屏底图）

> **规格**：1920×1080，16:9，不透明。  
> **构图红线（必守）**：**左下约 1/3 必须留空**——留给对话框（压底）+ 半身立绘（站左侧）。主体建筑/地貌放在画面中右与上半；不要在左下角堆货、摊位、近景人物或高对比细节。  
> **画法**：13 世纪抄本细密画 + 暮色/烛火光；羊皮纸矿物色；一眼能认出是哪座城。缺图时程序用文明色晕染顶替。  
> **Prompt 表**：[`ART_PROMPTS_F1_SCENES.md`](./ART_PROMPTS_F1_SCENES.md)（先写好再上传生图）。

| 引用名 | 场景 | 内容要求 |
|---|---|---|
| `scene-venice-quay.webp` | 威尼斯码头 | 泻湖、贡多拉、圣马可钟楼剪影、晨雾 |
| `scene-acre-wall.webp` | 阿卡城墙夜哨 | 十字军城垛、火把、远处地中海、星夜 |
| `scene-tabriz-bazaar.webp` | 大不里士巴扎 | 拱廊市集、地毯、屋顶观星仪 |
| `scene-hormuz-port.webp` | 霍尔木兹港 | 热风、缝合帆船、椰枣林、码头星占摊 |
| `scene-kerman-dunes.webp` | 克尔曼沙海 | 沙丘、驼影、落日、半埋废驿 |
| `scene-herat-road.webp` | 赫拉特商道 | 驿栈、杨树列、雪山远景 |
| `scene-pamir-pass.webp` | 帕米尔垭口 | 雪线、经幡、牦牛、淡蓝篝火 |
| `scene-shangdu-palace.webp` | 上都大理石宫 | 草原、白色宫殿、金顶帐幕 |
| `scene-khanbaliq-hall.webp` | 大都夜宴殿 | 巨柱大殿、烛海、屏风 |
| `scene-hangzhou-lake.webp` | 西湖画舫 | 石桥、画舫、灯火、远山 |
| `scene-quanzhou-harbor.webp` | 刺桐港 | 帆樯如林、天妃宫飞檐、香烟 |
| `scene-voyage-sea.webp` | 归航海上 | 四桅巨舶甲板、风暴将至的云 |
| `scene-region-chr.webp` | 基督之境·通用路景 | 欧洲丘陵、修道院远影 |
| `scene-region-isl.webp` | 新月之境·通用路景 | 商道、驼队、宣礼塔远影 |
| `scene-region-con.webp` | 儒道之境·通用路景 | 山道、驿亭、飞檐远影 |
| `scene-region-mazu.webp` | 妈祖之海·通用路景 | 浪、帆、海鸟 |

## §F2. NPC 立绘 · 26 张（P1 — 对话左侧人物：16 守门人 + 10 师父）

> **规格**：900×1300，透明底；**半身、朝右**。  
> **构图红线**：**底部约 15% 可被对话框压住**——脚/下摆可裁进安全区，脸与肩带道具必须在上 85% 内清晰可读。  
> **画法**：抄本插画笔法，非写实；**不画神明本尊**。  
> **Prompt 表**：[`ART_PROMPTS_F2_NPCS.md`](./ART_PROMPTS_F2_NPCS.md)（先写好再上传生图）。

### F2a · 守门人 16（市集 / 圣所 / 茶馆 / 客栈 × 四文明）

| 引用名 | 人物 |
|---|---|
| `npc-market-chr.webp` | 威尼斯布商乔凡尼 |
| `npc-market-isl.webp` | 香料贩优素福 |
| `npc-market-con.webp` | 丝行掌柜周三 |
| `npc-market-mazu.webp` | 船货牙人阿海 |
| `npc-temple-chr.webp` | 执事修士 |
| `npc-temple-isl.webp` | 清真寺看守阿卜杜勒 |
| `npc-temple-con.webp` | 道观知客 |
| `npc-temple-mazu.webp` | 天妃宫庙祝 |
| `npc-tea-chr.webp` | 酒馆老板娘 |
| `npc-tea-isl.webp` | 驿栈茶博士 |
| `npc-tea-con.webp` | 野店说书人 |
| `npc-tea-mazu.webp` | 码头茶棚阿婆 |
| `npc-inn-chr.webp` | 客栈掌柜 |
| `npc-inn-isl.webp` | 驿栈主人 |
| `npc-inn-con.webp` | 行馆管事 |
| `npc-inn-mazu.webp` | 船家客栈老板 |

### F2b · 师父 10（对话立绘 + 试炼徽章位）

| 引用名 | 人物 |
|---|---|
| `mentor-tarot.webp` | 威尼斯制牌人老马蒂欧 |
| `mentor-lenormand.webp` | 牌铺女儿卡特琳娜 |
| `mentor-runes.webp` | 瓦良格卫兵哈拉尔 |
| `mentor-astrodice.webp` | 星家帖必烈 |
| `mentor-western.webp` | 码头星占娜迪拉 |
| `mentor-meihua.webp` | 西行僧明远 |
| `mentor-iching.webp` | 太史院耶律先生 |
| `mentor-dream.webp` | 圆梦人撒里蛮 |
| `mentor-bazi.webp` | 命馆先生沈五 |
| `mentor-jiaobei.webp` | 天妃宫庙祝陈婆 |

## G. 秘境图标（P2，星图九宫格，现用 emoji）

`realm-tarot` / `realm-iching` / `realm-bazi` / `realm-western` / `realm-runes` / `realm-dream` / `realm-astrodice` / `realm-jiaobei` / `realm-meihua` / `realm-lenormand`
各 512×512 透明，一法一器物（牌/铜钱/罗盘宫格/星座环/符袋/枕月/三骰/筊杯/梅枝/小牌）。

---

### 已经不缺的（别重复画）
塔牌全幅 18 张 `sym-*-full`、卡背 `card-back-full`、流派徽记 `arch-*`、按钮 `ui-btn-*`、
主页入口 `mode-journey`/`mode-tower`、全局底 `bg-nocturne`、
雷诺曼 36 张（`assets/decks/lenormand/`）、星盘 34 张（`assets/astrodice/`）。
