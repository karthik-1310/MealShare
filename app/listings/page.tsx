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
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, MapPin, Clock, Calendar, Filter, List } from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'

export default function FoodListings() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('available')
  const { toast } = useToast()

  // Redirect if not authenticated or profile not completed
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    if (!profile) {
      router.push('/select-role')
      return
    }
    
    if (profile && !profile.profile_completed) {
      router.push('/complete-profile')
      return
    }
  }, [user, profile, router])

  // If no user or profile, show loading
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Loading listings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[120%] h-[120%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/20 blur-3xl opacity-40" />
      </div>

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              MealShare
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold mb-6">Food Listings</h1>
          
          {/* Role-specific actions */}
          <RoleSpecificActions role={profile.role} />

          {/* Listings tabs */}
          <div className="mt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="available">Available Now</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="my-listings">My Listings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="available">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Placeholder for available listings */}
                  <EmptyListingState message="No available food listings found" />
                </div>
              </TabsContent>
              
              <TabsContent value="upcoming">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Placeholder for upcoming listings */}
                  <EmptyListingState message="No upcoming food listings found" />
                </div>
              </TabsContent>
              
              <TabsContent value="my-listings">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Placeholder for my listings */}
                  <EmptyListingState message="You haven't created any listings yet" />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

// Role-specific action buttons
function RoleSpecificActions({ role }: { role: string | null }) {
  const router = useRouter()
  
  if (role === 'prov') {
    return (
      <Card className="bg-gray-900/70 border-gray-800">
        <CardHeader>
          <CardTitle>Provider Actions</CardTitle>
          <CardDescription>
            Share your excess food with those in need
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => router.push('/create-listing')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
          <Button variant="outline">
            <List className="h-4 w-4 mr-2" />
            My Listings
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  if (role === 'recip') {
    return (
      <Card className="bg-gray-900/70 border-gray-800">
        <CardHeader>
          <CardTitle>Recipient Actions</CardTitle>
          <CardDescription>
            Find available food in your area
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Search className="h-4 w-4 mr-2" />
            Find Food
          </Button>
          <Button variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            My Requests
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  if (role === 'vol') {
    return (
      <Card className="bg-gray-900/70 border-gray-800">
        <CardHeader>
          <CardTitle>Volunteer Opportunities</CardTitle>
          <CardDescription>
            Find ways to help distribute food
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Search className="h-4 w-4 mr-2" />
            Find Opportunities
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            View Schedule
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  // Default for individuals or other roles
  return (
    <Card className="bg-gray-900/70 border-gray-800">
      <CardHeader>
        <CardTitle>Food Sharing Options</CardTitle>
        <CardDescription>
          Choose how you want to participate today
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Donate Food
        </Button>
        <Button variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Find Food
        </Button>
      </CardContent>
    </Card>
  )
}

// Empty state for listings
function EmptyListingState({ message }: { message: string }) {
  return (
    <div className="col-span-full">
      <Card className="bg-gray-900/40 border-gray-800 text-center py-12">
        <CardContent>
          <div className="mx-auto rounded-full bg-gray-800 w-16 h-16 flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">No Listings Found</h3>
          <p className="text-gray-400">{message}</p>
        </CardContent>
      </Card>
    </div>
  )
} 