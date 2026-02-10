-- PUBLIC/DEVELOPMENT SCHEMA
-- CAUTION: This script allows ANYONE with your Anon Key to read/write data.
-- Use this only for local development/prototyping.

-- 1. Reset: Drop existing tables to avoid conflicts
drop table if exists expenses;
drop table if exists incomes;
drop table if exists goals;
drop table if exists profiles;

-- 2. Create Profiles (No link to auth.users for public mode)
create table profiles (
  id uuid primary key, -- We will generate this UUID in the frontend
  email text,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Public Access
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Public profiles are insertable by everyone." on profiles for insert with check (true);
create policy "Public profiles are updatable by everyone." on profiles for update using (true);

-- 3. Create Incomes
create table incomes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  amount numeric not null,
  user_id uuid references profiles(id),
  is_recurring boolean default false
);

-- RLS: Public Access
alter table incomes enable row level security;
create policy "Public incomes are viewable by everyone." on incomes for select using (true);
create policy "Public incomes are insertable by everyone." on incomes for insert with check (true);

-- 4. Create Goals
create table goals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  monthly_contribution numeric default 0,
  deadline timestamp with time zone
);

-- RLS: Public Access
alter table goals enable row level security;
create policy "Public goals are viewable by everyone." on goals for select using (true);
create policy "Public goals are insertable by everyone." on goals for insert with check (true);
create policy "Public goals are updatable by everyone." on goals for update using (true);

-- 5. Create Expenses
create table expenses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  amount numeric not null,
  payer_id uuid references profiles(id),
  is_shared boolean default true,
  category text not null,
  linked_goal_id uuid references goals(id)
);

-- RLS: Public Access
alter table expenses enable row level security;
create policy "Public expenses are viewable by everyone." on expenses for select using (true);
create policy "Public expenses are insertable by everyone." on expenses for insert with check (true);
