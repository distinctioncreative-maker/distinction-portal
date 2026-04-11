create table if not exists integration_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  provider text not null,
  status text default 'active',
  config jsonb default '{}',
  connected_at timestamptz default now(),
  last_synced_at timestamptz,
  created_date timestamptz default now(),
  unique(organization_id, provider)
);

alter table integration_connections enable row level security;

create policy "Org members can manage their integrations"
  on integration_connections for all
  using (
    organization_id::text = (auth.jwt() -> 'user_metadata' ->> 'organizationId')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') in ('superadmin', 'support')
  );
