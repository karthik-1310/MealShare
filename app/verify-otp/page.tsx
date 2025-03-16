'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Check if we have a token in the URL
    const token = searchParams.get('token')
    if (token) {
      handleEmailVerification(token)
    }
  }, [searchParams])

  const handleEmailVerification = async (token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup',
      })

      if (error) throw error

      toast({
        title: "Success!",
        description: "Your email has been verified successfully.",
      })

      router.push('/')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.verifyOtp({
        token: otp,
        type: 'signup',
      })

      if (error) throw error

      toast({
        title: "Success!",
        description: "Your email has been verified successfully.",
      })

      router.push('/')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            Enter the verification code sent to your email
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter the code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

