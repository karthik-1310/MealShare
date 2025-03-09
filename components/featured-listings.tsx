"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import FoodListingCard from "./food-listing-card"
import ListingsCarousel from "./listings-carousel"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

// Sample data for listings
const allListings = [
  {
    title: "Wedding Catering Leftovers",
    description: "High-quality catering food from a wedding event. Includes appetizers, main courses, and desserts.",
    location: "Downtown Community Center",
    price: 25,
    bids: 3,
    timeLeft: "2 hours",
    sourceType: "wedding" as const,
  },
  {
    title: "Restaurant Daily Surplus",
    description: "Fresh food from our daily menu. Variety of dishes including vegetarian options.",
    location: "Green Plate Restaurant",
    price: 15,
    bids: 7,
    timeLeft: "5 hours",
    sourceType: "restaurant" as const,
  },
  {
    title: "Corporate Event Extras",
    description: "Boxed lunches and snacks from a corporate meeting. All individually packaged.",
    location: "Business District Hub",
    price: 10,
    bids: 2,
    timeLeft: "1 hour",
    sourceType: "corporate" as const,
  },
  {
    title: "Birthday Party Leftovers",
    description: "Variety of homemade dishes and desserts from a birthday celebration. All freshly made today.",
    location: "Riverside Community Hall",
    price: 12,
    bids: 4,
    timeLeft: "3 hours",
    sourceType: "birthday" as const,
  },
  {
    title: "Home Cooking Surplus",
    description: "Homemade lasagna and salad, enough for 4-6 people. Made with organic ingredients.",
    location: "Oakwood Neighborhood",
    price: 8,
    bids: 1,
    timeLeft: "4 hours",
    sourceType: "home" as const,
  },
  {
    title: "Italian Restaurant Extras",
    description: "Authentic Italian pasta dishes and bread from our evening service. Enough for 8-10 people.",
    location: "Bella Italia Restaurant",
    price: 20,
    bids: 5,
    timeLeft: "2 hours",
    sourceType: "restaurant" as const,
  },
  // Additional listings for expanded view
  {
    title: "School Event Leftovers",
    description: "Sandwiches, fruits, and snacks from a school fundraiser. All packaged and ready to go.",
    location: "Lincoln Elementary School",
    price: 15,
    bids: 2,
    timeLeft: "3 hours",
    sourceType: "corporate" as const,
  },
  {
    title: "Bakery End-of-Day Items",
    description: "Assorted breads, pastries, and desserts from our bakery. All made fresh today.",
    location: "Sweet Delights Bakery",
    price: 18,
    bids: 6,
    timeLeft: "1 hour",
    sourceType: "restaurant" as const,
  },
  {
    title: "Graduation Party Extras",
    description: "Catered food from a graduation celebration. Includes sandwiches, salads, and desserts.",
    location: "University Commons",
    price: 22,
    bids: 3,
    timeLeft: "4 hours",
    sourceType: "wedding" as const,
  },
  {
    title: "Family Dinner Surplus",
    description: "Homemade chili and cornbread, enough for 6-8 people. Made with love and care.",
    location: "Maple Street Area",
    price: 10,
    bids: 2,
    timeLeft: "2 hours",
    sourceType: "home" as const,
  },
  {
    title: "Cafe Daily Specials",
    description: "Assorted sandwiches, soups, and salads from our daily menu. Perfect for lunch or dinner.",
    location: "Corner Cafe",
    price: 12,
    bids: 4,
    timeLeft: "3 hours",
    sourceType: "restaurant" as const,
  },
  {
    title: "Anniversary Party Food",
    description: "Elegant appetizers and desserts from a 25th anniversary celebration. High-quality catering.",
    location: "Grand Ballroom",
    price: 30,
    bids: 5,
    timeLeft: "2 hours",
    sourceType: "wedding" as const,
  },
]

export default function FeaturedListings() {
  const [expanded, setExpanded] = useState(false)
  const [filterType, setFilterType] = useState("all")
  const [sortOption, setSortOption] = useState("newest")
  const [activeBidId, setActiveBidId] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  // Filter and sort listings
  const filteredListings = allListings.filter((listing) => filterType === "all" || listing.sourceType === filterType)

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "ending-soon":
        return Number.parseInt(a.timeLeft) - Number.parseInt(b.timeLeft)
      default: // newest
        return 0
    }
  })

  const handleBidStart = (id: string) => {
    setActiveBidId(id)
    setIsPaused(true)
  }

  const handleBidEnd = () => {
    setActiveBidId(null)
    setIsPaused(false)
  }

  const renderFoodListingCard = (listing: typeof allListings[0], index: number) => (
    <FoodListingCard 
      {...listing}
      id={index.toString()}
      activeBidId={activeBidId}
      onBidStart={handleBidStart}
      onBidEnd={handleBidEnd}
    />
  )

  return (
    <Card className="bg-gray-900/50 border-gray-800 col-span-full w-full fade-in">
      <CardHeader className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
        activeBidId && "opacity-50"
      )}>
        <div>
          <CardTitle className="text-2xl">Featured Listings</CardTitle>
          <CardDescription className="text-gray-400">Available food donations near you</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="bg-gray-800 border-gray-700 rounded-md text-sm px-3 py-1.5"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            disabled={activeBidId !== null}
          >
            <option value="all">All Types</option>
            <option value="restaurant">Restaurant</option>
            <option value="wedding">Wedding</option>
            <option value="corporate">Corporate</option>
            <option value="birthday">Birthday</option>
            <option value="home">Home</option>
          </select>
          <select
            className="bg-gray-800 border-gray-700 rounded-md text-sm px-3 py-1.5"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            disabled={activeBidId !== null}
          >
            <option value="newest">Sort by: Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="ending-soon">Ending Soon</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="pb-8">
        <AnimatePresence mode="wait">
          {!expanded ? (
            <motion.div
              key="carousel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full overflow-hidden"
            >
              <ListingsCarousel speed={isPaused ? 0 : 60} className="py-4">
                <div className="flex gap-4">
                  {sortedListings.slice(0, 8).map((listing, index) => (
                    <div key={index} className="w-[280px] shrink-0">
                      {renderFoodListingCard(listing, index)}
                    </div>
                  ))}
                </div>
              </ListingsCarousel>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div className={cn(
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800",
                activeBidId && "overflow-hidden"
              )}>
                {sortedListings.map((listing, index) => (
                  <div key={index}>
                    {renderFoodListingCard(listing, index)}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter className={cn(
        "border-t border-gray-800 pt-4",
        activeBidId && "opacity-50"
      )}>
        <Button
          variant="outline"
          className="w-full hover:bg-blue-600 hover:text-white transition-colors"
          onClick={() => setExpanded(!expanded)}
          disabled={activeBidId !== null}
        >
          {expanded ? "Show Less" : "View All Listings"}
        </Button>
      </CardFooter>
    </Card>
  )
}

