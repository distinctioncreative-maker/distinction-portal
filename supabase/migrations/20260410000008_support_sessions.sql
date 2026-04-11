-- Create support_sessions table
create table if not exists support_sessions (
  id uuid primary key default gen_random_uuid(),
  support_user_id uuid not null,
  organization_id uuid not null references organizations(id) on delete cascade,
  reason text,
  mode text default 'read',
  status text default 'active',
  started_at timestamptz default now(),
  ended_at timestamptz,
  created_date timestamptz default now()
);

alter table support_sessions enable row level security;

create policy "Support users can manage sessions"
  on support_sessions for all
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('superadmin', 'support')
  );

-- Allow superadmin/support to read ALL organizations (in addition to existing member policy)
create policy "Superadmin can read all organizations"
  on organizations for select
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('superadmin', 'support')
  );

-- Allow superadmin to insert organizations
create policy "Superadmin can insert organizations"
  on organizations for insert
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'superadmin'
  );

-- Allow superadmin to update organizations
create policy "Superadmin can update organizations"
  on organizations for update
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'superadmin'
  );
