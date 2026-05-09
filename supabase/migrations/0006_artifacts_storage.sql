-- Public storage bucket for generated artifact images
insert into storage.buckets (id, name, public)
values ('artifacts', 'artifacts', true)
on conflict (id) do nothing;

-- Anyone can read artifact images
create policy "public read artifacts"
  on storage.objects for select to anon
  using (bucket_id = 'artifacts');

-- Only the service role (API route) can upload
create policy "service role upload artifacts"
  on storage.objects for insert to service_role
  with check (bucket_id = 'artifacts');

create policy "service role upsert artifacts"
  on storage.objects for update to service_role
  using (bucket_id = 'artifacts');
