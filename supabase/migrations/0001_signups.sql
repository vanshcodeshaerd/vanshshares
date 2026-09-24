create table if not exists public.signups (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  alias text not null,
  college_email text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists signups_email_unique
  on public.signups (lower(college_email));

-- RLS on with no policies: only the server (service role) can read or write.
alter table public.signups enable row level security;
