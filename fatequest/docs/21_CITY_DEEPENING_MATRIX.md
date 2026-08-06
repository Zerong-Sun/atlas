# 21 City 探索点深化接线矩阵

本表由 `tools/lore/build_21city_followups.mjs` 生成。每座 `city` 级城市至少 1 个探索点进入多轮互动；枢纽城 `chamba` / `badashan` / `tanpiju` 两点都加深。

| 城市 | 探索点 | 后续事件 | 枢纽双点 | 结果类型 |
|---|---|---|---|---|
| 起儿漫 `kerman` | `ev-kerman-a` | `ev-kerman-a-followup` | 否 | goods/codex/reveal_map/reputation/days |
| 卡玛迪 `camadi` | `ev-camadi-a` | `ev-camadi-a-followup` | 否 | goods/codex/reveal_map/days/reputation |
| 天德州 `tenduc` | `ev-tenduc-a` | `ev-tenduc-a-followup` | 否 | reveal_map/codex/coins/reputation/days/fate |
| 巴达哈伤 `badashan` | `ev-badashan-a` | `ev-badashan-a-followup` | 是 | goods/codex/reveal_map/days/fate |
| 巴达哈伤 `badashan` | `ev-badashan-b` | `ev-badashan-b-followup` | 是 | coins/reputation/fate/reveal_map/codex/goods |
| 哈密 `camul` | `ev-camul-a` | `ev-camul-a-followup` | 否 | goods/fate/reveal_map/codex/days |
| 克什米尔 `keshimur` | `ev-keshimur-a` | `ev-keshimur-a-followup` | 否 | days/codex/fate/reveal_map/coins/reputation |
| 塔伊坎 `taican` | `ev-taican-a` | `ev-taican-a-followup` | 否 | goods/reputation/reveal_map/codex/days |
| 潭州 `tanpiju` | `ev-tanpiju-a` | `ev-tanpiju-a-followup` | 是 | goods/codex/reveal_map/days/fate |
| 潭州 `tanpiju` | `ev-tanpiju-b` | `ev-tanpiju-b-followup` | 是 | goods/codex/coins/reputation/reveal_map |
| 甘州 `campichu` | `ev-campichu-a` | `ev-campichu-a-followup` | 否 | reveal_map/codex/goods/days/fate |
| 济南 `chinangli` | `ev-chinangli-a` | `ev-chinangli-a-followup` | 否 | goods/reveal_map/codex/days/fate |
| 西安 `kenjanfu` | `ev-kenjanfu-a` | `ev-kenjanfu-a-followup` | 否 | goods/codex/reveal_map/days/fate |
| 襄阳 `saianfu` | `ev-saianfu-a` | `ev-saianfu-a-followup` | 否 | goods/codex/reveal_map/days/fate |
| 徐州 `siju` | `ev-siju-a` | `ev-siju-a-followup` | 否 | goods/reveal_map/codex/days/fate |
| 镇江 `sinju` | `ev-sinju-a` | `ev-sinju-a-followup` | 否 | goods/codex/reveal_map/days/fate |
| 苏州 `suju` | `ev-suju-a` | `ev-suju-a-followup` | 否 | goods/codex/reveal_map/days/fate |
| 占城 `chamba` | `ev-chamba-a` | `ev-chamba-a-followup` | 是 | goods/codex/reveal_map/days/fate |
| 占城 `chamba` | `ev-chamba-b` | `ev-chamba-b-followup` | 是 | goods/codex/reveal_map/days/reputation/fate |
| 亚丁 `aden` | `ev-aden-a` | `ev-aden-a-followup` | 否 | goods/codex/reveal_map/fate/days |
| 加异勒 `cail` | `ev-cail-a` | `ev-cail-a-followup` | 否 | goods/codex/reveal_map/days/fate |
| 卡拉图 `calatu` | `ev-calatu-a` | `ev-calatu-a-followup` | 否 | goods/codex/reveal_map/days/fate |
| 施赫尔 `esher` | `ev-esher-a` | `ev-esher-a-followup` | 否 | goods/codex/reveal_map/days/fate |
| 马拉巴 `melibar` | `ev-melibar-a` | `ev-melibar-a-followup` | 否 | goods/reveal_map/codex/fate/days |

验收：每城至少 1 个 site 选择 `queue_event` 指向有效 followup；枢纽城两点齐全；中英文 key 由 **G31** 与主校验器检查；运行时回归见 `tests/smoke_21city_followups.gd`。
