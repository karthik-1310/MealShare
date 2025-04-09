#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifySetup() {
  console.log('🔍 Verifying Supabase Setup...');
  
  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  try {
    // 1. Check tables existence
    console.log('\nChecking database tables...');
    const tables = ['user_profiles', 'food_listings', 'bids', 'orders', 'notifications'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.code === '42P01') {
        console.error(`❌ Table "${table}" does not exist: ${error.message}`);
      } else if (error) {
        console.error(`❌ Error querying "${table}": ${error.message}`);
      } else {
        console.log(`✅ Table "${table}" exists`);
      }
    }
    
    // 2. Check RLS policies
    console.log('\nChecking Row Level Security...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies');
    
    if (policiesError) {
      console.error(`❌ Error fetching policies: ${policiesError.message}`);
    } else {
      const policyCount = policies ? policies.length : 0;
      console.log(`✅ Found ${policyCount} RLS policies`);
    }
    
    // 3. Check triggers
    console.log('\nChecking database triggers...');
    const { data: triggers, error: triggersError } = await supabase
      .rpc('get_triggers');
    
    if (triggersError) {
      console.error(`❌ Error fetching triggers: ${triggersError.message}`);
    } else {
      const triggerCount = triggers ? triggers.length : 0;
      console.log(`✅ Found ${triggerCount} triggers`);
    }
    
    // 4. Create a test user profile
    console.log('\nTesting trigger for user profile creation...');
    console.log('Note: This requires admin access to insert directly into auth.users');
    console.log('Please check in the Supabase dashboard instead.');
    
    console.log('\n🎉 Verification completed!');
    console.log('\nFor a complete verification:');
    console.log('1. Check the Supabase dashboard at https://app.supabase.com');
    console.log('2. Go to "Table Editor" to verify all tables');
    console.log('3. Go to "Authentication" -> "Policies" to verify RLS policies');
    console.log('4. Go to "Database" -> "Functions" to verify triggers');
    
  } catch (err) {
    console.error('Verification failed:', err);
  }
}

verifySetup(); 