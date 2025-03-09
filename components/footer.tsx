import Link from "next/link"
import { Facebook, Heart, Instagram, Linkedin, Twitter, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 px-6 md:px-12 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link href="#" className="flex items-center mb-4">
            <Heart className="text-blue-500 mr-2" />
            <span className="font-semibold text-xl">MealShare</span>
          </Link>
          <p className="text-gray-400 text-sm">
            Feeding Hope, One Meal at a Time. Reducing food waste and helping communities by connecting surplus food
            with those who need it most.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
              <Youtube className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Platform</h3>
          <ul className="space-y-2">
            <li>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Browse Listings
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Donate Food
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Find Food
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Success Stories
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            <li>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                About Us
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Our Mission
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Team
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Careers
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Press
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Legal</h3>
          <ul className="space-y-2">
            <li>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Cookie Policy
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Food Safety Guidelines
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Donation Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-400 text-sm">© 2025 MealShare. All rights reserved.</p>
        <p className="text-gray-400 text-sm mt-4 md:mt-0">Feeding Hope, One Meal at a Time</p>
      </div>
    </footer>
  )
}

