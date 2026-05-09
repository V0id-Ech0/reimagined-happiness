-- Poetic anonymous handle, e.g. "a wandering spark from Kyoto"
alter table moments add column if not exists handle text;
