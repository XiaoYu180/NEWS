import { useSearchParams } from 'react-router'
import { Link } from 'react-router'
import { useSearch } from '../hooks/useSearch'
import { timeAgo, getHostname } from '../api/hn'
import { Skeleton } from '../components/ui/Skeleton'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { EmptyState } from '../components/ui/EmptyState'

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const { data, isLoading, isError, error } = useSearch(query)

  return (
    <main className="container-main py-6">
      <h1 className="mb-2 font-display text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
        搜索：「{query}」
      </h1>
      {data && (
        <p className="mb-4 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          {'>'} 找到 {data.nbHits} 条结果
        </p>
      )}

      <div className="mecha-divider mb-4" />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mecha-panel space-y-2 p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      )}

      {isError && <ErrorMessage message={error?.message ?? '搜索失败'} />}

      {data && data.hits.length === 0 && (
        <EmptyState title="无结果" description={`未找到与「${query}」相关的内容`} />
      )}

      {data && data.hits.length > 0 && (
        <div className="space-y-3">
          {data.hits.map((hit: any) => (
            <article key={hit.objectID} className="mecha-panel p-4">
              <Link
                to={`/item/${hit.objectID}`}
                className="text-sm font-medium leading-snug transition-colors hover:underline"
                style={{ color: 'var(--text)' }}
              >
                {hit.title}
              </Link>
              {hit.url && (
                <span className="ml-2 font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  [{getHostname(hit.url)}]
                </span>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--accent-orange)' }}>作者:</span><span>{hit.author}</span>
                <span>{timeAgo(Math.floor(new Date(hit.created_at).getTime() / 1000))}</span>
                <span style={{ color: 'var(--accent-green)' }}>分:{hit.points}</span>
                <span style={{ color: 'var(--accent-cyan)' }}>评:{hit.num_comments}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
