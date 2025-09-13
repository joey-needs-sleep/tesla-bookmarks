"use client"

import { cn } from "@/lib/utils"

interface DebugPanelProps {
  gamepadConnected: boolean
  focusedIndex: number
  debugInfo: string
}

export function DebugPanel({ gamepadConnected, focusedIndex, debugInfo }: DebugPanelProps) {
  return (
    <div className="fixed bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 text-xs text-muted-foreground max-w-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className={cn("w-2 h-2 rounded-full", gamepadConnected ? "bg-green-500" : "bg-red-500")} />
        <span>Controller: {gamepadConnected ? "Connected" : "Disconnected"}</span>
      </div>
      <div>Focus: {focusedIndex}</div>
      <div className="mt-2 break-all">{debugInfo}</div>
    </div>
  )
}
