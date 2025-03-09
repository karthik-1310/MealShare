"use client"

import Link from "next/link"
import { ArrowUp, Heart } from "lucide-react"
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
  const scrollToListings = () => {
    const listingsSection = document.getElementById('listings')
    if (listingsSection) {
      listingsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[120%] h-[120%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/30 blur-3xl opacity-50"></div>
      </div>

      {/* Animations */}
      <CounterAnimation />
      <ScrollAnimations />

      {/* Navigation */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12 sticky top-0 backdrop-blur-sm bg-black/70">
        <div className="flex items-center gap-12">
          <Link href="#" className="flex items-center group">
            <Heart className="text-blue-500 mr-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-xl">MealShare</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#how-it-works"
              className="text-sm md:text-base text-gray-300 hover:text-white transition-colors hover:underline underline-offset-4"
            >
              How It Works
            </Link>
            <Link
              href="#listings"
              className="text-sm md:text-base text-gray-300 hover:text-white transition-colors hover:underline underline-offset-4"
            >
              Listings
            </Link>
            <Link
              href="#about"
              className="text-sm md:text-base text-gray-300 hover:text-white transition-colors hover:underline underline-offset-4"
            >
              About
            </Link>
            <Link
              href="#contact"
              className="text-sm md:text-base text-gray-300 hover:text-white transition-colors hover:underline underline-offset-4"
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm md:text-base text-gray-300 hover:text-white transition-colors">
            Login
          </Link>
          <Button className="bg-white text-black hover:bg-gray-200 rounded-full text-sm px-4 py-2 font-medium">
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </header>

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

        {/* Bento Grid Layout */}
        <section className="px-6 md:px-12 py-12">
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

            {/* Stats Card */}
            <Card className="bg-gray-900/50 border-gray-800 col-span-full fade-in stats-section">
              <CardContent className="p-0">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-800">
                  <div className="p-6 text-center">
                    <p className="text-3xl font-bold text-blue-500 counter" data-target="5280">
                      0
                    </p>
                    <p className="text-gray-400 mt-1">Meals Shared</p>
                  </div>
                  <div className="p-6 text-center">
                    <p className="text-3xl font-bold text-blue-500 counter" data-target="320">
                      0
                    </p>
                    <p className="text-gray-400 mt-1">Active Donors</p>
                  </div>
                  <div className="p-6 text-center">
                    <p className="text-3xl font-bold text-blue-500 counter" data-target="45">
                      0
                    </p>
                    <p className="text-gray-400 mt-1">Partner Organizations</p>
                  </div>
                  <div className="p-6 text-center">
                    <p className="text-3xl font-bold text-blue-500 counter" data-target="12">
                      0
                    </p>
                    <p className="text-gray-400 mt-1">Cities Covered</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="bg-gray-900/50 border-gray-800 md:col-span-1 lg:col-span-2 fade-in" id="about">
              <CardHeader>
                <CardTitle className="text-2xl">About MealShare</CardTitle>
                <CardDescription className="text-gray-400">Our mission to reduce food waste</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-300">
                    MealShare is a platform dedicated to reducing food waste by connecting people with surplus food to
                    those who need it most. We believe that no food should go to waste when there are people in need.
                  </p>
                  <p className="text-gray-300">
                    Our bidding system ensures that food is accessible at minimum prices, making it affordable for
                    everyone while still valuing the efforts of those who prepare and share it.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="hover:bg-blue-600 hover:text-white transition-colors">
                  Learn More
                </Button>
              </CardFooter>
            </Card>

            {/* Contact Form */}
            <Card className="bg-gray-900/50 border-gray-800 md:col-span-1 fade-in" id="contact">
              <CardHeader>
                <CardTitle className="text-2xl">Contact Us</CardTitle>
                <CardDescription className="text-gray-400">Get in touch with our team</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <Input type="text" placeholder="Name" className="bg-gray-800 border-gray-700" required />
                  </div>
                  <div>
                    <Input type="email" placeholder="Email" className="bg-gray-800 border-gray-700" required />
                  </div>
                  <div>
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm"
                      placeholder="Your message"
                      required
                    ></textarea>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Send Message</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

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

