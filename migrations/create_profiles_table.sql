-- Create profiles table
create table public.profiles (
    id bigint primary key generated always as identity,
    user_id uuid references auth.users(id) on delete cascade,
    username text,
    avatar_url text,
    created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create an index on user_id for performance
create index on public.profiles(user_id);

-- Create policies
-- Allow users to view their own profile
create policy "Users can view own profile" 
on public.profiles 
for select 
using (auth.uid() = user_id);

-- Allow users to update their own profile
create policy "Users can update own profile" 
on public.profiles 
for update 
using (auth.uid() = user_id);

-- Allow new users to create their profile
create policy "Users can insert their own profile" 
on public.profiles 
for insert 
with check (auth.uid() = user_id);

-- Create a function to handle new user profiles
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to call the function when a new user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 