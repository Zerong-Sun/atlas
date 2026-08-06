# 外部试玩交接包 · PLAYTEST

**commit `a12f924` · 2026-08-07 · 需求书 §13.2 步骤 / §13.5 记录口径 / §13.6 出口。**
本文是给外部试玩者的运行与记录说明；全分支人工通读清单见 [`R1_READTHROUGH.md`](R1_READTHROUGH.md)。

## 0. 交接包内容

| 物 | 位置 | 说明 |
|---|---|---|
| Godot 工程 | 本仓库 `fatequest/` | 唯一现行实现；`project.godot` 入口 |
| 资源包 PCK | `build/audit/FateQuest.pck` | 409.96 MB · 1952 文件 · `verify_pck.mjs` 已验证 |
| macOS 包 | `build/audit/FateQuest-mac.zip` | 405 MB（zip 打包，装模板后转 `.app`） |
| Windows 包 | `build/audit/FateQuest-win.zip` | 405 MB |
| 通读清单 | `docs/R1_READTHROUGH.md` | 全分支人工通读的可勾选清单 |
| 反馈表单 | `docs/PLAYTEST_FEEDBACK.md` | 每个试玩者一份 |
| 自动门禁 | 见 §4 | 每次候选前复跑 |

> 平台 zip 包已导出；macOS 的 `.app` 与 Linux 可执行档需官方 export templates
> 安装后转换（Godot 编辑器 → Export Templates → 下载），构建与实机验收列为人
> 工签署项（§13.6 第 5 条）。

## 1. 运行方式

**方式 A：编辑器直跑（推荐本机试玩）**

```bash
cd fatequest
godot --path .            # 或 Godot.app 打开目录后 F5
```

**方式 B：资源包直跑**

```bash
godot --path . --main-pack build/audit/FateQuest.pck
```

**方式 C：打包后运行**（模板装好后，见 §3）——直接启动产物。

## 2. 试玩流程与记录口径（§13.2 / §13.5）

- **身份**：马可·波罗 `polo`（tauris→cambaluc）· 草原旅人 `steppe`（tauris→chandu）· 商人 `merchant`（ormus→zayton）。
- **固定 seed**：按身份确定 —— `fatequest:polo` / `fatequest:steppe` / `fatequest:merchant`
  （`main.gd rng_seed()`，同一身份的所有试玩共享同一确定性世界，便于复现）。记录身份即记录 seed。
- **开局抽签复现（可选）**：`godot --path . -- --seed=<任意串>` 可固定角色抽取随机流
  （缺省行为不变）。试玩者若需复现某次开局三选，把启动命令原样写进反馈表单。
- **时长**：每身份 30–60 分钟。记录完成率（是否到达目标城/是否结局）、断点、问题清单。
- **每个候选必须记录**：测试日志、固定 seed、构建 commit、验证器结果（§4）、已知问题清单 —— 都写进反馈表单。

## 3. 构建平台可执行档（装好模板后）

```bash
# macOS（.app，含 arm64+x86_64 universal）
godot --headless --path . --export-release macOS build/export/FateQuest_macOS.zip

# Linux
godot --headless --path . --export-release Linux build/export/FateQuest_Linux.x86_64

# Windows
godot --headless --path . --export-release "Windows Desktop" build/export/FateQuest_Windows.exe
```

产物连同 `build/audit/FateQuest.pck` 一起分发；三平台均需实机验收（启动、中文/英文显示、存档、地图 60 FPS）。

## 4. 自动门禁（每次候选前复跑）

```bash
node tools/validate/validate.mjs --quiet                  # 28 道内容门禁 → all gates pass
node tools/lore/story.mjs check                           # 3619 current · 0 stale · 0 missing
node tests/test_i18n_lines.mjs                            # ALL CHECKS PASSED
godot --headless --path . --script tests/run_tests.gd     # 16 单测 PASS
godot --headless --path . --script tests/audit_logic.gd   # 0 项问题
godot --headless --path . --script tests/audit_divination_readings.gd  # 24 法阅读双语全覆盖
for t in tests/smoke_*.gd; do godot --headless --path . --script "$t" || exit 1; done  # 26 smoke
godot --headless --path . --script tests/benchmark_systems.gd  # serialize P95 5.93ms · save P95 33.47ms
godot --headless --path . --script tests/benchmark_map.gd      # mask P95 39.51ms · travel 18.71ms
godot --path . --script tests/benchmark_map_fps.gd             # 窗口 1280×720：zoom 0.03ms · pan 0.02ms · ≈145 FPS
node tools/validate/verify_pck.mjs build/audit/FateQuest.pck   # PASS
```

2026-08-07 `a12f924` 全量复跑结果：全部 ✅（详见 `docs/RELEASE_CANDIDATE.md` §0，`docs/benchmarks.json` 落档机器可读数据）。

## 5. 试玩重点（§13.6 出口项）

- 无断线、无黑屏、无不可退出覆盖层（行囊/市场/设置按 Esc 均可关）。
- 覆盖层、地图、HUD 在 720p 与 200% 字号下无溢出。
- 自动存档 < 100 ms；失败只提示、不阻断入城。
- 中英切换即时生效；正文无错字、无繁体残留、无缺 key。

## 6. 已知限制（试玩前告知）

| 项 | 状态 |
|---|---|
| 易经 31–64 牌面 | A1 未做，使用卦符回退占位 |
| 24 法工具/反馈/动画占位 | A1 未做，控件/符号占位（§11.7） |
| 动画 N4–N6 | 未做 |
| 移动端 | EA 先桌面端 |
| AI 生成工具记录 | `docs/AI_USAGE.md` 待建（§8 人工项） |

## 7. 反馈收集

每个试玩者填一份 [`PLAYTEST_FEEDBACK.md`](PLAYTEST_FEEDBACK.md)，完成后连同测试日志、验证器输出回交。
P0/P1 必须当天归零；P2 需列明负责人与修复版本。
