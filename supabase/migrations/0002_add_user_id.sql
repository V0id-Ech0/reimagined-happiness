-- Run this in Supabase SQL Editor after 0001_create_moments.sql
-- Also enable: Authentication > Configuration > Enable anonymous sign-ins (toggle ON)

-- Add user_id column (nullable — existing rows keep working)
alter table moments
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Replace the open insert policy with one that requires a matching auth.uid()
-- Anonymous users still count — Supabase gives them a real UUID session.
drop policy if exists "public insert" on moments;

create policy "authenticated insert"
  on moments for insert
  with check (auth.uid() is not null and auth.uid() = user_id);

-- Let users delete their own moments (for a future "remove" feature)
create policy "own delete"
  on moments for delete
  using (auth.uid() = user_id);
