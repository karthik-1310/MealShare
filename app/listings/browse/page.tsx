'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'
import { Search, MapPin, Calendar, Filter } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import components with client-side animations
const MotionDiv = dynamic(() => 
  import('framer-motion').then((mod) => mod.motion.div), 
  { ssr: false }
);

// Dummy data for food listings
const DUMMY_LISTINGS = [
  {
    id: '1',
    title: 'Fresh Bread and Pastries',
    description: 'Assorted breads and pastries from our bakery. Still fresh but won\'t be sold tomorrow.',
    food_type: 'bakery',
    quantity: '15 loaves, 25 pastries',
    expiration_date: '2023-06-15',
    location: 'Downtown Bakery, 123 Main St',
    provider: 'Downtown Bakery',
    created_at: '2023-06-14T10:30:00Z'
  },
  {
    id: '2',
    title: 'Organic Vegetables',
    description: 'Slightly bruised but perfectly good organic vegetables from our farm stand.',
    food_type: 'vegetables',
    quantity: '10 kg assorted',
    expiration_date: '2023-06-16',
    location: 'Green Farms Market, 456 Market St',
    provider: 'Green Farms',
    created_at: '2023-06-14T09:15:00Z'
  },
  {
    id: '3',
    title: 'Canned Goods',
    description: 'Assorted canned vegetables, fruits, and beans. All unexpired.',
    food_type: 'canned',
    quantity: '30 cans',
    expiration_date: '2023-12-15',
    location: 'Community Pantry, 789 Church St',
    provider: 'Community Pantry',
    created_at: '2023-06-13T14:45:00Z'
  },
]

export default function BrowseListings() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [foodType, setFoodType] = useState('all')
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Filter listings based on search term and food type
  const filteredListings = DUMMY_LISTINGS.filter(listing => {
    const matchesSearch = searchTerm === '' || 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      listing.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = foodType === 'all' || foodType === '' || listing.food_type === foodType
    
    return matchesSearch && matchesType
  })
  
  // Helper function to format dates in a consistent way
  const formatDate = (dateString: string) => {
    if (!isClient) return 'Loading...'; // Return a placeholder during SSR
    
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }
  
  // Handle request/claim of food listing
  const handleRequestFood = (listingId: string) => {
    toast({
      title: "Request Sent",
      description: "Your request for this food has been sent to the provider.",
    })
  }
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[120%] h-[120%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/30 blur-3xl opacity-50" />
      </div>

      <div className="flex-1 p-6 relative">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Available Food Listings
            </h1>
            <p className="text-gray-400 mt-2">
              Browse available food donations in your area
            </p>
          </div>
          
          {/* Search and filter */}
          <Card className="bg-gray-900/70 border-gray-800 mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search listings..."
                    className="bg-gray-800 border-gray-700 pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-[200px]">
                  <Select value={foodType} onValueChange={setFoodType}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Food type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="cooked">Cooked Meals</SelectItem>
                      <SelectItem value="fruits">Fruits</SelectItem>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="bakery">Bakery</SelectItem>
                      <SelectItem value="canned">Canned Goods</SelectItem>
                      <SelectItem value="dairy">Dairy</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>More Filters</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Role-specific action card */}
          {(profile?.role === 'prov' || profile?.role === 'provider') && (
            <Card className="bg-gray-900/70 border-gray-800 mb-8">
              <CardHeader>
                <CardTitle>Provider Actions</CardTitle>
                <CardDescription>
                  Create and manage your food listings
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => router.push('/listings/create')}
                >
                  Create New Listing
                </Button>
                <Button variant="outline">
                  Manage My Listings
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Listings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.length > 0 ? (
              filteredListings.map((listing) => (
                <MotionDiv
                  key={listing.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gray-900/70 border-gray-800 h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <Badge className="bg-purple-600 mb-2 self-start">
                          {listing.food_type.charAt(0).toUpperCase() + listing.food_type.slice(1)}
                        </Badge>
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                          New
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{listing.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {listing.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2 flex-1">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                          <span>{listing.location}</span>
                        </div>
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                          <span>Expires: {formatDate(listing.expiration_date)}</span>
                        </div>
                        <p className="text-gray-400 mt-2">
                          <strong>Quantity:</strong> {listing.quantity}
                        </p>
                        <p className="text-gray-400">
                          <strong>Provider:</strong> {listing.provider}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={() => handleRequestFood(listing.id)}
                      >
                        Request Food
                      </Button>
                    </CardFooter>
                  </Card>
                </MotionDiv>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400 text-lg">No listings found matching your criteria.</p>
                <Button 
                  variant="link" 
                  className="text-purple-400 mt-2"
                  onClick={() => {
                    setSearchTerm('')
                    setFoodType('all')
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </MotionDiv>
      </div>
    </div>
  )
} 