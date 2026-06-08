# Atlas（诸象）

跨文化命理与占梦 AI 对照解读 App — 多体系对照 + 古籍依据 + 可追溯引用。

- 产品 PRD：[docs/prd/诸象.md](docs/prd/诸象.md)
- 架构说明：[docs/architecture.md](docs/architecture.md)
- 实施计划：见项目 Wiki / 本地 `docs/plan.md`

## Monorepo 结构

```text
atlas/
├── apps/web/             # Vite + React Web 客户端（Web 优先）
├── apps/mobile/          # Expo 客户端
├── packages/
│   ├── engines/          # 八字 / 西占 / 塔罗 / 周易 计算引擎
│   ├── orchestrator/     # 解读编排、检索、LLM、引用校验
│   ├── shared-types/     # 共享类型与 JSON Schema
│   ├── theme/            # 设计 token 与 tradition 元数据
│   └── corpus-scripts/   # 语料采集与入库流水线
├── supabase/             # 数据库迁移与 Edge Functions
├── corpus/               # 语料清单与种子数据
└── docs/                 # PRD、合规说明
```

## 快速开始

### Web 优先（无需 Supabase 即可使用）

```bash
# 安装依赖（根目录）
npm install

# 本地开发（未配置 VITE_SUPABASE_* 时使用本地数据，功能照常可用）
npm run dev:web
# 浏览器打开 http://localhost:5173

# 生产构建
npm run build:web
```

连接 Supabase 时，复制 `.env.example` 为 `.env` 并填写 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`（可与 `SUPABASE_URL` / `SUPABASE_ANON_KEY` 相同），重启 dev 服务器。

### 本地 LLM（占梦等，当前测试方案）

复制 `.env.example` 为 `apps/web/.env.local`，填写：

```bash
VITE_LLM_API_KEY=your-deepseek-key
VITE_LLM_MODEL=deepseek-v4-flash
```

开发模式下请求经 Vite proxy（`/api/llm`）转发，密钥勿提交 git。对外发布前建议迁至 Edge Function。

### 语料流水线（corpus_v0_1）

```bash
# 安装依赖（根目录）
npm install

# 语料流水线
npm run corpus:generate    # 从 seed-builders 生成 corpus/seeds/*.json
npm run corpus:validate    # 清单 + 版权 100% + ≥500 chunks（当前约 1701 chunks）
npm run corpus:ingest:dry-run
npm run corpus:publish     # 生成 → 校验 → dry-run（CI 同款）

产物：`corpus/seeds/`、`corpus/audit/copyright-coverage.json`、`corpus/.cache/ingest.sql`

# 移动端
npm run dev -w @atlas/mobile
```

## 环境变量

复制 `.env.example` 为 `.env`（Web 本地 LLM 可用 `apps/web/.env.local`），填写 Supabase 与 LLM 等密钥（勿提交 `.env` / `.env.local`）。

| 变量 | 用途 |
|------|------|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Web（Vite）客户端 |
| `VITE_LLM_API_KEY` / `VITE_LLM_MODEL` | Web 本地 LLM（开发/自用测试） |
| `EXPO_PUBLIC_SUPABASE_*` | Expo 移动端 |
| `SUPABASE_*` / `LLM_API_KEY` / `MIMO_API_KEY` | Edge Functions / 脚本 |

## 许可

专有项目。古籍语料遵循各条目 `source_type` 与 `license_note` 字段标注。
