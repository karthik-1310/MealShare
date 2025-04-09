"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2, Eye, EyeOff, Check, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { motion } from "framer-motion"
import { createClient } from '@/lib/supabase/client'
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Success dialog component
const PasswordUpdatedDialog = ({ open, onOpenChange }: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void 
}) => {
  const router = useRouter()
  
  const handleReturn = () => {
    router.push('/login')
  }
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] border-0 p-0 max-w-md bg-transparent z-[100]">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[-1]" aria-hidden="true" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-gray-900/90 border-[3px] border-green-500/70 shadow-[0_0_50px_rgba(34,197,94,0.5)] rounded-xl max-w-md w-full mx-auto p-6 overflow-hidden"
        >
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-green-500/20 rounded-full flex items-center justify-center mb-6 mt-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  duration: 0.7
                }}
              >
                <Check className="h-16 w-16 text-green-500" />
              </motion.div>
            </div>

            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-center mb-2">
                Password Updated Successfully
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-300 text-lg">
                Your password has been updated successfully. You can now log in with your new password.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="flex flex-col w-full mt-6">
              <AlertDialogAction asChild>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-lg text-lg font-medium transition-all"
                  onClick={handleReturn}
                >
                  Return to Login
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Expired Link dialog component
const ExpiredLinkDialog = ({ open, onOpenChange }: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void 
}) => {
  const router = useRouter()
  
  const handleReturn = () => {
    router.push('/forgot-password')
  }
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] border-0 p-0 max-w-md bg-transparent z-[100]">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[-1]" aria-hidden="true" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-gray-900/90 border-[3px] border-red-500/70 shadow-[0_0_50px_rgba(239,68,68,0.5)] rounded-xl max-w-md w-full mx-auto p-6 overflow-hidden"
        >
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-red-500/20 rounded-full flex items-center justify-center mb-6 mt-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  duration: 0.7
                }}
              >
                <AlertTriangle className="h-16 w-16 text-red-500" />
              </motion.div>
            </div>

            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-center mb-2">
                Link Expired
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-300 text-lg">
                Your password reset link has expired or is invalid. Please request a new one.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="flex flex-col w-full mt-6">
              <AlertDialogAction asChild>
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-lg text-lg font-medium transition-all"
                  onClick={handleReturn}
                >
                  Request New Link
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showExpiredDialog, setShowExpiredDialog] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Default to not showing the expired dialog until we've checked
    setShowExpiredDialog(false);
    
    // Check if we have a session or token
    const checkSession = async () => {
      try {
        // For debugging, print the URL information
        console.log("URL check:", { 
          hash: window.location.hash,
          params: Object.fromEntries(searchParams.entries()),
          url: window.location.href
        });
        
        // More comprehensive check for reset tokens in various formats
        const hasResetToken = 
          // Hash-based tokens (typical for Supabase auth)
          window.location.hash.includes('access_token=') || 
          window.location.hash.includes('type=recovery') ||
          // Query parameter tokens
          searchParams.has('token') ||
          searchParams.has('access_token') ||
          // Check fragment directly if using hash router
          window.location.href.includes('#access_token=') ||
          // Check for any query parameters at all (fallback)
          searchParams.toString().length > 0;
        
        console.log("Reset token check:", { hasResetToken });
        
        if (!hasResetToken) {
          console.log("No reset token found, showing expired dialog");
          setShowExpiredDialog(true);
          return;
        }
        
        // Handle recovery flow
        let isValidToken = false;
        let sessionEstablished = false;
        
        try {
          // First, check if we already have a valid session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            console.log("Valid session already exists:", session);
            isValidToken = true;
            sessionEstablished = true;
          } 
          // If not, try to establish a session from the token
          else if (window.location.hash) {
            console.log("Processing hash-based token");
            
            // Parse the hash fragment to get the access token
            const hashParams = new URLSearchParams(
              window.location.hash.substring(1) // Remove the leading '#'
            );
            
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            const type = hashParams.get('type');
            
            console.log("Tokens from hash:", { 
              hasAccessToken: !!accessToken,
              hasRefreshToken: !!refreshToken,
              type
            });
            
            if (accessToken) {
              // Set the session manually with the extracted tokens
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
              });
              
              if (error) {
                console.error("Error setting session from hash tokens:", error);
                isValidToken = false;
              } else {
                console.log("Successfully set session from hash tokens:", data);
                isValidToken = true;
                sessionEstablished = true;
              }
            }
            
            // If type is recovery, this is specifically a password reset flow
            if (type === 'recovery') {
              isValidToken = true;
            }
          }
          
          // As a final check, try to get the user
          if (!sessionEstablished) {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
              console.error("Error getting user:", userError);
              // Only mark as invalid if we couldn't establish validity through other means
              if (!isValidToken) {
                isValidToken = false;
              }
            } else {
              console.log("Successfully verified user:", userData);
              isValidToken = true;
            }
          }
          
          // Determine if we should show the expired dialog
          setShowExpiredDialog(!isValidToken);
          
        } catch (e) {
          console.error("Error processing token:", e);
          setShowExpiredDialog(true);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        // On error, show expired dialog
        setShowExpiredDialog(true);
      }
    };

    // Only run the check if we're in the browser
    if (typeof window !== 'undefined') {
      checkSession();
    }
  }, [searchParams, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords
    if (!password) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive",
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    // Track if we've already retried
    let hasRetried = false;

    const attemptPasswordUpdate = async (retry = false) => {
      try {
        console.log(`Attempting to update password${retry ? ' (retry)' : ''}...`);
        
        // ALWAYS refresh the session on each attempt from the URL hash (if available)
        if (window.location.hash) {
          console.log(`Refreshing session from hash${retry ? ' (retry)' : ''}...`);
          
          // Parse the hash fragment to get the access token
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1) // Remove the leading '#'
          );
          
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });
            
            if (sessionError) {
              console.error(`Error refreshing session${retry ? ' (retry)' : ''}:`, sessionError);
              // Don't throw, still try to update password
            } else {
              console.log(`Successfully refreshed session${retry ? ' (retry)' : ''}:`, sessionData);
            }
          }
        }
        
        // Check if we have a valid session
        const { data: sessionData } = await supabase.auth.getSession();
        console.log(`Current session before update${retry ? ' (retry)' : ''}:`, sessionData);
        
        // If we don't have a valid session, try to get the user anyway
        if (!sessionData?.session) {
          console.log("No valid session found, attempting to get user...");
          const { data: userData, error: userError } = await supabase.auth.getUser();
          console.log("Get user result:", { user: userData, error: userError });
        }
        
        // Update the password
        const { data, error } = await supabase.auth.updateUser({
          password: password
        });

        console.log(`Password update result${retry ? ' (retry)' : ''}:`, { success: !error, data, error });

        if (error) {
          // Handle specific error cases
          if (error.message.includes("Auth session missing") && !hasRetried) {
            console.error("No valid auth session. Retrying with session refresh...");
            hasRetried = true;
            return await attemptPasswordUpdate(true);
          } else if (error.message.includes("Auth session missing") && hasRetried) {
            // If we've already retried, provide helpful advice
            toast({
              title: "Session Error",
              description: "Unable to update password. Please try clicking the reset link from your email again.",
              variant: "destructive",
              className: "bg-gray-900 border-red-500/30 text-white"
            });
            return false;
          } else {
            throw error;
          }
        } else {
          // Show success dialog and clear form
          setShowSuccessDialog(true);
          setPassword("");
          setConfirmPassword("");
          console.log("Password updated successfully");
          return true;
        }
      } catch (error: any) {
        console.error(`Failed to update password${retry ? ' (retry)' : ''}:`, error);
        
        let errorMessage = error.message || "Failed to update password. Please try again.";
        
        // Provide more user-friendly error messages
        if (error.message?.includes("invalid email")) {
          errorMessage = "The reset link is invalid or has expired. Please request a new password reset link.";
        } else if (error.message?.includes("expired")) {
          errorMessage = "Your session has expired. Please try clicking the reset link from your email again.";
        } else if (error.message?.includes("JWT")) {
          errorMessage = "Authentication error. Please try clicking the reset link from your email again.";
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
          className: "bg-gray-900 border-red-500/30 text-white"
        });
        return false;
      }
    };
    
    try {
      await attemptPasswordUpdate();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container relative flex flex-col items-center justify-center min-h-screen px-4">
      <Link
        href="/login"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-gray-400 hover:text-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to login
      </Link>

      {!showExpiredDialog && (
        <Card className="w-full max-w-md border-gray-800 bg-gray-950/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create new password</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-900 border-gray-800 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-900 border-gray-800 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <PasswordUpdatedDialog 
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
      />
      
      <ExpiredLinkDialog 
        open={showExpiredDialog}
        onOpenChange={setShowExpiredDialog}
      />
      
      <Toaster />
    </div>
  )
}