import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check tables existence
    const tableResults: {
      user_profiles_exists: boolean;
      profiles_exists: boolean;
      schema: Array<{tablename: string}>;
    } = {
      user_profiles_exists: false,
      profiles_exists: false,
      schema: []
    }
    
    // Get table list from Supabase
    const { data: tables, error: tableError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
    
    if (tableError) {
      console.error('Error fetching tables:', tableError.message)
    } else {
      tableResults.schema = tables as Array<{tablename: string}> || []
      
      // Check if specific tables exist in the schema
      tableResults.user_profiles_exists = tables?.some(t => t.tablename === 'user_profiles') || false
      tableResults.profiles_exists = tables?.some(t => t.tablename === 'profiles') || false
    }
    
    // Try to count records in user_profiles
    let userProfilesCount = 0
    try {
      const { count, error } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
      
      if (!error && count !== null) {
        userProfilesCount = count
      }
    } catch (e) {
      console.error('Error counting user_profiles:', e)
    }
    
    // Try to count records in profiles
    let profilesCount = 0
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      if (!error && count !== null) {
        profilesCount = count
      }
    } catch (e) {
      console.error('Error counting profiles:', e)
    }
    
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession()
    
    // Prepare response
    const result = {
      tables: tableResults,
      counts: {
        user_profiles: userProfilesCount,
        profiles: profilesCount
      },
      auth: {
        session_exists: !!session,
        user_id: session?.user?.id
      }
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 