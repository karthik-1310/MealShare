"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2, Lock, Eye, EyeOff, Check } from "lucide-react"
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
                  onClick={() => window.location.href = '/login'}
                >
                  Go to Login
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Check if we have a token from the URL
    const hasResetToken = 
      searchParams.has('token') || 
      searchParams.has('type') || 
      searchParams.has('access_token') ||
      searchParams.has('refresh_token') ||
      window.location.hash.includes('access_token=');

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      // If there's no reset token and no active session, redirect to forgot-password
      if (!hasResetToken && (!data.session || error)) {
        toast({
          title: "Session Expired",
          description: "Your password reset link has expired or is invalid. Please request a new one.",
          variant: "destructive",
        });
        router.push('/forgot-password');
      }
    };

    checkSession();
  }, [router, searchParams, toast, supabase.auth]);

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

    try {
      // Update the password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        throw error
      }

      // Show success dialog
      setShowSuccessDialog(true)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword)
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

      <Card className="w-full max-w-md border-gray-800 bg-gray-950/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Update your password</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
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
                  onClick={toggleShowPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
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
                  onClick={toggleShowConfirmPassword}
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
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-center w-full text-sm text-gray-500">
            Need a new reset link?{" "}
            <Link href="/forgot-password" className="text-blue-500 hover:text-blue-400">
              Request again
            </Link>
          </div>
        </CardFooter>
      </Card>

      <PasswordUpdatedDialog 
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
      />
      
      <Toaster />
    </div>
  )
} 