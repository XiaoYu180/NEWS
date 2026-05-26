export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-sm ${className}`}
      style={{ background: 'var(--border)' }}
    />
  )
}
