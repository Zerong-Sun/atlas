# R1 发布候选签署清单 · RELEASE_CANDIDATE

**2026-08-02 起 · 对应需求书 §13.6 发布候选清单。** 每项含自动验证命令（可重复运行）或人工签署步骤；
已通过项给出证据，人工项待签署。P0/P1 清零前不形成发布候选。

---

## 0. 自动门禁与回归（每次候选前复跑）

```bash
node tools/validate/validate.mjs --quiet                       # 28 道内容门禁
node tools/lore/story.mjs check                                # 译文时效
node tests/test_i18n_lines.mjs                                 # i18n 行测试
/Applications/Godot.app/Contents/MacOS/Godot --headless --path . --script tests/run_tests.gd
/Applications/Godot.app/Contents/MacOS/Godot --headless --path . --script tests/audit_logic.gd
/Applications/Godot.app/Contents/MacOS/Godot --headless --path . --script tests/audit_divination_readings.gd
for test in tests/smoke_*.gd; do
  /Applications/Godot.app/Contents/MacOS/Godot --headless --path . --script "$test" || exit 1
done
/Applications/Godot.app/Contents/MacOS/Godot --headless --path . --script tests/benchmark_systems.gd
/Applications/Godot.app/Contents/MacOS/Godot --headless --path . --script tests/benchmark_map.gd
node tools/validate/verify_pck.mjs build/audit/FateQuest.pck
```

最新结果（2026-08-07，commit `ecb2dda`，T1/O1/R1 执行计划落档复跑）：

| 项目 | 结果 |
|---|---|
| 内容门禁 | ✅ `all gates pass`（0 errors；G26 区分常驻/条件解锁站点） |
| story 时效 | ✅ `3619 current · 0 stale · 0 missing` |
| i18n 行测试 | ✅ `ALL CHECKS PASSED` |
| 内核单测 | ✅ `SUITE: PASS`（16 个） |
| 逻辑审计 | ✅ `tests/audit_logic.gd` 0 项问题 |
| 占法阅读审计 | ✅ `tests/audit_divination_readings.gd` 24 法 reading key 双语全覆盖 |
| UI smoke | ✅ **26 个全绿**（含 `smoke_21city_followups`、`smoke_map_display.gd`、`smoke_dock_drag.gd`、`smoke_twelve_cities.gd`、`smoke_ui_overlay.gd`） |
| 系统基准 | ✅ `BENCHMARK: PASS`（serialize P95 5.93 ms · save P95 33.47 ms · save 7712 B） |
| 地图 CPU 基准 | ✅ `MAP_BENCH`（setup 7.99 ms · mask P95 39.51 ms · travel frame P95 18.71 ms） |
| 地图窗口帧耗 | ✅ `MAP_FPS_BENCH: PASS`（1280×720：zoom P95 0.03 ms · pan P95 0.02 ms · 常驻帧 6.89 ms ≈145 FPS） |
| PCK 结构验证 | ✅ `verify_pck.mjs` PASS（1952 文件 · 必需全在 · 0 泄露） |
| PCK 启动 | ✅ `--main-pack` headless 185 s 零错误 |
| 三平台导出 | ✅ Linux PCK + macOS/Windows zip 包 |
| 美术审计 | ✅ `tools/art/audit.py` 674/674 完好 · 0 棋盘格 · 0 损坏 · 674 接线 |

`docs/benchmarks.json` 落档 systems/map CPU/map FPS/PCK/art 全部基准（机器可读）。
`build/audit/` 存实际产物（PCK/zip，git 忽略不提交）。

---

## 1. 数据门禁与警告归属

- **门禁**：`validate.mjs --quiet` → ✅ 0 errors。
- **warning 归属**：当前 advisory WARN 全部为已知信息性项，无新增未知：
  - G2b（2）：`mentors_divination.json` 中 2 个教学变体事件（`ev-tauris-mentor-astrodice`、`ev-baldacum-mentor-geomancy`）未被城市/路线直接引用——占法已可由 tauris/baldacum 的既有 mentor 事件（含对应 choice）习得，接上会形成重复教学入口，故保持为预留变体，非 P0/P1；
  - G15（1）：0 桩剩余，纯信息；
  - G17（1）：`en.json` 中 1015 个 `ev.*` 键未被事件 title/body/choice 直接引用——占法结果文本等合法先于事件的文本键，纯信息；
  - G20（1）：刺桐模板城市完整提示；
  - G27（1）：草原事件占路线事件 59%，属既有平衡备注。
- **已接线内容**：4 个占法用法站点（`ev-ormus-astrodice-tide`、`ev-baldacum-geomancy-court`、`ev-kiovia-runes-ford`、`ev-zayton-jiaobei-ask`）已加入对应城市 `sites`，`when.flags` 保证仅"已学该占法"后出现，不干扰新手流程。G26 已区分**常驻探索点**（metropolis 恰 3 / city 恰 2）与**条件解锁站点**（带 `when.flags` 不计入常驻配额，但必须 `when.cities` 归属本城），与 `city_view` 运行时过滤一致。
- **状态**：✅ 通过。

## 2. 中英关键流程通读

- **story check**：✅ 0 stale / 0 missing。
- **12 城后果链**：✅ `smoke_twelve_cities.gd` 逐城走完 12 链 × 2 重要分支（consequence → resolution → 城市），0 失败。
- **全分支通读清单**：✅ [`R1_READTHROUGH.md`](R1_READTHROUGH.md) 已备（12 主城 + 21 城深化 + 24 课 + 24 占法 + 路遇 + 8 结局 + 存读档 + 性能人工项）。
- **人工项**：按通读清单逐项打勾（中英各一遍），发现登记表回填 `QA_FIX_LIST`。

## 3. P0 / P1 归零

- **自动**：无已知 P0/P1。QA_FIX_LIST 记录的历史 P1（大不里士商人无后续）已在 `3b8f744` 修复并由 smoke 覆盖。
- **人工项**：60 分钟试玩记录中不得出现 P0/P1（见第 7 项）；P2 需列明负责人与修复版本。

## 4. 新游戏、三身份、五槽存读、旧档迁移、坏档恢复

- **自动**：`smoke_save.gd`（坏档/版本/checksum/备份槽/路径穿越）、`smoke_journey_resume.gd`（旅途中断恢复）、
  `smoke_boot.gd`、`smoke_fatequest_flow.gd` 均通过。
- **人工项**：发布候选前按需求书 §13.2 步骤 1–2、8–9 人工过一遍抽取、起点核对、五槽读写。

## 5. 离线导出资产完整性

- **PCK**：✅ `build/audit/FateQuest.pck`（409,955,504 B）`--export-pack` 成功，含 `vector_map.json` 与全部接线资产。
- **PCK 结构验证**：✅ `tools/validate/verify_pck.mjs` 解析 v4 目录（1952 文件），20 项必需资源全在、`content/story/docs/tests/tools/worldmap/_archive/_sheets` 0 泄露；主场景以二进制 `.scn` + `.remap` 形式存在。
- **启动**：✅ `--main-pack` 主包启动 185 s 零错误（后台验证后主动停止）。
- **平台包**：✅ macOS/Windows 预设 zip 已导出（各 405 MB）；Linux 可执行档与 macOS `.app` 需官方 export templates 安装后构建。
- **人工项**：三目标平台可执行文件（Linux/macOS/Windows）需对应官方 export template 与实机验收。

## 6. 覆盖层可退出 / 无黑屏 / 无断线

- **自动**：`smoke_ui_overlay.gd` 含键盘遍历（Esc 关闭行囊/市场/设置）+ 200% 中英覆盖层断言，✅ 通过。
- **无黑屏**：`smoke_map_display.gd` 驱动真实进图流程（书桌 → 抽签 → 出发 → 到达 → 往返）断言
  `world_map` 可见不透明、迷雾遮罩存在、投影尺寸非零、无全屏覆盖层残留，✅ 通过。
- **人工项**：60 分钟试玩中确认无断线、无黑屏、无不可退出覆盖层。

## 7. 外部 60 分钟试玩

- **交接包**：✅ [`PLAYTEST_README.md`](PLAYTEST_README.md)（运行/构建命令/记录口径/已知限制）+ [`PLAYTEST_FEEDBACK.md`](PLAYTEST_FEEDBACK.md)（反馈表单）+ `build/audit/FateQuest.pck`（409.96 MB，已验证）+ `FateQuest-mac.zip` / `FateQuest-win.zip`（405 MB）。
- **固定 seed**：按身份确定（`fatequest:polo` / `fatequest:steppe` / `fatequest:merchant`），同一身份世界确定、可复现；开局抽签可用 `-- --seed=<串>` 固定（缺省行为不变）。
- **状态**：⏳ 待外部执行（三平台可执行档需先安装 export templates，见交接包 §3）。
- **流程**：新玩家 / 三个身份各 30–60 分钟；记录完成率、断点、P0/P1/P2 清单、固定 seed、构建 commit、
  验证器结果（§13.5）。
- **出口**：0 个 P0/P1，P2 有负责人。

## 8. 版权、生成式工具记录、史料来源与文化审阅

- **史料来源**：马可·波罗 / 伊本·白图泰 / 法德兰 / 朱拜尔逐段标记，`passages.json` 含 `origin` 与时代性宗教贬语标记（G24 拦截）。
- **生成式工具记录**：`docs/AI_USAGE.md`（如有）与美术批次 `ART_PROMPTS_REQ_*.md` 留存。
- **文化审阅归档模板**（G24 拦截证据 + 术语 + 来源标记，供人工填日期签署）：

| 归档项 | 证据位置 | 复核人 | 日期 |
|---|---|---|---|
| G24 时代性宗教贬语拦截 0 errors | `node tools/validate/validate.mjs`（G24 门禁） | | |
| 术语一致性（筊/周易/季风/商队/驿栈等） | `assets/data/glossary.json` | | |
| 史料 origin 逐段标记 | `content/world/passages.json` | | |
| 中英关键流程通读（zh/en 各一遍） | `docs/R1_READTHROUGH.md` | | |
| 24 课/480 占法结果文化校读 | T1 完成记录（2026-08-06/07） | | |

## 9. README / STATUS / 需求书 / 发行说明一致

- **自动**：`docs/STATUS.md` 数据表与实际表一致（events 415、goods 60、art 674）。
- **人工项**：发版前核对 README、STATUS、需求书版本号与发行说明。

---

## 签署状态汇总

| # | 项 | 状态 |
|---|---|---|
| 1 | 数据门禁 + warning 归属 | ✅ 自动 |
| 2 | 中英关键流程通读 | 🟡 清单已备（`R1_READTHROUGH.md`）；人工通读待签 |
| 3 | P0/P1 归零 | 🟡 无已知；60 分钟试玩待签 |
| 4 | 三身份/五槽/坏档 | 🟡 自动部分✅；§13.2 人工步骤待签 |
| 5 | 离线导出资产 | 🟡 PCK✅（`verify_pck` PASS）+ mac/win zip 已导出；平台可执行档待模板装后构建 |
| 6 | 覆盖层可退出 | 🟡 自动部分✅；试玩确认待签 |
| 7 | 外部 60 分钟试玩 | 🟡 交接包已备（`PLAYTEST_README`/`FEEDBACK`/PCK/双 zip/`--seed`）；试玩待执行 |
| 8 | 版权/工具/史料/文化 | 🟡 归档模板已建（§8 表）；`AI_USAGE.md` 待建；文化审阅待签 |
| 9 | 文档一致 | 🟡 自动部分✅；发版前核对待签 |

**结论**：可自动验证的发布候选门禁全部通过；试玩交接包（运行说明 + 反馈表单 + PCK + 双 zip + 固定 seed）与全分支
通读清单已备齐。剩余为外部试玩（第 7 项）、三平台可执行档构建与实机验收、文化审阅等人工签署项。
