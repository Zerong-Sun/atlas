# M2–M3 六维验证 · 修复清单

验证维度：需求完整性 · 逻辑正确性 · 边界情况 · 代码质量 · 测试覆盖 · 实际运行。

## P0（已修）

| # | 问题 | 修复 |
|---|------|------|
| 1 | 凶象 `applyDivinationTableEffects` 对负 `delta` 用 `-Math.abs`，吉凶同向 | 改为 `pass ? d : -d` |
| 2 | 星骰读 `sign.elem`（不存在），几乎纯随机判定 | 改读 `elemZh`/`elemEn`，土火为吉 |

## P1（已修）

| # | 问题 | 修复 |
|---|------|------|
| 3 | 拜师仪式仍写入 `routeMods`/解锁旁路 | `skipTableFx` |
| 4 | 巴格达 `exits` 缺桥路线 | 加入 `rt-baghdad-damascus` |
| 5 | 缺 `omen.astrodice.*` 文案 | 补 i18n |
| 6 | 出行未吃 `routeMods.days` / 有效风险 | `TRAVEL.go` 接入 |
| 7 | 仪式悬念 `setTimeout` 未清理 | 计时器可取消 |

## 验证命令

```bash
node scripts/validate-tables.mjs
node scripts/test-v3-effects.mjs
```

结果：表校验 OK；单测含 fail 反转与桥出口，全部通过。
