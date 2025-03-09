"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TopContributors from "./top-contributors"

export default function TopGiversSection() {
  return (
    <Card className="bg-gray-900/50 border-gray-800 col-span-full w-full fade-in">
      <CardHeader>
        <CardTitle className="text-2xl" id="top-contributors">
          Top Givers & Bidders
        </CardTitle>
        <CardDescription className="text-gray-400">Recognizing those making the biggest impact</CardDescription>
      </CardHeader>
      <CardContent>
        <TopContributors />
      </CardContent>
    </Card>
  )
} 