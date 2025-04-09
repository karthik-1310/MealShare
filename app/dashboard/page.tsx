"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, List, Clock, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const { profile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  // Get role-specific dashboard components
  const RoleDashboard = () => {
    switch (profile?.role) {
      case 'prov':
        return <ProviderDashboard router={router} />
      case 'recip':
        return <RecipientDashboard router={router} />
      case 'vol':
        return <VolunteerDashboard router={router} />
      case 'org':
        return <OrganizationDashboard router={router} />
      default:
        return <GenericDashboard router={router} />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-2xl font-bold mb-6">Your Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card className="bg-gray-900/70 border-gray-800">
            <CardHeader>
              <CardTitle>Dashboard Overview</CardTitle>
              <CardDescription>
                Your personalized dashboard as a {profile?.role}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleDashboard />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card className="bg-gray-900/70 border-gray-800">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest interactions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                <p>No recent activity yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card className="bg-gray-900/70 border-gray-800">
            <CardHeader>
              <CardTitle>Your Schedule</CardTitle>
              <CardDescription>
                Upcoming events and commitments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                <p>No scheduled events yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

// Provider Dashboard Component
function ProviderDashboard({ router }: { router: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Available Listings" value="0" />
        <StatsCard title="Distributions" value="0" />
        <StatsCard title="People Helped" value="0" />
      </div>
      
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg">Create a Food Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            className="bg-purple-600 hover:bg-purple-700" 
            onClick={() => router.push('/listings')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Listing
          </Button>
          <p className="mt-4 text-sm text-gray-400">
            Share information about food you have available for donation.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Recipient Dashboard Component
function RecipientDashboard({ router }: { router: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Available Offers" value="0" />
        <StatsCard title="Your Requests" value="0" />
        <StatsCard title="Completed Pickups" value="0" />
      </div>
      
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg">Find Food Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => router.push('/listings')}
          >
            <Search className="h-4 w-4 mr-2" />
            Browse Listings
          </Button>
          <p className="mt-4 text-sm text-gray-400">
            Find food donations available in your area.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Volunteer Dashboard Component
function VolunteerDashboard({ router }: { router: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Volunteer Hours" value="0" />
        <StatsCard title="Deliveries Made" value="0" />
        <StatsCard title="Open Opportunities" value="0" />
      </div>
      
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg">Volunteer Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => router.push('/listings')}
          >
            <Search className="h-4 w-4 mr-2" />
            Find Opportunities
          </Button>
          <p className="mt-4 text-sm text-gray-400">
            Discover ways you can help distribute food in your community.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Organization Dashboard Component
function OrganizationDashboard({ router }: { router: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Active Campaigns" value="0" />
        <StatsCard title="Donations Received" value="0" />
        <StatsCard title="People Served" value="0" />
      </div>
      
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg">Manage Your Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => router.push('/listings')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
          <p className="mt-4 text-sm text-gray-400">
            Start a new food collection or distribution campaign.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Generic Dashboard for any other role
function GenericDashboard({ router }: { router: any }) {
  return (
    <div className="text-center py-6">
      <h3 className="text-lg font-medium mb-2">Welcome to MealShare</h3>
      <p className="text-gray-400 mb-6">
        Your dashboard is being set up. Please check back soon for more features.
      </p>
      <Button 
        className="bg-purple-600 hover:bg-purple-700"
        onClick={() => router.push('/listings')}
      >
        Explore MealShare
      </Button>
    </div>
  )
}

// Stats Card Component
function StatsCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-6">
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-sm text-gray-400 mt-1">{title}</div>
      </CardContent>
    </Card>
  )
} 