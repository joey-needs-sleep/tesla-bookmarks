"use client"

import { useCallback } from "react"

interface WebsiteMetadata {
  title: string
  favicon: string
  openGraphImage: string
  faviconColors: string[]
}

export function useLocalMetadata() {
  const fetchFavicon = useCallback(async (url: string): Promise<string> => {
    try {
      const domain = new URL(url).hostname
      // Try multiple favicon locations
      const faviconUrls = [
        `${new URL(url).origin}/favicon.ico`,
        `${new URL(url).origin}/favicon.png`,
        `${new URL(url).origin}/apple-touch-icon.png`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`, // Fallback
      ]

      for (const faviconUrl of faviconUrls) {
        try {
          const response = await fetch(faviconUrl, { mode: "no-cors" })
          if (response.ok || response.type === "opaque") {
            return faviconUrl
          }
        } catch {
          continue
        }
      }

      return "/generic-website-icon.png"
    } catch {
      return "/generic-website-icon.png"
    }
  }, [])

  const fetchOpenGraph = useCallback(async (url: string): Promise<string> => {
    try {
      const response = await fetch(url, { mode: "no-cors" })
      // Since we can't parse the HTML due to CORS, we'll use a placeholder
      // In a real implementation, you'd need a CORS proxy or server-side fetching
      const domain = new URL(url).hostname
      return `/placeholder.svg?height=200&width=400&query=${domain} website preview`
    } catch {
      return "/website-preview.png"
    }
  }, [])

  const extractFaviconColors = useCallback(async (faviconUrl: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = img.width
        canvas.height = img.height

        if (ctx) {
          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const colorCounts = new Map<string, number>()

          for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i]
            const g = imageData.data[i + 1]
            const b = imageData.data[i + 2]
            const a = imageData.data[i + 3]

            if (a > 128) {
              // Calculate saturation to prefer more vibrant colors
              const max = Math.max(r, g, b)
              const min = Math.min(r, g, b)
              const saturation = max === 0 ? 0 : (max - min) / max

              if (saturation > 0.3) {
                // Only include saturated colors
                const color = `rgb(${r}, ${g}, ${b})`
                colorCounts.set(color, (colorCounts.get(color) || 0) + 1)
              }
            }
          }

          const sortedColors = Array.from(colorCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([color]) => color)

          resolve(sortedColors.length > 0 ? sortedColors : ["#c8102e", "#f97316", "#dc2626"])
        } else {
          resolve(["#c8102e", "#f97316", "#dc2626"])
        }
      }
      img.onerror = () => resolve(["#c8102e", "#f97316", "#dc2626"])
      img.src = faviconUrl
    })
  }, [])

  const fetchWebsiteMetadata = useCallback(
    async (url: string): Promise<WebsiteMetadata> => {
      try {
        const domain = new URL(url).hostname
        const favicon = await fetchFavicon(url)
        const openGraphImage = await fetchOpenGraph(url)
        const faviconColors = await extractFaviconColors(favicon)

        return {
          title: domain.replace("www.", ""),
          favicon,
          openGraphImage,
          faviconColors,
        }
      } catch (error) {
        console.error("Failed to fetch metadata:", error)
        return {
          title: "Website",
          favicon: "/generic-website-icon.png",
          openGraphImage: "/website-preview.png",
          faviconColors: ["#c8102e", "#f97316", "#dc2626"],
        }
      }
    },
    [fetchFavicon, fetchOpenGraph, extractFaviconColors],
  )

  return { fetchWebsiteMetadata, extractFaviconColors }
}
