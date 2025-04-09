"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InfoIcon, AlertTriangle, CheckCircle } from 'lucide-react'

export default function DebugPage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const [sessionData, setSessionData] = useState<any>(null)
  const [userProfiles, setUserProfiles] = useState<any[]>([])
  const [profilesTable, setProfilesTable] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('session')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    async function fetchDebugData() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get session data
        const { data: { session } } = await supabase.auth.getSession()
        setSessionData(session)
        
        // Get profiles data
        if (session?.user?.id) {
          // Try user_profiles
          const { data: userProfilesData, error: userProfilesError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
          
          if (userProfilesError) {
            console.error('Error fetching user_profiles:', userProfilesError)
          } else {
            setUserProfiles(userProfilesData || [])
          }
          
          // Try profiles
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
          
          if (profilesError) {
            console.error('Error fetching profiles:', profilesError)
          } else {
            setProfilesTable(profilesData || [])
          }
        }
        
      } catch (err: any) {
        console.error('Debug fetch error:', err)
        setError(err.message || 'Failed to fetch debug data')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDebugData()
  }, [supabase])
  
  const refreshDebugData = async () => {
    try {
      setIsLoading(true)
      await refreshProfile()
      // Re-fetch debug data
      const { data: { session } } = await supabase.auth.getSession()
      setSessionData(session)
      
      if (session?.user?.id) {
        // Try user_profiles
        const { data: userProfilesData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
        setUserProfiles(userProfilesData || [])
        
        // Try profiles
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
        setProfilesTable(profilesData || [])
      }
    } catch (err: any) {
      console.error('Refresh error:', err)
      setError(err.message || 'Failed to refresh data')
    } finally {
      setIsLoading(false)
    }
  }
  
  const updateUserRole = async (role: string) => {
    try {
      const res = await fetch('/api/profile/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update role')
      }
      
      await refreshDebugData()
    } catch (err: any) {
      console.error('Role update error:', err)
      setError(err.message || 'Failed to update role')
    }
  }
  
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 pb-10 px-4 flex items-center justify-center">
        <div className="animate-pulse">Loading debug data...</div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 pb-10 px-4">
        <div className="max-w-5xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Not authenticated</AlertTitle>
            <AlertDescription>
              You need to be logged in to access the debug page.
            </AlertDescription>
          </Alert>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Alert className="mb-6 bg-blue-900/30 border-blue-800">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Debug Mode</AlertTitle>
          <AlertDescription>
            This page displays sensitive information about your account and session.
            It's only meant for debugging purposes.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-400">User ID: {user.id}</p>
            <p className="text-sm text-gray-400">Email: {user.email}</p>
          </div>
          <Button onClick={refreshDebugData} disabled={isLoading}>
            Refresh Data
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="session">Session</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="session">
            <Card className="bg-gray-900/70 border-gray-800">
              <CardHeader>
                <CardTitle>Session Information</CardTitle>
                <CardDescription>
                  Details about your current authentication session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-black/60 p-4 rounded-md overflow-auto max-h-[400px]">
                  {JSON.stringify(sessionData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="profile">
            <div className="grid gap-6 grid-cols-1">
              <Card className="bg-gray-900/70 border-gray-800">
                <CardHeader>
                  <CardTitle>user_profiles Table</CardTitle>
                  <CardDescription>
                    Data from the user_profiles table
                    {userProfiles.length === 0 && " (No records found)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userProfiles.length > 0 ? (
                    <pre className="bg-black/60 p-4 rounded-md overflow-auto max-h-[400px]">
                      {JSON.stringify(userProfiles, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      No records found in the user_profiles table for your account.
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900/70 border-gray-800">
                <CardHeader>
                  <CardTitle>profiles Table</CardTitle>
                  <CardDescription>
                    Data from the profiles table
                    {profilesTable.length === 0 && " (No records found)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profilesTable.length > 0 ? (
                    <pre className="bg-black/60 p-4 rounded-md overflow-auto max-h-[400px]">
                      {JSON.stringify(profilesTable, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      No records found in the profiles table for your account.
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900/70 border-gray-800">
                <CardHeader>
                  <CardTitle>Auth Provider State</CardTitle>
                  <CardDescription>
                    Current state from the Auth Provider
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-black/60 p-4 rounded-md overflow-auto max-h-[400px]">
                    {JSON.stringify({ user, profile }, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="tools">
            <Card className="bg-gray-900/70 border-gray-800">
              <CardHeader>
                <CardTitle>Debug Tools</CardTitle>
                <CardDescription>
                  Tools to help troubleshoot issues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Set Role</h3>
                  <p className="text-sm text-gray-400">
                    Update your role in the database to one of the valid values
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => updateUserRole('prov')}
                      className="flex-1"
                    >
                      Set as Provider
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => updateUserRole('recip')}
                      className="flex-1"
                    >
                      Set as Recipient
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => updateUserRole('vol')}
                      className="flex-1"
                    >
                      Set as Volunteer
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => updateUserRole('org')}
                      className="flex-1"
                    >
                      Set as Organization
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Navigation</h3>
                  <p className="text-sm text-gray-400">
                    Quickly navigate to important pages
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/'}
                      className="flex-1"
                    >
                      Home
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/select-role'}
                      className="flex-1"
                    >
                      Select Role
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/complete-profile'}
                      className="flex-1"
                    >
                      Complete Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/dashboard'}
                      className="flex-1"
                    >
                      Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 