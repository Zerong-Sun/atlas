# FateQuest 六维验收与修复清单

日期：2026-08-10
分支：`codex/core-systems-verification`

本清单记录本轮“城市互动 → 上路 → 出发 → 路遇 → 后果链 → 抵达 → 再次行动”主循环的验收结果、已修复问题和可复现证据。未改变内容表结构、`WorldState` 字段或 v4 存档格式。

## 修复清单

| ID | 发现的问题 | 修复内容 | 验证证据 |
| --- | --- | --- | --- |
| FQ-QA-01 | 城市人物的文字牌匾看起来可点击，但只有画像命中 | 将画像、牌匾和留白合并为一个完整 Button 卡片，统一鼠标、键盘、悬停和完成态 | `smoke_player_surface.gd`：`target=true caption=true dialog=true` |
| FQ-QA-02 | “上路”首屏重复城市内容，路线被推到折叠区；返回文案含糊 | 路线面板改用显式来源枚举，首屏先展示标题、返回入口和路线；按来源显示返回城市/地图 | `smoke_player_surface.gd`：`route=true visible=true back=true`；`smoke_citynav.gd` |
| FQ-QA-03 | 后果链每三页强制暂停，连续推进被打断 | 移除固定三页暂停；连续显示后果进度，只有玩家主动选择“稍后处理”才暂停 | `smoke_live_journey.gd`：`followup=true progress=true paused=true` |
| FQ-QA-04 | 选择提交、队列变化和途中读档边界可能丢状态或重复抵达 | 选择后自动保存；激活事件和主动暂停保存；恢复时精确保留事件/队列；旅程完成改为幂等 | `smoke_live_journey.gd`：`restored=true result=true arrived=true`；无路遇/结果页/入口链路径均通过 |
| FQ-QA-05 | 过期 timer/tween 可能关闭新一代 transit 覆盖层 | 集中管理 transit 生命周期，使用代次标识校验旧回调；抵达与重复完成都会先失效旧回调 | `smoke_map_display.gd`：`roundtrip=true`，完整 smoke 通过 |
| FQ-QA-06 | 基于帧数等待的 smoke 在负载下会误报超时 | 地图 smoke 改为按实际经过时间等待，并保留明确超时 | 完整 smoke 32/32 通过 |
| FQ-QA-07 | 过场只能用鼠标跳过，键盘路径可能卡住 | transit 层增加 Space/Enter/小键盘 Enter 跳过，仍保留非阻塞最长 3.6 秒约束 | 全键盘路径包含在 `smoke_player_surface.gd` 与 map smoke |
| FQ-QA-08 | 市场 smoke 将购买按钮硬编码为中文，CI 语言状态变化时找不到可购买按钮 | 测试改为匹配 `I18n.t("ui.buy")`，保持中英文运行均可识别真实按钮 | 本地 `smoke_market.gd` 通过；PR CI 重跑待确认 |
| FQ-QA-09 | 城市导航 smoke 将返回按钮硬编码为中文，英文 CI 误报城市死路 | 测试改为匹配 `ui.back_to_map`/`ui.back_to_city` 的当前语言文案 | PR CI 的市场修复后定位并修复 |
| FQ-QA-10 | 随从 smoke 将雇佣、缔结、辞退和容量单位硬编码为中文，英文 CI 误报雇佣失败 | 测试改为匹配本地化操作标签，并通过按钮 metadata 定位有货格加成的行 | PR CI 的城市导航修复后定位并修复 |
| FQ-QA-11 | Linux Godot 对 `%d` 收到 `/100` 浮点值报格式错误，英文 HUD/市场/随从信息刷出运行时错误 | 所有 fen→银的 UI 格式化边界显式 `int()`，保持内部货币整数模型不变 | 本地核心/市场/随从 smoke 通过；PR CI 待确认 |

## 六维验收

### 1. 需求完整性

- 城市卡片、路线首屏、来源感知返回、连续后果链、主动暂停、自动保存、途中恢复和再次上路均有实现或回归用例。
- 中英文新增界面文案通过内容门禁；未修改事件 JSON 选择/效果格式、`WorldState` 字段或 v4 存档兼容性。
- 剩余人工项：三个固定 seed 各 60 分钟的人工试玩和文化/文本审校仍需在发布前执行。

### 2. 逻辑正确性

- 路线来源使用 `MAP/CITY/ARRIVAL/RESUME` 显式枚举，避免布尔来源造成返回错误。
- 后果队列按 FIFO 连续推进；结果页的“继续”只会流向下一后果、抵达或城市。
- 无事件、单个路遇、嵌套后果、途中读档四条路径均只清空一次旅程并只抵达一次。

### 3. 边界情况

- 缺失事件、异常队列和错误循环保留运行时恢复出口与诊断记录。
- 主动暂停后立即保存；重启恢复不会重复结算选择。
- 过期 transit 回调、重复完成、减弱动态效果、鼠标和全键盘输入均有保护。

### 4. 代码质量

- transit 的隐藏、倒计时、入城图和过期回调集中在 `main.gd` 管理。
- `git diff --check` 通过；未引入新的 schema 或隐藏的人工日志依赖。
- Godot 自动生成的 `.uid` sidecar 保留在工作区但不纳入本次提交。

### 5. 测试覆盖

- 新增玩家表面 smoke：`smoke_player_surface.gd`。
- 新增完整旅程 smoke：`smoke_live_journey.gd`。
- 地图 smoke 改为真实时间等待；既有城市、事件、存档、角色、命运、寿命和地图回归均保留。
- 当前完整 smoke 套件：32/32 通过；核心 Godot suite、逻辑审计、命运读数审计均通过。

### 6. 实际运行结果

- 内容门禁：`all gates pass`；中英文翻译：5210/5210；故事引用：3619 current、0 stale、0 missing。
- 核心 Godot suite：`SUITE: PASS`；`audit_logic.gd`：0 issues；`audit_divination_readings.gd`：24 methods、0 failures。
- 存档 P95：6.55 ms（目标 <100 ms）。
- 地图持续帧率：约 69 FPS；地图站立帧率约 145 FPS（目标 ≥60 FPS）。
- 运行时 smoke：`SMOKES=32 all PASS`；玩家表面与完整旅程新增路径均通过。

## 结论

本轮自动化验收未发现新的 P0/P1 阻断；上述七项问题已修复并有测试或基准证据。发布前仍应完成三 seed × 60 分钟人工试玩，并为任何 P2 记录复现步骤与归属。
