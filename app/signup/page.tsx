"use client"

import Link from "next/link"
import { ArrowLeft, Loader2, Mail, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { useToast } from "@/components/ui/use-toast"

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showExistingAccountDialog, setShowExistingAccountDialog] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [signupComplete, setSignupComplete] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()
  const { toast } = useToast()

  // Redirect if already logged in
  if (user) {
    router.push('/')
    return null
  }

  const updateLoadingText = async (text: string, delay: number) => {
    setLoadingText(text)
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset state
    setLoading(true);
    setError(null);
    setSignupComplete(false);
    
    try {
      // Form validation
      if (!email || !password || !confirmPassword) {
        throw new Error('Please fill in all required fields.');
      }
      
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }
      
      // First, check if user already exists using signInWithPassword
      console.log("✅ Checking if account already exists...");
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (!signInError) {
        // User exists and credentials are correct, redirect to home
        console.log("✅ Account exists and credentials are correct, redirecting...");
        setSignupComplete(true);
        setShowVerificationDialog(false);
        router.push('/');
        return;
      }
      
      // If error is not "Invalid login credentials", it's another error
      if (signInError && !signInError.message.includes("Invalid login credentials")) {
        console.log("❌ Error checking account:", signInError.message);
        throw signInError;
      }
      
      // Check if user exists but password is wrong - we'll use admin API indirectly
      console.log("✅ Creating new account...");
      
      // Set up signup parameters
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback?next=/`;
      
      // Attempt to sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Redirect to our callback handler that will ensure the user is logged in
          emailRedirectTo: redirectTo,
          data: {
            // Store the user's name in metadata
            full_name: name || '',
            email_confirm: true
          },
        },
      });
      
      if (error) throw error;
      
      const isUserConfirmed = data?.user?.identities?.length === 0;
      const isEmailVerified = isUserConfirmed || data?.user?.email_confirmed_at;
      
      // If user already exists or needs confirmation
      if (data && (isUserConfirmed || isEmailVerified)) {
        console.log("✅ User already confirmed, attempting direct sign in...");
        // Handle case where user confirmed but needs sign in
        try {
          await supabase.auth.signInWithPassword({
            email,
            password,
          });
          router.push('/');
        } catch (e) {
          console.error("Error signing in confirmed user:", e);
          setShowVerificationDialog(true);
        }
      } else {
        // New user - show verification dialog
        console.log("✅ Account created! Email verification required.");
        setShowVerificationDialog(true);
      }
      
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setSignupComplete(true);
      
    } catch (error) {
      console.error("❌ Signup error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      
      // Check if error indicates existing account
      const errorMessage = error instanceof Error ? error.message : "";
      if (errorMessage.includes("already exists") || errorMessage.includes("already registered")) {
        setShowExistingAccountDialog(true);
      } else {
        // Show error toast for other errors
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      // No error handling here as the page will redirect
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle phone OTP signup
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phoneNumber || phoneNumber.trim() === '') {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number",
        variant: "destructive",
      })
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await updateLoadingText('Sending verification code...', 800)
      
      const formattedPhone = formatPhoneNumber(phoneNumber)
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      })
      
      if (error) throw error
      
      await updateLoadingText('Code sent successfully!', 800)
      
      // Show OTP input field
      setShowOtpInput(true)
      
      toast({
        title: "Verification Code Sent",
        description: "Check your phone for the verification code",
      })
      
      // Optionally navigate to a dedicated verification page
      // Uncomment the next line to navigate to verification page instead of showing inline OTP input
      // router.push('/signup/verify?type=phone')
    } catch (error) {
      console.error("Error sending OTP:", error)
      setError(error instanceof Error ? error.message : 'Failed to send verification code')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to send verification code',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setLoadingText('')
    }
  }
  
  // Handle OTP verification for signup
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otpCode || otpCode.trim() === '') {
      toast({
        title: "Verification Code Required",
        description: "Please enter the verification code",
        variant: "destructive",
      })
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await updateLoadingText('Verifying code...', 800)
      
      const formattedPhone = formatPhoneNumber(phoneNumber)
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otpCode,
        type: 'sms',
      })
      
      if (error) throw error
      
      await updateLoadingText('Success! Redirecting...', 800)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error("Error verifying OTP:", error)
      setError(error instanceof Error ? error.message : 'Failed to verify code')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to verify code',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setLoadingText('')
    }
  }
  
  // Format phone number to E.164 format
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '')
    
    // If number doesn't start with +, add it
    if (!phone.startsWith('+')) {
      // If number doesn't have country code (assuming US +1 as default)
      if (cleaned.length === 10) {
        cleaned = `+1${cleaned}`
      } else {
        cleaned = `+${cleaned}`
      }
    } else {
      cleaned = `+${cleaned}`
    }
    
    return cleaned
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-black text-white flex flex-col"
    >
      {/* Background gradient effect - Different color for signup */}
      <motion.div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div 
          className="absolute w-[120%] h-[120%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/30 blur-3xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        />
      </motion.div>

      {/* Back button */}
      <motion.div 
        className="p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Link href="/" className="inline-flex items-center text-gray-300 hover:text-white transition-colors duration-200">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-full max-w-md relative"
        >
          <motion.div
            className="absolute -inset-1 bg-purple-500/50 rounded-2xl blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          />
          <Card className="bg-gray-900/70 border-gray-800 relative overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
            <CardHeader className="text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4"
                >
                  <Mail className="h-8 w-8 text-purple-500" />
                </motion.div>
                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                  Create Account
                </CardTitle>
                <CardDescription>Join MealShare to make a difference</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger 
                      value="email"
                      className="data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-200"
                    >
                      Email/Password
                    </TabsTrigger>
                    <TabsTrigger 
                      value="phone"
                      className="data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-200"
                    >
                      Phone Number
                    </TabsTrigger>
                </TabsList>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={showOtpInput ? 'otp' : 'initial'}
                      initial={{ opacity: 0, x: showOtpInput ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: showOtpInput ? -20 : 20 }}
                      transition={{ duration: 0.2 }}
                    >
                <TabsContent value="email">
                        <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                            <Input 
                              type="email" 
                              placeholder="Email" 
                              className="bg-gray-800 border-gray-700"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                      </div>
                      <div className="space-y-2">
                            <Input 
                              type="password" 
                              placeholder="Password" 
                              className="bg-gray-800 border-gray-700"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                            />
                    </div>
                    <div className="space-y-2">
                            <Input 
                              type="password" 
                              placeholder="Confirm Password" 
                              className="bg-gray-800 border-gray-700"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                            />
                    </div>
                    <div className="space-y-2">
                            <Input 
                              type="text" 
                              placeholder="Name" 
                              className="bg-gray-800 border-gray-700"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                            />
                    </div>
                          {error && (
                            <div className="text-sm text-red-500">
                              {error}
                    </div>
                          )}
                          <Button 
                            type="submit" 
                            className="w-full bg-purple-600 hover:bg-purple-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                            disabled={loading}
                          >
                            Create Account
                          </Button>
                        </form>
                </TabsContent>

                <TabsContent value="phone">
                        {!showOtpInput ? (
                          <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                            <div className="space-y-2">
                              <Input 
                                type="tel" 
                                placeholder="Phone Number (e.g. +1234567890)" 
                                className="bg-gray-800 border-gray-700"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                              />
                              <p className="text-gray-400 text-xs">Format: +[country code][number], e.g., +12025550123</p>
                            </div>
                            {error && (
                              <div className="text-sm text-red-500">
                                {error}
                              </div>
                            )}
                            <Button 
                              type="submit" 
                              className="w-full bg-purple-600 hover:bg-purple-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                              disabled={loading}
                            >
                              Send Verification Code
                            </Button>
                          </form>
                        ) : (
                          <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                              <div className="rounded-md bg-gray-800/50 p-3 border border-gray-700">
                                <p className="text-sm text-gray-300 mb-1">Verification code sent to:</p>
                                <p className="text-purple-400 font-medium">{formatPhoneNumber(phoneNumber)}</p>
                              </div>
                    </div>
                    <div className="space-y-2">
                              <Input 
                                type="text" 
                                placeholder="Enter verification code" 
                                className="bg-gray-800 border-gray-700 text-center text-lg tracking-wider"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                required
                                maxLength={6}
                              />
                            </div>
                            {error && (
                              <div className="text-sm text-red-500">
                                {error}
                    </div>
                            )}
                            <Button 
                              type="submit" 
                              className="w-full bg-purple-600 hover:bg-purple-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                              disabled={loading}
                            >
                              Verify & Create Account
                            </Button>
                            <div className="flex justify-between items-center pt-2">
                              <Button 
                                type="button" 
                                variant="link" 
                                className="text-sm text-gray-400 hover:text-gray-300 px-0"
                                onClick={() => setShowOtpInput(false)}
                              >
                                Change Phone Number
                              </Button>
                              <Button 
                                type="button" 
                                variant="link" 
                                className="text-sm text-purple-400 hover:text-purple-300 px-0"
                                onClick={handleSendPhoneOtp}
                                disabled={loading}
                              >
                                Resend Code
                              </Button>
                  </div>
                          </form>
                        )}
                </TabsContent>
                    </motion.div>
                  </AnimatePresence>
              </Tabs>

                {/* Divider with animation */}
                <motion.div 
                  className="relative my-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
                </div>
                </motion.div>

                {/* Social login buttons with hover animation */}
                <motion.div 
                  className="grid grid-cols-1 gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  <Button 
                    variant="outline" 
                    className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    onClick={handleGoogleSignIn}
                  >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Continue with Google
                </Button>
                </motion.div>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center space-y-2">
                <motion.div 
                  className="text-center text-sm text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.3 }}
                >
                Already have an account?{" "}
                  <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors duration-200">
                    Log in
                </Link>
                </motion.div>
            </CardFooter>
            </motion.div>
          </Card>
        </motion.div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-xl max-w-sm w-full mx-4"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                  </div>
                </div>
                
                <motion.div
                  key={loadingText}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  <p className="text-lg text-gray-300 font-medium">{loadingText}</p>
                  <p className="text-sm text-gray-500 mt-1">Please wait...</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Account Dialog */}
      <AlertDialog open={showExistingAccountDialog} onOpenChange={setShowExistingAccountDialog}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
            <AlertDialogTitle className="text-white text-xl text-center">
              Account Already Exists
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 text-center">
              An account with <span className="text-purple-400">{email}</span> already exists.<br />
              Would you like to sign in instead?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-col gap-2">
            <AlertDialogAction
              onClick={() => router.push('/login')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Go to Login
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => setShowExistingAccountDialog(false)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              Try Different Email
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verification Dialog */}
      <AlertDialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-purple-500" />
            </div>
            <AlertDialogTitle className="text-white text-xl text-center">
              Check Your Email
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 text-center">
              We've sent a verification link to <span className="text-purple-400">{email}</span>.<br />
              Click the link in your email to complete your registration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-col gap-2">
            <AlertDialogAction
              onClick={() => window.open('https://mail.google.com', '_blank')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Open Gmail
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => setShowVerificationDialog(false)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              I'll check later
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}


