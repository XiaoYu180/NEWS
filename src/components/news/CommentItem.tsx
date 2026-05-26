import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchItem, timeAgo } from '../../api/hn'
import { Skeleton } from '../ui/Skeleton'
import type { HNComment } from '../../types'

interface Props { id: number }

function CommentContent({ text }: { text: string }) {
  return (
    <div
      className="font-mono text-sm leading-relaxed [&_a]:underline [&_p]:my-1 [&_pre]:rounded [&_pre]:p-2 [&_pre]:border"
      style={{ color: 'var(--text-muted)' }}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  )
}

function SingleComment({ id }: Props) {
  const { data: comment, isLoading } = useQuery({
    queryKey: ['comment', id],
    queryFn: () => fetchItem<HNComment>(id),
    staleTime: 300_000,
  })

  if (isLoading) {
    return (
      <div className="space-y-2 py-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
      </div>
    )
  }

  if (!comment || comment.dead || comment.deleted) return null

  return (
    <div className="border-l-2 pl-4" style={{ borderColor: 'var(--border)' }}>
      <div className="py-2">
        <p className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--accent-orange)' }}>[用户]</span>
          <span className="ml-1" style={{ color: 'var(--text)' }}>{comment.by}</span>
          <span className="mx-1" style={{ opacity: 0.3 }}>|</span>
          <span>{timeAgo(comment.time)}</span>
        </p>
        {comment.text && <CommentContent text={comment.text} />}
      </div>
      {comment.kids?.map((kidId) => (
        <div key={kidId} className="ml-2">
          <SingleComment id={kidId} />
        </div>
      ))}
    </div>
  )
}

export function CommentItem({ id }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  if (collapsed) {
    return (
      <button onClick={() => setCollapsed(false)}
        className="py-1 font-mono text-[11px] transition-colors hover:underline"
        style={{ color: 'var(--text-muted)' }}>
        展开评论
      </button>
    )
  }

  return (
    <div>
      <button onClick={() => setCollapsed(true)}
        className="mb-1 font-mono text-[11px] transition-colors hover:underline"
        style={{ color: 'var(--text-muted)' }}>
        收起评论
      </button>
      <SingleComment id={id} />
    </div>
  )
}
