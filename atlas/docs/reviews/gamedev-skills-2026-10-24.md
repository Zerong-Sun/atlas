# Atlas 对照 gamedev agent skills 的审阅与实施

日期：2026-10-24。范围：Atlas Web（含桌面壳复用部分）、共享交互逻辑及 Expo 抽牌流程。保留 React 18 / Expo 54 / React Native 0.81.5；不迁移游戏引擎。FateQuest 为独立项目，不在本次修改范围。

参考：
- [router](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/main/router/SKILL.md)：按项目指纹选择工具、按需加载知识。
- [save-systems](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/main/skills/disciplines/save-systems/SKILL.md)：版本、校验、恢复与写入失败反馈。
- [game-ui-ux](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/main/skills/disciplines/game-ui-ux/SKILL.md)：焦点、输入、屏幕适配与真实状态。
- [performance-optimization](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/main/skills/disciplines/performance-optimization/SKILL.md)：先测量、减少重复工作、设预算并回归。

## 详细实施清单

以下 14 项均已在本地实现。验证证据与范围见文末。

| 编号 | 优先级 | 发现与影响 | 改进与验收 |
|---|---|---|---|
| 01 | P0 | Web storage / archive / method history 直接断言 JSON 类型；`null`、对象冒充数组及损坏记录可能导致白屏 | 统一版本化 JSON 读写，兼容旧数据；校验容器和关键记录字段，损坏主记录恢复上一份有效记录，拒绝覆盖未知新版本 |
| 02 | P0 | localStorage 被禁用或写满时异常可穿透 UI；没有保存失败提示 | 本次会话内保留尚未持久化的数据，显示明确提示；保留磁盘旧值，避免伪称保存成功；测试 quota / SecurityError |
| 03 | P0 | AppProvider 启动 Promise 无 finally；缺少 React 错误边界 | 本地启动不被云端请求阻塞，失败可恢复；页面异常显示重载与返回入口，不清除用户资料 |
| 04 | P0 | Copilot 请求返回时未核对页面/报告，loading 仅依赖异步渲染 | 同步请求锁与上下文代次隔离；切换方法/报告及卸载后旧回复不能写入新界面或档案 |
| 05 | P1 | Web 抽牌同一帧可重复触发；Mobile 翻牌期间非 busy 且每次会取消旧定时器 | 共享可测试的抽牌控制器；完整状态序列、同步防重入、重置/卸载取消、异常解锁 |
| 06 | P1 | 定时器 ID 持续累积；减少动态效果只改 CSS，不影响等待 | 已完成定时器立即移除；两端抽牌尊重减少动态效果/应用开关，立即呈现结果 |
| 07 | P1 | CosmicBackdrop 只在挂载时读系统设置，忽略应用开关、后台可见性；速度依赖刷新率 | 订阅偏好与页面可见性，停用时零动画帧；delta time 驱动并限制长帧跳跃；静态模式 resize 重绘 |
| 08 | P1 | 合成音节点结束未 disconnect；音频 resume/storage 异常可能影响主操作 | 音频资源生命周期清理，静音与后台不播放，音频失败不阻断操作 |
| 09 | P1 | 隐藏 Copilot 仅 opacity/transform，仍能 Tab；缩放手柄仅鼠标可操作 | 隐藏时退出焦点流；打开聚焦、Esc 关闭并返回触发器；手柄方向键/Home/End 调宽；翻牌读屏内容与当前正反面一致 |
| 10 | P1 | 页面路由变化没有主内容焦点/标题同步；底栏安全区未计入 shell 留白 | 路由切换管理标题、焦点和滚动，后退保留浏览位置；触摸目标和安全区完整 |
| 11 | P1 | 默认占法、古文优先、安全提示三个开关只存 React state，无任何消费方 | 移除无效配置，保留真实生效的动效、音效、文化与 LLM 设置；明确已有内容呈现原则 |
| 12 | P1 | archive 合并每个 reading 都重新解析整个存储 | 一次读取建立 Map，合并过程中复用；用读取次数和合并语义回归验证 |
| 13 | P1 | 已有路由懒加载，但没有资源与入口预算，未来可静默膨胀 | 记录生产构建基线；将画像引擎改为按需加载，生成 manifest 并检测入口依赖 gzip、最大 JS chunk 和静态资源预算 |
| 14 | P0 | README 说有 Atlas CI，实际 CI 注释称 Atlas 已冻结 | 恢复独立 Atlas workflow：锁文件安装、全 workspace 检查与测试、Web 构建、资源预算、语料校验；更新运行说明 |

## 初始证据

- 工作区已有未跟踪文件，保持原样；仅修改本清单涉及文件。
- 生产构建基线成功（Vite 约 5.91s，仅记录一次构建时间，不当作性能结论）。入口 index JS 191.47 kB / gzip 72.36 kB；最大 JS iztro 474.05 kB / gzip 150.12 kB；public/assets 约 41 MB。
- 原有路由 lazy import、部分 prefers-reduced-motion、统一 design tokens、确定性 seed 测试已经存在，继续复用。

## 首轮验证结果

以下记录首轮实施时的证据；后续六维复核、补充修复、最终依赖与测试结果见 [六维验证清单](verification-six-areas-2026-10-24.md)。

### 已完成的代码与回归证据

| 条目 | 实施位置 | 证据 |
|---|---|---|
| 01–02 | `persistentStore.ts`、`storage.ts`、`archive.ts`、`useMethodSessionHistory.ts`、`StorageNotice.tsx` | 旧格式升级、畸形 JSON、损坏主记录恢复、未知版本拒写、Quota / SecurityError、并发 profile 合并测试 |
| 03 | `AppContext.tsx`、`AppErrorBoundary.tsx` | 本地资料先显示，云端在后台刷新；Web 类型检查与浏览器引导、重载成功；错误边界保留资料并提供恢复入口 |
| 04 | `MethodCopilot.tsx`、`requestGate.ts` | 同步锁，页面/报告代次改变和卸载均使旧 ticket 失效；旧响应不能解除新请求锁的测试 |
| 05–06 | `packages/method-core/src/drawSequence.ts`、两端 `useCardDrawPhase` / `useTimedCallback` | 同 tick 重入、翻牌忙碌、重置/卸载取消、回调中重置、异常解锁、无动效零定时器测试；Mobile 重新聚焦时刷新应用动效设置 |
| 07 | `CosmicBackdrop.tsx`、`motionPrefs.ts` | 实际组件的模拟 Canvas 测试确认：开启只注册一个 rAF；关闭/后台/系统减少动态效果时为 0；静态 resize 重绘；浏览器 DOM `data-animation=paused` |
| 08 | `methodSounds.ts` | 实际音频模块测试：节点结束 disconnect、静音停止当前音、后台不新播、禁用 storage 不中断 |
| 09–10 | `MethodCopilot.tsx`、`useCopilotResize.ts`、`Page.tsx`、`MainLayout.tsx`、`FlipCard.tsx` | 浏览器打开侧栏焦点到关闭按钮，Home 调宽到 280，Esc 关闭后焦点归还打开按钮；关闭侧栏退出 AX 树；路由标题/主内容焦点同步 |
| 11 | `SettingsPage.tsx` | 浏览器确认仅保留真实体验选项；动效关闭后刷新仍保持关闭 |
| 12 | `archive.ts` | 100 份报告合并只读取 1 次 archive 和 1 次 reading history；原代码对每份报告重新读取 archive，另重复读取 histories |
| 13 | `lib/api/profile.ts`、`vite.config.ts`、`scripts/check-web-budget.mjs`、`web-budgets.json` | 画像库按需加载；入口与静态依赖 gzip 从 345,451 bytes（本轮懒加载前）降到 164,319 bytes（首轮构建），约 -52%；最大 JS chunk 150,122 bytes，public 42,489,445 bytes，均在预算内 |
| 14 | `.github/workflows/atlas.yml`、README、原 CI 注释 | 独立 CI 已恢复；本地执行同款类型检查、测试、构建、预算和语料 dry-run；不触发部署 |

### 自动验证

- `npm run lint`：Web、Mobile 通过。
- `npm test`：全 workspace 134 项通过（Web 45、Mobile 12、api-core 2、engines 64、method-core 2、method-data 3、orchestrator 6）；Web 新增 24 项真实模块/控制器回归。
- `npm run build:web`、`npm run check:web-budget`：通过。
- `npm run corpus:validate`：12 个来源、1,979 个 chunks，现有版权标记覆盖 100%。这只是项目校验结果，不代表新增法律审查。
- `npm run corpus:ingest:dry-run`、`npm run corpus:embed:dry-run`：通过，未写数据库。
- `npm ci --dry-run --ignore-scripts --no-audit --no-fund`：通过，锁文件一致性检查未改变依赖。
- `git diff --check`：通过。

### 浏览器验证与限制

- 在本机开发页使用合成测试档案，走通兴趣选择、档案、画像、进入主界面；重载后引导状态与历史记录仍保留。
- 设置页关闭动效并重载，复核 Canvas 暂停；塔罗无动效模式可直接显示三张牌与组合解释。
- 侧栏键盘焦点、Home 调宽和 Esc 关闭归还焦点已实际操作。
- 最终以 Vite preview 的生产构建复测：三张牌进入 revealed、aria-busy=false、三个牌背退出读屏内容、没有保存警告；生产版侧栏打开/关闭焦点归还也通过，新测试标签页捕获的浏览器 error 日志为 0。开发中编辑 Context 引起过 Fast Refresh 暂态错误，完整重载和生产构建未复现。
- 390 × 844 窄屏检查卡片、文字、底栏，无页面横向溢出；1440 × 900 桌面尺寸同样无页面横向溢出。
- Canvas 测试测的是调度和生命周期，入口预算测的是构建产物；未将它们等同于真实设备 FPS、首屏耗时或电量改善。
- 没有 iOS/Android 真机回归、桌面壳重新打包、云端数据库迁移或线上发布。Mobile 的验证为类型检查、既有测试和两端复用控制器测试。
- CI 配置已写入本地，GitHub 远端运行需代码提交后触发；本轮未提交或推送。
- 存储备份与新记录共用浏览器额度；满额时不清理用户旧档案，而是明确提示会话暂存。没有引入跨设备同步或多标签页事务保证。
