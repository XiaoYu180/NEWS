import { useStory } from '../../hooks/useStory'
import { getHostname, timeAgo } from '../../api/hn'
import { Skeleton } from '../ui/Skeleton'
import { ErrorMessage } from '../ui/ErrorMessage'
import { EmptyState } from '../ui/EmptyState'
import { CommentItem } from './CommentItem'

interface Props { id: number }

function StoryDetailSkeleton() {
  return (
    <div className="mecha-panel space-y-4 p-6">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-4"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-20" /></div>
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

export function StoryDetail({ id }: Props) {
  const { data: story, isLoading, isError, error } = useStory(id)

  if (isLoading) return <StoryDetailSkeleton />
  if (isError) return <ErrorMessage message={error?.message ?? '信号丢失'} />
  if (!story) return <EmptyState title="无数据" description="文章不存在" />

  const hostname = getHostname(story.url)

  return (
    <article>
      <div className="mecha-panel p-6">
        <h1 className="font-display text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
          {story.title}
        </h1>

        {hostname && (
          <a href={story.url} target="_blank" rel="noopener noreferrer"
            className="mt-1 inline-block font-mono text-xs transition-colors hover:underline"
            style={{ color: 'var(--text-muted)' }}>
            [来源: {hostname}]
          </a>
        )}

        <div className="mecha-divider my-4" />

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--accent-orange)' }}>作者:</span><span>{story.by}</span>
          <span style={{ color: 'var(--accent-orange)' }}>时间:</span><span>{timeAgo(story.time)}</span>
          <span style={{ color: 'var(--accent-orange)' }}>分数:</span><span style={{ color: 'var(--accent-green)' }}>{story.score}</span>
          <span style={{ color: 'var(--accent-orange)' }}>评论:</span><span style={{ color: 'var(--accent-cyan)' }}>{story.descendants ?? 0}</span>
        </div>

        {story.text && (
          <div
            className="mt-4 border-t pt-4 font-mono text-sm leading-relaxed [&_a]:underline [&_p]:my-1 [&_pre]:rounded [&_pre]:p-3 [&_pre]:border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            dangerouslySetInnerHTML={{ __html: story.text }}
          />
        )}
      </div>

      <section className="mt-8">
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
          <span style={{ color: 'var(--accent-green)' }}>{'>'}</span> 评论区
        </h2>
        {story.kids && story.kids.length > 0 ? (
          <div className="space-y-4">
            {story.kids.map((kidId) => <CommentItem key={kidId} id={kidId} />)}
          </div>
        ) : (
          <EmptyState title="暂无评论" description="来发表第一条评论吧" />
        )}
      </section>
    </article>
  )
}
