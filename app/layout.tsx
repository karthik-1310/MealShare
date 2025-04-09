import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import Navbar from "@/components/navbar"
import AuthListener from "@/components/auth-listener"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MealShare - Feeding Hope, One Meal at a Time",
  description:
    "A platform for donating extra food from gatherings and restaurants at minimum prices to help those in need.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <AuthListener />
            <Navbar />
            {children}
          </ThemeProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}

