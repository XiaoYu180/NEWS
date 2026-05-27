import { useState, useEffect } from 'react'

export interface Quote {
  text: string
  from: string
}

const CACHE_KEY = 'daily-quote'
const DATE_KEY = 'daily-quote-date'

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

export function useDailyQuote() {
  const [quote, setQuote] = useState<Quote | null>(null)

  useEffect(() => {
    let cancelled = false
    const today = getToday()

    // Use cached quote if it's still today
    const cachedDate = localStorage.getItem(DATE_KEY)
    const cachedRaw = localStorage.getItem(CACHE_KEY)
    if (cachedDate === today && cachedRaw) {
      try {
        const cached = JSON.parse(cachedRaw)
        setQuote(cached)
        return
      } catch { /* stale cache */ }
    }

    // Fetch a new quote
    fetch('https://v1.hitokoto.cn/?c=a&c=b&c=c&c=d&c=e&c=f&c=k')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const q: Quote = {
          text: data.hitokoto,
          from: data.from || '佚名',
        }
        localStorage.setItem(CACHE_KEY, JSON.stringify(q))
        localStorage.setItem(DATE_KEY, today)
        setQuote(q)
      })
      .catch(() => {
        // silent fail
      })

    return () => { cancelled = true }
  }, [])

  return quote
}
