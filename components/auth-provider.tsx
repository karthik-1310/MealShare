'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { getCurrentUser } from '@/lib/session'

// Role mapping helpers
const roleMapping: Record<string, string> = {
  'prov': 'provider',
  'recip': 'individual',
  'vol': 'individual',
  'org': 'ngo'
}

// Reverse mapping for database-to-frontend conversion plus display names
const reverseRoleMapping: Record<string, string> = {
  'provider': 'prov',
  'individual': 'recip',
  'ngo': 'org'
}

// Get display name for a role (used in UI)
export const roleDisplayNames: Record<string, string> = {
  'prov': 'Provider',
  'recip': 'Recipient',
  'vol': 'Volunteer',
  'org': 'Organization',
  'provider': 'Provider',
  'individual': 'Recipient',
  'ngo': 'Organization'
}

// Get display name for a role that considers the is_volunteer flag
export function getRoleDisplayName(role: string | null | undefined, isVolunteer?: boolean): string {
  if (!role) return '';
  
  // Special case for volunteers
  if (isVolunteer || role === 'vol') {
    return 'Volunteer';
  }
  
  return roleDisplayNames[role as keyof typeof roleDisplayNames] || role;
}

// Convert database role to frontend role
export function dbRoleToShortRole(dbRole: string | null): string | null {
  if (!dbRole) return null
  
  // Special case: if the role is 'individual' but we want to display as 'volunteer',
  // we need additional context from profile data that isn't available here
  return reverseRoleMapping[dbRole] || dbRole
}

// Convert frontend role to database role
export function shortRoleToDbRole(shortRole: string | null): string | null {
  if (!shortRole) return null
  return roleMapping[shortRole] || shortRole
}

// Define types for user profile and auth context
type UserProfile = {
  id: string;
  role: string | null;
  full_name: string | null;
  profile_completed?: boolean;
  is_volunteer?: boolean;
  email?: string;
  // Add other profile fields as needed
  [key: string]: any; // Allow other fields
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  currentProfile: UserProfile | null // Add currentProfile for real-time state
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  currentProfile: null, // Add default value
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {}
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  // Define the refreshProfile function that fetches the latest profile data
  const refreshProfile = async (): Promise<void> => {
    try {
      console.log("Refreshing profile data...")
      
      const userData = await getCurrentUser()
      if (!userData) {
        console.log("No user data returned from getCurrentUser");
        setUser(null)
        setProfile(null)
        setCurrentProfile(null)
        return
      }
      
      setUser(userData)
      
      // Check if we have profile data
      if (userData.profile) {
        console.log("Raw profile data:", userData.profile);
        
        // Create a proper UserProfile object with all required fields
        const userProfile: UserProfile = {
          ...userData.profile,
          // Ensure required fields exist
          id: userData.profile.id || userData.id,
          role: userData.profile.role || null,
          full_name: userData.profile.full_name || null,
          email: userData.email,
        };
        
        // Convert database role to frontend role format if needed
        if (userProfile.role) {
          const originalRole = userProfile.role;
          userProfile.role = dbRoleToShortRole(userProfile.role) || userProfile.role;
          console.log(`Converted role from ${originalRole} to ${userProfile.role}`);
        }
        
        // Check if volunteer status is in user metadata
        if (userData.user_metadata?.is_volunteer !== undefined) {
          userProfile.is_volunteer = userData.user_metadata.is_volunteer;
          console.log(`Volunteer status from metadata: ${userProfile.is_volunteer}`);
        }
        
        console.log("Setting profile state with:", userProfile);
        setProfile(userProfile);
        setCurrentProfile(userProfile);
      } else {
        console.log("No profile found in user data");
        setProfile(null)
        setCurrentProfile(null)
      }
    } catch (error) {
      console.error("Error refreshing profile:", error)
    }
  }

  // Sign out function
  const signOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setCurrentProfile(null)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Initialize auth state on mount
  useEffect(() => {
    console.log("Auth provider initializing");
    
    const initializeAuth = async () => {
      setLoading(true)
      
      try {
        // Get current auth session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log("Found authenticated session:", session.user.email);
          setUser(session.user);
          
          try {
            // Fetch user profile data 
            const userData = await getCurrentUser();
            
            if (userData?.profile) {
              console.log("Setting profile from getCurrentUser:", userData.profile);
              
              // Create a proper UserProfile object
              const userProfile: UserProfile = {
                ...userData.profile,
                id: userData.profile.id || userData.id,
                role: userData.profile.role || null,
                full_name: userData.profile.full_name || null,
              };
              
              // Convert role if needed
              if (userProfile.role) {
                userProfile.role = dbRoleToShortRole(userProfile.role) || userProfile.role;
              }
              
              // Check for volunteer status in metadata
              if (userData.user_metadata?.is_volunteer) {
                userProfile.is_volunteer = userData.user_metadata.is_volunteer;
              }
              
              setProfile(userProfile);
              setCurrentProfile(userProfile);
            } else {
              console.log("No profile found in user data");
              setProfile(null);
              setCurrentProfile(null);
            }
          } catch (profileError) {
            console.error("Error fetching profile:", profileError);
          }
        } else {
          console.log("No authenticated session found");
          setUser(null);
          setProfile(null);
          setCurrentProfile(null);
        }
        
        // Set up auth state change listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state change:", event);
            
            if (event === 'SIGNED_IN' && session?.user) {
              console.log("User signed in:", session.user.email);
              setUser(session.user);
              
              // Fetch profile immediately after sign in
              try {
                const userData = await getCurrentUser();
                if (userData?.profile) {
                  // Create a proper UserProfile object
                  const userProfile: UserProfile = {
                    ...userData.profile,
                    id: userData.profile.id || userData.id,
                    role: userData.profile.role || null,
                    full_name: userData.profile.full_name || null,
                  };
                  
                  // Convert role if needed
                  if (userProfile.role) {
                    userProfile.role = dbRoleToShortRole(userProfile.role) || userProfile.role;
                  }
                  
                  // Check for volunteer status in metadata
                  if (userData.user_metadata?.is_volunteer) {
                    userProfile.is_volunteer = userData.user_metadata.is_volunteer;
                  }
                  
                  setProfile(userProfile);
                  setCurrentProfile(userProfile);
                }
              } catch (profileError) {
                console.error("Error fetching profile after sign in:", profileError);
              }
            } else if (event === 'SIGNED_OUT') {
              console.log("User signed out");
              setUser(null);
              setProfile(null);
              setCurrentProfile(null);
            } else if (event === 'USER_UPDATED' && session?.user) {
              console.log("User updated:", session.user.email);
              setUser(session.user);
              await refreshProfile();
            }
          }
        );
        
        return () => {
          authListener.subscription.unsubscribe();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    }
    
    initializeAuth()
  }, [supabase])

  const value: AuthContextType = {
    user,
    profile,
    currentProfile: currentProfile,
    loading,
    signOut,
    refreshProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 