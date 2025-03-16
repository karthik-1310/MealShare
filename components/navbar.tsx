'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/components/auth-provider'
import { LogOut, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const { user } = useAuth()
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Reset isSigningOut if user is logged in (fixes animation appearing after login)
  useEffect(() => {
    if (user) {
      setIsSigningOut(false)
    }
  }, [user])

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      
      // Show sign-out loading state with fade-out effect
      const fadeOutElement = document.body
      fadeOutElement.style.transition = 'opacity 0.8s ease'
      fadeOutElement.style.opacity = '0.5'
      
      // Display toast that will be visible during fade-out
      toast({
        title: "Signing Out...",
        description: "Thanks for using MealShare!",
      })
      
      // Wait for animation before actually signing out
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Perform the sign-out
      await supabase.auth.signOut()
      
      // Show a toast message that appears on the next page
      toast({
        title: "Success!",
        description: "You have been signed out successfully.",
      })
      
      // Reset opacity before redirect
      fadeOutElement.style.opacity = '1'
      
      // Refresh the page
      router.refresh()
    } catch (error) {
      // Reset opacity in case of error
      document.body.style.opacity = '1'
      setIsSigningOut(false)
      
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center group">
              <Heart className="text-blue-500 mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xl text-white">MealShare</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="#how-it-works"
                className="text-sm md:text-base text-gray-300 hover:text-white transition-colors hover:underline underline-offset-4"
              >
                How It Works
              </Link>
              <Link
                href="#listings"
                className="text-sm md:text-base text-gray-300 hover:text-white transition-colors hover:underline underline-offset-4"
              >
                Listings
              </Link>
              <Link
                href="#about"
                className="text-sm md:text-base text-gray-300 hover:text-white transition-colors hover:underline underline-offset-4"
              >
                About
              </Link>
              <Link
                href="#contact"
                className="text-sm md:text-base text-gray-300 hover:text-white transition-colors hover:underline underline-offset-4"
              >
                Contact
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {!isSigningOut ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300">{user.email}</span>
                      <Avatar className="h-8 w-8 ring-2 ring-blue-500">
                        <AvatarImage 
                          src={user.user_metadata?.avatar_url || user.user_metadata?.picture} 
                          alt={user.email || 'User avatar'} 
                        />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="text-gray-300 hover:text-white flex items-center gap-2 px-4 py-2"
                    >
                      <span>Sign out</span>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-300">Signing out...</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-white text-black hover:bg-gray-200 rounded-full text-sm px-4 py-2 font-medium">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 