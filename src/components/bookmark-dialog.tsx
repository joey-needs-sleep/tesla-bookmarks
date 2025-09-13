"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"

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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingBookmark ? "Edit Bookmark" : "Add New Bookmark"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => onFormDataChange({ ...formData, url: e.target.value })}
              className="min-h-[44px]"
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
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={onSave} className="flex-1 min-h-[44px]">
              <Save className="h-4 w-4 mr-2" />
              {editingBookmark ? "Update" : "Save"}
            </Button>
            <Button variant="outline" onClick={onCancel} className="min-h-[44px] bg-transparent">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
