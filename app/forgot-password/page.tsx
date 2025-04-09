"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Mail, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { motion } from "framer-motion"
import { createClient } from '@/lib/supabase/client'
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Success dialog component
const ResetEmailSentDialog = ({ email, open, onOpenChange }: { 
  email: string, 
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
          className="bg-gray-900/90 border-[3px] border-blue-500/70 shadow-[0_0_50px_rgba(59,130,246,0.5)] rounded-xl max-w-md w-full mx-auto p-6 overflow-hidden"
        >
          <div className="flex flex-col items-center">
            {/* Email Icon with Animation */}
            <div className="w-28 h-28 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 mt-2">
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
                <Mail className="h-16 w-16 text-blue-500" />
              </motion.div>
            </div>

            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-center mb-2">
                Check Your Email
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-300 text-lg">
                We've sent a password reset link to:
                <div className="font-medium text-blue-400 mt-2 mb-4 text-xl break-all">
                  {email}
                </div>
                Click the link in the email to reset your password. The link will expire in 24 hours.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="flex flex-col w-full mt-6">
              <AlertDialogAction asChild>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg text-lg font-medium transition-all"
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Use Supabase's password reset functionality with absolute URL
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        throw error
      }

      // Show success dialog
      setShowSuccessDialog(true)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset password email. Please try again.",
        variant: "destructive",
        className: "bg-gray-900 border-red-500/30 text-white"
      })
    } finally {
      setIsLoading(false)
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

      <Card className="w-full max-w-md border-gray-800 bg-gray-950/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-900 border-gray-800"
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-center w-full text-sm text-gray-500">
            Remember your password?{" "}
            <Link href="/login" className="text-blue-500 hover:text-blue-400">
              Back to login
            </Link>
          </div>
        </CardFooter>
      </Card>

      <ResetEmailSentDialog 
        email={email}
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
      />
      
      <Toaster />
    </div>
  )
} 