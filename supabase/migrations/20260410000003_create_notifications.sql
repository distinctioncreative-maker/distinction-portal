create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  user_id uuid not null,
  type text not null default 'info',
  title text not null,
  message text,
  status text not null default 'unread',
  priority text not null default 'normal',
  read_at timestamptz,
  created_date timestamptz not null default now()
);

alter table notifications enable row level security;

create policy "Users can manage their own notifications"
  on notifications for all
  using (user_id = auth.uid());
