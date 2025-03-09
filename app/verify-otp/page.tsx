import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function VerifyOTPPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[120%] h-[120%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/30 blur-3xl opacity-50"></div>
      </div>

      {/* Back button */}
      <div className="p-6">
        <Link href="/login" className="inline-flex items-center text-gray-300 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-gray-900/70 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verify OTP</CardTitle>
            <CardDescription>Enter the one-time password sent to your phone</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <Input
                  type="text"
                  maxLength={1}
                  className="bg-gray-800 border-gray-700 text-center text-xl h-16"
                  inputMode="numeric"
                />
                <Input
                  type="text"
                  maxLength={1}
                  className="bg-gray-800 border-gray-700 text-center text-xl h-16"
                  inputMode="numeric"
                />
                <Input
                  type="text"
                  maxLength={1}
                  className="bg-gray-800 border-gray-700 text-center text-xl h-16"
                  inputMode="numeric"
                />
                <Input
                  type="text"
                  maxLength={1}
                  className="bg-gray-800 border-gray-700 text-center text-xl h-16"
                  inputMode="numeric"
                />
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700">Verify & Continue</Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center space-y-2">
            <div className="text-center text-sm text-gray-400">
              Didn&apos;t receive the code?{" "}
              <Link href="#" className="text-blue-400 hover:text-blue-300">
                Resend OTP
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

