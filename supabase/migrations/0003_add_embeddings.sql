-- Run in Supabase SQL Editor (new tab)
-- Requires pgvector — already available on all Supabase projects

-- 1. Enable the extension
create extension if not exists vector;

-- 2. Add embedding column to moments
alter table moments
  add column if not exists embedding vector(1536);

-- 3. Security-definer function so the API route can update embeddings
--    using the anon key without needing the service role key.
create or replace function update_moment_embedding(
  p_id        uuid,
  p_embedding vector(1536)
)
returns void
language sql
security definer
as $$
  update moments set embedding = p_embedding where id = p_id;
$$;

-- 4. Returns all moment pairs whose cosine similarity exceeds the threshold.
--    Called once on page load; cached in the client for the session.
create or replace function get_similar_pairs(
  p_threshold float default 0.70,
  p_limit     int   default 150
)
returns table(id_a uuid, id_b uuid, similarity float)
language sql
as $$
  select
    least(m1.id, m2.id)::uuid     as id_a,
    greatest(m1.id, m2.id)::uuid  as id_b,
    (1 - (m1.embedding <=> m2.embedding))::float as similarity
  from moments m1, moments m2
  where m1.id < m2.id
    and m1.embedding is not null
    and m2.embedding is not null
    and (1 - (m1.embedding <=> m2.embedding)) > p_threshold
  order by similarity desc
  limit p_limit;
$$;
