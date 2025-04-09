"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, MapPin, Clock, Info, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'

// Mock food listings data
const mockListings = [
  { 
    id: 1, 
    title: 'Fresh Produce from Local Farm', 
    provider: 'Green Acres Farm',
    description: 'Assorted fresh vegetables including carrots, lettuce, and tomatoes. Harvested yesterday.',
    distance: '0.8 miles',
    items: ['Carrots', 'Lettuce', 'Tomatoes', 'Cucumbers'],
    pickup_window: 'Today, 2PM - 6PM',
    pickup_address: '123 Farm Road',
    tags: ['organic', 'vegetables', 'fresh'],
    img: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=600&auto=format&fit=crop'
  },
  { 
    id: 2, 
    title: 'Bread and Bakery Items', 
    provider: 'Sunshine Bakery',
    description: 'Assorted breads and pastries from today\'s bake. Perfect condition, just excess from our shop.',
    distance: '1.2 miles',
    items: ['Sourdough Bread', 'Bagels', 'Croissants', 'Muffins'],
    pickup_window: 'Today, 5PM - 7PM',
    pickup_address: '456 Main Street',
    tags: ['bakery', 'bread', 'pastries'],
    img: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?q=80&w=600&auto=format&fit=crop'
  },
  { 
    id: 3, 
    title: 'Canned Food Assortment', 
    provider: 'Community Pantry',
    description: 'Various canned foods including beans, soups, and vegetables. All unexpired and in good condition.',
    distance: '2.5 miles',
    items: ['Canned Beans', 'Soup', 'Canned Vegetables', 'Tuna'],
    pickup_window: 'Tomorrow, 10AM - 4PM',
    pickup_address: '789 Community Ave',
    tags: ['canned', 'non-perishable', 'pantry'],
    img: 'https://images.unsplash.com/photo-1584263074798-6d48bac63b71?q=80&w=600&auto=format&fit=crop'
  },
  { 
    id: 4, 
    title: 'Dairy Products', 
    provider: 'Local Grocery',
    description: 'Assorted dairy products including milk, cheese, and yogurt. All within expiration date.',
    distance: '1.8 miles',
    items: ['Milk', 'Cheese', 'Yogurt', 'Butter'],
    pickup_window: 'Today, 3PM - 7PM',
    pickup_address: '101 Market Street',
    tags: ['dairy', 'refrigerated', 'perishable'],
    img: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=600&auto=format&fit=crop'
  }
]

export default function AvailableFoodPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [listings, setListings] = useState(mockListings)
  const [activeTab, setActiveTab] = useState('all')

  // Filter listings based on search query and active tab
  const filteredListings = listings.filter(listing => {
    // Search filter
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    // Tab filter
    if (activeTab === 'all') return matchesSearch
    return matchesSearch && listing.tags.includes(activeTab)
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Available Food</h1>
        
        <Button 
          variant="outline"
          onClick={() => router.push('/dashboard/available/map')}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Map View
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search available food..." 
            className="pl-8 bg-gray-800 border-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="fresh">Fresh</TabsTrigger>
          <TabsTrigger value="bakery">Bakery</TabsTrigger>
          <TabsTrigger value="non-perishable">Non-perishable</TabsTrigger>
          <TabsTrigger value="dairy">Dairy</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredListings.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-900/70 rounded-lg border border-gray-800">
            <Info className="h-8 w-8 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-400">No food listings match your search</p>
            <Button variant="ghost" className="mt-4" onClick={() => { setSearchQuery(''); setActiveTab('all'); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          filteredListings.map(listing => (
            <Card key={listing.id} className="bg-gray-900/70 border-gray-800 overflow-hidden">
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={listing.img} 
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{listing.title}</CardTitle>
                    <CardDescription>{listing.provider}</CardDescription>
                  </div>
                  <Badge className="bg-purple-600 hover:bg-purple-700">
                    {listing.distance}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-300 line-clamp-2">{listing.description}</p>
                
                <div className="flex flex-wrap gap-1">
                  {listing.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-gray-800 text-gray-300">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="bg-gray-800/50 p-3 rounded-md space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{listing.pickup_window}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{listing.pickup_address}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => router.push(`/dashboard/available/${listing.id}`)}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Request Items
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  )
} 