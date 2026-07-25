# v2 PWA 博物馆快照

本目录保存 **v2.0 千载行纪** 主路径退出前的关键模块，供对照与考古。**不可与 v3 `assets/data/*.json` 世界存档互通。**

## 含什么

| 路径 | 原用途 |
|------|--------|
| `js/tower.js` · `js/data-tower.js` | 命途塔 12 层 |
| `js/journey.js` · `js/data-journey*.js` · `js/data-secret-paths.js` | 占途节点抽签环 |
| `js/outcomes/marco-*.js` | 节点 outcome 矩阵 |
| `js/map.js` · `js/data-quests-stories.js` | 旧舆图 SVG / journey 任务见闻（M2 起主路径卸载） |

## 如何本地回看（博物馆）

1. 在 git 历史中检出含完整 `index.html` 加载上述脚本的提交，或自行拼回旧脚本列表。
2. 用静态服务器打开 `fatequest/`。
3. 勿与当前 v3 `localStorage` 键混用。

当前主树由 `chargen` / `city` / `travel` / `ritual` + 系统表驱动；无 tower / journey 入口。
