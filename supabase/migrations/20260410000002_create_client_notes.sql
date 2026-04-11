create table if not exists client_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  lead_id uuid not null,
  user_id uuid,
  content text not null,
  note_type text not null default 'general',
  created_date timestamptz not null default now()
);

alter table client_notes enable row level security;

create policy "Users can manage their org client notes"
  on client_notes for all
  using (organization_id::text = (auth.jwt() -> 'user_metadata' ->> 'organizationId'));
