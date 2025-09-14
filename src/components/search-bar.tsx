"use client"

import { forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Save } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onSearch: () => void
  onSave: () => void
  gamepadFocused: boolean
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ searchQuery, onSearchChange, onSearch, onSave, gamepadFocused }, ref) => {
    return (
      <div className="flex justify-center mb-8">
        <div className="relative max-w-2xl w-full">
          <div
            className={cn(
              "relative flex items-center bg-card border rounded-full p-2 transition-all duration-200",
              gamepadFocused && "ring-2 ring-red-500 shadow-lg shadow-red-500/20",
            )}
          >
            <Search className="absolute left-5 text-muted-foreground h-5 w-5 z-10" />
            <Input
              ref={ref}
              type="text"
              placeholder="Search bookmarks or enter URL..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="flex-1 pl-12 pr-40 h-14 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 touch-friendly"
            />
            <div className="absolute right-2 flex gap-2">
              <Button 
                onClick={onSearch} 
                size="lg" 
                className="h-12 px-4 rounded-full min-h-[48px] min-w-[48px] touch-friendly"
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button
                onClick={onSave}
                variant="outline"
                size="lg"
                className="h-12 px-4 rounded-full min-h-[48px] min-w-[48px] bg-transparent touch-friendly"
              >
                <Save className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

SearchBar.displayName = "SearchBar"
