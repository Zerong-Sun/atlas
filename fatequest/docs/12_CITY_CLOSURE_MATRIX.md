# 十二主城剧情闭环接线矩阵

本表由 `tools/lore/build_12_city_closures.mjs` 生成，描述当前首批剧情接线。入口事件前两项为重要选择，进入两页后果链；第三项使用即时反馈与状态效果。

| 城市 | 入口事件 | 导师事件 | 重要分支 A | 重要分支 B | 探索点 |
|---|---|---|---|---|---|
| 巴里黑 `balc` | `ev-balc-entry` | `ev-balc-mentor` | `ev-balc-consequence-a` → resolution | `ev-balc-consequence-b` → resolution | `ev-balc-a`、`ev-balc-b`、`ev-balc-c` |
| 喀什噶尔 `cascar` | `ev-cascar-entry` | `ev-cascar-mentor` | `ev-cascar-consequence-a` → resolution | `ev-cascar-consequence-b` → resolution | `ev-cascar-a`、`ev-cascar-b`、`ev-cascar-c` |
| 于阗 `cotan` | `ev-cotan-entry` | `ev-cotan-mentor` | `ev-cotan-consequence-a` → resolution | `ev-cotan-consequence-b` → resolution | `ev-cotan-a`、`ev-cotan-b`、`ev-cotan-c` |
| 罗卜 `lop` | `ev-lop-entry` | `ev-lop-mentor` | `ev-lop-consequence-a` → resolution | `ev-lop-consequence-b` → resolution | `ev-lop-bazaar`、`ev-lop-shrine`、`ev-lop-caravanserai` |
| 撒马尔罕 `samarcanda` | `ev-samarcanda-entry` | `ev-samarcanda-mentor` | `ev-samarcanda-consequence-a` → resolution | `ev-samarcanda-consequence-b` → resolution | `ev-samarcanda-a`、`ev-samarcanda-b`、`ev-samarcanda-c` |
| 大都（汗八里） `cambaluc` | `ev-cambaluc-entry` | `ev-cambaluc-mentor-iching` | `ev-cambaluc-consequence-a` → resolution | `ev-cambaluc-consequence-b` → resolution | `ev-cambaluc-a`、`ev-cambaluc-b`、`ev-cambaluc-c` |
| 行在 `kinsay` | `ev-kinsay-entry` | `ev-kinsay-mentor-jiaobei` | `ev-kinsay-consequence-a` → resolution | `ev-kinsay-consequence-b` → resolution | `ev-kinsay-a`、`ev-kinsay-b`、`ev-kinsay-c` |
| 刺桐 `zayton` | `ev-zayton-entry` | `ev-zayton-mentor` | `ev-zayton-ledger-consequence` → resolution | `ev-zayton-watch-consequence` → resolution | `ev-zayton-harbour`、`ev-zayton-fanfang`、`ev-zayton-mazu` |
| 上都 `chandu` | `ev-chandu-entry` | `ev-chandu-mentor` | `ev-chandu-consequence-a` → resolution | `ev-chandu-consequence-b` → resolution | `ev-chandu-a`、`ev-chandu-b`、`ev-chandu-c` |
| 报达 `baldacum` | `ev-baldacum-entry` | `ev-baldacum-mentor-bazi` | `ev-baldacum-consequence-a` → resolution | `ev-baldacum-consequence-b` → resolution | `ev-baldacum-a`、`ev-baldacum-b`、`ev-baldacum-c` |
| 忽鲁谟斯 `ormus` | `ev-ormus-entry` | `ev-ormus-mentor-astrodice` | `ev-ormus-consequence-a` → resolution | `ev-ormus-consequence-b` → resolution | `ev-ormus-a`、`ev-ormus-b`、`ev-ormus-c` |
| 大不里士 `tauris` | `ev-tauris-entry` | `ev-tauris-mentor-tarot` | `ev-tauris-consequence-a` → resolution | `ev-tauris-consequence-b` → resolution | `ev-tauris-a`、`ev-tauris-b`、`ev-tauris-c` |

验收：每个入口选择必须出现即时反馈或后续事件；每条重要分支至少包含一个分支页和一个 resolution 页；中英文 key 由主校验器统一检查。
