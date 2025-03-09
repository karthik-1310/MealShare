"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ListingsCarouselProps {
  children: React.ReactNode
  className?: string
  speed?: number
  pauseOnHover?: boolean
}

export default function ListingsCarousel({
  children,
  className,
  speed = 30,
  pauseOnHover = true,
}: ListingsCarouselProps) {
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)

  // Only duplicate content if speed > 0 (carousel is moving)
  useEffect(() => {
    if (!scrollerRef.current || speed === 0) return

    // Clear any existing duplicates
    while (scrollerRef.current.childNodes.length > 1) {
      scrollerRef.current.removeChild(scrollerRef.current.lastChild!)
    }

    // Only duplicate if speed > 0
    if (speed > 0) {
      const scrollerContent = Array.from(scrollerRef.current.children)
      scrollerContent.forEach((item) => {
        const duplicate = item.cloneNode(true)
        scrollerRef.current?.appendChild(duplicate)
      })
    }
  }, [speed])

  return (
    <div
      ref={containerRef}
      className={cn("w-full overflow-hidden", className)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div
        ref={scrollerRef}
        className={cn(
          "flex gap-4 w-max",
          speed > 0 && "animate-scroll-horizontal"
        )}
        style={{
          animationDuration: `${speed}s`,
          animationPlayState: isPaused ? "paused" : "running",
          animationFillMode: "both",
          willChange: "transform"
        }}
      >
        {children}
      </div>
    </div>
  )
} 