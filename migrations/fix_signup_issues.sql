-- Fix User Registration Issues
-- This comprehensive script will fix authentication issues by:
-- 1. Determining the correct table structure
-- 2. Fixing or creating appropriate triggers
-- 3. Ensuring RLS policies are correct
-- 4. Creating missing profiles for existing users

-- Check which profile table exists
DO $$
DECLARE
    profile_table_name TEXT;
BEGIN
    -- Determine which table structure is being used
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        profile_table_name := 'user_profiles';
        RAISE NOTICE 'Found user_profiles table';
    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        profile_table_name := 'profiles';
        RAISE NOTICE 'Found profiles table';
    ELSE
        RAISE EXCEPTION 'No user profile table found. Please create either user_profiles or profiles table';
    END IF;
END $$;

-- Check the structure of auth.users to understand the correct column names
SELECT 
    column_name,
    data_type,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'auth'
    AND table_name = 'users'
    AND column_name IN ('email', 'email_confirmed_at', 'confirmed_at', 'created_at');

-- Check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM 
    information_schema.triggers
WHERE 
    event_object_schema = 'auth'
    AND event_object_table = 'users'
    AND trigger_name = 'on_auth_user_created';

-- PART 1: Fix the user_profiles trigger function
-- Drop any existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create an improved function that handles both table structures and has better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    profile_table_name TEXT;
    user_id_column TEXT;
    has_role_column BOOLEAN;
    has_full_name_column BOOLEAN;
BEGIN
    -- Determine which table structure exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        profile_table_name := 'user_profiles';
        user_id_column := 'id'; -- user_profiles likely uses id
    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        profile_table_name := 'profiles';
        user_id_column := 'user_id'; -- profiles likely uses user_id
    ELSE
        RAISE LOG 'No user profile table found. Profile creation skipped.';
        RETURN NEW;
    END IF;
    
    -- Check if role column exists
    has_role_column := EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = profile_table_name
        AND column_name = 'role'
    );
    
    -- Check if full_name column exists
    has_full_name_column := EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = profile_table_name
        AND column_name = 'full_name'
    );
    
    -- Add extensive logging for debugging
    RAISE LOG 'Creating profile for new user: %, in table: %', NEW.id, profile_table_name;
    
    -- Use an explicit try-catch to handle any errors
    BEGIN
        -- Handle different table structures with dynamic SQL
        IF profile_table_name = 'user_profiles' THEN
            -- Handle user_profiles table (id-based)
            IF has_role_column AND has_full_name_column THEN
                EXECUTE format('
                    INSERT INTO %I (id, role, full_name)
                    VALUES ($1, $2, $3)', profile_table_name)
                USING NEW.id, 
                      COALESCE(NEW.raw_user_meta_data->>'role', 'individual'),
                      COALESCE(NEW.raw_user_meta_data->>'full_name', NULL);
            ELSIF has_role_column THEN
                EXECUTE format('
                    INSERT INTO %I (id, role)
                    VALUES ($1, $2)', profile_table_name)
                USING NEW.id, 
                      COALESCE(NEW.raw_user_meta_data->>'role', 'individual');
            ELSE
                EXECUTE format('
                    INSERT INTO %I (id)
                    VALUES ($1)', profile_table_name)
                USING NEW.id;
            END IF;
        ELSE
            -- Handle profiles table (user_id-based)
            IF has_role_column AND has_full_name_column THEN
                EXECUTE format('
                    INSERT INTO %I (user_id, role, full_name)
                    VALUES ($1, $2, $3)', profile_table_name)
                USING NEW.id, 
                      COALESCE(NEW.raw_user_meta_data->>'role', 'individual'),
                      COALESCE(NEW.raw_user_meta_data->>'full_name', NULL);
            ELSIF has_role_column THEN
                EXECUTE format('
                    INSERT INTO %I (user_id, role)
                    VALUES ($1, $2)', profile_table_name)
                USING NEW.id, 
                      COALESCE(NEW.raw_user_meta_data->>'role', 'individual');
            ELSE
                EXECUTE format('
                    INSERT INTO %I (user_id)
                    VALUES ($1)', profile_table_name)
                USING NEW.id;
            END IF;
        END IF;
        
        RAISE LOG 'Successfully created profile for user: %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        -- Log error but don't prevent user creation
        RAISE WARNING 'Failed to create profile for user % - Error: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PART 2: Fix missing profiles for existing users
DO $$ 
DECLARE
    profile_table_name TEXT;
    user_id_column TEXT;
    has_role_column BOOLEAN;
    user_record RECORD;
    profile_count INTEGER;
BEGIN
    -- Determine which table structure exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        profile_table_name := 'user_profiles';
        user_id_column := 'id'; -- user_profiles likely uses id
    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        profile_table_name := 'profiles';
        user_id_column := 'user_id'; -- profiles likely uses user_id
    ELSE
        RAISE EXCEPTION 'No user profile table found. Please create either user_profiles or profiles table';
    END IF;
    
    -- Check if role column exists
    has_role_column := EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = profile_table_name
        AND column_name = 'role'
    );

    -- Dynamic SQL to find users without profiles
    IF profile_table_name = 'user_profiles' THEN
        -- For user_profiles table
        FOR user_record IN 
            EXECUTE format('
                SELECT au.id 
                FROM auth.users au
                LEFT JOIN %I up ON au.id = up.id
                WHERE up.id IS NULL', profile_table_name)
        LOOP
            RAISE NOTICE 'User % is missing a profile, creating one...', user_record.id;
            
            -- Create the missing profile with dynamic SQL
            IF has_role_column THEN
                EXECUTE format('
                    INSERT INTO %I (id, role)
                    VALUES ($1, $2)', profile_table_name)
                USING user_record.id, 'individual';
            ELSE
                EXECUTE format('
                    INSERT INTO %I (id)
                    VALUES ($1)', profile_table_name)
                USING user_record.id;
            END IF;
            
            GET DIAGNOSTICS profile_count = ROW_COUNT;
            RAISE NOTICE 'Created % profile(s) for existing user %', profile_count, user_record.id;
        END LOOP;
    ELSE
        -- For profiles table
        FOR user_record IN 
            EXECUTE format('
                SELECT au.id 
                FROM auth.users au
                LEFT JOIN %I p ON au.id = p.user_id
                WHERE p.user_id IS NULL', profile_table_name)
        LOOP
            RAISE NOTICE 'User % is missing a profile, creating one...', user_record.id;
            
            -- Create the missing profile with dynamic SQL
            IF has_role_column THEN
                EXECUTE format('
                    INSERT INTO %I (user_id, role)
                    VALUES ($1, $2)', profile_table_name)
                USING user_record.id, 'individual';
            ELSE
                EXECUTE format('
                    INSERT INTO %I (user_id)
                    VALUES ($1)', profile_table_name)
                USING user_record.id;
            END IF;
            
            GET DIAGNOSTICS profile_count = ROW_COUNT;
            RAISE NOTICE 'Created % profile(s) for existing user %', profile_count, user_record.id;
        END LOOP;
    END IF;
END $$;

-- PART 3: Make sure RLS is properly configured
DO $$ 
DECLARE
    profile_table_name TEXT;
    user_id_column TEXT;
    policy_exists BOOLEAN;
BEGIN
    -- Determine which table structure exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        profile_table_name := 'user_profiles';
        user_id_column := 'id'; -- user_profiles likely uses id
    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        profile_table_name := 'profiles';
        user_id_column := 'user_id'; -- profiles likely uses user_id
    ELSE
        RAISE EXCEPTION 'No user profile table found. Please create either user_profiles or profiles table';
    END IF;
    
    -- Enable RLS
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', profile_table_name);
    
    -- Create policies with appropriate column reference but check if they exist first
    IF profile_table_name = 'user_profiles' THEN
        -- For user_profiles table
        
        -- Check if select policy exists
        SELECT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'user_profiles'
            AND policyname = 'Users can view own profile'
        ) INTO policy_exists;
        
        IF NOT policy_exists THEN
            EXECUTE format('
                CREATE POLICY "Users can view own profile" 
                ON %I 
                FOR SELECT 
                USING (auth.uid() = id)', profile_table_name);
            RAISE NOTICE 'Created SELECT policy for %', profile_table_name;
        END IF;
        
        -- Check if update policy exists
        SELECT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'user_profiles'
            AND policyname = 'Users can update own profile'
        ) INTO policy_exists;
        
        IF NOT policy_exists THEN
            EXECUTE format('
                CREATE POLICY "Users can update own profile" 
                ON %I 
                FOR UPDATE 
                USING (auth.uid() = id)', profile_table_name);
            RAISE NOTICE 'Created UPDATE policy for %', profile_table_name;
        END IF;
        
        -- Check if insert policy exists
        SELECT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'user_profiles'
            AND policyname = 'Users can insert own profile'
        ) INTO policy_exists;
        
        IF NOT policy_exists THEN
            EXECUTE format('
                CREATE POLICY "Users can insert own profile" 
                ON %I 
                FOR INSERT 
                WITH CHECK (auth.uid() = id)', profile_table_name);
            RAISE NOTICE 'Created INSERT policy for %', profile_table_name;
        END IF;
    ELSE
        -- For profiles table
        
        -- Check if select policy exists
        SELECT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'profiles'
            AND policyname = 'Users can view own profile'
        ) INTO policy_exists;
        
        IF NOT policy_exists THEN
            EXECUTE format('
                CREATE POLICY "Users can view own profile" 
                ON %I 
                FOR SELECT 
                USING (auth.uid() = user_id)', profile_table_name);
            RAISE NOTICE 'Created SELECT policy for %', profile_table_name;
        END IF;
        
        -- Check if update policy exists
        SELECT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'profiles'
            AND policyname = 'Users can update own profile'
        ) INTO policy_exists;
        
        IF NOT policy_exists THEN
            EXECUTE format('
                CREATE POLICY "Users can update own profile" 
                ON %I 
                FOR UPDATE 
                USING (auth.uid() = user_id)', profile_table_name);
            RAISE NOTICE 'Created UPDATE policy for %', profile_table_name;
        END IF;
        
        -- Check if insert policy exists
        SELECT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'profiles'
            AND policyname = 'Users can insert own profile'
        ) INTO policy_exists;
        
        IF NOT policy_exists THEN
            EXECUTE format('
                CREATE POLICY "Users can insert own profile" 
                ON %I 
                FOR INSERT 
                WITH CHECK (auth.uid() = user_id)', profile_table_name);
            RAISE NOTICE 'Created INSERT policy for %', profile_table_name;
        END IF;
    END IF;
END $$;

-- PART 4: Check user email verification status using the correct column names
SELECT
    email,
    -- Attempt different column names that might exist
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'email_confirmed_at'
    ) THEN 'email_confirmed_at exists' ELSE 'email_confirmed_at does not exist' END as email_confirmed_status,
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'confirmed_at'
    ) THEN 'confirmed_at exists' ELSE 'confirmed_at does not exist' END as confirmed_at_status,
    created_at
FROM 
    auth.users
LIMIT 5;

-- Check email confirmation status using columns that actually exist
SELECT
    email,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'email_confirmed_at'
        ) THEN email_confirmed_at
        ELSE NULL
    END as email_confirmed_at,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'confirmed_at'
        ) THEN confirmed_at
        ELSE NULL
    END as confirmed_at,
    created_at
FROM 
    auth.users
LIMIT 5; 