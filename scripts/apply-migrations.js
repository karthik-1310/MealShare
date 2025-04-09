#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const migrationsDir = path.join(__dirname, '..', 'migrations');
const files = [
  'schema.sql',
  'rls.sql',
  'triggers.sql'
];

// Check if Supabase CLI is installed
try {
  execSync('supabase --version', { stdio: 'ignore' });
} catch (error) {
  console.error('Supabase CLI is not installed. Please install it first.');
  console.error('https://supabase.com/docs/guides/cli/getting-started');
  process.exit(1);
}

// Execute migrations
async function runMigrations() {
  console.log('📦 Applying migrations to Supabase...');
  
  // Check if linked to a Supabase project
  try {
    execSync('supabase status', { stdio: 'ignore' });
  } catch (error) {
    console.error('Not linked to a Supabase project. Please run:');
    console.error('  supabase link --project-ref YOUR_PROJECT_REF');
    process.exit(1);
  }
  
  // Apply each migration file
  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    
    if (fs.existsSync(filePath)) {
      console.log(`Applying ${file}...`);
      try {
        // Using SQL file directly
        execSync(`supabase db push --db-url "${process.env.DATABASE_URL}" --file ${filePath}`, { 
          stdio: 'inherit'
        });
        console.log(`✅ Successfully applied ${file}`);
      } catch (error) {
        console.error(`❌ Error applying ${file}:`, error.message);
        process.exit(1);
      }
    } else {
      console.warn(`⚠️ Migration file ${file} not found, skipping.`);
    }
  }
  
  console.log('🎉 All migrations applied successfully!');
}

runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 