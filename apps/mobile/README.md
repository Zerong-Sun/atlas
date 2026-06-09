# 诸象 Atlas — Mobile (Expo)

Expo + React Native app with **expo-router** and six tabs: 今日 / 提问 / 占法 / 梦境 / 档案 / 设置。

## Prerequisites

- Node.js ≥ 20
- npm (monorepo root install)
- [Expo Go](https://expo.dev/go) on a device, or iOS Simulator / Android emulator

## Environment variables

Set in repo root `.env` (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `EXPO_PUBLIC_MIMO_API_KEY` | Optional fallback LLM key (dev) |

Without Supabase, the app runs in **mock mode**. For占梦与 Method Copilot，推荐在 **设置 → LLM 连接** 配置 BYOK（仅存本机 AsyncStorage）。

## Run from repo root

```bash
npm install
npm run dev:mobile
```

Then press `i` (iOS simulator), `a` (Android), or scan the QR code with Expo Go.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:mobile` | Start Metro / Expo |
| `npm run lint` | Typecheck (`tsc --noEmit`) |

## Screen map

```
app/
├── _layout.tsx              # Auth gate, Method Copilot, stack routes
├── (tabs)/
│   ├── index.tsx            # 今日 — DailyBrief + 快捷入口
│   ├── ask.tsx              # 提问 — 多体系对照（含奇门）
│   ├── methods.tsx          # 占法目录（15 种 ready）
│   ├── dream.tsx            # 梦境 — 解析 + 历史 + 趋势
│   ├── profile.tsx          # 档案 — 出生信息、归档、书库入口
│   └── settings.tsx         # 设置 — BYOK LLM、体验偏好
├── methods/[methodId].tsx   # 14 种独立占法页（引擎本地计算）
├── library.tsx              # 书库（二级）
├── archive/[id].tsx         # 归档详情
├── reading/[id].tsx         # 对照报告
└── onboarding/              # 兴趣 → 档案 → 画像
```

## Shared packages

- `@atlas/method-data` — 占法目录、体验元数据、签库
- `@atlas/method-core` — 报告快照、Copilot 提示、分享格式化
- `@atlas/engines` — 八字、塔罗、奇门等确定性计算

## Access policy

Per `docs/access.md`: all features open in MVP—no paywall, Plus, or quota UI.
