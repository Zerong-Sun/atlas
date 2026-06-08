-- pgvector similarity search for source_chunks (used when embeddings are populated)
create or replace function match_source_chunks(
  query_embedding vector(1536),
  match_traditions text[],
  match_count int default 12
)
returns table (
  id uuid,
  source_id text,
  tradition text,
  original_text text,
  translation_zh text,
  annotation_zh text,
  keywords text[]
)
language sql
stable
as $$
  select
    sc.id,
    sc.source_id,
    sc.tradition,
    sc.original_text,
    sc.translation_zh,
    sc.annotation_zh,
    sc.keywords
  from source_chunks sc
  where sc.tradition = any(match_traditions)
    and sc.embedding is not null
  order by sc.embedding <=> query_embedding
  limit match_count;
$$;

-- IVFFlat index: create after corpus ingest when embeddings are populated.
-- run manually: create index idx_chunks_embedding on source_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
