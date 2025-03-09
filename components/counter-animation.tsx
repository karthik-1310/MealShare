"use client"

import { useEffect, useRef } from "react"

export default function CounterAnimation() {
  const animationFrames = useRef<number[]>([])

  useEffect(() => {
    const animateValue = (element: Element, start: number, end: number, duration: number) => {
      let startTimestamp: number | null = null
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp
        const progress = Math.min((timestamp - startTimestamp) / duration, 1)
        const current = Math.floor(progress * (end - start) + start)
        element.textContent = `${current}+`
        if (progress < 1) {
          const frameId = window.requestAnimationFrame(step)
          animationFrames.current.push(frameId)
        }
      }
      const frameId = window.requestAnimationFrame(step)
      animationFrames.current.push(frameId)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const counters = entry.target.querySelectorAll(".counter")
          
          if (entry.isIntersecting) {
            // Start animations when entering viewport
            counters.forEach((counter) => {
              const target = Number.parseInt(counter.getAttribute("data-target") || "0")
              animateValue(counter, 0, target, 2000) // 2 seconds duration
            })
          } else {
            // Reset counters when leaving viewport
            counters.forEach((counter) => {
              counter.textContent = "0+"
            })
            // Cancel any ongoing animations
            animationFrames.current.forEach(frameId => {
              window.cancelAnimationFrame(frameId)
            })
            animationFrames.current = []
          }
        })
      },
      { threshold: 0.5 },
    )

    const statsSection = document.querySelector(".stats-section")
    if (statsSection) {
      observer.observe(statsSection)
    }

    return () => {
      observer.disconnect()
      // Cleanup any remaining animation frames
      animationFrames.current.forEach(frameId => {
        window.cancelAnimationFrame(frameId)
      })
    }
  }, [])

  return null
}

