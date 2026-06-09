# Atlas（诸象）

**跨文化命理、占卜与占梦的 AI 对照解读应用。**

同一个问题、同一份出生资料或同一场梦，可在八字、西洋占星、塔罗、周易等多种传统中并行解读；每条结论尽量附古籍依据与可追溯引用，并呈现不同体系之间的共识与分歧。

> 核心不是「告诉你命运是什么」，而是把不同文明的象征系统放在同一张桌上，让用户看见解释、依据与差异。

**在线体验（无需自行部署）：** [https://zhuxiang.vercel.app](https://zhuxiang.vercel.app)

## 特性

- **多体系对照** — 同一输入并行调用多个学派，保留差异而非强行合并
- **原典优先** — 解读引用古籍 chunk，无依据处标注为 AI 综合解释
- **共识 / 分歧分析** — 汇总各传统的共同判断、冲突点与文化差异
- **Web 优先 + 移动端** — Vite React Web 与 Expo 客户端共享类型与 API 契约
- **本地可运行** — 未配置 Supabase 时使用本地 mock 数据，开发体验不中断

## 文档

| 文档 | 说明 |
|------|------|
| [产品 PRD](docs/prd/诸象.md) | 定位、用户、功能与体验原则 |
| [架构说明](docs/architecture.md) | 运行时边界、API 形态与数据一致性 |
| [访问策略](docs/access.md) | MVP 无付费墙、无额度限制 |
| [实施计划](docs/plan.md) | 里程碑与任务拆解 |
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

在终端按 `i`（iOS 模拟器）、`a`（Android）或 Expo Go 扫码。详见 [apps/mobile/README.md](apps/mobile/README.md)。

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

## 许可

专有项目。古籍语料遵循各条目 `source_type` 与 `license_note` 字段标注；详见 [docs/corpus-copyright.md](docs/corpus-copyright.md)。
