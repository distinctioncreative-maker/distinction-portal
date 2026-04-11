create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  title text not null,
  type text not null default 'call',
  status text not null default 'scheduled',
  start_at timestamptz,
  end_at timestamptz,
  location text,
  description text,
  assigned_to_user_id uuid,
  lead_id uuid,
  created_date timestamptz not null default now()
);

alter table appointments enable row level security;

create policy "Users can manage their org appointments"
  on appointments for all
  using (organization_id::text = (auth.jwt() -> 'user_metadata' ->> 'organizationId'));
