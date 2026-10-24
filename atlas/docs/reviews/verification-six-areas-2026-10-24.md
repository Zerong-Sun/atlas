# Atlas 六维验证与修复清单

范围：上一轮 gamedev-skills 对照改进及其运行链路。2026-10-24。

| 编号 | 验证维度 | 问题/风险 | 修复与验收 |
|---|---|---|---|
| R1 | 逻辑正确性、边界情况 | 先写备份可能把原本足够主记录更新的存储额度耗尽；相同内容反复保存也会冲掉上一份备份 | 主键原子更新优先，备份尽力更新并单独提示；相同内容不轮换备份；测试精确额度与失败重试 |
| R2 | 需求完整性、边界情况 | 未知版本拒写后新操作没有会话副本；恢复后的存储提示可能永久残留 | 保留磁盘新版本同时保留本次修改于内存；区分会话暂存/备份失败/读取失败，成功恢复后更新提示 |
| R3 | 逻辑正确性、边界情况 | 嵌套 questionFrame、structuredFacts、解说 sections/highlights 和画像摘要字段未校验，合法 JSON 仍可能令渲染崩溃 | 补齐 UI 消费字段的结构校验；实际坏档案与旧格式兼容测试 |
| R4 | 逻辑正确性、需求完整性 | refreshProfile 在远程等待前读取本地快照，会覆盖等待期间的新编辑；完成引导与保存仍等待云端 | 统一 profile 合并与后台同步，读最新本地资料，隔离过期刷新；本地完成不因断网卡住，显示同步失败状态；复用已有画像，消除生成→保存→重复生成循环 |
| R5 | 逻辑正确性、边界情况 | 抽牌控制器对阶段通知中的异常/取消保护不完整；页面在锁判定前清空结果；移动端离开仍可能有延迟回调 | 将开始副作用置于受锁保护的阶段；取消/异常不再调度旧阶段；离开移动页面取消；完整阶段回归 |
| R6 | 实际运行结果、需求完整性 | 路由滚动只在卸载时取值，懒加载隐藏/新页高度改变可能丢失返回位置；异步标题不更新 | 独立标题与滚动生命周期，记录滚动事件，延迟内容就绪时恢复；真实 React 路由测试与浏览器后退验证 |
| R7 | 代码质量、测试覆盖 | 关键断言主要覆盖纯函数或模拟 hooks，尚不能证明 provider/侧栏/路由组合正确 | 增加 jsdom 下真实 React 挂载测试，覆盖离线引导、编辑竞态、旧解说回复与焦点；避免仅测试重写的镜像逻辑 |
| R8 | 测试覆盖、实际运行结果 | CI 只 dry-run 安装不能证明干净依赖可运行；桌面测试不属于 npm workspace，上一轮未覆盖 | 隔离目录完整 npm ci + lint/test/build；固定 Web React 18 的 Vite/类型/测试解析，避免 hoist 后误用 React 19；配对 Expo React DOM 19.1；加入桌面协议测试 CI；生产预览交互验证 |
| R9 | 代码质量、边界情况 | npm audit 报告历史依赖漏洞，含构建和开发工具链 | 已在隔离目录执行不带 --force 的兼容修补；Vitest 5 迁移通过 77 项 Web 回归，移除 tinypool 告警链；锁定修补版本并全量回归。剩余上游/主版本迁移项单独列为未解决，不能视为安全审计全通过 |

R1–R8：修复已实施并通过下列本地门禁。R9：兼容修补与 Vitest 5 迁移已实施，critical 已清零，仍有 16 个受影响依赖包，详见下文。


## 验收证据（六个方面）

1. **需求完整性**：14 项原始改进逐项映射到代码；补齐本地优先保存与完成引导，移除无效设置；新增真实同步失败提示。画像已有结果不重复生成。
2. **逻辑正确性**：晚到云端刷新不能覆盖最新编辑或较新的刷新；失败云端字段会合并到下一次保存重试；侧栏旧请求无法进入新报告；抽牌只接受一次开始事件。
3. **边界情况**：覆盖损坏/旧格式/未来版本/存储禁用/写满/备份额度不足/恢复后重试；校验报告、画像、解说的嵌套字段；测试各阶段取消与阶段回调异常。
4. **代码质量**：两端抽牌共享纯控制器；读写集中校验；Web/Expo React 版本隔离；备份失败与主记录失败区分；依赖兼容修补写入锁文件。
5. **测试覆盖**：新增真实 React + jsdom Provider、Router、Copilot 联合测试；保留纯状态机和实际模块测试。没有用覆盖率百分比代表业务正确性。
6. **实际运行结果**：Vite production preview 中抽牌正常，减少动效直接出牌；页面切换置顶、后退恢复 2678px；侧栏 Escape 关闭并把焦点还给打开按钮；390×844、1440×900 无横向溢出；本轮测试标签页 error/warn 日志为 0。

## 依赖审计的未解决项

执行兼容的 `npm audit fix --ignore-scripts`（无 `--force`）后，npm 的受影响依赖包计数先从 34 降到 19；继续迁移 Vitest 5.0.5 后降到 **16（moderate 8 / high 8 / critical 0；不是 16 个独立漏洞）**。修补涉及 shell-quote、tar、undici、js-yaml、source-map-js、PostCSS 的 Vite 分支、浏览器兼容数据库等。**依赖安全审计仍未全通过。**

| 剩余依赖链 | 当前状态与后续修复边界 |
|---|---|
| Vitest → mocker / tinypool | **已修复**：在隔离目录迁移 Vitest 5.0.5，77 项 Web 测试全部通过；最低开发环境改为 Node 22.12 的受支持 LTS 系列。两项 critical 计数的工具链依赖已移除 |
| Expo → cli / code-signing-certificates / node-forge | node-forge 当前审计影响范围为 `*`；npm 自动强制方案会把 Expo 54 降到 44，不是可接受的修复。需要上游修补及 Expo 原生回归 |
| Expo → metro-config / PostCSS | 固定依赖链仍命中告警；Vite 分支已兼容升级，Metro 分支须与 Expo 升级验证 |
| Expo Router → query-string / decode-uri-component | 自动修复要求 Expo Router 主版本迁移，须配套 Expo、React Native 真机回归 |
| @expo/ngrok → uuid | 审计返回无自动修复；需上游更新或另行替换 tunnel 开发工具 |
| Vite、React Router、image-size、brace-expansion | 在当前依赖约束下兼容修补后仍有告警；不能用 `audit fix` 命令执行成功代替结果检查，需后续版本/上游依赖约束变更 |

没有运行强制降级 Expo、数据库迁移、线上部署。未做 iOS/Android 真机和 Electron GUI 回归；移动端证据是类型检查、12 项既有测试及共享抽牌控制器回归，桌面证据是协议/文件访问边界测试。以上限制均未标记为通过。


## 最终本地门禁

| 验证 | 结果 |
|---|---|
| 隔离目录最终锁文件 `npm ci` → lint → test → build | **通过**；未复制 node_modules、构建产物或 .env，最终 Vitest 5.0.5 配置下全量测试与构建通过 |
| `npm run lint` | Web 与 Mobile 均通过 |
| `npm test` | **166 项通过**：Web 77、Mobile 12、api-core 2、engines 64、method-core 2、method-data 3、orchestrator 6 |
| `node --test desktop/test/*.test.cjs` | **3 项通过**，覆盖协议来源、离线路由、MIME、路径穿越、LLM 代理来源边界 |
| Web 生产构建与资源门禁 | 通过；入口静态依赖 gzip **165,013 bytes**，最大 JS gzip **150,122 bytes**，public **42,489,445 bytes** |
| corpus validate / ingest dry-run / embed dry-run | 通过；12 个来源、1,979 个 chunks；现有版权标记覆盖 100%，没有写入数据库 |
| 最终生产构建浏览器复测 | 完整刷新后可再次抽牌，报告出现、busy=false、无错误提示；本轮 error/warn 日志 0 |
| `git diff --check` | 通过 |

相对首轮，本轮 Web 从 45 项增加到 77 项（新增 32 项）。包含真实 React 组合回归，不只用模拟 hook 或状态机替代 UI。测试总计 **169 项**，没有把同一测试的重复运行累加。


## 提交与远端验证

实现与修复提交：`f1d3358`，已推送到 `origin/main`。[Atlas CI 首次运行](https://github.com/Zerong-Sun/atlas/actions/runs/40108874615) 全部步骤成功，包含最终锁文件安装、169 项测试、类型检查、构建、预算与语料门禁。

远端日志提示旧 Actions 的 Node 20 运行时弃用，以及 `ubuntu-latest` 将迁移镜像。后续收尾提交将 Atlas 独立 workflow 固定到 Ubuntu 24.04，并使用已核对 `action.yml` 为 Node 24 运行时的官方 checkout v7.0.1、setup-node v7.1.0。项目测试本身仍使用 Node 22。FateQuest workflow 的并行修改不在本次提交中。
