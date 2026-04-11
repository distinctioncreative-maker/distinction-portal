create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  description text,
  user_id uuid,
  user_email text,
  created_date timestamptz not null default now()
);

alter table activity_logs enable row level security;

create policy "Users can read their org activity"
  on activity_logs for select
  using (organization_id::text = (auth.jwt() -> 'user_metadata' ->> 'organizationId'));

create policy "Users can insert activity for their org"
  on activity_logs for insert
  with check (organization_id::text = (auth.jwt() -> 'user_metadata' ->> 'organizationId'));
