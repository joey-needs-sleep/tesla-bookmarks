import { useState, useEffect } from 'react'

export function useColorScheme() {
  const [isDark, setIsDark] = useState(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return false
    
    // Check for saved preference first
    const saved = localStorage.getItem('color-scheme')
    if (saved) return saved === 'dark'
    
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no manual preference is saved
      const saved = localStorage.getItem('color-scheme')
      if (!saved) {
        setIsDark(e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  const toggleColorScheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    localStorage.setItem('color-scheme', newIsDark ? 'dark' : 'light')
  }

  return { isDark, toggleColorScheme }
}