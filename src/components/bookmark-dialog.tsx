"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"
import { useVirtualKeyboard } from "../hooks/use-virtual-keyboard"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

interface Bookmark {
  id: string
  title: string
  url: string
  favicon: string
  openGraphImage?: string
  faviconColors: string[]
  createdAt: string
}

interface BookmarkDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingBookmark: Bookmark | null
  formData: {
    title: string
    url: string
    favicon: string
    openGraphImage: string
  }
  onFormDataChange: (data: any) => void
  onSave: () => void
  onCancel: () => void
}

export function BookmarkDialog({
  isOpen,
  onOpenChange,
  editingBookmark,
  formData,
  onFormDataChange,
  onSave,
  onCancel,
}: BookmarkDialogProps) {
  const { isKeyboardOpen, keyboardHeight } = useVirtualKeyboard()

  // Handle Enter key submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSave()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "sm:max-w-md",
          isKeyboardOpen && "top-4 translate-y-0"
        )}
        style={{
          ...(isKeyboardOpen && {
            position: 'fixed',
            top: '1rem',
            transform: 'translateX(-50%)',
            maxHeight: `calc(100vh - ${keyboardHeight}px - 2rem)`,
            overflowY: 'auto'
          })
        }}
      >
        <DialogHeader>
          <DialogTitle>{editingBookmark ? "Edit Bookmark" : "Add New Bookmark"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4" onKeyDown={handleKeyDown}>
          <div>
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => onFormDataChange({ ...formData, url: e.target.value })}
              className="min-h-[44px]"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Website title (auto-detected if empty)"
              value={formData.title}
              onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
              className="min-h-[44px]"
            />
          </div>
          <div>
            <Label htmlFor="favicon">Favicon URL</Label>
            <Input
              id="favicon"
              placeholder="https://example.com/favicon.ico (auto-detected if empty)"
              value={formData.favicon}
              onChange={(e) => onFormDataChange({ ...formData, favicon: e.target.value })}
              className="min-h-[44px]"
            />
          </div>
          <div>
            <Label htmlFor="openGraphImage">Preview Image URL</Label>
            <Textarea
              id="openGraphImage"
              placeholder="https://example.com/preview.jpg (auto-detected if empty)"
              value={formData.openGraphImage}
              onChange={(e) => onFormDataChange({ ...formData, openGraphImage: e.target.value })}
              className="min-h-[44px]"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onSave()
                }
              }}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={onSave} className="flex-1 min-h-[56px] text-lg touch-friendly">
              <Save className="h-5 w-5 mr-2" />
              {editingBookmark ? "Update" : "Save"}
            </Button>
            <Button variant="outline" onClick={onCancel} className="min-h-[56px] px-6 bg-transparent text-lg touch-friendly">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
