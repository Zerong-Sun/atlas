# Nanghin 与 Tiju 地理校正（2026-10-30）

## 依据与确定程度

- 项目所附 Yule–Cordier 编注《马可·波罗游记》卷 II 第 LXVII 章注 1 识 `Cayu` 为高邮；第 LXVIII 章注 1 采纳 `Tiju` 为泰州的通行解释，但说明原文的运河路线与泰州向东偏离运河的方位不完全吻合；同章注 2 识 `Yanju` 为扬州；第 LXIX 章注 1 认为 `Nanghin` 很可能是安庆。原文位置：`assets/books/02_The_Travels_of_Marco_Polo_Vol2_Marco_Polo.txt`，约第 8915–9110 行。[公版底本](https://www.gutenberg.org/cache/epub/12410/pg12410-images.html)。这些是编注者的地名考证，不应写成波罗亲自给出的现代地名。
- [联合国地名专家组：安庆](https://ungegn.un.org/dashboard/cities/details?id=1904)录中国地名研究所坐标经度 117.05、纬度 30.53；[泰州](https://ungegn.un.org/dashboard/cities/details?id=2384)录经度 119.92、纬度 32.48。地图数据按 `[经度, 纬度]` 记录。

## 本次数据处理

| ID | 旧标签与位置 | 本次标签与位置 | 理由 |
| --- | --- | --- | --- |
| `nanghin` | 扬州；118.797, 32.060（南京） | 安庆；117.05, 30.53 | `Yanju` 才是扬州；第 LXIX 章注 1 暂定 Nanghin 为安庆。 |
| `tiju` | 高邮；119.443, 32.785（高邮） | 泰州；119.92, 32.48 | `Cayu` 才是高邮；第 LXVIII 章注 1 将 Tiju 识为泰州。 |

同步了 `worldmap/scripts/gen_vector_data.py`、`worldmap/data/cities.geojson`、`worldmap/data/cities.csv`、`content/tables/cities/china.json`，并用 `worldmap/scripts/build_web_map.py` 刷新嵌入地图数据的 `worldmap/web/index.html`。另修正 `tools/lore/build_entry_texts.py` 的 Nanghin→Yangiu 错误别名、Tiju 的高邮兜底文案及地名种子词表。中英文城市名、图鉴、入城/问路文本由 `content/story/nanghin`、`content/story/tiju` 维护；图鉴不再只在运行时 JSON 中存放无来源的地名副本。

镇江府、淮安、宝应、真州的问路文字原来仍把 `Nanghin` 当作扬州或南京、把 `Tiju` 当作高邮；这些文本现在按事件真正揭示的路线改为安庆和泰州。邳州的运河问路原来把高邮说成淮安以北且揭示的却是宝应，现改为先经淮安、再到宝应。仍以扬州为起点的真州入城正文对应书中的 `Yanju`，故保留扬州。

原有八条关联路线保留连边，仅按 `tools/lore/build_routes.mjs` 使用的球面距离和陆路 30 公里/日规则，更新 `distanceKm`、`days`、`cost`；天数为 `max(1, round(distance/30))`，费用为每天 30。新距离分别为 `caiju–tiju` 55、`chinghianfu–nanghin` 291、`coigangiu–tiju` 148、`coiganju–tiju` 134、`nanghin–caiju` 294、`nanghin–sinju` 280、`paukin–tiju` 101、`tiju–sinju` 73 公里。它们是游戏现有直线距离模型，不是史实道路里程。

## 仍需留意

当前内容表没有 `Cayu`（高邮）和 `Yanju`（扬州）两个可访问城市节点，虽然游记正文及不少既有故事提到它们。本次不扩展图和事件，以免为一项地名修正制造大量占位内容。`build_routes.mjs` 重新运行时会按最近邻规则重建**整个**路线拓扑并覆盖各城市 `exits`，因此这次只校正现有八条路线的里程和日数；若之后要加入高邮或扬州，应整体审查路线网络，而不是把当前连边当作已考证的古道。
