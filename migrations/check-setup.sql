-- Create helper functions to check setup (you can run these in Supabase SQL Editor)

-- 1. Check if all tables exist
SELECT
  table_name,
  'EXISTS' as status
FROM
  information_schema.tables
WHERE
  table_schema = 'public'
  AND table_name IN (
    'user_profiles',
    'food_listings',
    'bids',
    'orders',
    'notifications'
  );

-- 2. Count records in each table
SELECT
  'user_profiles' as table_name,
  COUNT(*) as record_count
FROM
  user_profiles
UNION ALL
SELECT
  'food_listings' as table_name,
  COUNT(*) as record_count
FROM
  food_listings
UNION ALL
SELECT
  'bids' as table_name,
  COUNT(*) as record_count
FROM
  bids
UNION ALL
SELECT
  'orders' as table_name,
  COUNT(*) as record_count
FROM
  orders
UNION ALL
SELECT
  'notifications' as table_name,
  COUNT(*) as record_count
FROM
  notifications;

-- 3. Check all RLS policies
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM
  pg_policies
WHERE
  schemaname = 'public';

-- 4. Check triggers
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM
  information_schema.triggers
WHERE
  trigger_schema = 'public'
ORDER BY
  trigger_name;

-- 5. Check if PostGIS extension is enabled
SELECT
  name,
  default_version,
  installed_version
FROM
  pg_available_extensions
WHERE
  name = 'postgis'; 