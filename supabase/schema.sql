-- Run this whole file once in Supabase Dashboard -> SQL Editor -> New query -> Run

create extension if not exists "pgcrypto";

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null,
  ingredients text not null,
  energy text not null check (energy in ('low', 'medium', 'high')),
  craving text,
  dish_name text not null,
  dish_reason text not null,
  dish_recipe text not null,
  status text not null default 'suggested' check (status in ('suggested', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists checkins_user_id_idx on public.checkins(user_id);
create index if not exists checkins_session_id_idx on public.checkins(session_id);

alter table public.checkins enable row level security;

create policy "Users can view their own checkins"
  on public.checkins for select
  using (auth.uid() = user_id);

create policy "Users can insert their own checkins"
  on public.checkins for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own checkins"
  on public.checkins for update
  using (auth.uid() = user_id);
