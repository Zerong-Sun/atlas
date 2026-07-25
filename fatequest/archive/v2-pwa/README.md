# v2 PWA 博物馆快照

本目录保存 **v2.0 千载行纪** 主路径退出前的关键模块，供对照与考古。**不可与 v3 `assets/data/*.json` 世界存档互通。**

## 含什么

| 路径 | 原用途 |
|------|--------|
| `js/tower.js` · `js/data-tower.js` | 命途塔 12 层 |
| `js/journey.js` · `js/data-journey*.js` · `js/data-secret-paths.js` | 占途节点抽签环 |
| `js/outcomes/marco-*.js` | 节点 outcome 矩阵（~2000 行） |

## 如何本地回看（博物馆）

1. 在 git 历史中检出含完整 `index.html` 加载上述脚本的提交，或自行拼回旧 `index.html` 脚本列表（见仓库历史）。
2. 用静态服务器打开 `fatequest/`：`npx serve fatequest` 或 Python `http.server`。
3. 勿与当前 v3 `localStorage` 键 `fatequest` 混用——可先清站点数据。

当前主树 **`index.html` 已去掉塔与旧 journey/outcomes 加载**；世界循环由 `chargen` / `city` / `travel` + 八张系统表驱动。

## 与 v3 的关系

- 可玩文本与节点叙事已部分迁移进 `assets/data/events.json` 等表。
- 牌组、`data-mentors`、美术资产仍在主树共用。
- 详见 `docs/GDD.md` §16、`docs/V3_MVP_CHECKLIST.md`。
