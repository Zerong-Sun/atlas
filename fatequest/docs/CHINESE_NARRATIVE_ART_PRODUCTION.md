# 中文叙事配图生产清单

本轮与 2026-10-25 中文剧情自然化同步维护。城市图用于入城卡/对话背景；按实际城市记录和 `MapArt.city_entry()` 的资源名核对，不以资源索引总数推断覆盖率。插图不能替代文本来源审查。

## 生产规格

- 103 座城市各自一张 16:9 入城背景，WebP 960×540；人物、建筑、地貌、贸易或天气应对应该城当前入城文本。不得因同属一个文化区而重复一张通用画面。
- 风格沿用项目现有暖纸色、手绘旅行插画；构图为对话 UI 留清晰安全区，不放文字、现代物件或不合时代的奇幻元素。
- 有专属人物对白时，核对 `game/map/portrait_art_map.json` 和人物审计清单。缺少与角色相符的单人头像，先登记 brief；不得拿身份不符的合照或异地肖像顶替。
- 新图保留生成原图；项目内转为 WebP，并在 `game/map/art_wire_index.json` 注册。生成后记录 prompt、源段落、输出文件和视觉核对结果。

## 城市入城图登记

| 城市 ID | 美术资源 ID | 状态 | 其他已命名场景图 |
|---|---|---|---|
| `accon` | `acre` | 已注册专属入城图 | 现有命名场景：`scene-acre-wall` |
| `aden` | `aden` | 已注册专属入城图 | — |
| `alexandria` | `alexandria` | 已注册专属入城图 | — |
| `antiochia` | `antiochia` | 已注册专属入城图 | — |
| `axuma` | `axuma` | 已注册专属入城图 | — |
| `babylonia-cairus` | `babylonia-cairus` | 已注册专属入城图 | — |
| `badashan` | `badashan` | 已注册专属入城图 | — |
| `balc` | `balc` | 已注册专属入城图 | — |
| `baldacum` | `baldacum` | 已注册专属入城图 | — |
| `basora` | `basora` | 已注册专属入城图 | — |
| `berrhoea` | `berrhoea` | 已注册专属入城图 | — |
| `bethleem` | `bethleem` | 已注册专属入城图 | — |
| `bochara` | `bochara` | 已注册专属入城图 | — |
| `cabul` | `cabul` | 已注册专属入城图 | — |
| `cacanfu` | `cacanfu` | 已注册专属入城图 | — |
| `cachanfu` | `cachanfu` | 已注册专属入城图 | — |
| `caffa` | `caffa` | 已注册专属入城图 | — |
| `caiju` | `caiju` | 已注册专属入城图 | — |
| `cail` | `cail` | 已注册专属入城图 | — |
| `calatu` | `calatu` | 已注册专属入城图 | — |
| `camadi` | `camadi` | 已注册专属入城图 | — |
| `cambaet` | `cambaet` | 已注册专属入城图 | — |
| `cambaluc` | `cambaluc` | 已注册专属入城图 | 现有命名场景：`scene-khanbaliq-hall` |
| `campichu` | `campichu` | 已注册专属入城图 | — |
| `camul` | `camul` | 已注册专属入城图 | — |
| `caracoron` | `caracoron` | 已注册专属入城图 | — |
| `cascar` | `cascar` | 已注册专属入城图 | — |
| `chamba` | `chamba` | 已注册专属入城图 | — |
| `chandu` | `chandu` | 已注册专属入城图 | 现有命名场景：`scene-shangdu-palace` |
| `charchan` | `charchan` | 已注册专属入城图 | — |
| `chinangli` | `chinangli` | 已注册专属入城图 | — |
| `chinghianfu` | `chinghianfu` | 已注册专属入城图 | — |
| `chinginju` | `chinginju` | 已注册专属入城图 | — |
| `cobinan` | `cobinan` | 已注册专属入城图 | — |
| `coigangiu` | `coigangiu` | 已注册专属入城图 | — |
| `coiganju` | `coiganju` | 已注册专属入城图 | — |
| `coilum` | `coilum` | 已注册专属入城图 | — |
| `constantinopolis` | `constantinopolis` | 已注册专属入城图 | — |
| `cotan` | `cotan` | 已注册专属入城图 | — |
| `ctesiphon` | `ctesiphon` | 已注册专属入城图 | — |
| `damascus` | `damascus` | 已注册专属入城图 | — |
| `delli` | `delli` | 已注册专属入城图 | — |
| `dongola` | `dongola` | 已注册专属入城图 | — |
| `dufar` | `dufar` | 已注册专属入城图 | — |
| `edessa` | `edessa` | 已注册专属入城图 | — |
| `egrigaia` | `egrigaia` | 已注册专属入城图 | — |
| `ephesus` | `ephesus` | 已注册专属入城图 | — |
| `esher` | `esher` | 已注册专属入城图 | — |
| `etzina` | `etzina` | 已注册专属入城图 | — |
| `fuju` | `fuju` | 已注册专属入城图 | — |
| `hierusalem` | `hierusalem` | 已注册专属入城图 | — |
| `ispahan` | `ispahan` | 已注册专属入城图 | — |
| `java-major` | `java-major` | 已注册专属入城图 | — |
| `kenjanfu` | `kenjanfu` | 已注册专属入城图 | — |
| `kerman` | `kerman` | 已注册专属入城图 | 现有命名场景：`scene-kerman-dunes` |
| `keshimur` | `keshimur` | 已注册专属入城图 | — |
| `kinsay` | `kinsay` | 已注册专属入城图 | 现有命名场景：`scene-hangzhou-lake` |
| `kiovia` | `kiovia` | 已注册专属入城图 | — |
| `linju` | `linju` | 已注册专属入城图 | — |
| `lop` | `lop` | 已注册专属入城图 | — |
| `maabar` | `maabar` | 已注册专属入城图 | — |
| `maldive` | `maldive` | 已注册专属入城图 | — |
| `mecha` | `mecha` | 已注册专属入城图 | — |
| `medina` | `medina` | 已注册专属入城图 | — |
| `melibar` | `melibar` | 已注册专属入城图 | — |
| `merva` | `merva` | 已注册专属入城图 | — |
| `mien` | `mien` | 已注册专属入城图 | — |
| `moscovia` | `moscovia` | 已注册专属入城图 | — |
| `nanghin` | `nanghin` | 已注册专属入城图 | — |
| `nicaea` | `nicaea` | 已注册专属入城图 | — |
| `ninive` | `ninive` | 已注册专属入城图 | — |
| `novogardia` | `novogardia` | 已注册专属入城图 | — |
| `ormus` | `hormos` | 已注册专属入城图 | 现有命名场景：`scene-hormuz-port` |
| `paukin` | `paukin` | 已注册专属入城图 | — |
| `pein` | `pein` | 已注册专属入城图 | — |
| `pentam` | `pentam` | 已注册专属入城图 | — |
| `petra` | `petra` | 已注册专属入城图 | — |
| `sachiu` | `sachiu` | 已注册专属入城图 | — |
| `saianfu` | `saianfu` | 已注册专属入城图 | — |
| `samara` | `samara` | 已注册专属入城图 | — |
| `samarcanda` | `samarcanda` | 已注册专属入城图 | — |
| `sapurgan` | `sapurgan` | 已注册专属入城图 | — |
| `semenat` | `semenat` | 已注册专属入城图 | — |
| `siju` | `siju` | 已注册专属入城图 | — |
| `sindafu` | `sindafu` | 已注册专属入城图 | — |
| `sinju` | `sinju` | 已注册专属入城图 | — |
| `sinjumatu` | `sinjumatu` | 已注册专属入城图 | — |
| `smyrna` | `smyrna` | 已注册专属入城图 | — |
| `suju` | `suju` | 已注册专属入城图 | — |
| `taican` | `taican` | 已注册专属入城图 | — |
| `tana` | `tana` | 已注册专属入城图 | — |
| `tana-azov` | `tana-azov` | 已注册专属入城图 | — |
| `tanpiju` | `tanpiju` | 已注册专属入城图 | — |
| `tarsus` | `tarsus` | 已注册专属入城图 | — |
| `tauris` | `tauris` | 已注册专属入城图 | 现有命名场景：`scene-tabriz-bazaar` |
| `tenduc` | `tenduc` | 已注册专属入城图 | — |
| `tiju` | `tiju` | 已注册专属入城图 | — |
| `trapezus` | `trapezus` | 已注册专属入城图 | — |
| `tripolis` | `tripolis` | 已注册专属入城图 | — |
| `tyrus` | `tyrus` | 已注册专属入城图 | — |
| `yarcan` | `yarcan` | 已注册专属入城图 | — |
| `yasdi` | `yasdi` | 已注册专属入城图 | — |
| `zayton` | `zayton` | 已注册专属入城图 | 现有命名场景：`scene-quanzhou-harbor` |

共 103 城，当前有 103 张专属入城图已注册，0 城仍待制作。

本轮 103 城入城图已全部生成、转为 960×540 WebP 并注册到 `art_wire_index.json`。`accon` 与 `ormus` 分别复用已配置的 `acre`、`hormos` 专属图资源；城市条目数仍按 103 计算。

每张图依据对应 `content/story/<city>/zh.md` 的 `ev.<city>.entry.body` 定制，生成 PNG 原图保留在 Codex generated_images 目录。其他具名场景背景继续只绑定其对应事件。

## 人物头像与其他场景背景

- 亚历山大入城欢迎场景现由搬运工引路；`npc-alexandria-porter.webp` 已生成并绑定 `ev-alexandria-welcome-gate`，人物为搬运工，不能沿用原先商人画像。
- 本轮已完成 103 张城市入城背景及亚历山大搬运工专属头像。其他游戏场景角色的肖像审计队列见 [`library_audit/portrait_review_inventory.csv`](library_audit/portrait_review_inventory.csv)；非入城互动场景的专属背景继续按对应事件和运行时调用逐项登记，不以入城图代替。
- 已存在的命名场景背景继续复用其本来对应的事件；城市入城图不取代市集、住家、港口、神殿等互动场景需要的背景。

## 中国城市新增登记（2026-10-25）

新增 8 张逐城定制的专属入城背景，均依据当前 `ev.<id>.entry.body`：`cachanfu`（黄河船市）、`caiju`（瓜州秋粮河运）、`campichu`（甘州寺院与多元信仰）、`chinangli`（长芦丝绸与水路）、`chinghianfu`（镇江府丝市与教堂）、`chinginju`（常州街市与纪念场景）、`coigangiu`（淮阴运河船户）、`coiganju`（淮安漕运枢纽）。8 张原始 PNG 保留在 `/Users/kongde/.codex/generated_images/01a171b6-0348-7bf0-8b04-a2502991ce71/`；项目内 WebP 均为 960×540，并已加入 `art_wire_index.json`。

## 中国城市新增登记（2026-10-25，第二批）

新增 10 张按当前入城正文定制的背景：`cacanfu`（河间府丝织与教堂）、`kenjanfu`（京兆府桑田蚕茧）、`kinsay`（行在石桥与水道）、`linju`（陵州城门与市集）、`siju`（邳州粮市）、`sindafu`（成都府山口平原与旧都城墙）、`sinju`（真州码头船期）、`suju`（苏州石桥与织坊）、`tanpiju`（通州园田与路边问路）、`tiju`（泰州河运与海盐晒场；旧制作记录称高邮）。原始 PNG 保留在 `/Users/kongde/.codex/generated_images/01a171b6-0348-7bf0-8b04-a2502991ce71/`；项目 WebP 均为 960×540，并已加入 `art_wire_index.json`。
