create table if not exists widget_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  user_id uuid not null,
  widget_key text not null,
  is_visible boolean not null default true,
  created_date timestamptz not null default now(),
  unique (organization_id, user_id, widget_key)
);

alter table widget_settings enable row level security;

create policy "Users can manage their own widget settings"
  on widget_settings for all
  using (user_id = auth.uid());
