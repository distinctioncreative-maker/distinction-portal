create table if not exists billing_packages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique,
  package_name text,
  billing_type text not null default 'flat',
  setup_fee numeric default 0,
  monthly_recurring_fee numeric default 0,
  billing_notes text,
  next_billing_date date,
  status text not null default 'active',
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

alter table billing_packages enable row level security;

create policy "Users can manage their org billing"
  on billing_packages for all
  using (organization_id::text = (auth.jwt() -> 'user_metadata' ->> 'organizationId'));
