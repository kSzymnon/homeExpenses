-- Create a table for public profiles (links to auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Income Table
create table incomes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  amount numeric not null,
  user_id uuid references profiles(id), -- or auth.users if strictly private
  is_recurring boolean default false
);

-- Enable RLS for incomes
alter table incomes enable row level security;
create policy "Incomes are viewable by everyone (shared economy)." on incomes for select using (true);
create policy "Users can insert their own income." on incomes for insert with check (auth.uid() = user_id);

-- Goals Table
create table goals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  monthly_contribution numeric default 0,
  deadline timestamp with time zone
);

-- Enable RLS for goals
alter table goals enable row level security;
create policy "Goals are viewable by everyone." on goals for select using (true);
create policy "Authenticated users can insert goals." on goals for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update goals." on goals for update using (auth.role() = 'authenticated');

-- Expenses Table
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

-- Enable RLS for expenses
alter table expenses enable row level security;
create policy "Expenses are viewable by everyone." on expenses for select using (true);
create policy "Authenticated users can insert expenses." on expenses for insert with check (auth.role() = 'authenticated');
