import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'dark-mode'
const DARK_START = 20 // 8pm
const DARK_END = 6    // 6am

function isNightTime(): boolean {
  const hour = new Date().getHours()
  return hour >= DARK_START || hour < DARK_END
}

function getInitial(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) return stored === 'true'
  return isNightTime()
}

export function useDarkMode() {
  const [dark, setDark] = useState(getInitial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem(STORAGE_KEY, String(dark))
  }, [dark])

  // Auto-switch based on time when user hasn't manually toggled
  useEffect(() => {
    const timer = setInterval(() => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === null) {
        setDark(isNightTime())
      }
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const toggle = useCallback(() => setDark((prev) => !prev), [])

  return { dark, toggle }
}
