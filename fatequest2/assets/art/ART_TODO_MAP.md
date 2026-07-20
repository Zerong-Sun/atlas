# 缺少的贴图清单 · MISSING TEXTURES (地图与交通)

本文件**只列还没有的**。文件放进 `fatequest2/assets/art/`，文件名与「引用名」完全一致，格式 `.webp`。
放进去即生效；没有的地方目前由程序化 SVG 顶着（能看，但你的画会好很多）。

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

## F1. 场景背景（P0 — 对话/到站/遭遇的整屏底图）

> **横构图、16:9，人物区留在左下 1/3**（对话框压底部、立绘站左侧，别把主体放那儿）。
> 画法：抄本细密画 + 暮色光；建筑与地貌要能一眼认出是哪座城。缺图时程序用文明色晕染顶替。

| 引用名 | 场景 | 内容要求 | 尺寸 |
|---|---|---|---|
| `scene-venice-quay.webp` | 威尼斯码头 | 泻湖、贡多拉、圣马可钟楼剪影、晨雾 | 1920×1080 不透明 |
| `scene-acre-wall.webp` | 阿卡城墙夜哨 | 十字军城垛、火把、远处地中海、星夜 | 同上 |
| `scene-tabriz-bazaar.webp` | 大不里士市集/观星台 | 拱廊巴扎、地毯、屋顶观星仪 | 同上 |
| `scene-hormuz-port.webp` | 霍尔木兹港 | 热风、缝合帆船、椰枣林、码头星占摊 | 同上 |
| `scene-kerman-dunes.webp` | 克尔曼荒漠 | 沙海、驼影、落日、半埋废驿 | 同上 |
| `scene-herat-road.webp` | 赫拉特商道 | 驿栈、杨树列、雪山远景 | 同上 |
| `scene-pamir-pass.webp` | 帕米尔垭口 | 雪线、经幡、牦牛、淡蓝火焰的篝火 | 同上 |
| `scene-shangdu-palace.webp` | 上都大理石宫 | 草原、白色宫殿、金顶帐幕 | 同上 |
| `scene-khanbaliq-hall.webp` | 大都夜宴殿 | 巨柱大殿、烛海、屏风 | 同上 |
| `scene-hangzhou-lake.webp` | 行在西湖 | 石桥、画舫、灯火、远山 | 同上 |
| `scene-quanzhou-harbor.webp` | 泉州刺桐港 | 帆樯如林、天妃宫飞檐、香烟 | 同上 |
| `scene-voyage-sea.webp` | 归航海上 | 四桅巨舶甲板、风暴将至的云 | 同上 |
| `scene-region-chr.webp` | 基督之境·途中 | 通用路景：欧洲丘陵、修道院远影 | 同上 |
| `scene-region-isl.webp` | 新月之境·途中 | 通用路景：商道、驼队、宣礼塔远影 | 同上 |
| `scene-region-con.webp` | 儒道之境·途中 | 通用路景：山道、驿亭、飞檐远影 | 同上 |
| `scene-region-mazu.webp` | 妈祖之海·途中 | 通用海景：浪、帆、海鸟 | 同上 |

## F2. NPC 立绘（P1 — 对话场景左侧人物）

> **半身立绘、朝右、透明底**；底部可被对话框压住 15%。抄本插画笔法，不要写实。

| 引用名 | 人物 | 尺寸 |
|---|---|---|
| `npc-market-chr.webp` | 威尼斯布商乔凡尼 | 900×1300 透明 |
| `npc-market-isl.webp` | 香料贩优素福 | 同上 |
| `npc-market-con.webp` | 丝行掌柜周三 | 同上 |
| `npc-market-mazu.webp` | 船货牙人阿海 | 同上 |
| `npc-temple-chr.webp` | 执事修士 | 同上 |
| `npc-temple-isl.webp` | 清真寺看守阿卜杜勒 | 同上 |
| `npc-temple-con.webp` | 道观知客 | 同上 |
| `npc-temple-mazu.webp` | 天妃宫庙祝 | 同上 |
| `npc-tea-chr.webp` | 酒馆老板娘 | 同上 |
| `npc-tea-isl.webp` | 驿栈茶博士 | 同上 |
| `npc-tea-con.webp` | 野店说书人 | 同上 |
| `npc-tea-mazu.webp` | 码头茶棚阿婆 | 同上 |
| `npc-inn-chr.webp` | 客栈掌柜 | 同上 |
| `npc-inn-isl.webp` | 驿栈主人 | 同上 |
| `npc-inn-con.webp` | 行馆管事 | 同上 |
| `npc-inn-mazu.webp` | 船家客栈老板 | 同上 |

## F. 师父像（P1，对话立绘 + 试炼徽章位）

> 同为半身立绘，规格同 F2（900×1300 透明）；文件名如下。

| 引用名 | 人物 | 尺寸 |
|---|---|---|
| `mentor-tarot.webp` | 威尼斯制牌人老马蒂欧 | 900×1300 透明 |
| `mentor-lenormand.webp` | 牌铺女儿卡特琳娜 | 同上 |
| `mentor-runes.webp` | 瓦良格卫兵哈拉尔 | 同上 |
| `mentor-astrodice.webp` | 星家帖必烈 | 同上 |
| `mentor-western.webp` | 码头星占娜迪拉 | 同上 |
| `mentor-meihua.webp` | 西行僧明远 | 同上 |
| `mentor-iching.webp` | 太史院耶律先生 | 同上 |
| `mentor-dream.webp` | 圆梦人撒里蛮 | 同上 |
| `mentor-bazi.webp` | 命馆先生沈五 | 同上 |
| `mentor-jiaobei.webp` | 天妃宫庙祝陈婆 | 同上 |

> 人物像红线：侧写/半身、抄本插画笔法即可，**不画神明本尊**。

## G. 秘境图标（P2，星图九宫格，现用 emoji）

`realm-tarot` / `realm-iching` / `realm-bazi` / `realm-western` / `realm-runes` / `realm-dream` / `realm-astrodice` / `realm-jiaobei` / `realm-meihua` / `realm-lenormand`
各 512×512 透明，一法一器物（牌/铜钱/罗盘宫格/星座环/符袋/枕月/三骰/筊杯/梅枝/小牌）。

---

### 已经不缺的（别重复画）
塔牌全幅 18 张 `sym-*-full`、卡背 `card-back-full`、流派徽记 `arch-*`、按钮 `ui-btn-*`、
主页入口 `mode-journey`/`mode-tower`、全局底 `bg-nocturne`、
雷诺曼 36 张（`assets/decks/lenormand/`）、星盘 34 张（`assets/astrodice/`）。
