"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'

// Role options with descriptions
const roleOptions = [
  {
    id: 'prov',
    title: 'Food Provider',
    description: 'I want to donate and share food with others in need',
    icon: '🍲',
  },
  {
    id: 'recip',
    title: 'Food Recipient',
    description: 'I am looking for food donations and support',
    icon: '🧺',
  },
  {
    id: 'vol',
    title: 'Volunteer',
    description: 'I want to help with distribution and other support services',
    icon: '🤲',
  },
  {
    id: 'org',
    title: 'Organization',
    description: 'I represent a food bank, charity, or community organization',
    icon: '🏢',
  },
]

export default function SelectRole() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { refreshProfile } = useAuth()
  const { toast } = useToast()

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No session found, redirecting to login");
        router.push('/login');
      } else {
        console.log("Session found:", session.user.email);
      }
    };
    
    checkAuth();
  }, [supabase, router]);

  // Handle role selection
  const handleRoleSelect = async () => {
    if (!selectedRole) {
      toast({
        title: "Selection Required",
        description: "Please select a role to continue",
        variant: "destructive",
      });
      return;
    }
    
    // Verify the user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to continue",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Updating role to:", selectedRole);
      
      // Show immediate feedback toast
      toast({
        title: "Updating...",
        description: `Setting your role as ${getRoleTitle(selectedRole)}`,
      });
      
      // For volunteers, we need to save additional metadata
      const extraMetadata = selectedRole === 'vol' ? { is_volunteer: true } : {};
      
      if (selectedRole === 'vol') {
        console.log("Setting volunteer flag in user metadata");
      }
      
      // Use the server-side API endpoint to update role
      const response = await fetch('/api/profile/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          role: selectedRole,
          ...extraMetadata
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role');
      }
      
      console.log("API response:", data);
      
      if (data.success) {
        // Make sure to refresh the profile
        try {
          await refreshProfile();
          console.log("Profile refreshed successfully after role update");
        } catch (refreshError) {
          console.error("Error refreshing profile:", refreshError);
        }
        
        // Show success message
        toast({
          title: "Role Selected",
          description: `You've selected ${getRoleTitle(selectedRole)}. Now let's complete your profile.`,
        });
        
        // Always route to the complete profile page after selecting a role
        router.push('/complete-profile');
      } else {
        throw new Error('Server returned success: false');
      }
    } catch (error: any) {
      console.error("Error updating role:", error);
      
      // Better error handling with specific messages
      let errorMessage = "Failed to update your role. Please try again.";
      
      if (error.name === 'AbortError') {
        errorMessage = "The request took too long. Please try again.";
      } else if (error.message.includes('constraint')) {
        errorMessage = "This role selection is not compatible with your account. Please choose another role.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get role title from ID
  const getRoleTitle = (roleId: string): string => {
    const role = roleOptions.find(r => r.id === roleId)
    return role ? role.title : roleId
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[120%] h-[120%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/30 blur-3xl opacity-50" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl"
        >
          <Card className="bg-gray-900/70 border-gray-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Select Your Role
              </CardTitle>
              <CardDescription>
                Choose how you want to participate in MealShare
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleOptions.map((role) => (
                  <motion.div
                    key={role.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedRole === role.id
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{role.icon}</div>
                        <div>
                          <h3 className="font-medium text-lg">{role.title}</h3>
                          <p className="text-sm text-gray-400">{role.description}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pt-2">
              <Button
                className="bg-purple-600 hover:bg-purple-700 w-full max-w-xs"
                size="lg"
                onClick={handleRoleSelect}
                disabled={isLoading || !selectedRole}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 