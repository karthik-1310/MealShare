-- Check auth schema existence
SELECT nspname 
FROM pg_catalog.pg_namespace 
WHERE nspname = 'auth';

-- Check auth.users table
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'auth'
   AND table_name = 'users'
);

-- Check if anon role has proper permissions
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'anon'
AND table_schema = 'auth'
AND table_name = 'users';

-- Check if service_role has proper permissions
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'service_role'
AND table_schema = 'auth'
AND table_name = 'users';

-- Check if auth.users has any rows
SELECT count(*) FROM auth.users;

-- Check profiles table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- Check if the trigger exists
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';

-- Add auth.users delete cascading to public.profiles constraint explicitly
DO $$
BEGIN
    ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS profiles_id_fkey;
    
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adjusting constraints: %', SQLERRM;
END $$; 