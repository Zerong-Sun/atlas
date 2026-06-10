# 诸象 Atlas — Mobile (Expo)

Expo + React Native app with **expo-router** and six tabs: 今日 / 提问 / 占法 / 梦境 / 档案 / 设置。

## Prerequisites

- Node.js ≥ 20.19.4
- npm (monorepo root install)
- [Expo Go](https://expo.dev/go) **SDK 54** on a device, or iOS Simulator / Android emulator

## Environment variables

Set in repo root `.env` (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `EXPO_PUBLIC_LLM_API_KEY` | Optional dev LLM key (DeepSeek etc.) |
| `EXPO_PUBLIC_MIMO_API_KEY` | Optional fallback LLM key (Xiaomi Mimo) |

Env files are loaded from the **repo root** `.env` (see `.env.example`). For production use, prefer **设置 → LLM 连接** (BYOK stored on device).

Without Supabase, the app runs in **mock mode**. For占梦与 Method Copilot，推荐在 **设置 → LLM 连接** 配置 BYOK（仅存本机 AsyncStorage）。

## Run from repo root

```bash
npm install
npm run dev:mobile
```

或进入本目录启动：

```bash
cd apps/mobile
npx expo start
```

**不要**在 monorepo 根目录（`untitled/`）直接运行 `npx expo start`，否则会加载默认 `AppEntry` 并报 `Unable to resolve ../../App`。

Then press `i` (iOS simulator), `a` (Android), or scan the QR code with **Expo Go SDK 54**.

> This project uses **Expo SDK 54** (React Native 0.81, React 19). The App Store version of Expo Go matches the latest SDK; older Expo Go builds will report a version mismatch.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:mobile` | Start Metro / Expo |
| `npm run lint` | Typecheck (`tsc --noEmit`) |
| `npm run build:mobile:ios` | EAS 云端打 iOS 包（TestFlight / App Store） |
| `npm run submit:mobile:ios` | 提交最新 iOS 包到 App Store Connect |

## TestFlight 内测（iOS）

前置：**Apple Developer 会员（中国区 ¥688/年）**、**Expo 账号**（免费）。

### 1. 一次性准备

```bash
npm install -g eas-cli
eas login
cd apps/mobile
eas init          # 关联 Expo 项目（首次）
```

在 [App Store Connect](https://appstoreconnect.apple.com) 新建 App，Bundle ID 填 `com.atlas.app`（须与 `app.config.ts` 一致）。

### 2. 配置构建环境变量（云端打包用）

本地 `.env` 不会上传到 EAS，需单独设置：

```bash
cd apps/mobile
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value "https://..."
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..."
```

### 3. 打 iOS 包

在仓库根目录：

```bash
npm run build:mobile:ios
```

首次会引导配置 **Apple 签名证书**（选让 EAS 自动管理即可）。构建完成后在 [expo.dev](https://expo.dev) 控制台可看到 `.ipa`。

### 4. 提交 TestFlight

```bash
npm run submit:mobile:ios
```

按提示登录 Apple ID、选择 App Store Connect 里的 App。提交后在 App Store Connect → **TestFlight** 添加内测员邮箱，对方用 iPhone 安装 TestFlight App 即可下载。

### 图标

App 图标：`assets/icon.png`（1024×1024）。修改后重新 `build:mobile:ios` 即可。
| `npm test` (in `apps/mobile`) | Unit tests (`storage`, `uiPrefs`, `lenormandDeck`) |

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
