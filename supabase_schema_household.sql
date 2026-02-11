-- HOUSEHOLD SCHEMA (Public/Shared Mode)
-- Allows users to share data by joining the same "Household".

-- 1. Reset (optional, if you want a clean slate)
-- drop table if exists expenses;
-- drop table if exists incomes;
-- drop table if exists goals;
-- drop table if exists profiles;
-- drop table if exists households;

-- 2. Create Households Table
create table if not exists households (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text unique, -- Simple code like "1234" or "FAMILY" for joining
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Public for households (controlled by code knowledge in app logic)
alter table households enable row level security;
create policy "Public households view" on households for select using (true);
create policy "Public households insert" on households for insert with check (true);

-- 3. Update Profiles
-- If you already have the table, run:
-- alter table profiles add column household_id uuid references households(id);
-- OR recreate:
create table if not exists profiles (
  id uuid primary key,
  email text,
  name text,
  avatar_url text,
  household_id uuid references households(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Update Data Tables (Incomes, Goals, Expenses)
-- We add household_id to all of them for easy filtering
-- alter table incomes add column household_id uuid references households(id);
create table if not exists incomes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  amount numeric not null,
  user_id uuid references profiles(id),
  household_id uuid references households(id),
  is_recurring boolean default false
);

create table if not exists goals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  monthly_contribution numeric default 0,
  deadline timestamp with time zone,
  household_id uuid references households(id)
);

create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  amount numeric not null,
  payer_id uuid references profiles(id),
  is_shared boolean default true,
  category text not null,
  linked_goal_id uuid references goals(id),
  household_id uuid references households(id)
);

-- RLS Updates: Allow if household_id matches
-- Ideally, we'd check if auth.uid() is in the household, but for Public mode:
-- We just trust the client controls the ID.
alter table incomes enable row level security;
create policy "Public incomes" on incomes for all using (true) with check (true);

alter table goals enable row level security;
create policy "Public goals" on goals for all using (true) with check (true);

alter table expenses enable row level security;
create policy "Public expenses" on expenses for all using (true) with check (true);
