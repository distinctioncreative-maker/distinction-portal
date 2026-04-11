create table if not exists daily_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  date date not null,
  revenue_daily numeric default 0,
  revenue_mtd numeric default 0,
  revenue_ytd numeric default 0,
  profit_daily numeric default 0,
  profit_mtd numeric default 0,
  profit_ytd numeric default 0,
  leads_daily integer default 0,
  leads_mtd integer default 0,
  leads_ytd integer default 0,
  booked_calls_daily integer default 0,
  booked_calls_mtd integer default 0,
  booked_calls_ytd integer default 0,
  conversion_rate_daily numeric default 0,
  unique (organization_id, date)
);

alter table daily_metrics enable row level security;

create policy "Users can manage their org daily metrics"
  on daily_metrics for all
  using (organization_id::text = (auth.jwt() -> 'user_metadata' ->> 'organizationId'));
