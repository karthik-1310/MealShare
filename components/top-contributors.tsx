"use client"

import type React from "react"
import { Trophy, Award, Medal, Building, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"
import AutoScrollCarousel from "./auto-scroll-carousel"

// Sample data for top contributors
const topDonors = [
  {
    name: "Green Plate Restaurant",
    type: "Restaurant",
    contribution: "250 meals",
    icon: <Building className="h-5 w-5 text-blue-400" />,
  },
  {
    name: "City Catering Co.",
    type: "Catering",
    contribution: "180 meals",
    icon: <Building className="h-5 w-5 text-blue-400" />,
  },
  {
    name: "Fresh Bites Cafe",
    type: "Restaurant",
    contribution: "120 meals",
    icon: <Building className="h-5 w-5 text-blue-400" />,
  },
  {
    name: "Harvest Events",
    type: "Event Planner",
    contribution: "95 meals",
    icon: <Building className="h-5 w-5 text-blue-400" />,
  },
  {
    name: "Family Bakery",
    type: "Bakery",
    contribution: "85 meals",
    icon: <Building className="h-5 w-5 text-blue-400" />,
  },
]

const topNGOs = [
  {
    name: "Community Food Bank",
    type: "Food Bank",
    contribution: "320 meals distributed",
    icon: <Users className="h-5 w-5 text-green-400" />,
  },
  {
    name: "Hope Foundation",
    type: "Charity",
    contribution: "210 meals distributed",
    icon: <Users className="h-5 w-5 text-green-400" />,
  },
  {
    name: "Street Helpers",
    type: "Volunteer Group",
    contribution: "180 meals distributed",
    icon: <Users className="h-5 w-5 text-green-400" />,
  },
  {
    name: "Youth Support Center",
    type: "Support Center",
    contribution: "150 meals distributed",
    icon: <Users className="h-5 w-5 text-green-400" />,
  },
  {
    name: "Elder Care Network",
    type: "Senior Support",
    contribution: "120 meals distributed",
    icon: <Users className="h-5 w-5 text-green-400" />,
  },
]

const topIndividuals = [
  {
    name: "Sarah Johnson",
    type: "Individual",
    contribution: "45 meals",
    icon: <User className="h-5 w-5 text-purple-400" />,
  },
  {
    name: "Michael Chen",
    type: "Individual",
    contribution: "38 meals",
    icon: <User className="h-5 w-5 text-purple-400" />,
  },
  {
    name: "Aisha Patel",
    type: "Individual",
    contribution: "32 meals",
    icon: <User className="h-5 w-5 text-purple-400" />,
  },
  {
    name: "David Rodriguez",
    type: "Individual",
    contribution: "28 meals",
    icon: <User className="h-5 w-5 text-purple-400" />,
  },
  {
    name: "Emma Wilson",
    type: "Individual",
    contribution: "25 meals",
    icon: <User className="h-5 w-5 text-purple-400" />,
  },
]

interface ContributorCardProps {
  title: string
  icon: React.ReactNode
  contributors: Array<{
    name: string
    type: string
    contribution: string
    icon: React.ReactNode
  }>
  className?: string
}

function ContributorCard({ title, icon, contributors, className }: ContributorCardProps) {
  return (
    <div className={cn("bg-gray-800/50 rounded-lg overflow-hidden", className)}>
      <div className="p-4 border-b border-gray-700 flex items-center gap-2">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="h-[300px] overflow-hidden">
        <AutoScrollCarousel speed={20} direction="vertical">
          {contributors.map((contributor, index) => (
            <div
              key={index}
              className="p-4 border-b border-gray-700/50 flex items-center gap-3 hover:bg-gray-700/30 transition-colors w-full"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                {contributor.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{contributor.name}</p>
                <p className="text-sm text-gray-400 truncate">{contributor.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-400">{contributor.contribution}</p>
              </div>
            </div>
          ))}
        </AutoScrollCarousel>
      </div>
    </div>
  )
}

export default function TopContributors() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ContributorCard
        title="Top Donors"
        icon={<Trophy className="h-5 w-5 text-yellow-400" />}
        contributors={topDonors}
      />
      <ContributorCard
        title="Top NGOs & Organizations"
        icon={<Award className="h-5 w-5 text-blue-400" />}
        contributors={topNGOs}
      />
      <ContributorCard
        title="Top Individual Contributors"
        icon={<Medal className="h-5 w-5 text-green-400" />}
        contributors={topIndividuals}
      />
    </div>
  )
}

