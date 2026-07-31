# FateQuest 六维验收与修复清单 · 2026-07-31

本记录对应提交前的需求、逻辑、边界、代码、测试和运行验收。它记录本轮实际检查结果，
不把尚未完成的正式文本、美术和 GPU 视觉回归误报为完成。

## 1. 结论

| 维度 | 结果 | 依据 |
|---|---|---|
| 需求完整性 | 通过当前范围；发布项仍有明确占位 | `FQ-CHAR`、`FQ-NAR`、`FQ-SAVE`、`FQ-MAP`、`FQ-TRAVEL`、`FQ-LESSON` 对照需求书与 G28 |
| 逻辑正确性 | 通过 | `tests/test_*.gd`、`tests/audit_logic.gd`、内容门禁 |
| 边界情况 | 通过 | 坏档、版本、checksum、无资格、缺配置、队列恢复、无路线和旅途恢复路径 |
| 代码质量 | 通过本轮静态/解析检查 | Godot editor scan、`git diff --check`、架构门禁 |
| 测试覆盖 | 已修复两处 smoke 覆盖缺陷 | 全部 16 个核心单测、12 个 smoke、逻辑审计 |
| 实际运行结果 | 通过 headless 运行；视觉项仍需人工验收 | Godot 4.7.1 启动、编辑器导入、核心 suite 和全部 smoke |

## 2. 发现与修复清单

### QA-001 · 城市导航 smoke 误判后果队列为死端

- **等级**：P2（测试缺陷；未确认是产品缺陷）。
- **现象**：`smoke_citynav.gd` 只处理入口事件的一页。十二主城入口选择合法地排入
  后果事件时，测试因对话层仍可见而提前停止，报告 `usable buttons = 0`。
- **根因**：测试没有按真实玩家路径消费 `active_event`、`pending_events` 和暂停后的“继续处理”。
- **修复**：增加 `_drain_to_city()`，通过真实对话按钮和队列暂停按钮消费 FIFO 后果，再检查
  once-only 探索点和城市出口。
- **复验**：`CITYNAV: visited=3 ... usable buttons=4`，`CITYNAV: OK`。

### QA-002 · 主流程 smoke 在无行动时仍报告 OK

- **等级**：P2（测试覆盖缺陷）。
- **现象**：`smoke_play.gd` 只扫描 `_panel`。初始入口对话在 `_dialog_layer`，因此测试
  第 0 步报告“nothing actionable”，但仍退出成功。
- **根因**：测试没有覆盖入口对话、城市探索和道路面板三种交互层。
- **修复**：增加 `_press_first_action()` / `_press_first_enabled()`，按对话层 → 城市层 →
  panel 的真实 UI 顺序点击，并在没有推进时失败退出。
- **复验**：6 步实际 UI 操作均推进，`PLAY: OK`。

## 3. 六维检查明细

### 需求完整性

- 102 城、204 路线、331 事件、24 占法、v3 存档和首批 12 主城剧情闭环均与当前需求书
  和验证器一致。
- G28 检查 12 主城所有面向玩家的选项是否有 `resultText` 或 `queue_event`，重要分支是否
  至少到达分支页和 resolution 页。
- 明确保留的非阻断项：正式课程文本、24 法正式美术、易经 31–64 资源、N4–N6 动画、
  720p/200%/中英视觉回归和 GPU 60 FPS 实机记录。它们在需求书和状态文档中仍标为占位或待验收。

### 逻辑正确性

- 事件效果顺序、学习门禁、队列 FIFO、旅途 encounter、路线许可/方向/交通兼容、存档恢复、
  结局和随从货格均通过核心测试。
- 未发现运行时状态错位、重复结算、队列断链或可达性错误。

### 边界情况

- 负向断言覆盖：未知 condition、缺少 effect reason、未学习占法、隐藏选择、lesson 失败、
  checksum 损坏、坏版本、坏 shape、备份槽、路径穿越和坏自动档。
- Godot 输出中的 `ERROR` 均来自这些故意触发的拒绝路径，对应测试最终为 PASS。

### 代码质量

- Godot 4.7.1 editor scan/import 成功，项目脚本可注册，主场景可加载。
- 内容架构门禁通过，effect reason、引用、双语 key、循环和资源接线均通过。
- 本轮只修改测试 harness；未修改无关美术、地图和生成管线工作区内容。

### 测试覆盖

- 核心：16 个 `test_*.gd` 全部通过。
- UI smoke：12 个 `smoke_*.gd` 全部通过。
- 逻辑审计：`tests/audit_logic.gd` 共 0 项问题。
- 内容与本地化：25 道内容门禁、故事 `1830 current / 0 stale / 0 missing`、i18n 3169/3169。

### 实际运行结果

- Godot：`4.7.1.stable.official.a13da4feb`。
- 启动：102 城、204 路线、331 事件，缺失 i18n key 为 0。
- 主流程：抽取、入口选择、后果链继续、地图卡、出行确认、学习门禁和恢复均通过。
- 当前仍需发布候选阶段人工执行非 headless 的 720p、200% 字号、中英、键盘焦点、GPU 帧耗
  和视觉文化复核；本轮不宣称这些项目已完成。

## 4. 复现命令

```bash
node tools/validate/validate.mjs --quiet
node tools/lore/story.mjs check
node tests/test_i18n_lines.mjs
scripts/art-gen-kit/.venv/bin/python tools/art/audit.py --unused
/Applications/Godot.app/Contents/MacOS/Godot --headless --path . --script tests/run_tests.gd
/Applications/Godot.app/Contents/MacOS/Godot --headless --path . --script tests/audit_logic.gd
for test in tests/smoke_*.gd; do
  /Applications/Godot.app/Contents/MacOS/Godot --headless --path . --script "$test" || exit 1
done
```
