# v3 M0–M1 六维验证 · 修复清单

验证维度：需求完整性 · 逻辑正确性 · 边界情况 · 代码质量 · 测试覆盖 · 实际运行。

## P0（已修）

| # | 问题 | 修复 |
|---|------|------|
| 1 | 雾地图洪水：chargen/抵达自动解锁全部邻城邻路 | chargen 仅解锁起点出站路；抵达只保留已走路 + 目的城 |
| 2 | 背包满仍扣币购买 | `applyEffects` 预检 + `CITY.buy` 拦截，`blocked:'bag_full'` |
| 3 | `lot` / `jiaobei` 学习不一致 | `learnDivination` 双向别名 |

## P1（已修）

| # | 问题 | 修复 |
|---|------|------|
| 4 | 停笔后仍可进世界/地图 | `stopped` → 直接结语 |
| 5 | 驿站/`paiza` 缺失 | `goods.paiza` + `ev-shangdu-paiza`；出行认 `paiza`/`paiza-silk` |
| 6 | 学艺/神龛缺银钱守卫；皈依结局缺路径 | 扣币预检；神龛可 `faith` 转换 |
| 7 | 威尼斯/阿卡入口未显式解锁 | `unlockRoute` + `revealMap` |
| 8 | `meihua` mentor `at:pamir`（城表无） | 改为 `kashgar` |
| 9 | `loadTables` 失败后 `DB_READY` 卡死 | 失败清标志；`worldMap` `.catch` |
| 10 | `map.js` 仍调 `FQ.J.*` 会崩 | `MAP.render` 无 journey 时安全回退 |
| 11 | 无内核单测 | `scripts/test-v3-effects.mjs` |
| 12 | README 仍写 v2 主路径 | 改为 v3 M0–M1 |
| 13 | REQ_ANALYSIS M1 勾选未同步 | 已勾选 |

## 验证命令

```bash
node scripts/validate-tables.mjs
node scripts/test-v3-effects.mjs
```

结果（修复后）：表校验 OK；12 项单测 ALL PASSED。
