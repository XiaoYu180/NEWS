export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-[var(--bg-panel)]/90 backdrop-blur" style={{ borderColor: 'var(--border)' }}>
      <div className="container-main flex items-center justify-center py-3">
        <div className="site-title">
          天下大事尽我所知
        </div>
      </div>

      <div className="mecha-divider" />
    </header>
  )
}
