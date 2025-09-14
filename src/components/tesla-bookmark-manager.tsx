"use client"

import { useState, useEffect, useRef } from "react"
import { SearchBar } from "./search-bar"
import { BookmarkCard } from "./bookmark-card"
import { AddBookmarkCard } from "./add-bookmark-card"
import { BookmarkDialog } from "./bookmark-dialog"
import { DebugPanel } from "./debug-panel"
import { ControllerStatus } from "./controller-status"
import { useLocalMetadata } from "../hooks/use-local-metadata"
import { useColorScheme } from "../hooks/use-color-scheme"

interface Bookmark {
  id: string
  title: string
  url: string
  favicon: string
  openGraphImage?: string
  faviconColors: string[]
  createdAt: string
}

interface GamepadState {
  connected: boolean
  focusedIndex: number
  isPressed: boolean
}

export function TeslaBookmarkManager() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)
  const [gamepadState, setGamepadState] = useState<GamepadState>({
    connected: false,
    focusedIndex: -1,
    isPressed: false,
  })
  const [debugInfo, setDebugInfo] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    url: "",
    favicon: "",
    openGraphImage: "",
  })

  const searchInputRef = useRef<HTMLInputElement>(null)
  const { fetchWebsiteMetadata } = useLocalMetadata()
  const { isDark } = useColorScheme()

  // Add gamepad deadzone tracking
  const gamepadDeadzoneRef = useRef({
    horizontalInDeadzone: true,
    verticalInDeadzone: true,
    lastMoveTime: 0,
    moveThreshold: 0.7, // Higher threshold for activation
    deadzoneThreshold: 0.3, // Must return below this to reset
    moveCooldown: 200, // Minimum time between moves in ms
  })

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tesla-bookmarks")
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved))
      } catch (error) {
        console.error("Failed to load bookmarks:", error)
      }
    }
  }, [])

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem("tesla-bookmarks", JSON.stringify(bookmarks))
  }, [bookmarks])

  // Debug info detection - enhanced to include color scheme
  useEffect(() => {
    const userAgent = navigator.userAgent
    const isTesla = userAgent.includes("Tesla") || userAgent.includes("QtWebEngine")
    const isTeslaYouTube = userAgent.includes("Tesla") && window.location.href.includes("youtube")

    setDebugInfo(`Browser: ${userAgent} | Tesla: ${isTesla} | Tesla YouTube: ${isTeslaYouTube} | Dark Mode: ${isDark}`)
  }, [isDark])

  // Gamepad support with proper debouncing
  useEffect(() => {
    let animationFrame: number
    const deadzone = gamepadDeadzoneRef.current

    const handleGamepadInput = () => {
      const gamepads = navigator.getGamepads()
      const gamepad = gamepads[0]
      const now = Date.now()

      if (gamepad) {
        setGamepadState((prev) => {
          const newState = { ...prev, connected: true }

          // Check if axes are in deadzone (close to center)
          const horizontalAxis = gamepad.axes[0]
          const verticalAxis = gamepad.axes[1]

          // Update deadzone status
          if (Math.abs(horizontalAxis) < deadzone.deadzoneThreshold) {
            deadzone.horizontalInDeadzone = true
          }
          if (Math.abs(verticalAxis) < deadzone.deadzoneThreshold) {
            deadzone.verticalInDeadzone = true
          }

          // Only process movement if we're in deadzone and enough time has passed
          const canMove = now - deadzone.lastMoveTime > deadzone.moveCooldown

          // Horizontal movement
          if (canMove && deadzone.horizontalInDeadzone) {
            if (horizontalAxis > deadzone.moveThreshold || gamepad.buttons[15]?.pressed) {
              // Right
              newState.focusedIndex = Math.min(prev.focusedIndex + 1, bookmarks.length)
              deadzone.horizontalInDeadzone = false
              deadzone.lastMoveTime = now
            } else if (horizontalAxis < -deadzone.moveThreshold || gamepad.buttons[14]?.pressed) {
              // Left
              newState.focusedIndex = Math.max(prev.focusedIndex - 1, -1)
              deadzone.horizontalInDeadzone = false
              deadzone.lastMoveTime = now
            }
          }

          // Vertical movement
          if (canMove && deadzone.verticalInDeadzone) {
            if (verticalAxis > deadzone.moveThreshold || gamepad.buttons[13]?.pressed) {
              // Down
              const cols = Math.floor((window.innerWidth - 64) / 280)
              newState.focusedIndex = Math.min(prev.focusedIndex + cols, bookmarks.length)
              deadzone.verticalInDeadzone = false
              deadzone.lastMoveTime = now
            } else if (verticalAxis < -deadzone.moveThreshold || gamepad.buttons[12]?.pressed) {
              // Up
              const cols = Math.floor((window.innerWidth - 64) / 280)
              newState.focusedIndex = Math.max(prev.focusedIndex - cols, -1)
              deadzone.verticalInDeadzone = false
              deadzone.lastMoveTime = now
            }
          }

          // A button (select)
          if (gamepad.buttons[0]?.pressed && !prev.isPressed) {
            if (newState.focusedIndex === -1) {
              searchInputRef.current?.focus()
            } else if (newState.focusedIndex === bookmarks.length) {
              setIsDialogOpen(true)
            } else if (newState.focusedIndex < bookmarks.length) {
              handleBookmarkClick(bookmarks[newState.focusedIndex])
            }
            newState.isPressed = true
          } else if (!gamepad.buttons[0]?.pressed) {
            newState.isPressed = false
          }

          return newState
        })
      } else {
        setGamepadState((prev) => ({ ...prev, connected: false }))
      }

      animationFrame = requestAnimationFrame(handleGamepadInput)
    }

    animationFrame = requestAnimationFrame(handleGamepadInput)
    return () => cancelAnimationFrame(animationFrame)
  }, [bookmarks])

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    const isUrl = searchQuery.includes(".") || searchQuery.startsWith("http")
    const targetUrl = isUrl
      ? searchQuery.startsWith("http")
        ? searchQuery
        : `https://${searchQuery}`
      : `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`

    // Redirect through YouTube redirect for Tesla compatibility
    window.location.href = `https://youtube.com/redirect?q=${encodeURIComponent(targetUrl)}`
  }

  const handleBookmarkClick = (bookmark: Bookmark) => {
    window.location.href = `https://youtube.com/redirect?q=${encodeURIComponent(bookmark.url)}`
  }

  const handleSaveBookmark = async () => {
    if (!formData.url.trim()) return

    const metadata = await fetchWebsiteMetadata(formData.url)

    const bookmark: Bookmark = {
      id: editingBookmark?.id || Date.now().toString(),
      title: formData.title.trim() || metadata.title,
      url: formData.url.startsWith("http") ? formData.url : `https://${formData.url}`,
      favicon: formData.favicon || metadata.favicon,
      openGraphImage: formData.openGraphImage || metadata.openGraphImage,
      faviconColors: metadata.faviconColors,
      createdAt: editingBookmark?.createdAt || new Date().toISOString(),
    }

    if (editingBookmark) {
      setBookmarks((prev) => prev.map((b) => (b.id === editingBookmark.id ? bookmark : b)))
    } else {
      setBookmarks((prev) => [...prev, bookmark])
    }

    setIsDialogOpen(false)
    setEditingBookmark(null)
    setFormData({ title: "", url: "", favicon: "", openGraphImage: "" })
  }

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark)
    setFormData({
      title: bookmark.title,
      url: bookmark.url,
      favicon: bookmark.favicon,
      openGraphImage: bookmark.openGraphImage || "",
    })
    setIsDialogOpen(true)
  }

  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  }

  const filteredBookmarks = bookmarks.filter(
    (bookmark) =>
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      <ControllerStatus />

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">Charge.Tube</h1>
          <p className="text-xl text-muted-foreground">Your personal bookmark manager optimized for Tesla browser</p>
        </div>

        {/* Search Bar */}
        <SearchBar
          ref={searchInputRef}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
          onSave={() => {
            if (searchQuery.trim()) {
              setFormData({ ...formData, url: searchQuery })
              setIsDialogOpen(true)
            }
          }}
          gamepadFocused={gamepadState.focusedIndex === -1 && gamepadState.connected}
        />

        {/* Bookmarks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          {filteredBookmarks.map((bookmark, index) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onClick={() => handleBookmarkClick(bookmark)}
              onEdit={() => handleEditBookmark(bookmark)}
              onDelete={() => handleDeleteBookmark(bookmark.id)}
              isGamepadFocused={gamepadState.connected && gamepadState.focusedIndex === index}
              dominantColor={bookmark.faviconColors[0] || "#c8102e"}
            />
          ))}

          {/* Add New Bookmark Card */}
          <AddBookmarkCard
            onClick={() => setIsDialogOpen(true)}
            isGamepadFocused={gamepadState.connected && gamepadState.focusedIndex === filteredBookmarks.length}
          />
        </div>

        {/* Bookmark Dialog */}
        <BookmarkDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingBookmark={editingBookmark}
          formData={formData}
          onFormDataChange={setFormData}
          onSave={handleSaveBookmark}
          onCancel={() => {
            setIsDialogOpen(false)
            setEditingBookmark(null)
            setFormData({ title: "", url: "", favicon: "", openGraphImage: "" })
          }}
        />

        {/* Debug Panel */}
        <DebugPanel
          gamepadConnected={gamepadState.connected}
          focusedIndex={gamepadState.focusedIndex}
          debugInfo={debugInfo}
        />
      </div>
    </div>
  )
}
