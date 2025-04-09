'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Calendar, Clock } from 'lucide-react'

export default function CreateListing() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    food_type: '',
    quantity: '',
    expiration_date: '',
    pickup_instructions: '',
    location: '',
    contact_info: '',
    dietary_info: ''
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
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !profile) {
      toast({
        title: "Error",
        description: "You must be logged in as a provider to create listings.",
        variant: "destructive"
      })
      return
    }
    
    // Check for both formats of provider role
    if (profile.role !== 'prov' && profile.role !== 'provider') {
      toast({
        title: "Access Denied",
        description: "Only providers can create food listings.",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      // Create the listing through our API
      const response = await fetch('/api/listings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          provider_id: user.id,
          provider_name: profile.full_name || user.email,
          created_at: new Date().toISOString(),
          status: 'available'
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create listing')
      }
      
      toast({
        title: "Listing Created",
        description: "Your food listing has been successfully created.",
      })
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        food_type: '',
        quantity: '',
        expiration_date: '',
        pickup_instructions: '',
        location: '',
        contact_info: '',
        dietary_info: ''
      })
      
      // Redirect to provider dashboard or listings page
      router.push('/listings/browse')
    } catch (error: any) {
      console.error('Error creating listing:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create listing. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
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
                Create Food Listing
              </CardTitle>
              <CardDescription>
                Share your available food with those in need
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="listingForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="bg-gray-800 border-gray-700"
                      placeholder="e.g., Fresh Bread from Local Bakery"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="bg-gray-800 border-gray-700 min-h-[100px]"
                      placeholder="Describe the food you're offering..."
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="food_type">Food Type</Label>
                      <Select
                        value={formData.food_type}
                        onValueChange={(value) => handleSelectChange('food_type', value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Select food type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cooked">Cooked Meal</SelectItem>
                          <SelectItem value="fruits">Fruits</SelectItem>
                          <SelectItem value="vegetables">Vegetables</SelectItem>
                          <SelectItem value="bakery">Bakery Items</SelectItem>
                          <SelectItem value="canned">Canned Goods</SelectItem>
                          <SelectItem value="dairy">Dairy</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        className="bg-gray-800 border-gray-700"
                        placeholder="e.g., 5 loaves, 2 kg, serves 10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiration_date">Expiration Date</Label>
                    <div className="relative">
                      <Input
                        id="expiration_date"
                        name="expiration_date"
                        type="date"
                        value={formData.expiration_date}
                        onChange={handleChange}
                        className="bg-gray-800 border-gray-700"
                        required
                      />
                      <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pickup_instructions">Pickup Instructions</Label>
                    <Textarea
                      id="pickup_instructions"
                      name="pickup_instructions"
                      value={formData.pickup_instructions}
                      onChange={handleChange}
                      className="bg-gray-800 border-gray-700"
                      placeholder="When and how can the food be picked up?"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="bg-gray-800 border-gray-700"
                      placeholder="Address or pickup location"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact_info">Contact Information</Label>
                    <Input
                      id="contact_info"
                      name="contact_info"
                      value={formData.contact_info}
                      onChange={handleChange}
                      className="bg-gray-800 border-gray-700"
                      placeholder="How should recipients contact you?"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dietary_info">Dietary Information</Label>
                    <Textarea
                      id="dietary_info"
                      name="dietary_info"
                      value={formData.dietary_info}
                      onChange={handleChange}
                      className="bg-gray-800 border-gray-700"
                      placeholder="Any allergens, vegan, halal, etc."
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex gap-4 justify-between pt-6">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="listingForm"
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Listing"
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 