# 缺失贴图清单 · ART TODO（v3.0 · 对应《远行之书》规划案）

本文件是**唯一的缺口总表**，随规划改版重写。此前的 `ART_TODO_MAP.md` 只覆盖地图与交通，已并入本文。

**放置规则**：文件放进 `assets/art/`（人物、场景、图标、UI）或 `assets/decks/<牌组>/`（成套牌面），文件名与「引用名」完全一致，格式 `.webp`。缺图时程序自动回退到 SVG 或 emoji，**不会开天窗**。

**统一风格**：13 世纪抄本 × 暮色山野（「云岭暮光」）。羊皮纸 `#E9DBB8`／墨 `#4A3A1C`／赭 `#8A6234`／朱批 `#B3402E`／海青 `#3F5F6B`。手绘笔触、矿物色淡彩、克制饱和；忌现代扁平矢量、忌照片写实、忌霓虹发光。

**透明底要求**：所有剪影／图标／立绘必须**带真 alpha 通道**。若出图带白底，跑一次
`python3 scripts/dealpha.py --apply` 自动抠除（已内置安全阀，满幅图会跳过）。

---

## ✅ 已有（269 张，不用再画）

| 类别 | 数量 | 说明 |
|---|---|---|
| `ic-*` 图标 | ~180 | 导航／HUD／仪式／地点／交通／塔内／梦象／22 张大阿卡纳／怪物／特效，经 `ART_EMOJI_MAP.json` 全局替换 emoji |
| `scene-*` 场景背景 | 16 | 12 城 + 4 文明通用路景 |
| `npc-*` 立绘 | 16 | 四文明 × 市集／庙宇／茶肆／行馆守门人 |
| `map-*` 地图贴图 | 12 | 羊皮纸底、海面、四文明纹样、岩山／雪山／沙丘／森林／河道／礁石 |
| `ui-bg-*` / `ui-btn-*` / `ui-icon-*` / `ui-orn-*` | 37 | 面板、秘境格、坞栏、经验条、六种按钮态、角饰 |
| `sym-*` 塔符号 | 18+ | 含 `-full` 全幅卡面 |
| 塔罗全牌 | 22 | `assets/decks/tarot/` |
| 易经卦牌 | 30 | `assets/decks/iching/`（1–30） |
| 雷诺曼 | 36 | `assets/decks/lenormand/`（19 世纪 Dondorf 原版扫描，公有领域） |
| 星盘线稿 | 34 | `assets/astrodice/`（行星 10／星座 12／宫位 12） |

---

## ⏳ P0 · 新规划必需（先做这些）

### A. 开场书案（GDD §3）

| 引用名 | 内容 | 尺寸 |
|---|---|---|
| `book-rubruck.webp` | 《鲁布鲁克东行记》书脊／封面，羊皮装订 | 512×700 透明 |
| `book-polo.webp` | 《马可·波罗游记》同上 | 同上 |
| `book-battuta.webp` | 《伊本·白图泰游记》皮面烫金 | 同上 |
| `book-odoric.webp` | 《鄂多立克东游录》 | 同上 |
| `book-zhenghe.webp` | 《郑和航海图志》线装 | 同上 |
| `book-tafur.webp` | 《佩罗·塔富尔游记》 | 同上 |
| `book-conti.webp` | 《尼科洛·德·康蒂旅行录》 | 同上 |
| `desk-parchment.webp` | 书案底图：羊皮地图铺开，书叠其上 | 1920×1080 不透明 |

### B. 导入过场（GDD §3 ②）

11 张循环贴图，**1920×1080 不透明**，暗调、下方 1/4 留给箴言文字：
`load-port` · `load-desert` · `load-station` · `load-monastery` · `load-mosque` · `load-church` · `load-snowpeak` · `load-steppe` · `load-canal` · `load-bazaar` · `load-seaship`

### C. 角色生成（GDD §4）

| 引用名 | 内容 | 尺寸 |
|---|---|---|
| `fate-wheel.webp` | 命格转盘／九等评级底盘 | 800×800 透明 |
| `fate-bar-travel.webp` `fate-bar-rapport.webp` `fate-bar-wealth.webp` | 三条命运条的纹章端头 | 各 256×64 透明 |
| `culture-latin.webp` `culture-islamic.webp` `culture-eastasia.webp` `culture-steppe.webp` `culture-indianocean.webp` | 五文化圈徽记 | 各 512×512 透明 |
| `faith-latin/orthodox/islam/buddhism/daoism/nestorian/hindu/folk.webp` | 八宗教身份徽记（**器物意象，不画神明**） | 各 512×512 透明 |

---

## ⏳ P1 · MVP 十二城（按 LORE_PIPELINE 方案 A 重排后）

> 现有 16 张 `scene-*` 覆盖旧城市表；新主干若改为「阿卡→大不里士→忽鲁谟斯→巴达赫尚→喀什→敦煌→上都→大都→行在→泉州」，需补下列场景。

| 引用名 | 场景 | 尺寸 |
|---|---|---|
| `scene-hormuz-port.webp` | 忽鲁谟斯港（已有，复用） | — |
| `scene-badashan.webp` | 巴达赫尚高原、宝石矿 | 1920×1080 |
| `scene-kashgar.webp` | 喀什噶尔绿洲市集 | 同上 |
| `scene-dunhuang.webp` | 敦煌石窟与鸣沙山 | 同上 |
| `scene-kinsay.webp` | 行在（杭州）西湖画舫 | 同上（已有 `scene-hangzhou-lake` 可复用） |

**每城另需**：`city-<id>-entry.webp`（入城视角小图 960×540）与三张探索点插图 `site-<id>-1/2/3.webp`（各 960×540）。十二城合计 **12 + 36 = 48 张**。

## ⏳ P1 · 随从系统（GDD §11）

| 引用名 | 内容 | 尺寸 |
|---|---|---|
| `retainer-<id>.webp` × 18 | 随从半身立绘，朝右，底部 15% 可被对话框压住 | 900×1300 透明 |
| `role-guide/interpreter/agent/guard/physician/sailor/scribe/acolyte/porter/diviner.webp` | 十种职业徽记 | 各 512×512 透明 |
| `contract-open.webp` `contract-divined.webp` `contract-sealed.webp` | 三种招募方式的契约纸 | 各 800×1000 透明 |
| `seal-wax.webp` | 生辰封印蜡印（三级揭示动画用） | 512×512 透明 |

## ⏳ P1 · 十位师父立绘（沿用旧规划，仍缺）

`mentor-tarot / lenormand / runes / astrodice / western / meihua / iching / dream / bazi / jiaobei.webp`
各 900×1300 透明。现暂借同文明守门人立绘顶替；人设见 `js/data-mentors.js`。

---

## ⏳ P2 · 补全与升级

| 引用名 | 内容 | 尺寸 |
|---|---|---|
| `decks/iching/iching-31..64-*-full.webp`（34 张） | 易经卦牌下半部，命名沿用现规则 | 同现有 |
| `realm-tarot/western/astrodice/jiaobei/meihua/lenormand.webp`（6 张） | 占法徽记（`ART_EMOJI_MAP.json` 已指向这些名字但文件未出，现由近似纹章顶替） | 512×512 透明 |
| `map-city-chr/isl/con/mazu.webp`、`map-court-con.webp`、`map-shrine.webp` | 地图城塞小像（现由 SVG 立面顶替） | 256×220 透明 |
| `map-beast-serpent/whale/roc/griffin.webp`、`map-rose.webp`、`map-wind-head.webp`、`map-cartouche.webp`、`map-border.webp` | 地图异兽与装饰（现由 SVG 顶替） | 见 `ART_PROMPTS_MAP.md` |
| `tr-*.webp`（12 张） | 交通小像（现由 `ic-travel-*` 纹章顶替，可不做） | 256×160 透明 |
| `sticker-*.webp` | 纪念贴纸，按城市／食物／建筑／导师／占法／商品／路线／节庆／人物分类 | 各 400×400 透明 |
| `goods-*.webp` × 60 | 商品图标（MVP 六十种） | 各 256×256 透明 |
| `currency-ducat/dinar/dirham/cash/sycee.webp` | 五种货币 | 各 256×256 透明 |

---

## 优先级小结

**先画 P0**（书案 8 + 导入 11 + 角色生成 17 ≈ 36 张）——没有这些，开场三拍无法成立。
**再画 P1**（城市 48 + 随从 32 + 师父 10 ≈ 90 张）——MVP 内容体验的骨架。
**P2 随内容扩充**，且多数已有 SVG 或纹章顶替，不阻塞开发。
