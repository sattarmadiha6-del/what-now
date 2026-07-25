-- Only needed if you already ran schema.sql before this update.
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run
-- If you are setting up the project fresh, just use schema.sql instead - you don't need this file.

alter table public.checkins add column if not exists time_minutes integer;
alter table public.checkins add column if not exists difficulty text
  check (difficulty in ('Easy', 'Medium', 'Hard'));
