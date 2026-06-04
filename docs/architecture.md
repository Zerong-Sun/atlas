# Atlas Architecture

Atlas is organized as a monorepo with a thin-client, Edge Function, orchestration, engine, corpus, and database split.

## Runtime Flow

```text
apps/web or apps/mobile
  -> Supabase Edge Functions
  -> packages/orchestrator
  -> packages/engines + corpus retrieval + Mimo
  -> Supabase tables
```

## Boundaries

- `apps/web` and `apps/mobile` own presentation, routing, local onboarding state, and platform-specific storage.
- `supabase/functions` owns authenticated API boundaries and database persistence.
- `packages/orchestrator` owns reading assembly: safety policy, engine calls, retrieval, Mimo calls, citation verification, and section ordering.
- `packages/engines` owns deterministic calculations for bazi, western astrology, tarot, and iching.
- `packages/shared-types` owns DTOs that cross app, function, orchestrator, and engine boundaries.
- `packages/corpus-scripts` owns corpus generation, validation, dry-run ingest, and publishing checks.
- `corpus` owns generated seed data, manifests, and audit artifacts.
- `packages/theme` owns shared design tokens and tradition metadata intended for both clients.

## API Shape

Edge Functions return camelCase DTOs from `@atlas/shared-types`. Database rows stay snake_case inside Supabase functions and must be mapped before leaving the API boundary.

Current reading endpoints:

- `create-reading`: creates a question, generates a report, persists the reading, sections, and citation snapshots.
- `list-readings`: returns persisted `ReadingReport[]` for the authenticated user.

Client API modules may fall back to mock/local data when Supabase is not configured or an Edge Function fails. Product behavior that requires persistence should still have a real Edge Function path.

## Data Consistency

`create-reading` treats the reading row and its child rows as one logical write. If section or citation inserts fail, the function deletes the newly created reading row and returns an error.

Supabase RLS remains the primary ownership guard. User-owned tables should be accessed through an authenticated user client unless a service-role operation is explicitly required.

## Next Consolidation Targets

- Move duplicated web/mobile API mapping and mock data into a shared client package.
- Move shared web/mobile view components only when their platform differences are small enough to justify it.
- Replace mock vector scoring in `HybridRetrieval` with a database-backed vector and keyword retrieval path.
- Add an API mapper module for repeated snake_case to camelCase conversions.
