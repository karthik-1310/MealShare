import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function refreshSession() {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase.auth.getSession()
  
  if (error || !data.session) {
    console.log("No active session found");
    window.location.href = '/login'
    return null
  }
  
  return data.session
}

export async function getCurrentUser() {
  const supabase = createClientComponentClient()
  
  try {
    // Get the current user
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      console.log("No authenticated user found");
      return null
    }
    
    console.log("Found authenticated user:", user.email);
    
    // Default empty profile - will be populated if found in DB
    let profile = {
      id: user.id,
      role: null as string | null,
      full_name: null as string | null,
      email: user.email
    }
    
    try {
      // Try to get profile from user_profiles table
      const { data: userProfile, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (!userProfileError && userProfile) {
        console.log("Found user profile:", userProfile);
        // Merge with our default profile to ensure we have all required fields
        profile = {
          ...profile,
          ...userProfile
        }
      } else {
        console.log("No user profile found in database");
      }
    } catch (profileError) {
      console.error("Error fetching profile:", profileError);
    }
    
    // Return user with profile data and make user_metadata easily accessible
    return { 
      ...user,
      profile,
      // Ensure user_metadata is accessible at the top level
      user_metadata: user.user_metadata || {}
    }
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    return null
  }
}
