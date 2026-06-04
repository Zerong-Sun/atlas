-- Atlas MVP schema
create extension if not exists vector;
create extension if not exists pg_trgm;

-- Corpus versioning
create table if not exists corpus_releases (
  version text primary key,
  published_at timestamptz not null default now(),
  chunk_count int default 0,
  notes text
);

-- Classical sources metadata
create table if not exists sources (
  id text primary key,
  title text not null,
  tradition text not null,
  source_type text not null check (source_type in ('public_domain', 'licensed', 'self_authored')),
  license_note text,
  source_url text,
  verbatim_allowed boolean default true,
  corpus_version text not null references corpus_releases(version)
);

-- Chunk storage (single source of truth for original text)
create table if not exists source_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references sources(id) on delete cascade,
  chapter text,
  section text,
  original_text text,
  translation_zh text,
  annotation_zh text,
  keywords text[] default '{}',
  tradition text not null,
  embedding vector(1536),
  corpus_version text not null,
  review_status text default 'unreviewed' check (review_status in ('unreviewed', 'ai_reviewed', 'expert_reviewed')),
  created_at timestamptz default now()
);

create index if not exists idx_chunks_tradition on source_chunks(tradition);
create index if not exists idx_chunks_keywords on source_chunks using gin(keywords);
create index if not exists idx_chunks_corpus on source_chunks(corpus_version);

-- Cross-tradition concept index
create table if not exists concept_index (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label_zh text not null,
  tradition text not null,
  definition_zh text,
  chunk_ids uuid[] default '{}',
  related_slugs text[] default '{}',
  corpus_version text not null
);

create index if not exists idx_concept_tradition on concept_index(tradition);
create index if not exists idx_concept_label on concept_index using gin(label_zh gin_trgm_ops);

-- User profiles
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  birth_date date,
  birth_time time,
  birth_place text,
  birth_lat double precision,
  birth_lng double precision,
  timezone text default 'Asia/Shanghai',
  disabled_traditions text[] default '{}',
  onboarding_completed boolean default false,
  corpus_version_pin text,
  portrait_summary jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Questions
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  category text default 'general',
  traditions text[] not null,
  created_at timestamptz default now()
);

-- Readings
create table if not exists readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid references questions(id) on delete set null,
  traditions text[] not null,
  structured_facts jsonb not null default '[]',
  consensus text,
  divergence text,
  degraded boolean default false,
  trace_id text not null,
  token_cost numeric,
  latency_ms int,
  created_at timestamptz default now()
);

create table if not exists reading_sections (
  id uuid primary key default gen_random_uuid(),
  reading_id uuid not null references readings(id) on delete cascade,
  section_type text not null,
  title text not null,
  content text not null,
  tradition text,
  sort_order int not null,
  metadata jsonb default '{}'
);

-- Frozen citation snapshots per reading
create table if not exists citation_snapshots (
  id uuid primary key default gen_random_uuid(),
  reading_id uuid not null references readings(id) on delete cascade,
  chunk_id uuid not null,
  original_text text,
  translation_zh text,
  annotation_zh text,
  application text,
  relevance numeric default 0,
  trace_id text not null
);

-- Dreams
create table if not exists dream_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  emotions text[] default '{}',
  symbols text[] default '{}',
  interpretation jsonb,
  created_at timestamptz default now()
);

-- Daily briefs cache
create table if not exists daily_briefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brief_date date not null,
  payload jsonb not null,
  created_at timestamptz default now(),
  unique(user_id, brief_date)
);

-- Ingestion jobs
create table if not exists ingestion_jobs (
  id uuid primary key default gen_random_uuid(),
  corpus_version text not null,
  status text not null default 'pending',
  stats jsonb default '{}',
  error text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Tradition intros for library tab
create table if not exists tradition_intros (
  tradition text primary key,
  title_zh text not null,
  summary_zh text not null,
  cultural_note_zh text
);

-- Analytics events
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  properties jsonb default '{}',
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table questions enable row level security;
alter table readings enable row level security;
alter table reading_sections enable row level security;
alter table citation_snapshots enable row level security;
alter table dream_entries enable row level security;
alter table daily_briefs enable row level security;
alter table analytics_events enable row level security;

-- Public read for corpus
alter table sources enable row level security;
alter table source_chunks enable row level security;
alter table concept_index enable row level security;
alter table tradition_intros enable row level security;
alter table corpus_releases enable row level security;

create policy "corpus_sources_read" on sources for select using (true);
create policy "corpus_chunks_read" on source_chunks for select using (true);
create policy "concept_index_read" on concept_index for select using (true);
create policy "tradition_intros_read" on tradition_intros for select using (true);
create policy "corpus_releases_read" on corpus_releases for select using (true);

create policy "profiles_own" on profiles for all using (auth.uid() = user_id);
create policy "questions_own" on questions for all using (auth.uid() = user_id);
create policy "readings_own" on readings for all using (auth.uid() = user_id);
create policy "reading_sections_own" on reading_sections for all
  using (exists (select 1 from readings r where r.id = reading_id and r.user_id = auth.uid()));
create policy "citation_snapshots_own" on citation_snapshots for all
  using (exists (select 1 from readings r where r.id = reading_id and r.user_id = auth.uid()));
create policy "dreams_own" on dream_entries for all using (auth.uid() = user_id);
create policy "daily_briefs_own" on daily_briefs for all using (auth.uid() = user_id);
create policy "analytics_own" on analytics_events for insert with check (auth.uid() = user_id);

-- Seed corpus release placeholder
insert into corpus_releases (version, notes) values ('corpus_v0_1', 'MVP initial corpus')
on conflict (version) do nothing;
