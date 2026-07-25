# v3.0 M2–M3 验收清单

平台：主树 PWA · Polo + Battuta · 见 `docs/GDD.md` §16

## 替换（主路径）

- [x] `index.html` / `sw.js` 不加载 `map.js`、`data-quests-stories.js`
- [x] 无 tower / journey 底栏入口；`app.js` 灯标对齐 `world`
- [x] 旧模块保留于 `archive/v2-pwa/`

## M2 · 占卜闭环

- [x] 五拍仪式壳 `js/ritual.js` + `css/method-motion.css`
- [x] 城内探索 / 路上遇险带 `divination` 的选项走仪式（非静默硬币）
- [x] `divinations.json` 的 `{stat,delta}` 写入 `routeMods` / `omen`
- [x] 吉象可解锁邻路（改路验收）
- [x] 导师学艺：微操通过后才 `learnDivination`（易/星骰/签）
- [x] `FQ.worldCast` / 引擎对接三法

## M3 · 内容

- [x] `codex.json` + Records「图鉴」栏；`w.codex[]` 进度
- [x] 白图泰六城：`tangier→cairo→damascus→mecca→delhi→calicut`
- [x] `battuta` 身份 + `end-battuta-witness`
- [x] 巴格达→大马士革桥
- [x] 开罗 / 麦加各 3 拍对话树（`goto:event:`）
- [x] Polo 满配 entry/site 正文加厚
- [x] `data-battuta-lore.js` + zh trunk

## 自动验收

```bash
node scripts/validate-tables.mjs
node scripts/test-v3-effects.mjs
```

## 手工（发版前）

1. Polo：学艺 → 上路占卜 → 舆图出现新线  
2. Battuta：丹吉尔开局 → 入麦加 → 完成朝觐树 → 停笔看隐藏结局  
3. Records → 图鉴有解锁条目
