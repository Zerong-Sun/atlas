# R1 发布候选签署清单 · RELEASE_CANDIDATE

**2026-08-02 起 · 对应需求书 §13.6 发布候选清单。** 每项含自动验证命令（可重复运行）或人工签署步骤；
已通过项给出证据，人工项待签署。P0/P1 清零前不形成发布候选。

---

## 0. 自动门禁与回归（每次候选前复跑）

```bash
node tools/validate/validate.mjs --quiet                       # 25 道内容门禁
node tools/lore/story.mjs check                                # 译文时效
node tests/test_i18n_lines.mjs                                 # i18n 行测试
/Applications/Godot.app/Contents/MacOS/Godot --headless --path . --script tests/run_tests.gd
for test in tests/smoke_*.gd; do
  /Applications/Godot.app/Contents/MacOS/Godot --headless --path . --script "$test" || exit 1
done
/Applications/Godot.app/Contents/MacOS/Godot --headless --path . --script tests/benchmark_systems.gd
```

最新结果（2026-08-03）：

| 项目 | 结果 |
|---|---|
| 内容门禁 | ✅ `all gates pass`（0 errors） |
| story 时效 | ✅ `2646 current · 0 stale · 0 missing` |
| i18n 行测试 | ✅ `ALL CHECKS PASSED` |
| 内核单测 | ✅ `SUITE: PASS`（16 个） |
| UI smoke | ✅ **23 个全绿**（含新增 `smoke_map_display.gd`、`smoke_dock_drag.gd`、`smoke_twelve_cities.gd`、`smoke_ui_overlay.gd`） |
| 系统基准 | ✅ `BENCHMARK: PASS`（serialize P95 1.10 ms · save P95 5.98 ms） |

---

## 1. 数据门禁与警告归属

- **门禁**：`validate.mjs --quiet` → ✅ 0 errors。
- **warning 归属**：当前 advisory WARN 为既有已知项（G20 刺桐模板完整提示、G27 草原事件占比），
  无新增未知 warning。
- **状态**：✅ 通过。

## 2. 中英关键流程通读

- **story check**：✅ 0 stale / 0 missing。
- **12 城后果链**：✅ `smoke_twelve_cities.gd` 逐城走完 12 链 × 2 重要分支（consequence → resolution → 城市），0 失败。
- **人工项**：发布候选前由人通读一遍中英各关键流程（入口 → 探索 → 导师 → 出行 → 结局）。

## 3. P0 / P1 归零

- **自动**：无已知 P0/P1。QA_FIX_LIST 记录的历史 P1（大不里士商人无后续）已在 `3b8f744` 修复并由 smoke 覆盖。
- **人工项**：60 分钟试玩记录中不得出现 P0/P1（见第 7 项）；P2 需列明负责人与修复版本。

## 4. 新游戏、三身份、五槽存读、旧档迁移、坏档恢复

- **自动**：`smoke_save.gd`（坏档/版本/checksum/备份槽/路径穿越）、`smoke_journey_resume.gd`（旅途中断恢复）、
  `smoke_boot.gd`、`smoke_fatequest_flow.gd` 均通过。
- **人工项**：发布候选前按需求书 §13.2 步骤 1–2、8–9 人工过一遍抽取、起点核对、五槽读写。

## 5. 离线导出资产完整性

- **PCK**：✅ `build/audit/FateQuest.pck`（409,429,492 B）`--export-pack` 成功，含 `vector_map.json` 与全部接线资产。
- **启动**：✅ `--main-pack` 主包启动 85 s 零错误（后台验证后主动停止）。
- **人工项**：三目标平台可执行文件（Linux/macOS/Windows）需对应官方 export template 与实机验收。

## 6. 覆盖层可退出 / 无黑屏 / 无断线

- **自动**：`smoke_ui_overlay.gd` 含键盘遍历（Esc 关闭行囊/市场/设置）+ 200% 中英覆盖层断言，✅ 通过。
- **无黑屏**：`smoke_map_display.gd` 驱动真实进图流程（书桌 → 抽签 → 出发 → 到达 → 往返）断言
  `world_map` 可见不透明、迷雾遮罩存在、投影尺寸非零、无全屏覆盖层残留，✅ 通过。
- **人工项**：60 分钟试玩中确认无断线、无黑屏、无不可退出覆盖层。

## 7. 外部 60 分钟试玩

- **状态**：⏳ 待执行。
- **流程**：新玩家 / 三个身份各 30–60 分钟；记录完成率、断点、P0/P1/P2 清单、固定 seed、构建 commit、
  验证器结果（§13.5）。
- **出口**：0 个 P0/P1，P2 有负责人。

## 8. 版权、生成式工具记录、史料来源与文化审阅

- **史料来源**：马可·波罗 / 伊本·白图泰 / 法德兰 / 朱拜尔逐段标记，`passages.json` 含 `origin` 与时代性宗教贬语标记（G24 拦截）。
- **生成式工具记录**：`docs/AI_USAGE.md`（如有）与美术批次 `ART_PROMPTS_REQ_*.md` 留存。
- **人工项**：发布前完成文化审阅记录归档。

## 9. README / STATUS / 需求书 / 发行说明一致

- **自动**：`docs/STATUS.md` 数据表与实际表一致（events 382、goods 60、art 674）。
- **人工项**：发版前核对 README、STATUS、需求书版本号与发行说明。

---

## 签署状态汇总

| # | 项 | 状态 |
|---|---|---|
| 1 | 数据门禁 + warning 归属 | ✅ 自动 |
| 2 | 中英关键流程通读 | 🟡 自动部分✅；人工通读待签 |
| 3 | P0/P1 归零 | 🟡 无已知；60 分钟试玩待签 |
| 4 | 三身份/五槽/坏档 | 🟡 自动部分✅；§13.2 人工步骤待签 |
| 5 | 离线导出资产 | 🟡 PCK✅；三平台可执行文件待签 |
| 6 | 覆盖层可退出 | 🟡 自动部分✅；试玩确认待签 |
| 7 | 外部 60 分钟试玩 | ⏳ 待执行 |
| 8 | 版权/工具/史料/文化 | 🟡 大部分归档；文化审阅待签 |
| 9 | 文档一致 | 🟡 自动部分✅；发版前核对待签 |

**结论**：可自动验证的发布候选门禁全部通过；剩余为外部试玩（第 7 项）与三平台实机验收等人工签署项。
