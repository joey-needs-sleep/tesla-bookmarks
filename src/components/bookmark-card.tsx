"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRef } from "react"

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

  const handleTouchStart = () => {
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

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
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
                  borderColor: dominantColor,
                  borderWidth: "3px",
                }
              : {
                  borderColor: dominantColor,
                  borderWidth: "2px",
                }),
          }}
        >
          <CardContent className="p-4 bg-card backdrop-blur-sm h-full relative z-10 rounded-xl">
            <div className="flex items-start justify-between mb-3">
              <img
                src={bookmark.favicon || "/placeholder.svg"}
                alt={`${bookmark.title} favicon`}
                className="w-8 h-8 rounded"
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
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
            )}
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onEdit} className="flex items-center gap-2 cursor-pointer">
          <Edit className="h-4 w-4" />
          Edit Bookmark
        </ContextMenuItem>
        <ContextMenuItem onClick={onDelete} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
          <Trash2 className="h-4 w-4" />
          Delete Bookmark
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
