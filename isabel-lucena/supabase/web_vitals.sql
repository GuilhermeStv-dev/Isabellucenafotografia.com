create table if not exists public.web_vitals (
  id bigint generated always as identity primary key,
  timestamp timestamptz not null default now(),
  name text not null,
  value double precision,
  rating text,
  metric_id text,
  delta double precision,
  navigation_type text,
  pathname text,
  viewport text,
  connection text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists web_vitals_created_at_idx on public.web_vitals (created_at desc);
create index if not exists web_vitals_name_idx on public.web_vitals (name);
create index if not exists web_vitals_pathname_idx on public.web_vitals (pathname);

alter table public.web_vitals enable row level security;

-- As inserções serão feitas pela Vercel Function com SERVICE ROLE KEY.
-- Mantenha RLS habilitado e não crie policy de insert para 'anon'.
