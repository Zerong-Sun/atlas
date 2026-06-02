create extension if not exists vector;

create table if not exists corpus_releases (
  version text primary key,
  published_at timestamptz default now()
);

create table if not exists sources (
  id text primary key,
  title text not null,
  tradition text not null,
  source_type text not null,
  license_note text,
  source_url text,
  corpus_version text
);

create table if not exists source_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id text references sources(id),
  chapter text,
  original_text text,
  translation_zh text,
  annotation_zh text,
  keywords text[],
  embedding vector(1536),
  corpus_version text not null
);

create table if not exists profiles (
  user_id uuid primary key,
  birth_date date,
  birth_time time,
  birth_place text,
  disabled_traditions text[] default '{}',
  onboarding_completed boolean default false,
  free_reading_used boolean default false
);
