"use client"

import { useEffect } from "react"

export default function ScrollAnimations() {
  useEffect(() => {
    const fadeElements = document.querySelectorAll(".fade-in")

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    fadeElements.forEach((element) => {
      observer.observe(element)
    })

    return () => {
      fadeElements.forEach((element) => {
        observer.unobserve(element)
      })
    }
  }, [])

  return null
}

