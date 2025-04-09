# Implementing User Profiles with Supabase

This guide explains how to set up and use the user profiles system in your application.

## Database Setup

To set up the profiles table in your Supabase database, run the following SQL in the Supabase SQL Editor:

```sql
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
```

## How It Works

1. **Automatic Profile Creation**: When a new user signs up, a database trigger automatically creates a profile record for them.

2. **Row Level Security**: The profiles table uses Row Level Security (RLS) to ensure users can only access and modify their own profile data.

3. **User-Profile Relationship**: Each user has exactly one profile, linked by the `user_id` field which references `auth.users(id)`.

## Storage Setup for Avatars

To enable avatar uploads, you need to create a storage bucket in Supabase:

1. Go to the Supabase dashboard
2. Navigate to "Storage" in the sidebar
3. Click "Create a new bucket"
4. Name it "avatars"
5. Set the bucket privacy to "Private"
6. Create the following policy to allow authenticated users to upload their own avatars:

```sql
-- Allow users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own avatars
CREATE POLICY "Users can read their own avatars"
ON storage.objects
FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to all avatars
CREATE POLICY "Public access to avatars"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'avatars'
);
```

## Using Profiles in Your Application

The application includes several utilities for working with profiles:

1. **Profile Types** (`lib/types.ts`): TypeScript interfaces for profile data.

2. **Profile Utilities** (`lib/profile.ts`): Functions for fetching and updating profiles.

3. **Profile Hook** (`lib/hooks/useProfile.ts`): A React hook for accessing profile data in components.

4. **Profile Page** (`app/profile/page.tsx`): A page for users to view and update their profile.

## Example Usage

```tsx
import { useProfile } from "@/lib/hooks/useProfile";

function MyComponent() {
  const { profile, loading, error, update } = useProfile();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!profile) return <div>Not authenticated</div>;
  
  return (
    <div>
      <h1>Welcome, {profile.username || "User"}</h1>
      <button onClick={() => update({ username: "New Username" })}>
        Update Username
      </button>
    </div>
  );
}
```

## Security Considerations

1. **Row Level Security**: All database access is protected by RLS policies.

2. **Storage Security**: Avatar uploads are restricted to authenticated users.

3. **Data Validation**: Always validate user input before updating profiles.

4. **Error Handling**: All profile operations include proper error handling.

## Troubleshooting

If you encounter issues with profiles:

1. Check that the SQL migrations have been applied correctly.
2. Verify that RLS policies are configured properly.
3. Ensure the storage bucket for avatars exists and has the correct policies.
4. Check browser console for any errors related to Supabase operations. 