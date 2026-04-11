-- Add branding/config columns to organizations if not present
alter table organizations add column if not exists business_type text;
alter table organizations add column if not exists timezone text default 'America/New_York';
alter table organizations add column if not exists primary_color text default '#D4A853';

-- Organization feature-flag settings (one row per org)
create table if not exists organization_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique,
  pipeline_enabled boolean not null default true,
  calendar_enabled boolean not null default true,
  crm_enabled boolean not null default true,
  revenue_tracking_enabled boolean not null default true,
  chatbot_enabled boolean not null default false,
  whatsapp_assistant_enabled boolean not null default false,
  ai_insights_enabled boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

alter table organization_settings enable row level security;

create policy "Users can manage their org settings"
  on organization_settings for all
  using (organization_id::text = (auth.jwt() -> 'user_metadata' ->> 'organizationId'));
