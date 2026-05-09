-- Run in Supabase SQL Editor (new tab)

alter table moments
  add column if not exists artifact_url text;

-- Security-definer so the API route can update this column using the anon key
create or replace function update_moment_artifact(
  p_id          uuid,
  p_artifact_url text
)
returns void
language sql
security definer
as $$
  update moments set artifact_url = p_artifact_url where id = p_id;
$$;
