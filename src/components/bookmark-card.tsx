"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRef, useState, useEffect, useMemo } from "react"
import { useTeslaMode } from "../hooks/use-tesla-mode"

interface Bookmark {
  id: string
  title: string
  url: string
  favicon: string
  openGraphImage?: string
  faviconColors: string[]
  createdAt: string
}

interface BookmarkCardProps {
  bookmark: Bookmark
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
  isGamepadFocused: boolean
  dominantColor: string
}

export function BookmarkCard({
  bookmark,
  onClick,
  onEdit,
  onDelete,
  isGamepadFocused,
  dominantColor,
}: BookmarkCardProps) {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { isEditingEnabled } = useTeslaMode()
  const [extractedColors, setExtractedColors] = useState<string[]>([])

  // Extract colors from favicon
  useEffect(() => {
    const extractFaviconColors = async () => {
      if (!bookmark.favicon) return
      
      try {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) return

          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data
          const colorMap = new Map<string, number>()

          // Sample colors from the favicon
          for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const a = data[i + 3]
            
            if (a > 128) { // Only count non-transparent pixels
              const color = `rgb(${r}, ${g}, ${b})`
              colorMap.set(color, (colorMap.get(color) || 0) + 1)
            }
          }

          // Get the most common colors
          const sortedColors = Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([color]) => color)

          setExtractedColors(sortedColors)
        }
        img.src = bookmark.favicon
      } catch (error) {
        console.log("Could not extract favicon colors:", error)
      }
    }

    extractFaviconColors()
  }, [bookmark.favicon])

  const handleTouchStart = () => {
    if (!isEditingEnabled) return
    
    longPressTimerRef.current = setTimeout(() => {
      // Long press detected - context menu will be handled by the ContextMenu component
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const cardColors = extractedColors.length > 0 ? extractedColors : bookmark.faviconColors

  // Memoize the card interior to avoid duplication
  const cardInterior = useMemo(() => {
    // Use extracted colors if available, fallback to bookmark colors, then to dominantColor
    const primaryColor = extractedColors[0] || bookmark.faviconColors[0] || dominantColor
    const secondaryColor = extractedColors[1] || bookmark.faviconColors[1] || "#f97316"
    const tertiaryColor = extractedColors[2] || bookmark.faviconColors[2] || "#c8102e"

    return (
      <Card
        tabIndex={0}
        className={cn(
          "group cursor-pointer transition-all duration-300 hover:scale-105 min-h-[200px] relative overflow-hidden rounded-2xl border-2 touch-friendly",
          isGamepadFocused && "ring-4 ring-red-500 scale-105",
        )}
        onClick={onClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onClick()
          }
        }}
        style={{
          ...(isGamepadFocused
            ? {
                borderColor: primaryColor,
                borderWidth: "3px",
                background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}10, ${tertiaryColor}10)`,
              }
            : {
                borderColor: primaryColor,
                borderWidth: "2px",
                background: `linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}08, ${tertiaryColor}08)`,
              }),
        }}
      >
        <CardContent 
          className="p-4 bg-card/95 backdrop-blur-sm h-full relative z-10 rounded-xl"
          style={{
            borderLeft: `4px solid ${primaryColor}`,
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <img
              src={bookmark.favicon || "/placeholder.svg"}
              alt={`${bookmark.title} favicon`}
              className="w-8 h-8 rounded"
              style={{
                border: `1px solid ${primaryColor}40`,
              }}
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = "/generic-website-icon.png"
              }}
            />
          </div>
          <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2">{bookmark.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{new URL(bookmark.url).hostname}</p>
          {bookmark.openGraphImage && (
            <img
              src={bookmark.openGraphImage || "/placeholder.svg"}
              alt={`${bookmark.title} preview`}
              className="w-full h-20 object-cover rounded mt-3"
              style={{
                border: `1px solid ${primaryColor}30`,
              }}
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = "none"
              }}
            />
          )}
        </CardContent>
      </Card>
    )
  }, [bookmark, onClick, isGamepadFocused, dominantColor, handleTouchStart, handleTouchEnd, extractedColors])

  // Return without context menu in Tesla mode
  if (!isEditingEnabled) {
    return cardInterior
  }

  // Return with context menu when editing is enabled
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {cardInterior}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64 p-2">
        <ContextMenuItem 
          onClick={onEdit} 
          className="flex items-center gap-3 cursor-pointer p-4 text-lg rounded-lg min-h-[56px] touch-friendly"
        >
          <Edit className="h-6 w-6" />
          Edit Bookmark
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={onDelete} 
          className="flex items-center gap-3 cursor-pointer p-4 text-lg rounded-lg min-h-[56px] touch-friendly text-destructive focus:text-destructive"
        >
          <Trash2 className="h-6 w-6" />
          Delete Bookmark
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
