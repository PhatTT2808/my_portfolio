-- Portfolio database schema (run in Supabase SQL Editor)

create extension if not exists "pgcrypto";

-- ---------- public content ----------
create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  subheadline text,
  bio text,
  spotify_embed_url text,
  email text,
  github_url text,
  linkedin_url text
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text,
  thumbnail_url text,
  tags text[] not null default '{}',
  repo_url text,
  live_url text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- private area ----------
create table if not exists vocabulary (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  meaning text not null,
  example text,
  pronunciation text,
  learned boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text,
  due_date date,
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists schedule (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  location text
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  amount numeric(12,2) not null check (amount > 0),
  category text not null default 'other',
  spent_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists vocabulary_word_idx on vocabulary (lower(word));
create index if not exists expenses_spent_on_idx on expenses (spent_on desc);
create index if not exists tasks_done_idx on tasks (done, due_date);

-- RLS on everything: the API uses the service-role key and bypasses RLS,
-- so no anon policies are created. Nothing is reachable with the anon key.
alter table profile enable row level security;
alter table projects enable row level security;
alter table vocabulary enable row level security;
alter table tasks enable row level security;
alter table schedule enable row level security;
alter table expenses enable row level security;

-- Seed your profile (edit the values).
insert into profile (headline, subheadline, bio, spotify_embed_url)
select
  'YOUR NAME',
  'Developer / Student',
  'Short bio here.',
  'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M'
where not exists (select 1 from profile);
