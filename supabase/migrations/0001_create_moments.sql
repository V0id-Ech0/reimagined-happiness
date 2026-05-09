-- Phosphene: moments table
-- Run this once in the Supabase SQL Editor (Database > SQL Editor > New query)

create table if not exists moments (
  id          uuid primary key default gen_random_uuid(),
  words       text        not null,
  color       text        not null check (color in ('warm','cool','rose','sage','violet')),
  hue         integer     not null,
  x           float       not null,
  y           float       not null,
  z           float       not null,
  radius      float       not null,
  drift_speed float       not null,
  phase       float       not null,
  created_at  timestamptz not null default now()
);

-- Row Level Security: public cosmos — anyone reads, anyone writes (no auth yet)
alter table moments enable row level security;

create policy "public read"
  on moments for select using (true);

create policy "public insert"
  on moments for insert with check (true);
