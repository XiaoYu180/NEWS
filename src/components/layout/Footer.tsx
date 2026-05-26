export function Footer() {
  return (
    <footer className="border-t py-6 text-center" style={{ borderColor: 'var(--border)' }}>
      <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
        <span style={{ color: 'var(--accent-orange)' }}>[</span>
        新闻聚合终端 v1.0
        <span style={{ color: 'var(--accent-orange)' }}>]</span>
        {' '}— 数据源{' '}
        <span style={{ color: '#ff2d55' }}>抖音</span>
        {' + '}
        <span style={{ color: '#f97316' }}>微博</span>
        {' + '}
        <span style={{ color: '#2932e1' }}>百度</span>
        {' + '}
        <span style={{ color: '#0066ff' }}>知乎</span>
        {' + '}
        <span style={{ color: '#10b981' }}>B站</span>
        {' + '}
        <span style={{ color: '#c62f2f' }}>网易云</span>
        {' + '}
        <span style={{ color: '#31c27c' }}>QQ音乐</span>
        {' + '}
        <span style={{ color: '#6e7681' }}>GitHub</span>
        {' + '}
        <span style={{ color: '#10a37f' }}>AI动态</span>
        {' // '}
        <span style={{ opacity: 0.5 }}>系统运行正常</span>
      </p>
    </footer>
  )
}
