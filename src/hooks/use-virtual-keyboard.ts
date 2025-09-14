import { useState, useEffect } from 'react'

export function useVirtualKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const initialViewportHeight = window.visualViewport?.height || window.innerHeight
    let lastViewportHeight = initialViewportHeight

    const handleResize = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight
      const heightDifference = initialViewportHeight - currentHeight
      
      // Consider keyboard open if viewport shrunk by more than 150px
      const isOpen = heightDifference > 150
      
      setIsKeyboardOpen(isOpen)
      setKeyboardHeight(isOpen ? heightDifference : 0)
      lastViewportHeight = currentHeight
    }

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        // Small delay to allow keyboard to open
        setTimeout(() => {
          handleResize()
        }, 300)
      }
    }

    const handleFocusOut = () => {
      // Small delay to allow keyboard to close
      setTimeout(() => {
        handleResize()
      }, 300)
    }

    // Listen to visual viewport changes (better for mobile/Tesla browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    } else {
      // Fallback for browsers without visual viewport support
      window.addEventListener('resize', handleResize)
    }

    // Also listen to focus events as backup
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      } else {
        window.removeEventListener('resize', handleResize)
      }
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [])

  return { isKeyboardOpen, keyboardHeight }
}