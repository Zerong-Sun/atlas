# FateQuest 引擎六维验证与修复清单

**审计日期：2026-07-30**

**审计分支：`codex/fatequest-engine-audit`**

**审计基线：Godot 4.7.1 stable / Apple M2 Pro / macOS / debug 与桌面 Compatibility**

本文验证
[`FATEQUEST_ENGINE_REQUIREMENTS.md`](FATEQUEST_ENGINE_REQUIREMENTS.md) 所定义的本轮边界：
正式长篇文本和正式新增美术只验需求、接口与占位登记，不把占位误报为正式内容；其余人物
抽取、后果链、数据库、存档、地图、出行和占卜学习均按可运行交付验证。

## 1. 结论

六个维度的自动验证均通过，本轮发现的生产代码、数据、测试和文档问题均已修复并增加回归
约束。当前没有已知 P0/P1 代码缺陷。

| 维度 | 结果 | 核心证据 |
|---|---|---|
| 需求完整性 | 通过 | 七系统逐项有流程、数据、异常、文本、美术与验收定义 |
| 逻辑正确性 | 通过 | 后果 FIFO、事件重验、学习原子门禁、旅程检查点 |
| 边界情况 | 通过 | 坏档、备份、同尺寸篡改、重复点击、嵌套旅程、沿海货格 |
| 代码质量 | 通过 | 确定随机、状态单写入口、严格数据门禁、地图绘制缓存 |
| 测试覆盖 | 通过 | 24 道内容门禁、16 个核心单测、12 个场景 smoke |
| 实际运行 | 通过 | 三条身份线走通；Linux PCK 导出后作为主包启动成功 |

正式发布前仍需人工签署 720p/200% 字号/中英视觉回归、GPU 60 FPS、三目标系统可执行文件、
签名与公证。这些是发布环境验收项，不是本轮已发现而未修复的引擎缺陷。

## 2. 需求完整性

| 原始需求 | 实现闭环 | 验证 |
|---|---|---|
| 抽人物时同步定起点，随后入城 | 抽取卡保存身份、起点、出生与背景知识，确认后进入起点 | `smoke_fatequest_flow.gd` |
| 选项后故事不断线 | effects 写状态并把后果事件加入持久 FIFO，处理完才返回城市 | 刺桐三分支、队列单测、流程 smoke |
| 剧本数据库驱动 | cities/routes/events/choices/effects/conditions 均有字段与引用门禁 | G1/G2/G10 |
| 自动档与五手动槽 | 抵达自动存，五槽独立，v3 快照、SHA-256、sidecar、bak 与恢复 | SaveGame 单测与 smoke |
| 已知城市可点击 | worldmap 矢量层、情报雾、命中、键盘焦点和城市详情卡 | 流程 smoke |
| 出行确认与动画 | 方式选择只规划，详情确认后才二次校验和结算 | Travel 单测与流程 smoke |
| 每种占法需操作后学习 | 24 配置覆盖六类规则，通过后才原子应用学习 choice，可失败/跳过 | lesson 单测与流程 smoke |

文本需求见总需求 §10，美术需求见 §11；两者均给出数量、字段、命名、文化审阅、技术规格、
生产流程和验收规则，并以 `placeholderText` / 稳定 asset id 暂时占位。

## 3. 修复清单

| ID | 级别 | 发现的问题 | 修复 | 回归证据 | 状态 |
|---|---:|---|---|---|---|
| FQ-01 | P1 | observe 课程可不看线索直接答题 | 要求记录配置数量的观察；校验线索与数量边界 | `test_lesson_engine` / G3 | 已修复 |
| FQ-02 | P2 | throw 课程可无限投掷，非法面数被静默抬高 | 限制规定次数并要求 faces≥2 | `test_lesson_engine` / G3 | 已修复 |
| FQ-03 | P1 | UI 可保留旧事件引用，条件变化后仍能结算 | `choose()` 结算时重验 event.when/showWhen/needs | `test_narrative` | 已修复 |
| FQ-04 | P1 | 直接调用学习 choice 可绕过小游戏，并可能先扣学费 | 执行任何效果前预检 direct/pass/fail 学习效果与 `lesson_passed` | `test_narrative` | 已修复 |
| FQ-05 | P1 | `lessonFailEffects` 数据可在失败时授予占法 | 内容门禁禁止失败效果包含 `learn_divination` | G10 | 已修复 |
| FQ-06 | P1 | 4 种占法的 learnAt 宣称了没有学习事件的城市 | 数据收敛为真实教学城市；新增 learning event↔learnAt 双向门禁 | `test_divination_reach` / G2 | 已修复 |
| FQ-07 | P1 | 旅程检查点未结束时可再次 depart | Travel 核心拒绝嵌套旅程，保证拒绝无副作用 | `test_journey` | 已修复 |
| FQ-08 | P1 | 沿海路线货格按 route kind 计算，步行会吃到海员加成 | 沿海路线按所选交通的实际 land/sea 移动类型计算 | `test_journey` | 已修复 |
| FQ-09 | P2 | land_only 随从在河船上也加货格 | land_only 仅 land；sea_only 仅 sea | `test_retainer` | 已修复 |
| FQ-10 | P0 | 损坏 live 可能在下一次保存时覆盖/污染有效备份 | 坏 live 与 backup-only 槽位禁止写入，须先恢复或显式删除 | `test_save` | 已修复 |
| FQ-11 | P0 | 有正确 SHA 的缺字段 v3 文档可进入反序列化 | v3 必填字段、容器类型、身份与 header/state 一致性严格校验 | `test_save` | 已修复 |
| FQ-12 | P1 | sidecar 无法发现同尺寸正文损坏，失败后反馈不足 | 菜单 sidecar 仅作快速提示；实际读取深检，失败槽位转深检并保留新游戏 | `test_save` | 已修复 |
| FQ-13 | P1 | 读档预检后再次读文件，存在校验与恢复文档不一致竞态 | 使用同一份预检文档恢复，反序列化失败保持书案可用 | 场景编译 / save smoke | 已修复 |
| FQ-14 | P1 | 自动保存失败只写控制台，玩家会误以为已保护 | 到达不阻断，但日志明确提示检查自动槽位 | `smoke_save` | 已修复 |
| FQ-15 | P2 | 地图完全重叠同级城市依赖内容遍历顺序 | 距离、当前城、情报、tier、稳定 id 全序决定 | WorldMap 编译 / 流程 smoke | 已修复 |
| FQ-16 | P2 | 地图动画逐帧重复投影山脉、取笔刷和计算图标 | setup 时缓存山脉、路线几何/笔刷与城市视觉 | `benchmark_systems` | 已修复 |
| FQ-17 | P1 | 1300 年闰年审计 fixture 把非闰年断言成闰年 | 改验 1300 非闰与 1304 闰年的往返 | `audit_logic` | 已修复 |
| FQ-18 | P1 | 逻辑审计发现严重项仍可能退出 0 | 严重项统一返回非零退出码 | `audit_logic` | 已修复 |
| FQ-19 | P1 | 端到端路线夹具未结束旅程；占法夹具绕过课程且站错导师城 | 夹具按真实旅程/课程门禁完成状态转换 | 全部 16 单测 | 已修复 |
| FQ-20 | P2 | 文档 i18n 数量、表结构说明和地图冲突规则与实现漂移 | 同步为 2501/2501、支持表描述和稳定选择规则 | 文档校对 / i18n 检查 | 已修复 |
| FQ-21 | P1 | 路线、交通、坐标和 lesson 数值缺少完整静态边界门禁 | 增加范围、整数、唯一性、月份及交通兼容性验证 | G1/G2/G3 | 已修复 |
| FQ-22 | P1 | 核心拒绝过期点击后 UI 仍显示结果并可能把未结算后果出队 | EffectResult 显式标记 resolved；拒绝时不叙述、不出队并刷新选择 | `test_narrative` | 已修复 |
| FQ-23 | P1 | 队列后果点“先不动手”会隐藏 active_event 且没有恢复入口 | 进入“未完的后果”暂停页；可继续处理；队列目标强制无条件兜底选项 | 流程 smoke / G2 | 已修复 |
| FQ-24 | P2 | headless 短生命周期场景加载 Ogg，退出时音频线程仍引用 playback 并报告 ObjectDB leak | headless 禁止实际播放；正常退出停止播放器、清空 stream 并终止 tween | verbose smoke | 已修复 |

## 4. 逻辑与边界验证重点

- 选择索引、可见性、条件和 once 状态在核心层二次校验，禁用按钮不是安全边界。
- 学习门禁先于扣费、随机分支和效果执行；失败和跳过不会写 learned 状态。
- 后果队列按作者顺序入队、FIFO 消费、可存档；静态检测直接和间接循环。
- 交通选择阶段不改状态；确认后重新检查方向、道路知识、季节、许可、费用、货格和旅程状态。
- 出行先写 active journey，再扣钱/走天数/移动/排途中事件；读档可继续事件并最终清检查点。
- live、临时文件和备份均校验；损坏槽位不会被自动或手动保存静默覆盖。
- sidecar 只优化列表性能，不能替代加载时的正文 SHA-256 和 schema 深检。
- 沿海路线依据 ship/land 交通决定随从职业货格，不把 route 的混合标签当实际移动方式。

## 5. 测试与实际运行记录

| 命令/场景 | 结果 |
|---|---|
| `node tools/validate/validate.mjs --quiet` | 24 道内容门禁通过，0 error |
| `node tools/lore/story.mjs check` | 1334 current，0 stale，0 missing |
| `node tests/test_i18n_lines.mjs` | 2501/2501，100%，0 raw key |
| `godot --headless --script tests/run_tests.gd` | 16/16 通过 |
| 全部 `tests/smoke_*.gd` | 12/12 通过 |
| `tests/audit_logic.gd` | 0 项问题，退出 0 |
| `tests/benchmark_systems.gd` | serialize P95 0.97 ms；save P95 5.39 ms；通过 |
| 固定种子 polo 线 | 12 段，372 日，到达大都 |
| 固定种子 steppe 线 | 9 段，365 日，到达上都 |
| 固定种子 merchant 线 | 11 段，371 日，到达刺桐 |
| Linux `--export-pack` | 成功，PCK 373 MB |
| `--main-pack build/audit/FateQuest.pck` | 成功启动；102 城、204 路、279 事件、0 缺 i18n key |
| 非 headless 工程启动 | Metal/OpenGL Compatibility 成功创建窗口并启动，0 启动错误 |

Godot 单测输出中的 `push_error` 是故意触发非法 effect、未知 condition、未学习占法、坏档、
越权 choice 与未知结局条件的负向测试；测试逐项确认它们被拒绝，最终 suite 为 PASS。

## 6. 代码质量检查

- `git diff --check` 无尾随空格或冲突标记。
- Godot `--import` 完成全工程扫描和全局 class 注册。
- G9 保证 core 中只有 EffectExecutor 写 WorldState。
- G11 禁止 core 使用系统随机、系统时间与 Node 生命周期。
- 所有事件 effects 使用合法 op 且带可审计 reason。
- 地图 `_draw()` 不解析 JSON，不重复投影静态几何。
- 存档日期从唯一权威 `state.jdn` 派生，不依赖可能滞后的 UI clock。

## 7. 发布前人工签署项

| 项目 | 方法 | 出口 |
|---|---|---|
| 720p/1080p、100%/200% 字号、中英布局 | 逐项截图和键盘遍历 | 无遮挡、无 raw key、可退出覆盖层 |
| 地图 GPU 帧耗 | 发布构建连续 30 次缩放/平移记录 median/P95 | 1280×720 保持 60 FPS |
| macOS/Windows/Linux 可执行文件 | 安装官方 export templates 后三目标实机启动 | 主流程可运行 |
| macOS 签名/公证与 Windows 签名 | 正式发行证书 | 平台校验通过 |
| 正式文本与美术替换 | 按总需求 §10–11 生产、文化与版权复核 | 占位清单归零 |
