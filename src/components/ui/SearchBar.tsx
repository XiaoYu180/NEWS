import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router'

interface Props {
  initialQuery?: string
  compact?: boolean
}

export function SearchBar({ initialQuery = '', compact = false }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const navigate = useNavigate()

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = query.trim()
      if (trimmed) {
        navigate(`/search?q=${encodeURIComponent(trimmed)}`)
      }
    },
    [query, navigate],
  )

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="> 搜索新闻..."
        className={`mecha-input ${compact ? 'py-1.5 text-xs' : 'py-2 text-sm'}`}
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 transition-colors"
        style={{ color: 'var(--text-muted)' }}
        aria-label="搜索"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  )
}
