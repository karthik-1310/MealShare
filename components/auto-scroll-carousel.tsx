"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AutoScrollCarouselProps {
  children: React.ReactNode
  className?: string
  speed?: number
  pauseOnHover?: boolean
  direction?: "horizontal" | "vertical"
}

export default function AutoScrollCarousel({
  children,
  className,
  speed = 20,
  pauseOnHover = true,
  direction = "horizontal",
}: AutoScrollCarouselProps) {
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [duplicated, setDuplicated] = useState(false)

  // Duplicate items to create seamless scrolling
  useEffect(() => {
    if (!scrollerRef.current || duplicated) return

    const scrollerContent = Array.from(scrollerRef.current.children)

    // Only duplicate if we have enough content to need scrolling
    if (scrollerContent.length > 0) {
      scrollerContent.forEach((item) => {
        const duplicate = item.cloneNode(true)
        scrollerRef.current?.appendChild(duplicate)
      })
      setDuplicated(true)
    }
  }, [duplicated])

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden w-full", className)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div
        ref={scrollerRef}
        className={cn(
          direction === "horizontal" ? "flex gap-4 w-max" : "flex flex-col gap-4 w-full",
          direction === "horizontal" ? "animate-scroll-horizontal" : "animate-scroll-vertical"
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

