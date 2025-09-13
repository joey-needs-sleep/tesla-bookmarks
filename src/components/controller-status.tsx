"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function ControllerStatus() {
  const [isControllerConnected, setIsControllerConnected] = useState(false)

  useEffect(() => {
    const checkControllers = () => {
      const gamepads = navigator.getGamepads()
      const connected = Array.from(gamepads).some((gamepad) => gamepad !== null)
      setIsControllerConnected(connected)
    }

    // Check initially
    checkControllers()

    // Listen for controller events
    const handleGamepadConnected = () => {
      console.log("[v0] Controller connected")
      setIsControllerConnected(true)
    }

    const handleGamepadDisconnected = () => {
      console.log("[v0] Controller disconnected")
      checkControllers() // Recheck all controllers
    }

    window.addEventListener("gamepadconnected", handleGamepadConnected)
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected)

    // Poll for controller state changes
    const interval = setInterval(checkControllers, 1000)

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected)
      window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-sm border rounded-full px-3 py-2 text-sm">
      <span className="text-muted-foreground">Controller</span>
      <div
        className={cn("w-2 h-2 rounded-full transition-colors", isControllerConnected ? "bg-green-500" : "bg-red-500")}
      />
    </div>
  )
}
