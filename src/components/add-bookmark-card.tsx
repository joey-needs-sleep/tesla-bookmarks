"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddBookmarkCardProps {
  onClick: () => void
  isGamepadFocused: boolean
}

export function AddBookmarkCard({ onClick, isGamepadFocused }: AddBookmarkCardProps) {
  return (
    <Card
      tabIndex={0}
      className={cn(
        "cursor-pointer transition-all duration-300 hover:scale-105 border-dashed border-2 min-h-[200px] rounded-xl",
        isGamepadFocused && "ring-4 ring-red-500 scale-105 shadow-2xl shadow-red-500/50",
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <CardContent className="p-4 flex items-center justify-center h-full">
        <div className="text-center">
          <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Add Bookmark</p>
        </div>
      </CardContent>
    </Card>
  )
}
