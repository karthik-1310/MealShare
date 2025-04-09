import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    // Properly handle cookies
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })
    
    // Get current session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('No session found in role update API')
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get role and extra metadata from request
    const { role, is_volunteer, ...extraData } = await request.json()
    
    if (!role) {
      console.error('No role provided')
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      )
    }
    
    // Map shortened role IDs to database-accepted values
    // This handles the check constraint in the database
    const roleMapping: Record<string, string> = {
      'prov': 'provider',
      'recip': 'individual',
      'vol': 'individual', // Changed from 'volunteer' to 'individual' to match DB constraint
      'org': 'ngo'
    }
    
    // Reverse mapping for UI
    const reverseRoleMapping: Record<string, string> = {
      'provider': 'prov',
      'individual': 'recip',
      'ngo': 'org'
    }
    
    // Use the mapped role or the original if not in mapping
    const dbRole = roleMapping[role] || role
    
    console.log(`API: Updating role to "${role}" (DB value: "${dbRole}") for user ${session.user.id}${is_volunteer ? ' (volunteer)' : ''}`)

    // Check the structure of the user_profiles table
    const { data: userProfileData, error: userProfileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)
    
    if (userProfileError) {
      console.error('Error querying user_profiles structure:', userProfileError)
      return NextResponse.json(
        { error: 'Failed to query database structure' },
        { status: 500 }
      )
    }
    
    // Get the actual columns from an existing record or fallback to default
    const validColumns = userProfileData && userProfileData.length > 0
      ? Object.keys(userProfileData[0])
      : ['id', 'email', 'role', 'updated_at', 'created_at']
    
    console.log('Valid columns in user_profiles:', validColumns.join(', '))
    
    // Prepare update data with only valid columns
    const updateData: Record<string, any> = {
      role: dbRole,
      updated_at: new Date().toISOString()
    }
    
    // Only include extraData fields that match valid columns
    Object.keys(extraData).forEach(key => {
      if (validColumns.includes(key)) {
        updateData[key] = extraData[key]
      }
    })
    
    // First try to find existing profile in user_profiles
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', session.user.id)
      .single()
    
    let success = false
    
    // If user_profiles record exists, update it
    if (userProfile) {
      console.log('API: Found existing record in user_profiles, updating with data:', updateData)
      
      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', session.user.id)
      
      if (error) {
        console.error('API: Error updating user_profiles:', error)
        return NextResponse.json(
          { error: `Failed to update user profile: ${error.message}` },
          { status: 500 }
        )
      } else {
        success = true
        
        // Store volunteer status in user metadata
        if (is_volunteer) {
          const { error: metadataError } = await supabase.auth.updateUser({
            data: { is_volunteer: is_volunteer }
          })
          
          if (metadataError) {
            console.error('API: Error updating user metadata:', metadataError)
          }
        }
      }
    } else {
      // Create new record in user_profiles
      console.log('API: No existing profile found, creating new record')
      
      // Prepare insert data with only valid columns
      const insertData: Record<string, any> = {
        id: session.user.id,
        email: session.user.email,
        role: dbRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Only include extraData fields that match valid columns
      Object.keys(extraData).forEach(key => {
        if (validColumns.includes(key)) {
          insertData[key] = extraData[key]
        }
      })
      
      console.log('API: Inserting new profile with data:', insertData)
      
      const { error } = await supabase
        .from('user_profiles')
        .insert(insertData)
      
      if (error) {
        console.error('API: Error inserting into user_profiles:', error)
        return NextResponse.json(
          { error: `Failed to create user profile: ${error.message}` },
          { status: 500 }
        )
      } else {
        success = true
        
        // Store volunteer status in user metadata
        if (is_volunteer) {
          const { error: metadataError } = await supabase.auth.updateUser({
            data: { is_volunteer: is_volunteer }
          })
          
          if (metadataError) {
            console.error('API: Error updating user metadata:', metadataError)
          }
        }
      }
    }
    
    if (success) {
      // For volunteers, use special role value
      const finalRole = is_volunteer ? 'vol' : role;
      
      console.log(`API: Successfully updated role to "${dbRole}", returning frontend role "${finalRole}"`)
      return NextResponse.json({ 
        success: true, 
        role: finalRole, // Return the short role ID for the frontend
        dbRole: dbRole, // Also return the full DB role
        is_volunteer: is_volunteer || false // Return the volunteer status
      })
    } else {
      console.error('API: Failed to update role')
      return NextResponse.json(
        { error: 'Failed to update role' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('API: Unexpected error in role update:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
} 