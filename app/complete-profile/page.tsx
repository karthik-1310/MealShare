"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth-provider'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'

// Define profile data type
type ProfileData = {
  [key: string]: any;
  id?: string;
  user_id?: string;
  full_name?: string;
  role?: string;
  profile_completed?: boolean;
}

export default function CompleteProfile() {
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // Form fields
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    bio: '',
    // Provider-specific fields
    business_name: '',
    business_type: '',
    // Organization-specific fields
    organization_name: '',
    organization_type: '',
    // Recipient-specific fields
    preferences: '',
    dietary_restrictions: '',
    // Volunteer-specific fields
    availability: '',
    skills: ''
  })

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Initialize form data from existing profile
  useEffect(() => {
    const initializeProfile = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      if (!profile) {
        await refreshProfile()
        return
      }

      // If profile is already completed, redirect to dashboard
      if (profile.profile_completed) {
        router.push('/dashboard')
        return
      }

      // Initialize form data with existing profile data
      let profileData: ProfileData | null = null
      try {
        // Try user_profiles first
        let { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          // Try profiles instead
          let { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (!profilesError) {
            profileData = profilesData as ProfileData
          }
        } else {
          profileData = data as ProfileData
        }

        // Update form if profile data exists
        if (profileData) {
          setFormData(prev => ({
            ...prev,
            ...Object.keys(prev).reduce((acc, key) => {
              if (profileData && profileData[key]) {
                acc[key] = profileData[key]
              }
              return acc
            }, {} as Record<string, any>)
          }))
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeProfile()
  }, [user, profile, refreshProfile, router, supabase])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return

    setIsLoading(true)

    try {
      // Show immediate feedback toast
      toast({
        title: "Saving...",
        description: "Updating your profile information"
      });
      
      // First check what fields are allowed in the database
      // We do this by fetching our existing profile
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      // Create a filtered version of form data containing only fields
      // that exist in the database schema
      const filteredFormData: Record<string, any> = {};
      
      if (userProfile) {
        // Add only the fields that exist in the database
        Object.keys(userProfile).forEach(key => {
          // Type assertion to fix linter error
          if (key in formData) {
            filteredFormData[key] = (formData as Record<string, any>)[key];
          }
        });
        
        // Always include role and updated timestamp
        filteredFormData.role = profile.role;
        filteredFormData.updated_at = new Date().toISOString();
      } else {
        // If we don't have a profile yet, just include essential fields
        filteredFormData.full_name = formData.full_name;
        filteredFormData.role = profile.role;
        filteredFormData.updated_at = new Date().toISOString();
      }
      
      console.log("Submitting profile data:", filteredFormData);
      
      // Use the server-side API for profile updates with filtered data
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filteredFormData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete profile');
      }

      // Refresh profile in background
      await refreshProfile();

      toast({
        title: "Profile Completed",
        description: "Your profile has been updated successfully."
      });

      // Role-based redirection
      if (profile.role === 'prov') {
        console.log('Redirecting provider to create listings page');
        router.push('/listings/create');
      } else {
        console.log('Redirecting to browse listings page');
        router.push('/listings/browse');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update your profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle skip functionality
  const handleSkip = async () => {
    if (!user || !profile) return
    
    setIsLoading(true)
    
    try {
      // Show immediate feedback
      toast({
        title: "Processing...",
        description: "Updating your profile settings"
      });
      
      // Use the server-side API - only send minimal data
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Only include role to update
          role: profile.role,
          updated_at: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to skip profile completion');
      }
      
      // Refresh profile completely before redirecting
      await refreshProfile();
      
      toast({
        title: "Profile Skipped",
        description: "You can complete your profile later from the dashboard."
      });
      
      // Direct role-based routing without checks
      if (profile.role === 'prov') {
        console.log('Redirecting provider to create listings page');
        router.push('/listings/create');
      } else {
        console.log('Redirecting to browse listings page');
        router.push('/listings/browse');
      }
    } catch (error) {
      console.error('Error skipping profile:', error);
      toast({
        title: "Error",
        description: "Failed to skip profile completion. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If still initializing, show loading
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    )
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
                Complete Your Profile
              </CardTitle>
              <CardDescription>
                {profile?.role ? `Tell us more about you as a ${profile.role}` : 'Please provide your details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="profileForm" onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information - All Users */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="bg-gray-800 border-gray-700"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip_code">ZIP Code</Label>
                      <Input
                        id="zip_code"
                        name="zip_code"
                        value={formData.zip_code}
                        onChange={handleChange}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="bg-gray-800 border-gray-700 min-h-[100px]"
                      placeholder="Tell us a bit about yourself..."
                    />
                  </div>
                </div>

                {/* Provider-specific fields */}
                {profile?.role === 'provider' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Provider Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="business_name">Business Name</Label>
                        <Input
                          id="business_name"
                          name="business_name"
                          value={formData.business_name}
                          onChange={handleChange}
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business_type">Business Type</Label>
                        <Select
                          value={formData.business_type}
                          onValueChange={(value) => handleSelectChange('business_type', value)}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="restaurant">Restaurant</SelectItem>
                            <SelectItem value="cafe">Café</SelectItem>
                            <SelectItem value="bakery">Bakery</SelectItem>
                            <SelectItem value="grocery">Grocery Store</SelectItem>
                            <SelectItem value="catering">Catering</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Organization-specific fields */}
                {profile?.role === 'organization' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Organization Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="organization_name">Organization Name</Label>
                        <Input
                          id="organization_name"
                          name="organization_name"
                          value={formData.organization_name}
                          onChange={handleChange}
                          className="bg-gray-800 border-gray-700"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="organization_type">Organization Type</Label>
                        <Select
                          value={formData.organization_type}
                          onValueChange={(value) => handleSelectChange('organization_type', value)}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="food_bank">Food Bank</SelectItem>
                            <SelectItem value="shelter">Shelter</SelectItem>
                            <SelectItem value="community_center">Community Center</SelectItem>
                            <SelectItem value="religious">Religious Organization</SelectItem>
                            <SelectItem value="nonprofit">Non-profit</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recipient-specific fields */}
                {profile?.role === 'recipient' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recipient Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
                      <Textarea
                        id="dietary_restrictions"
                        name="dietary_restrictions"
                        value={formData.dietary_restrictions}
                        onChange={handleChange}
                        className="bg-gray-800 border-gray-700"
                        placeholder="List any allergies or restrictions..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferences">Food Preferences</Label>
                      <Textarea
                        id="preferences"
                        name="preferences"
                        value={formData.preferences}
                        onChange={handleChange}
                        className="bg-gray-800 border-gray-700"
                        placeholder="Any food preferences..."
                      />
                    </div>
                  </div>
                )}

                {/* Volunteer-specific fields */}
                {profile?.role === 'volunteer' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Volunteer Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability</Label>
                      <Input
                        id="availability"
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                        className="bg-gray-800 border-gray-700"
                        placeholder="e.g., Weekends, Weekday evenings"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills</Label>
                      <Textarea
                        id="skills"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        className="bg-gray-800 border-gray-700"
                        placeholder="List any relevant skills or experience..."
                      />
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
            <CardFooter className="flex gap-4 justify-between pt-6">
              <Button
                variant="outline"
                type="button"
                onClick={handleSkip}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Skip for Now
              </Button>
              <Button
                type="submit"
                form="profileForm"
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 flex-1"
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Complete Profile
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
      <div className="text-center pb-6 text-gray-500 text-sm">
        You can always update your profile information later
      </div>
    </div>
  )
} 