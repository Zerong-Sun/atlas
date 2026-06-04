# Atlas Web（诸象）

Vite + React 单页应用，与 `apps/mobile` 共享 `@atlas/shared-types` 与 Supabase Edge Functions 契约。

## 本地运行

```bash
# 在 monorepo 根目录
npm install
npm run dev:web
```

未配置 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 时自动进入**演示模式**（本地 mock 数据）。

## Edge Functions 映射

| 客户端常量 | Supabase 函数 |
|-----------|----------------|
| `create-reading` | `create-reading` |
| `interpretDream` → `create-dream` | `create-dream` |
| `daily-brief` | `daily-brief` |
| `libraryList` → `get-library` | `get-library` (GET) |
| `profile` | `profile` |

## 路由

- `/onboarding/*` — 引导（兴趣 → 出生档案 → 画像）
- `/today` — 今日简报
- `/ask` — 提问对照
- `/dream` — 梦境记录
- `/profile` — 档案与历史
- `/library` — 书库浏览
- `/reading/:id` — 对照报告详情

全功能开放，无付费墙或额度 UI（见 `docs/access.md`）。
