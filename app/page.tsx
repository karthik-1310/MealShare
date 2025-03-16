"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import HowItWorks from "@/components/how-it-works"
import Footer from "@/components/footer"
import FeaturedListings from "@/components/featured-listings"
import TopGiversSection from "@/components/top-givers-section"
import CounterAnimation from "@/components/counter-animation"
import ScrollAnimations from "@/components/scroll-animations"

export default function Home() {
  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Show success message if present in URL
    const message = searchParams.get('message')
    if (message) {
      toast({
        title: "Success!",
        description: message,
      })
    }
  }, [searchParams, toast])

  const scrollToListings = () => {
    const listingsSection = document.getElementById('listings')
    if (listingsSection) {
      listingsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative pt-16">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[120%] h-[120%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/30 blur-3xl opacity-50"></div>
      </div>

      {/* Animations */}
      <CounterAnimation />
      <ScrollAnimations />

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-12 fade-in">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl">
            Feeding Hope,
            <br />
            One Meal at a Time
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl">
            Join thousands of people and restaurants donating extra food at minimum prices to help those in need.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Button 
              className="bg-gray-800 text-white rounded-full px-6 py-6 relative z-0 transition-all duration-300 hover:bg-blue-600"
            >
              <span className="absolute top-[-2px] left-[-2px] w-[calc(100%+4px)] h-[calc(100%+4px)] rounded-full bg-glow-gradient bg-[length:600%] filter blur-[8px] z-[-1] opacity-0 hover:opacity-100 animate-glow transition-opacity duration-300"></span>
              <Link href="/signup">Donate Food</Link>
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-700 text-white rounded-full px-6 py-6 relative z-0 transition-all duration-300 hover:bg-blue-600 hover:border-transparent bg-gray-800"
              onClick={scrollToListings}
            >
              <span className="absolute top-[-2px] left-[-2px] w-[calc(100%+4px)] h-[calc(100%+4px)] rounded-full bg-glow-gradient bg-[length:600%] filter blur-[8px] z-[-1] opacity-0 hover:opacity-100 animate-glow transition-opacity duration-300"></span>
              Find Food
            </Button>
          </div>
        </section>

        {/* Rest of the content */}
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* How It Works */}
            <Card className="bg-gray-900/50 border-gray-800 col-span-full fade-in" id="how-it-works">
              <CardHeader>
                <CardTitle className="text-2xl">How It Works</CardTitle>
                <CardDescription className="text-gray-400">Simple steps to share or find food</CardDescription>
              </CardHeader>
              <CardContent>
                <HowItWorks />
              </CardContent>
            </Card>

            {/* Featured Listings */}
            <div id="listings" className="col-span-full">
              <FeaturedListings />
            </div>

            {/* Top Givers & Bidders Section */}
            <TopGiversSection />
          </div>
        </div>

        {/* CTA Section */}
        <section className="px-6 md:px-12 py-16 text-center relative overflow-hidden fade-in">
          <div className="absolute inset-0 bg-blue-600/10 blur-3xl rounded-full transform -translate-y-1/2"></div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to make a difference?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Join our community today and help reduce food waste while supporting those in need.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 text-lg">
              <Link href="/signup">Get Started for Free</Link>
            </Button>
          </div>
        </section>

        {/* Back to Top Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50 transition-transform hover:scale-110"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

