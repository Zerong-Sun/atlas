# 诸象 Atlas — Mobile (Expo)

Expo + React Native app with **expo-router** and five tabs: 今日 / 提问 / 梦境 / 档案 / 书库.

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

Without these, the app runs in **mock mode** (readings, daily brief, dreams, library).

## Run from repo root

```bash
npm install
npm run dev
```

Then press `i` (iOS simulator), `a` (Android), or scan the QR code with Expo Go.

From `apps/mobile`: `npx expo start`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Metro / Expo (root delegates to `@atlas/mobile`) |
| `npm run lint` | Typecheck (`tsc --noEmit`) |

## Screen map

```
app/
├── _layout.tsx              # Auth gate, onboarding redirect
├── (tabs)/
│   ├── index.tsx            # 今日 — DailyBrief
│   ├── ask.tsx              # 提问 — AskComposer → reading result
│   ├── dream.tsx            # 梦境 — DreamCapture + 7-day trend
│   ├── profile.tsx          # 档案 — birth edit, tradition toggles, history
│   └── library.tsx          # 书库 — browse terms by tradition
├── onboarding/
│   ├── interests.tsx        # Interest multi-select
│   ├── profile.tsx          # Birth date / time / place
│   └── portrait.tsx         # Multi-tradition portrait (no paywall)
└── reading/[id].tsx         # ReadingResultView (consensus, citations)
```

## API (`lib/api.ts`)

Edge Functions (with mock fallback):

| Client export | Edge function |
|---------------|---------------|
| `createReading` | `create-reading` |
| `interpretDream` | `create-dream` |
| `fetchDailyBrief` | `daily-brief` |
| `listLibrary` | `get-library` (GET) |
| `fetchProfile` / `updateProfile` | `profile` |

## Design system

- `theme/tokens.ts` — ink / parchment / gold-gray tokens
- `components/design-system/` — CitationBlock, TraditionBadge, ConsensusCard, DivergenceCard

## Access policy

Per `docs/access.md`: all features open in MVP—no paywall, Plus, or quota UI.
