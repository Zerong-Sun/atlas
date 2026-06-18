# Atlas（诸象）

**面向全球文明的命理、占卜、占梦与预测方法对照应用。**

同一个问题、同一份出生资料或同一场梦，可在八字、西洋占星、塔罗、周易、吠陀占星、雷诺曼、卢恩、土占、咖啡渣占卜等多种传统中并行解读；每条结论尽量附原典依据与可追溯引用，并呈现不同体系之间的共识、分歧和文化态度。

> 核心不是「告诉你命运是什么」，而是把不同文明的象征系统放在同一张桌上，让用户体会每种文化如何提问、如何理解因果、如何处理不确定性。

**在线体验（无需自行部署）：** [https://zhuxiang.vercel.app](https://zhuxiang.vercel.app)

## 特性

- **多体系对照** — 同一输入并行调用多个学派，保留差异而非强行合并
- **文明语境** — 每种占法记录来源文明、提问方式、文化态度与跨语言别名
- **语言 / 文化适配** — 支持界面语言、文化视角与术语策略偏好；例如 `八字` 可按 `Four Pillars / Ba Zi` 解释
- **原典优先** — 解读引用古籍 chunk，无依据处标注为 AI 综合解释
- **共识 / 分歧分析** — 汇总各传统的共同判断、冲突点与文化差异
- **Web 优先 + 移动端** — Vite React Web 与 Expo 客户端共享类型与 API 契约
- **本地可运行** — 未配置 Supabase 时使用本地 mock 数据，开发体验不中断

## 文档

| 文档 | 说明 |
|------|------|
| [产品 PRD](docs/prd/诸象.md) | 定位、用户、功能与体验原则 |
| [主体验重构](docs/main-experience-refactor.md) | 从“占法工具箱”转向“文明象征系统对照台”的产品与实施蓝图 |
| [架构说明](docs/architecture.md) | 运行时边界、API 形态与数据一致性 |
| [访问策略](docs/access.md) | MVP 无付费墙、无额度限制 |
| [实施计划](docs/plan.md) | 里程碑与任务拆解 |
| [占法完整度审阅](docs/method-completeness.md) | Web / Mobile 占法完成度、缺口与下一批方法 |
| [合规说明](docs/compliance.md) | 内容与表达边界 |
| [Web 客户端](apps/web/README.md) | 部署、路由、Edge Functions 映射 |
| [Mobile 客户端](apps/mobile/README.md) | Expo 运行与屏幕结构 |

## 仓库结构

```text
atlas/
├── apps/
│   ├── web/                  # Vite + React（Web 优先）
│   └── mobile/               # Expo + React Native
├── packages/
│   ├── engines/              # 八字 / 西占 / 塔罗 / 周易 等确定性计算
│   ├── orchestrator/         # 解读编排、检索、LLM、引用校验
│   ├── shared-types/         # 跨边界 DTO 与 JSON Schema
│   ├── theme/                # 设计 token 与 tradition 元数据
│   └── corpus-scripts/       # 语料生成、校验与入库流水线
├── supabase/                 # 数据库迁移与 Edge Functions
├── corpus/                   # 语料清单、种子数据与审计产物
└── docs/                     # PRD、架构、合规
```

## 前置要求

- **Node.js** ≥ 20
- **npm**（workspace monorepo）

## 快速开始

直接使用 [在线版](https://zhuxiang.vercel.app) 即可体验；以下为本地开发与贡献者指引。

### 1. 安装依赖

```bash
npm install
```

### 2. Web 开发（推荐入口）

```bash
npm run dev:web
# 浏览器打开 http://localhost:5173
```

未配置 `VITE_SUPABASE_*` 时自动进入本地模式，主要功能仍可使用。

生产构建：

```bash
npm run build:web
```

### 3. 移动端

```bash
npm run dev:mobile
# 或 cd apps/mobile && npx expo start
```

在终端按 `i`（iOS 模拟器）、`a`（Android）或 Expo Go 扫码。请使用 `npm run dev:mobile` 或先 `cd apps/mobile`；不要在仓库根目录直接运行 `npx expo start`。详见 [apps/mobile/README.md](apps/mobile/README.md)。

> 请勿在仓库根目录运行 `npx expo start`——会误把 monorepo 根目录当作 Expo 项目，报 `Unable to resolve ../../App`。

### 4. 环境变量

复制 `.env.example` 为 `.env`（Web 本地 LLM 也可使用 `apps/web/.env.local`）。**勿提交** `.env` / `.env.local`。

| 变量 | 用途 |
|------|------|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Web 客户端 |
| `VITE_LLM_API_KEY` / `VITE_LLM_MODEL` | Web 本地 LLM（开发；生产建议设置页 BYOK） |
| `EXPO_PUBLIC_SUPABASE_*` | Expo 移动端 |
| `SUPABASE_*` / `LLM_*` / `MIMO_*` | Edge Functions 与语料脚本 |

连接 Supabase 后，设置页应显示「已连接云端」；未连接时显示「仅本地模式」。

### 5. 本地 LLM（占梦、侧栏解说）

**推荐**：应用内 **设置 → LLM 连接**，密钥仅存本机。

**可选**（仅开发）：在 `apps/web/.env.local` 配置：

```bash
VITE_LLM_API_KEY=your-key
VITE_LLM_MODEL=deepseek-v4-flash
```

开发模式下请求经 Vite 代理 `/api/llm` 转发。对外发布前建议迁至 Edge Function 或用户 BYOK。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev:web` | 启动 Web 开发服务器 |
| `npm run dev:mobile` | 启动 Expo |
| `npm run build:web` | Web 生产构建 |
| `npm run lint` | 各 workspace 类型检查 |
| `npm run test` | 各 workspace 单元测试 |
| `npm run corpus:generate` | 从 seed-builders 生成 `corpus/seeds/*.json` |
| `npm run corpus:validate` | 校验清单、版权覆盖与 chunk 数量 |
| `npm run corpus:ingest:dry-run` | 生成入库 SQL（不写入数据库） |
| `npm run corpus:publish` | 生成 → 校验 → dry-run（CI 同款） |
| `npm run corpus:embed` | 为已入库 chunk 生成 embedding SQL |
| `npm run corpus:embed:dry-run` | 校验 embedding 维度（CI 同款） |

语料入库（完整 RAG 时）：`npm run corpus:ingest` → `npm run corpus:embed` → 在 Supabase 执行 `corpus/.cache/embed.sql` 并创建 IVFFlat 索引。未入库时 Edge Function 会 fallback 到种子语料。

## 运行时架构

```text
apps/web 或 apps/mobile
  → Supabase Edge Functions
  → packages/orchestrator
  → packages/engines + 语料检索 + LLM
  → Supabase 表
```

Edge Functions 对外返回 camelCase DTO（`@atlas/shared-types`）；数据库层保持 snake_case，在 API 边界完成映射。客户端在 Supabase 未配置或请求失败时可 fallback 到本地 mock。

主要 Edge Functions：`create-reading`、`list-readings`、`create-dream`、`list-dreams`、`dream-trend`、`generate-portrait`、`daily-brief`、`get-library`、`profile`。

## CI

`main` 分支 push / PR 触发 [`.github/workflows/ci.yml`](.github/workflows/ci.yml)：

- 语料 generate + validate + ingest dry-run + embed dry-run
- Web lint、build、test
- `engines`、`orchestrator` 与 `api-core` 单元测试

## 部署

Web 推荐 [Vercel](apps/web/README.md#vercel推荐)（根目录 `vercel.json` 指定构建 `apps/web/dist`）。Supabase 迁移与 Functions 部署步骤见 [apps/web/README.md](apps/web/README.md#supabase-云端配置)。

## 占法实现状态（Web）

| 占法 | 状态 |
|------|------|
| 吠陀 | Swiss Ephemeris（Lahiri）、Whole Sign 十二宫、Vimshottari 大运 |
| 土占 | 手点四母图（默认）+ 一键随机 |
| 面相 / 手相 | 结构化观察表单（非 CV）；图片上传为后续 epic |
| 周易 | `/methods/iching` 铜钱演卦；`/methods/iching/workbench` 模板草稿（非演卦）；`/methods/liuyao` 纳甲六爻 |

## 文明与语言路线

Atlas 的长期目标是做成全球象征系统的对照台，而不是把所有传统压平成同一种“算命”。新增或优化占法时，需要同时补齐：

- 来源文明与历史语境：这套方法来自哪里，原本服务什么场景
- 提问方式：它擅长回答人生结构、短期事件、空间布局、梦境意象，还是行动策略
- 术语策略：原词、译名、双语并列如何显示
- 文化边界：宗教、民俗、身体观察、健康与财务相关表达必须有清晰边界

优先扩展方向：

| 区域 / 文明 | 方法 |
|-------------|------|
| 东亚 | 韩国 Saju、日本宿曜、御神签、阴阳道、梅花与六壬深化 |
| 南亚 | Vedic 分盘 Navamsa、Prashna 问事占星、Nakshatra 深化 |
| 中东 / 伊斯兰世界 | 梦境解释、Istikhara 决策反思、阿拉伯地占传统 |
| 欧洲 | 古典占星 Horary、Geomancy 完整十二宫、Tarot 历史牌系、Lenormand Grand Tableau |
| 非洲与侨民传统 | Ifá 作为文化学习模块、投贝/投骨类象征系统（需严格尊重宗教边界） |
| 美洲与现代传统 | Maya Tzolk'in、现代 Oracle、心理象征与荣格主动想象 |

## 许可

专有项目。古籍语料遵循各条目 `source_type` 与 `license_note` 字段标注；详见 [docs/corpus-copyright.md](docs/corpus-copyright.md)。

吠陀星历计算使用 [@swisseph/browser](https://www.npmjs.com/package/@swisseph/browser) / [@swisseph/node](https://www.npmjs.com/package/@swisseph/node)（AGPL-3.0），详见语料版权文档中的第三方组件说明。
