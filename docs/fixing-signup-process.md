# Fixing User Signup Issues

This document provides a step-by-step guide to fix issues with user signup where users aren't appearing in the Supabase authentication panel.

## Common Issues

1. **Database Trigger Issues**: The trigger that creates user profiles might not be working correctly
2. **Email Confirmation Problems**: Email confirmations might not be delivered or configured
3. **RLS Permission Issues**: Row Level Security might be blocking profile creation
4. **Missing or Incorrect Environment Variables**: The Supabase connection may be misconfigured
5. **Column Name Discrepancies**: Supabase schema differences between versions

## Understanding the Problem

The main issue we're facing is that when users sign up:

1. The user gets created in the `auth.users` table, but:
   - The user profile is not being created in the `user_profiles` table
   - This happens because the database trigger isn't working correctly

2. There are differences in Supabase database schemas:
   - Some versions use a `profiles` table with a `user_id` column
   - Other versions use a `user_profiles` table with `id` as the foreign key
   - Column names for email verification also differ between versions

3. The error `column "is_identity_email_verified" does not exist` indicates:
   - The original script was using column names that don't exist in your version
   - We need a more dynamic approach that adapts to your database structure

## Solution Steps

### 1. Run the Improved Database Fix Script

Run the updated SQL script in the Supabase SQL Editor:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to the SQL Editor
4. Open and run the file `migrations/fix_signup_issues.sql`

This improved script will:

- **Automatically detect your database structure**:
  - Identifies whether you're using `profiles` or `user_profiles` table
  - Checks which columns exist in your tables
  - Uses the correct column references for your schema version

- **Fix the database trigger** that creates user profiles:
  - Creates a robust trigger that works with both table structures
  - Adds comprehensive error handling and logging
  - Prevents silent failures during profile creation

- **Create profiles for existing users**:
  - Identifies users without profiles
  - Dynamically creates profiles using the correct table structure
  - Adds required fields based on your schema

- **Set up proper RLS policies**:
  - Ensures Row Level Security is correctly configured
  - Creates policies with the correct column references
  - Makes policies compatible with your specific table structure

### 2. Check Supabase Email Settings

1. Go to Authentication → Email Templates
2. Verify the "Confirm Signup" template is configured correctly
3. Make sure you have a proper Site URL configured in URL Configuration
4. Add the following Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/`
   - Your production URLs if applicable

### 3. Test the Signup Process

1. Open the browser developer tools (F12)
2. Navigate to the Console tab
3. Try to create a new account with a valid email
4. Look for any error messages in the console
5. Check if you see `Auth signup successful - User ID: [some-id]` message

### 4. Verify Email Delivery

If users aren't receiving verification emails:

1. Check spam/junk folders
2. Use a disposable email service like [Mailinator](https://www.mailinator.com/) for testing
3. In Supabase, go to Authentication → Users to see if the user appears

### 5. Verify Environment Variables

Check your `.env.local` file to ensure it contains the correct Supabase URL and Anon Key:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Override Email Confirmation for Testing

If you're just testing and need to bypass email confirmation:

1. In Supabase Dashboard, go to Authentication → Users
2. Find the test user
3. Click the "..." menu and select "Edit User"
4. Check the "Email confirmed" checkbox (or equivalent in your Supabase version)
5. Save changes

## Troubleshooting

### If Users Still Don't Appear in Supabase

1. Check browser console logs during signup for errors
2. Verify network requests to see if the signup API call is succeeding
3. Try enabling "Auto-confirm" in Supabase Email provider settings temporarily
4. Check for any errors in the Supabase logs

### Understanding Supabase Version Differences

Supabase has changed its schema over time:

- **Early versions**: Used `auth_user`, `profiles` table with a `user_id` column
- **Current versions**: Use `auth.users`, might use `user_profiles` with `id` as the key
- **Column differences**: Email verification columns have changed names

Our fix script automatically handles these differences by:
1. Detecting which tables and columns exist in your database
2. Using dynamic SQL to adapt to your specific structure
3. Creating the appropriate triggers and policies for your version

### Database Permissions Issues

If the SQL scripts fail because of permissions:

1. Make sure you're running them with the correct admin role
2. Contact Supabase support for assistance with database permission issues
3. Try running the migrations from the Supabase management console directly

## Ongoing Monitoring

To ensure signup continues to work:

1. Implement logging in your signup process
2. Set up error tracking to alert on signup failures
3. Periodically check for users without profiles

By following these steps, your signup process should be fixed and users should appear correctly in the Supabase authentication panel. The dynamic nature of our fix ensures it works across different Supabase versions. 