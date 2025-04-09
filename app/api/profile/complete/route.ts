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
      console.error('No session found in profile completion API')
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get profile data from request
    const profileData = await request.json()
    console.log('Profile data received:', JSON.stringify(profileData))
    
    if (!profileData) {
      console.error('No profile data provided')
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      )
    }
    
    console.log(`API: Completing profile for user ${session.user.id}`)

    // Check for volunteer status in metadata
    const { data: { user } } = await supabase.auth.getUser();
    let isVolunteer = Boolean(user?.user_metadata?.is_volunteer);
    
    // Get existing user_profile to check schema and current role
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (profileError) {
      console.log('Error fetching user profile:', profileError.message);
    } else {
      console.log('Found existing user profile:', userProfile);
    }
    
    // Mapping constants
    // Frontend to DB role mapping
    const roleMapping: Record<string, string> = {
      'prov': 'provider',
      'recip': 'individual',
      'vol': 'individual',
      'org': 'ngo'
    };
    
    // DB to frontend role mapping
    const reverseRoleMapping: Record<string, string> = {
      'provider': 'prov',
      'individual': 'recip',
      'ngo': 'org'
    };

    // Determine database columns that actually exist based on existing profile
    let updateData: Record<string, any> = {};
    
    // Always include role if available - make sure to map to database format
    if (userProfile?.role || profileData.role) {
      const role = profileData.role || userProfile?.role;
      // Convert frontend role to DB role
      updateData.role = roleMapping[role] || role;
      
      console.log(`Mapped role from '${role}' to '${updateData.role}'`);
    }
    
    // Check if the role indicates volunteer status
    if (profileData.role === 'vol') {
      isVolunteer = true;
      // Store volunteer status in user metadata
      await supabase.auth.updateUser({
        data: { is_volunteer: true }
      });
    }
    
    // Only include fields that exist in the user_profiles table
    if (userProfile) {
      // Take only the fields that already exist in the userProfile object
      Object.keys(userProfile).forEach(key => {
        if (profileData[key] !== undefined && key !== 'role') { // Skip role as we've already handled it
          updateData[key] = profileData[key];
        }
      });
    } else {
      // Only include essential fields when creating a new record
      updateData = {
        id: session.user.id,
        email: session.user.email,
        role: updateData.role || 'individual'
      };
    }
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    console.log('Updating user_profile with data:', updateData);
    
    let success = false;
    let resultRole = updateData.role;
    
    if (userProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', session.user.id);
      
      if (updateError) {
        console.error('Error updating user_profile:', updateError);
        return NextResponse.json(
          { error: `Failed to update profile: ${updateError.message}` },
          { status: 500 }
        );
      } else {
        success = true;
      }
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert(updateData);
      
      if (insertError) {
        console.error('Error creating user_profile:', insertError);
        return NextResponse.json(
          { error: `Failed to create profile: ${insertError.message}` },
          { status: 500 }
        );
      } else {
        success = true;
      }
    }
    
    // Handle successful update
    if (success) {
      // Map DB role back to frontend format
      const shortRole = reverseRoleMapping[resultRole] || resultRole;
      
      // Return special role for volunteers
      const finalRole = isVolunteer ? 'vol' : shortRole;
      
      console.log(`Successfully updated profile. Role: ${resultRole}, shortRole: ${finalRole}, isVolunteer: ${isVolunteer}`);
      
      return NextResponse.json({
        success: true,
        role: finalRole,
        dbRole: resultRole,
        is_volunteer: isVolunteer
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API: Unexpected error in profile completion:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 