import { useParams, Link } from 'react-router'
import { StoryDetail } from '../components/news/StoryDetail'

export function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const storyId = Number(id)

  if (!id || isNaN(storyId)) {
    return (
      <main className="container-main py-6">
        <div className="font-mono text-sm" style={{ color: 'var(--accent-red)' }}>[错误] 无效的文章 ID</div>
      </main>
    )
  }

  return (
    <main className="container-main py-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 font-mono text-xs transition-colors hover:underline"
        style={{ color: 'var(--text-muted)' }}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回首页
      </Link>
      <StoryDetail id={storyId} />
    </main>
  )
}
