"use client"

import Link from "next/link"
import { ArrowLeft, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verifyType = searchParams.get('type') || 'email'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white flex flex-col"
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[120%] h-[120%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/30 blur-3xl opacity-50"></div>
      </div>

      {/* Back button */}
      <div className="p-6">
        <Link href="/signup" className="inline-flex items-center text-gray-300 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign Up
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative"
        >
          <div className="absolute -inset-1 bg-blue-500/50 rounded-2xl blur-lg opacity-15" />
          <Card className="bg-gray-900/70 border-gray-800 relative">
            <CardHeader className="text-center">
              {verifyType === 'phone' ? (
                <>
                  <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle className="text-2xl">Check Your Phone</CardTitle>
                  <CardDescription>We've sent you a verification code</CardDescription>
                </>
              ) : (
                <>
                  <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle className="text-2xl">Check Your Email</CardTitle>
                  <CardDescription>We've sent you a confirmation link</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {verifyType === 'phone' ? (
                <p className="text-gray-300">
                  Please check your phone for a verification code. Enter the code on the previous page to verify your account and complete the registration process.
                </p>
              ) : (
                <p className="text-gray-300">
                  Please check your email inbox for a confirmation link. Click the link to verify your account and complete the registration process.
                </p>
              )}
              <div className="text-sm text-gray-400">
                <p>Didn't receive the {verifyType === 'phone' ? 'SMS' : 'email'}?</p>
                <p>
                  {verifyType === 'phone' 
                    ? 'Try clicking "Resend Code" on the previous page.' 
                    : 'Check your spam folder or contact support.'}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center space-y-4">
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white"
                onClick={() => router.back()}
              >
                Go Back
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Return to Login
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
} 