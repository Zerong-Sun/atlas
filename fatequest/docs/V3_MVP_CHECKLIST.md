# v3.0 M0–M1 验收清单

平台：主树 PWA · 世界：Polo 走廊 · 见 `docs/GDD.md` §16.1

## M0 · 数据

- [x] `assets/data/` 存在八张系统表 + `transports.json`
- [x] `node scripts/validate-tables.mjs` 退出码 0
- [x] 十二满配城各有 `entryEvent`、`sites[3]`、`market`、`shrine`、`mentor`、`exits`
- [x] 3 条占卜均有非空 `effects`
- [x] 8 条结局含停笔层 + ≥3 隐藏条件

## M1 · 可玩闭环

- [x] 新开局：书案/标题 → 角色抽取 → 进入起点城（`chargen.js`）
- [x] 满配城：入口事件 + 3 探索点选项可执行（`city.js`）
- [x] 市集可买入至少一种商品
- [x] 导师可学会至少一种 MVP 占法
- [x] 探索选项触发 `revealMap` / `unlockRoute` 后，雾地图出现新城或新线
- [x] 选交通走一段路，可触发 road 事件（`travel.js`）
- [x] 「停下书写」生成结语；至少一条隐藏结局可用（`checkEndings`）
- [x] 底栏无「塔」；不加载 `tower.js` / `outcomes/marco-*.js`
- [x] `node scripts/validate-tables.mjs` 通过

## 明确不测（M2+）

Atlas 全引擎、十种学习小游戏、P0/P1 全量新美术、白图泰章、多槽存档打磨

## 手工浏览器验收（发版前再点一次）

用本地静态服务器打开 `fatequest/index.html`，清 localStorage 后走一遍：生辰→执念→入城→探索→市集→出路→停笔。