-- Run this once in the Supabase SQL editor (free tier is plenty for personal use).

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  prompt text not null,
  files jsonb not null,
  created_at timestamptz default now()
);

alter table projects enable row level security;

create policy "Users manage their own projects"
  on projects
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
