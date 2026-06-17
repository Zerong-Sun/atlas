# Atlas Web（诸象）

Vite + React 单页应用，与 `apps/mobile` 共享 `@atlas/shared-types`、`@atlas/method-data` 与 Supabase Edge Functions 契约。Web 是完整工作台入口，负责展示全球占法目录、文化语境说明、语言 / 术语偏好和深度报告。

## 本地运行

```bash
# 在 monorepo 根目录
npm install
npm run dev:web
```

未配置 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 时使用本地数据，功能照常可用。

本地 LLM（占梦、侧栏解说）：

- **推荐**：打开 **设置 → LLM 连接**，输入 API Key 并测试（密钥仅存本机 `localStorage`）
- **可选**：在 `apps/web/.env.local` 配置 `VITE_LLM_API_KEY`（仅本地开发，**勿写入 Vercel Production**），开发模式经 `/api/llm` 代理转发

LLM 代理（`/api/llm`）仅允许白名单内的 HTTPS 服务商域名，防止 SSRF；生产环境密钥由用户在设置页 BYOK 输入。

## 生产部署

### Vercel（推荐）

1. 将仓库 push 到 GitHub，在 [vercel.com](https://vercel.com) Import Project
2. **Root Directory** 保持 monorepo 根目录（由根目录 [`vercel.json`](../../vercel.json) 指定构建）
3. 配置环境变量（Production + Preview）：

| 变量 | 必填 | 说明 |
|------|------|------|
| `VITE_SUPABASE_URL` | 是 | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | 是 | anon public key |
| `VITE_LLM_API_KEY` | 否 | 仅本地 `.env.local`；公开站靠设置页 BYOK，勿写入 Production |

4. Deploy 后得到 `https://<project>.vercel.app`
5. 在 Supabase Auth 中填入该 URL（见下方 Supabase 配置）
6. 打开站点 → **设置 → LLM 连接** → 输入 Key → **测试连接**

静态资源来自 `apps/web/dist`；`/api/llm` 由根目录 [`api/llm.ts`](../../api/llm.ts) 代理到用户配置的 LLM 提供商（避免浏览器 CORS）。

### Cloudflare Pages（备选）

Dashboard → Workers & Pages → Create → Connect Git：

| 项 | 值 |
|----|-----|
| Build command | `npm run build:web` |
| Build output | `apps/web/dist` |
| Root directory | `/`（monorepo 根） |

环境变量同 Vercel。Functions 目录为仓库根 [`functions/`](../../functions/)（`functions/api/llm.ts` 处理 `/api/llm`）。SPA 回退见 [`public/_redirects`](public/_redirects)。

### Supabase 云端配置

在 monorepo 根目录：

```bash
# 安装 Supabase CLI 后
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

设置 Edge Function 服务端密钥（用于 `create-reading` 等编排链路，与设置页 BYOK 互不冲突）：

```bash
supabase secrets set \
  MIMO_API_KEY=... \
  MIMO_API_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1 \
  LLM_API_KEY=... \
  LLM_API_BASE_URL=https://api.deepseek.com/v1 \
  LLM_MODEL=deepseek-v4-flash
```

部署全部 Edge Functions：

```bash
supabase functions deploy create-reading
supabase functions deploy create-dream
supabase functions deploy list-dreams
supabase functions deploy dream-trend
supabase functions deploy generate-portrait
supabase functions deploy daily-brief
supabase functions deploy get-library
supabase functions deploy list-readings
supabase functions deploy library-list
supabase functions deploy profile
```

**Authentication → URL Configuration**（Supabase Dashboard）：

- **Site URL**：`https://<your-app>.vercel.app`（或自定义域名）
- **Redirect URLs**：同上，并加上 `http://localhost:5173`（本地开发）

语料入库（可选，完整 RAG 时）：

```bash
npm run corpus:ingest
npm run corpus:embed
# 在 Supabase SQL Editor 执行 corpus/.cache/embed.sql，并按 migration 注释创建 IVFFlat 索引
```

未入库时 Edge Function 会 fallback 到种子语料；无 embedding 时检索退化为关键词匹配。

## Edge Functions 映射

| 客户端常量 | Supabase 函数 |
|-----------|----------------|
| `create-reading` | `create-reading` |
| `interpretDream` → `create-dream` | `create-dream` |
| `listDreams` | `list-dreams` (GET) |
| `dreamTrend` | `dream-trend` (GET) |
| `generatePortrait` | `generate-portrait` |
| `daily-brief` | `daily-brief` |
| `libraryList` → `get-library` | `get-library` (GET) |
| `profile` | `profile` |

## 路由

- `/onboarding/*` — 引导（兴趣 → 出生档案 → 画像）
- `/today` — 今日简报
- `/ask` — 提问对照
- `/methods` — 占法目录（均为真实演算页或结构化规则引擎）
- `/methods/meihua`、`/methods/numerology`、`/methods/oracle`、`/methods/coffee`、`/methods/scrying` — 接入 `@atlas/engines`
- `/methods/vedic` — 吠陀星盘（Swiss Ephemeris / Lahiri、Whole Sign 十二宫、Vimshottari 大运）
- `/methods/geomancy` — 土占（默认手点四母图，可切换一键随机）
- `/methods/xiangmian`、`/methods/palmistry` — 结构化观察表单（非图像识别）；图片上传为后续 epic
- `/methods/iching` — 周易铜钱演卦（真实 `castIChing`）
- `/methods/iching/workbench` — 周易参考文库模板工作台（hash 模板草稿，**非演卦**）
- `/methods/liuyao` — 纳甲六爻事件占（世应、六亲、用神）
- `/dream` — 梦境记录
- `/profile` — 档案与历史
- `/library` — 书库浏览
- `/reading/:id` — 对照报告详情
- `/settings` — 偏好与 LLM 连接
- `/settings` — 偏好、语言文化适配与 LLM 连接

全功能开放，无付费墙或额度 UI（见 `docs/access.md`）。

## 验证清单

| 项 | 预期 |
|----|------|
| 未配 Supabase | 设置页显示「仅本地模式」 |
| 已配 Supabase | 设置页显示「已连接云端」 |
| 未配 LLM Key | 占梦 / Copilot 降级模板 |
| 设置页测试连接 | `POST /api/llm` 返回 200 |
| 深链路由 | `/dream`、`/reading/:id` 不 404 |
