"use client"

import Link from "next/link"
import { ArrowLeft, Loader2, AlertTriangle, RefreshCw, Mail, Clock, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Create a more attention-grabbing verification success dialog component
const VerificationSuccessDialog = ({ email, open, onOpenChange }: { 
  email: string, 
  open: boolean, 
  onOpenChange: (open: boolean) => void 
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-gray-900/90 border-[3px] border-green-500/70 shadow-[0_0_50px_rgba(34,197,94,0.5)] rounded-xl max-w-md w-full mx-auto p-6 overflow-hidden"
        >
          <div className="flex flex-col items-center">
            {/* Success Icon with Animation */}
            <div className="w-28 h-28 bg-green-500/20 rounded-full flex items-center justify-center mb-6 mt-2">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  duration: 0.7
                }}
              >
                <svg className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            </div>

            {/* Title with Animation */}
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white text-center mb-2"
            >
              Email Verified!
            </motion.h2>
            
            {/* Divider with Animation */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "40%" }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="h-1 bg-green-500/50 mx-auto rounded-full mb-6"
            />

            {/* Content with Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center space-y-4"
            >
              <p className="text-gray-200 text-lg leading-relaxed">
                Your email has been successfully verified!
              </p>
              
              {email && (
                <div className="mt-2 p-4 bg-green-900/30 rounded-lg border border-green-800 mb-4">
                  <p className="text-sm text-gray-400 mb-1">Continue with:</p>
                  <p className="text-green-400 font-medium text-xl">{email}</p>
                </div>
              )}
            </motion.div>

            {/* Continue Button with Animation */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full mt-6 pt-4 border-t border-gray-800"
            >
              <button
                onClick={() => {
                  onOpenChange(false);
                  // Auto-fill the form but don't submit automatically
                  const passwordInput = document.querySelector('input[type="password"]');
                  if (passwordInput) {
                    (passwordInput as HTMLInputElement).focus();
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg rounded-lg font-medium transition-all duration-300 shadow-lg shadow-green-900/30 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue to Login
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Create a dedicated verification resent dialog that's distinct from the regular sent dialog
const VerificationResentDialog = ({ email, open, onOpenChange }: { 
  email: string, 
  open: boolean, 
  onOpenChange: (open: boolean) => void 
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gradient-to-b from-[#101824] to-[#0c1523] border-2 border-amber-500/30 shadow-[0_0_35px_rgba(245,158,11,0.2)] rounded-xl max-w-md mx-auto">
        <AlertDialogHeader className="gap-4 pb-3">
          <div className="mx-auto w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20 
              }}
            >
              <RefreshCw className="h-10 w-10 text-amber-500" />
            </motion.div>
          </div>
          <AlertDialogTitle className="text-white text-2xl font-bold text-center mt-2">
            New Verification Sent!
          </AlertDialogTitle>
          <div className="w-24 h-1 bg-amber-500/30 mx-auto rounded-full"></div>
          <AlertDialogDescription className="text-gray-300 text-center text-base mt-4 leading-relaxed">
            We've sent a new verification link to:<br />
            <span className="text-amber-400 font-medium text-lg block mt-2 mb-3 p-2 bg-amber-950/30 rounded-md border border-amber-900">{email}</span>
            Click the link in your email to verify your account and sign in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex flex-col gap-3 pt-4 border-t border-gray-800">
          <AlertDialogAction
            onClick={() => window.open('https://mail.google.com', '_blank')}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Open Gmail
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-700 py-3 rounded-lg"
          >
            I'll Check Later
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default function LoginPage() {
  // Check for verification parameters directly before hooks
  const hasVerificationParam = 
    typeof window !== 'undefined' && 
    (window.location.search.includes('verified=true') || 
     window.location.hash.includes('verification_success') ||
     document.cookie.includes('just_verified=true'));
  
  // Pre-extract email from URL if available
  const urlEmail = 
    typeof window !== 'undefined' 
      ? new URLSearchParams(window.location.search).get('email') || ''
      : '';
  
  // Initialize state with verification status if detected in URL
  const [email, setEmail] = useState(urlEmail)
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingText, setLoadingText] = useState('')
  const [showExpiredLinkDialog, setShowExpiredLinkDialog] = useState(false)
  const [showVerificationSentDialog, setShowVerificationSentDialog] = useState(false)
  const [showVerifiedSuccessDialog, setShowVerifiedSuccessDialog] = useState(hasVerificationParam)
  const [errorDetails, setErrorDetails] = useState<{
    code: string;
    description: string;
  } | null>(null)
  const [showVerificationResentDialog, setShowVerificationResentDialog] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()
  const { toast } = useToast()
  const verificationChecked = useRef(false);
  const autoLoginAttempted = useRef(false);

  // Check for error parameters in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Check both URL query parameters and hash parameters
      const error = urlParams.get('error') || hashParams.get('error');
      const errorCode = urlParams.get('error_code') || hashParams.get('error_code');
      const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
      
      if (error && (
          error === 'access_denied' || 
          error.includes('expired') || 
          (errorCode && (
            errorCode === 'otp_expired' || 
            errorCode.includes('expired')
          ))
      )) {
        console.log('Link expired error detected:', { error, errorCode, errorDescription });
        
        // Extract email from the error description if available
        try {
          const descriptionText = decodeURIComponent(errorDescription || '');
          const emailMatch = descriptionText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
          if (emailMatch && emailMatch[0]) {
            setEmail(emailMatch[0]);
            console.log('Email extracted from error:', emailMatch[0]);
          }
        } catch (e) {
          console.error("Failed to extract email from error description:", e);
        }

        // Set error details and show dialog
        setErrorDetails({
          code: errorCode || 'link_expired',
          description: errorDescription || 'Your verification link has expired'
        });
        setShowExpiredLinkDialog(true);
        
        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Forced immediate check on component mount for verification 
  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && !verificationChecked.current) {
      verificationChecked.current = true;
      
      // More detailed debug logs
      console.log('🚨 VERIFICATION CHECK TRIGGERED');
      console.log('📍 URL:', window.location.href);
      console.log('📍 HASH:', window.location.hash);
      console.log('📍 SEARCH:', window.location.search);
      console.log('📍 COOKIES:', document.cookie);
      
      // Simple function to check all signals
      const checkVerificationSignals = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
        
        // Combined check for verification success from all sources
        const isVerified = 
          urlParams.get('verified') === 'true' || 
          hashParams.get('verification_success') === 'true' ||
          document.cookie.includes('just_verified=true');
          
        console.log('📊 Verification check results:', { 
          isVerified,
          fromUrl: urlParams.get('verified') === 'true',
          fromHash: hashParams.get('verification_success') === 'true',
          fromCookie: document.cookie.includes('just_verified=true')
        });
          
        // Get the email from any source
        const verifiedEmail = 
          urlParams.get('email') || 
          hashParams.get('email') || 
          getCookieValue('verified_email');
          
        if (isVerified) {
          console.log('🎉 VERIFICATION SUCCESS DETECTED!');
          if (verifiedEmail) {
            console.log('📧 Setting verified email:', verifiedEmail);
            setEmail(verifiedEmail);
          }
          
          // Immediately show the success dialog
          setShowVerifiedSuccessDialog(true);
          
          // Show toast notification with a slight delay to avoid it being missed
          setTimeout(() => {
            toast({
              title: "Email Verified!",
              description: "Your email has been successfully verified. You can now log in.",
              duration: 8000,
            });
          }, 1000);
          
          // Clean up URL parameters
          if (window.history && window.history.replaceState) {
            const cleanUrl = window.location.pathname + 
              (verifiedEmail ? `?email=${encodeURIComponent(verifiedEmail)}` : '');
            window.history.replaceState({}, document.title, cleanUrl);
          }
          
          // Clean up cookies after using them
          document.cookie = 'just_verified=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'email_verified=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'verified_email=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'verification_timestamp=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        } else {
          console.log('ℹ️ No verification signals detected');
        }
      };
      
      // Helper function to get cookie value
      const getCookieValue = (name: string) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) {
          try {
            return decodeURIComponent(match[2]);
          } catch (e) {
            return match[2];
          }
        }
        return '';
      };
      
      // Check immediately
      checkVerificationSignals();
      
      // Just to be extra safe, check again after a short delay
      // (in case there's any async operation or timing issue)
      setTimeout(checkVerificationSignals, 100);
    }
  }, []);

  // Auto-login after verification
  useEffect(() => {
    const attemptAutoLogin = async () => {
      if (typeof window === 'undefined' || autoLoginAttempted.current || !email) return;
      
      // Check if we have verification success indicators
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      const isVerified = 
        urlParams.get('verified') === 'true' || 
        hashParams.get('verification_success') === 'true' ||
        document.cookie.includes('just_verified=true');
      
      if (isVerified && email) {
        console.log('🔑 Auto-login attempt after verification for:', email);
        autoLoginAttempted.current = true;
        
        try {
          setLoading(true);
          await updateLoadingText('Signing in automatically...', 800);
          
          // Use passwordless login
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              // This will redirect back to the callback handler that logs the user in
              emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
            }
          });
          
          if (error) {
            console.error('❌ Auto-login error:', error.message);
            toast({
              title: "Email verified!",
              description: "Your email is verified. Please log in with your password.",
              duration: 6000,
            });
          } else {
            setShowVerificationSentDialog(true);
            await updateLoadingText('Verification link sent!', 800);
          }
        } catch (error) {
          console.error('❌ Auto-login error:', error);
        } finally {
          setLoading(false);
          setLoadingText('');
          
          // Clear verification cookies after attempt
          document.cookie = 'just_verified=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'email_verified=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'verified_email=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
      }
    };
    
    attemptAutoLogin();
  }, [email, supabase.auth]);

  // Redirect if already logged in - using useEffect to avoid router updates during render
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const updateLoadingText = async (text: string, delay: number) => {
    setLoadingText(text)
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await updateLoadingText('Signing in...', 800)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      await updateLoadingText('Success! Redirecting...', 800)
      router.push('/')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setLoadingText('')
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return; // Don't close the dialog if email is missing
    }
    
    setLoading(true);
    try {
      // Faster process - no artificial delays
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/`,
        }
      });
      
      if (signInError) {
        console.log("Error sending OTP:", signInError);
        throw signInError;
      }
      
      // Show the resent dialog, which is different from the regular verification dialog
      setShowExpiredLinkDialog(false);
      setShowVerificationResentDialog(true);
      
      // No toast notification - we already have a dialog
    } catch (error) {
      console.error("Error during resend:", error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingText('');
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

  // Handle phone OTP login
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
  
  // Handle OTP verification
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

  // Render verification success dialog by itself if showing - this makes it super prominent
  if (showVerifiedSuccessDialog) {
    return (
      <>
        <VerificationSuccessDialog 
          email={email}
          open={true}
          onOpenChange={(open) => {
            setShowVerifiedSuccessDialog(open);
            
            // Only clear verified flag from URL if user explicitly closes dialog
            if (!open && window.history && window.history.replaceState) {
              const cleanUrl = window.location.pathname + 
                (email ? `?email=${encodeURIComponent(email)}` : '');
              window.history.replaceState({}, document.title, cleanUrl);
            }
          }}
        />
        {/* Normal page rendering behind the dialog */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-black text-white flex flex-col"
        >
          {/* Verification Banner - Shows at the top of the page */}
          <AnimatePresence>
            {showVerifiedSuccessDialog && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3 }}
                className="sticky top-0 z-50 w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg"
              >
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-1.5 rounded-full">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Email Verified Successfully!</h3>
                      <p className="text-white/90 text-sm">You can now log in to your account</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowVerifiedSuccessDialog(false)}
                    className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Background gradient effect */}
          <motion.div 
            className="absolute inset-0 overflow-hidden pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div 
              className="absolute w-[120%] h-[120%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/30 blur-3xl"
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
                className="absolute -inset-1 bg-blue-500/50 rounded-2xl blur-lg"
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
                    <CardTitle className="text-2xl font-bold">Log In</CardTitle>
                    <CardDescription>Welcome back to MealShare</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="email" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger 
                          value="email"
                          className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
                        >
                          Email/Password
                        </TabsTrigger>
                        <TabsTrigger 
                          value="phone"
                          className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
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
                              {error && (
                                <div className="text-sm text-red-500">
                                  {error}
                                </div>
                              )}
                              <div className="flex justify-end">
                                <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                                  Forgot password?
                                </Link>
                              </div>
                              <Button 
                                type="submit" 
                                className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                                disabled={loading}
                              >
                                Sign In
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
                                  className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
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
                                    <p className="text-blue-400 font-medium">{formatPhoneNumber(phoneNumber)}</p>
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
                                  className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                                  disabled={loading}
                                >
                                  Verify & Sign In
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
                                    className="text-sm text-blue-400 hover:text-blue-300 px-0"
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
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
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

          {/* Verification Sent Dialog */}
          <AlertDialog open={showVerificationSentDialog} onOpenChange={setShowVerificationSentDialog}>
            <AlertDialogContent className="bg-gray-900/95 backdrop-blur-md border-2 border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl max-w-md mx-auto">
              <AlertDialogHeader className="gap-2 pb-2">
                <div className="mx-auto w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Mail className="h-10 w-10 text-blue-500" />
                </div>
                <AlertDialogTitle className="text-white text-2xl font-bold text-center mt-2">
                  Verification Email Sent
                </AlertDialogTitle>
                <div className="w-20 h-1 bg-blue-500/30 mx-auto rounded-full"></div>
                <AlertDialogDescription className="text-gray-300 text-center text-base mt-4 leading-relaxed">
                  We've sent a verification link to:<br />
                  <span className="text-blue-400 font-medium text-lg block mt-1 mb-2">{email}</span>
                  Click the link in your email to sign in automatically and access your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6 flex flex-col gap-3 pt-2 border-t border-gray-800">
                <AlertDialogAction
                  onClick={() => window.open('https://mail.google.com', '_blank')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Open Gmail
                </AlertDialogAction>
                <AlertDialogCancel
                  onClick={() => setShowVerificationSentDialog(false)}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-700 py-3 rounded-lg"
                >
                  I'll Check Later
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Add the verification resent dialog here as well for when resending outside of expired flow */}
          <VerificationResentDialog
            email={email}
            open={showVerificationResentDialog}
            onOpenChange={setShowVerificationResentDialog}
          />
          
          {/* Include Toaster for toast notifications */}
          <Toaster />
        </motion.div>
      </>
    );
  }

  // Add a full-page overlay modal for expired links
  if (showExpiredLinkDialog) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0F1116] border border-gray-800 rounded-2xl max-w-md w-full mx-auto p-6 shadow-2xl"
        >
          <div className="flex flex-col items-center gap-6">
            {/* Icon */}
            <div className="w-16 h-16 bg-[#1A1D24] rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-amber-500" />
            </div>

            {/* Title */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-2">
                Verification Link Expired
              </h2>
              <div className="w-16 h-0.5 bg-amber-500/50 mx-auto"></div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-center">
              Your verification link has expired or is invalid.
              Please enter your email to receive a new verification link.
            </p>

            {/* Email Input */}
            <div className="w-full mt-2">
              <Input 
                type="email" 
                placeholder="Enter your email"
                className="bg-[#1A1D24] border-gray-800 text-white w-full p-6 text-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4 w-full mt-2">
              <Button
                onClick={handleResendVerification}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-medium text-lg flex items-center justify-center gap-2"
                disabled={!email || loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5" />
                )}
                Send New Verification Link
              </Button>
              <Button
                onClick={() => router.push('/signup')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
              >
                Create New Account
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-xl max-w-sm w-full mx-4"
              >
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
                  <p className="text-lg text-gray-300 font-medium">Sending verification link...</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Add the verification resent dialog */}
        <VerificationResentDialog
          email={email}
          open={showVerificationResentDialog}
          onOpenChange={setShowVerificationResentDialog}
        />
      </div>
    );
  }

  // Regular login page rendering (when no verification)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-black text-white flex flex-col"
    >
      {/* Verification Banner - Shows at the top of the page */}
      <AnimatePresence>
        {showVerifiedSuccessDialog && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="sticky top-0 z-50 w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg"
          >
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-full">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Email Verified Successfully!</h3>
                  <p className="text-white/90 text-sm">You can now log in to your account</p>
                </div>
              </div>
              <button
                onClick={() => setShowVerifiedSuccessDialog(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background gradient effect */}
      <motion.div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div 
          className="absolute w-[120%] h-[120%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/30 blur-3xl"
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
            className="absolute -inset-1 bg-blue-500/50 rounded-2xl blur-lg"
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
                <CardTitle className="text-2xl font-bold">Log In</CardTitle>
                <CardDescription>Welcome back to MealShare</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="email" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger 
                      value="email"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
                    >
                      Email/Password
                    </TabsTrigger>
                    <TabsTrigger 
                      value="phone"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
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
                          {error && (
                            <div className="text-sm text-red-500">
                              {error}
                            </div>
                          )}
                          <div className="flex justify-end">
                            <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                              Forgot password?
                            </Link>
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                            disabled={loading}
                          >
                            Sign In
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
                              className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
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
                                <p className="text-blue-400 font-medium">{formatPhoneNumber(phoneNumber)}</p>
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
                              className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                              disabled={loading}
                            >
                              Verify & Sign In
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
                                className="text-sm text-blue-400 hover:text-blue-300 px-0"
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
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
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

      {/* Verification Sent Dialog */}
      <AlertDialog open={showVerificationSentDialog} onOpenChange={setShowVerificationSentDialog}>
        <AlertDialogContent className="bg-gray-900/95 backdrop-blur-md border-2 border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl max-w-md mx-auto">
          <AlertDialogHeader className="gap-2 pb-2">
            <div className="mx-auto w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Mail className="h-10 w-10 text-blue-500" />
            </div>
            <AlertDialogTitle className="text-white text-2xl font-bold text-center mt-2">
              Verification Email Sent
            </AlertDialogTitle>
            <div className="w-20 h-1 bg-blue-500/30 mx-auto rounded-full"></div>
            <AlertDialogDescription className="text-gray-300 text-center text-base mt-4 leading-relaxed">
              We've sent a verification link to:<br />
              <span className="text-blue-400 font-medium text-lg block mt-1 mb-2">{email}</span>
              Click the link in your email to sign in automatically and access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-col gap-3 pt-2 border-t border-gray-800">
            <AlertDialogAction
              onClick={() => window.open('https://mail.google.com', '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Open Gmail
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => setShowVerificationSentDialog(false)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-700 py-3 rounded-lg"
            >
              I'll Check Later
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add the verification resent dialog here as well for when resending outside of expired flow */}
      <VerificationResentDialog
        email={email}
        open={showVerificationResentDialog}
        onOpenChange={setShowVerificationResentDialog}
      />
      
      {/* Include Toaster for toast notifications */}
      <Toaster />
    </motion.div>
  )
}

