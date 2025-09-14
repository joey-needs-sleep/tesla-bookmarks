import { useState, useEffect } from 'react'

export function useTeslaMode() {
  const [isTesla, setIsTesla] = useState(false)
  const [isEditingEnabled, setIsEditingEnabled] = useState(true)

  useEffect(() => {
    const userAgent = navigator.userAgent
    const teslaDetected = userAgent.includes("Tesla") || userAgent.includes("QtWebEngine")
    
    setIsTesla(teslaDetected)
    setIsEditingEnabled(!teslaDetected) // Disable editing in Tesla mode
  }, [])

  return {
    isTesla,
    isEditingEnabled,
    isTheatreButtonVisible: !isTesla // Hide theatre button in Tesla
  }
}