"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, MapPin, Cake, Utensils, Building2, Home, PartyPopper, X, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface FoodListingCardProps {
  id: string
  title: string
  description: string
  location: string
  price: number
  bids: number
  timeLeft: string
  sourceType: "restaurant" | "wedding" | "corporate" | "birthday" | "home"
  className?: string
  activeBidId: string | null
  onBidStart: (id: string) => void
  onBidEnd: () => void
}

export default function FoodListingCard({
  id,
  title,
  description,
  location,
  price,
  bids,
  timeLeft,
  sourceType,
  className,
  activeBidId,
  onBidStart,
  onBidEnd,
}: FoodListingCardProps) {
  const [bidAmount, setBidAmount] = useState(price)
  const isActive = activeBidId === id
  const isDisabled = activeBidId !== null && !isActive
  const { toast } = useToast()

  // Get the appropriate icon and color based on source type
  const getSourceDetails = () => {
    switch (sourceType) {
      case "restaurant":
        return { icon: <Utensils className="h-6 w-6" />, color: "from-blue-500/20 to-blue-600/20 text-blue-400" }
      case "wedding":
        return { icon: <PartyPopper className="h-6 w-6" />, color: "from-pink-500/20 to-pink-600/20 text-pink-400" }
      case "corporate":
        return { icon: <Building2 className="h-6 w-6" />, color: "from-purple-500/20 to-purple-600/20 text-purple-400" }
      case "birthday":
        return { icon: <Cake className="h-6 w-6" />, color: "from-orange-500/20 to-orange-600/20 text-orange-400" }
      case "home":
        return { icon: <Home className="h-6 w-6" />, color: "from-green-500/20 to-green-600/20 text-green-400" }
      default:
        return { icon: <Utensils className="h-6 w-6" />, color: "from-blue-500/20 to-blue-600/20 text-blue-400" }
    }
  }

  const { icon, color } = getSourceDetails()

  const handleBidSubmit = () => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-blue-400" />
          <span>Bid Placed Successfully!</span>
        </div>
      ),
      description: (
        <div className="pl-7">Your bid has been sent. We'll notify you when the seller responds.</div>
      ),
      duration: 5000,
    })
    onBidEnd()
  }

  return (
    <Card className={cn(
      "group bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-800/50 overflow-hidden transition-all w-full h-[240px] flex flex-col backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/50 hover:-translate-y-0.5",
      isDisabled && "opacity-50 pointer-events-none saturate-50",
      isActive && "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20",
      className
    )}>
      <CardHeader className="p-3 flex flex-row items-center gap-3 flex-shrink-0">
        <div className={cn(
          "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center transition-transform group-hover:scale-110",
          color
        )}>
          {icon}
        </div>
        <div>
          <CardTitle className="text-base line-clamp-1 group-hover:text-blue-400 transition-colors">{title}</CardTitle>
          <div className="flex items-center text-gray-400 text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>
        <div className={cn(
          "ml-auto text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r transition-colors",
          color
        )}>
          {sourceType}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex-1">
        <p className="text-sm text-gray-300 line-clamp-2 mb-2 group-hover:text-gray-200 transition-colors">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-400 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {timeLeft} left
          </div>
          <div className={cn("text-base font-bold transition-colors", color)}>${price}</div>
        </div>
        <div className={cn(
          "mt-1 px-2 py-0.5 rounded-full inline-block text-xs transition-colors",
          "bg-gradient-to-r",
          color
        )}>{bids} bids</div>
      </CardContent>
      <CardFooter className="p-3 pt-0 mt-auto flex-shrink-0">
        <div className="w-full flex items-center gap-2">
          {!isActive ? (
            <Button 
              size="sm" 
              className={cn(
                "flex-1 h-8 bg-gradient-to-r hover:shadow-lg transition-all",
                color.includes("blue") ? "from-blue-600 to-blue-700 hover:shadow-blue-500/20" :
                color.includes("pink") ? "from-pink-600 to-pink-700 hover:shadow-pink-500/20" :
                color.includes("purple") ? "from-purple-600 to-purple-700 hover:shadow-purple-500/20" :
                color.includes("orange") ? "from-orange-600 to-orange-700 hover:shadow-orange-500/20" :
                "from-green-600 to-green-700 hover:shadow-green-500/20"
              )}
              onClick={() => onBidStart(id)}
              disabled={isDisabled}
            >
              Place Bid
            </Button>
          ) : (
            <>
              <Input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                className="bg-gray-800 border-gray-700 h-8"
                min={price}
                step={1}
              />
              <Button 
                size="sm" 
                className={cn(
                  "h-8 whitespace-nowrap bg-gradient-to-r hover:shadow-lg transition-all",
                  color.includes("blue") ? "from-blue-600 to-blue-700 hover:shadow-blue-500/20" :
                  color.includes("pink") ? "from-pink-600 to-pink-700 hover:shadow-pink-500/20" :
                  color.includes("purple") ? "from-purple-600 to-purple-700 hover:shadow-purple-500/20" :
                  color.includes("orange") ? "from-orange-600 to-orange-700 hover:shadow-orange-500/20" :
                  "from-green-600 to-green-700 hover:shadow-green-500/20"
                )}
                onClick={handleBidSubmit}
              >
                Place ${bidAmount}
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8 shrink-0 hover:shadow-lg hover:shadow-red-500/20 transition-all"
                onClick={() => {
                  setBidAmount(price)
                  onBidEnd()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

