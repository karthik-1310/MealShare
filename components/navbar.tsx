'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth, getRoleDisplayName } from '@/components/auth-provider'
import { LogOut, Heart, LayoutDashboard, User, List, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { user, signOut, currentProfile, refreshProfile } = useAuth()
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Handle scroll events to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Force refresh profile when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      console.log("Route changed, refreshing profile")
      refreshProfile().catch(err => console.error("Failed to refresh profile:", err))
    }
    
    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange)
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [refreshProfile])

  // Reset isSigningOut if user is logged in (fixes animation appearing after login)
  useEffect(() => {
    if (user) {
      setIsSigningOut(false)
    }
  }, [user])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      setIsSigningOut(false)
    }
  }

  // Generate navigation links based on user role and authentication state
  const getNavLinks = () => {
    if (!user) {
      return [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About' },
        { href: '/how-it-works', label: 'How It Works' },
      ]
    }

    // For authenticated users
    const baseLinks = [
      { href: '/dashboard', label: 'Dashboard' },
    ]
    
    // If user has no role yet, add select role and complete profile links
    if (!currentProfile?.role) {
      baseLinks.push(
        { href: '/select-role', label: 'Select Role' },
        { href: '/complete-profile', label: 'Complete Profile' }
      )
      return baseLinks
    }
    
    // User has a role - show role-specific links
    // Add role-specific links
    if (currentProfile?.role === 'prov' || currentProfile?.role === 'provider') {
      baseLinks.push({ href: '/listings/create', label: 'Create Listing' })
    }
    
    baseLinks.push({ href: '/listings/browse', label: 'Browse Listings' })
    
    return baseLinks
  }

  const navLinks = getNavLinks()

  return (
    <>
      <div className="h-16 w-full" /> {/* Spacer */}
      
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className={`
            pointer-events-auto
            transition-all duration-500 ease-in-out
            ${isScrolled 
              ? 'bg-gradient-to-r from-[#050b29]/50 to-[#0a1545]/45 shadow-sm my-3 py-2 px-6 rounded-full backdrop-blur-xl border border-white/10' 
              : 'bg-[#05071b]/40 backdrop-blur-xl py-3 px-6 w-full rounded-none border-b border-white/5'}
          `}
          animate={{
            width: isScrolled ? '85%' : '100%',
            maxWidth: isScrolled ? '1000px' : '100%',
            y: isScrolled ? 0 : 0,
            boxShadow: isScrolled ? '0 8px 20px -5px rgba(5, 11, 41, 0.1), 0 5px 10px -6px rgba(10, 21, 69, 0.05)' : 'none'
          }}
          transition={{ 
            duration: 0.5, 
            ease: [0.25, 0.1, 0.25, 1.0],
            width: { duration: 0.6 }
          }}
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Logo */}
            <motion.div
              animate={{ 
                scale: isScrolled ? 0.95 : 1
              }}
              transition={{ duration: 0.4 }}
            >
              <Link href="/" className="flex items-center gap-2">
                <Heart className="text-blue-200 h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
                  MealShare
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.nav 
              className="hidden md:flex items-center space-x-2"
              animate={{ 
                scale: isScrolled ? 0.95 : 1,
                opacity: 1
              }}
              transition={{ duration: 0.4 }}
            >
              <ul className="flex space-x-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className={`px-3 py-2 text-sm font-medium transition-colors hover:underline underline-offset-4 ${
                        pathname === link.href 
                          ? 'text-white font-semibold' 
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>

            {/* Auth Buttons or User Menu */}
            <motion.div 
              className="flex items-center"
              animate={{ 
                scale: isScrolled ? 0.95 : 1,
                gap: isScrolled ? '0.75rem' : '1rem'
              }}
              transition={{ duration: 0.4 }}
            >
              {!user ? (
                // Login/Signup buttons that animate closer when scrolled
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    className="text-white hover:text-white hover:bg-white/10"
                    onClick={() => router.push('/login')}
                  >
                    Log in
                  </Button>
                  <Button 
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-full shadow-[0_0_15px_rgba(234,179,8,0.6)] transition-all hover:shadow-[0_0_20px_rgba(234,179,8,0.9)]"
                    onClick={() => router.push('/signup')}
                  >
                    Sign Up
                  </Button>
                </div>
              ) : (
                !isSigningOut ? (
                  // User profile section
                  <div className="flex items-center gap-3">
                    {currentProfile?.role && (
                      <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm text-white/90">
                          {currentProfile.email}
                        </span>
                        <div className="flex items-center">
                          <span className="text-sm text-white font-medium capitalize">
                            {currentProfile.is_volunteer 
                              ? 'Volunteer' 
                              : currentProfile.role === 'prov' 
                                ? 'Provider' 
                                : currentProfile.role === 'recip' 
                                  ? 'Recipient' 
                                  : currentProfile.role === 'org' 
                                    ? 'Organization' 
                                    : ''}
                          </span>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-sm text-amber-400 hover:text-amber-300 p-0 h-auto ml-1 font-medium"
                            onClick={() => {
                              refreshProfile().catch(err => console.error("Failed to refresh profile:", err));
                              router.push('/select-role');
                            }}
                          >
                            (Change)
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <Avatar className="h-8 w-8 cursor-pointer transition-all ring-2 ring-blue-700" onClick={() => router.push('/profile')}>
                      <AvatarImage src={user.user_metadata?.avatar_url || user.user_metadata?.picture || "/placeholder-user.png"} />
                      <AvatarFallback className="bg-blue-800 text-white">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <Button 
                      variant="ghost" 
                      className="text-gray-300 hover:text-white hidden md:inline-flex items-center gap-2"
                      onClick={handleSignOut}
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
                )
              )}

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-300"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xl pt-20 md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-8">
              <ul className="space-y-4">
                {navLinks.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link
                      href={link.href}
                      className={`block py-2 px-4 text-lg font-medium rounded-md ${
                        pathname === link.href
                          ? 'text-blue-200'
                          : 'text-gray-300 hover:bg-gray-800/50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
                
                {user && (
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:text-white text-lg font-medium py-2 px-4"
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Sign Out
                    </Button>
                  </motion.li>
                )}
              </ul>

              {user && currentProfile?.role && (
                <div className="mt-8 pt-4 border-t border-gray-800">
                  <p className="text-gray-400">Signed in as:</p>
                  <p className="text-white font-medium">{user.email}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-blue-200">
                      {currentProfile.is_volunteer 
                        ? 'Volunteer' 
                        : currentProfile.role === 'prov' 
                          ? 'Provider' 
                          : currentProfile.role === 'recip' 
                            ? 'Recipient' 
                            : currentProfile.role === 'org' 
                              ? 'Organization' 
                              : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 