interface Props {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: Props) {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-lg border p-6 text-center"
      style={{ borderColor: 'var(--accent-red)', background: 'color-mix(in srgb, var(--bg-panel) 95%, var(--accent-red))' }}
    >
      <svg className="h-8 w-8" style={{ color: 'var(--accent-red)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <p className="font-mono text-sm" style={{ color: 'var(--accent-red)' }}>
        <span style={{ color: 'var(--accent-orange)' }}>[错误]</span> {message}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="mecha-btn">
          重新连接
        </button>
      )}
    </div>
  )
}
