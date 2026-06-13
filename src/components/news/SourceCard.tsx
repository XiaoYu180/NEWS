import { useState, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useSource } from '../../hooks/useSource'
import { Skeleton } from '../ui/Skeleton'
import { ErrorMessage } from '../ui/ErrorMessage'
import { EmptyState } from '../ui/EmptyState'
import type { NewsSource, UnifiedStory } from '../../types'

function LogoImage({
  src,
  label,
  size,
  fallback,
}: {
  src: string
  label: string
  size: number
  fallback: ReactNode
}) {
  const [failed, setFailed] = useState(false)

  if (failed) return <>{fallback}</>

  return (
    <img
      src={src}
      alt=""
      aria-label={label}
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      style={{ display: 'block', height: size, objectFit: 'contain', width: size }}
    />
  )
}

function SourceLogo({ sourceId, size }: { sourceId: string; size?: number }) {
  const s = size ?? 18

  switch (sourceId) {
    case 'douyin':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      )
    case 'weibo':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439l-.002.004zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.18.601l.014-.028zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.57-.18-.405-.615.375-.977.42-1.804 0-2.404-.781-1.112-2.915-1.053-5.364-.03 0 0-.766.331-.571-.271.376-1.217.315-2.224-.27-2.809-1.338-1.337-4.869.045-7.888 3.08C1.309 10.87 0 13.273 0 15.348c0 3.981 5.099 6.395 10.086 6.395 6.536 0 10.888-3.801 10.888-6.82 0-1.822-1.547-2.854-2.915-3.284v.01zm1.908-5.092c-.766-.856-1.908-1.187-2.96-.962-.436.09-.706.511-.616.932.09.42.511.691.932.602.511-.105 1.067.044 1.442.465.376.421.466.977.316 1.473-.136.406.089.856.51.992.405.119.857-.105.992-.512.33-1.021.12-2.178-.646-3.035l.03.045zm2.418-2.195c-1.576-1.757-3.905-2.419-6.054-1.968-.496.104-.812.587-.706 1.081.104.496.586.813 1.082.707 1.532-.331 3.185.15 4.296 1.383 1.112 1.246 1.429 2.943.947 4.416-.165.48.106 1.007.586 1.157.479.165.991-.104 1.157-.586.675-2.088.241-4.478-1.338-6.235l.03.045z"/>
        </svg>
      )
    case 'bilibili':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z"/>
        </svg>
      )
    case 'zhihu':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.721 0C2.251 0 0 2.25 0 5.719V18.28C0 21.751 2.252 24 5.721 24h12.56C21.751 24 24 21.75 24 18.281V5.72C24 2.249 21.75 0 18.281 0zm1.964 4.078c-.271.73-.5 1.434-.68 2.11h4.587c.545-.006.445 1.168.445 1.171H9.384a58.104 58.104 0 01-.112 3.797h2.712c.388.023.393 1.251.393 1.266H9.183a9.223 9.223 0 01-.408 2.102l.757-.604c.452.456 1.512 1.712 1.906 2.177.473.681.063 2.081.063 2.081l-2.794-3.382c-.653 2.518-1.845 3.607-1.845 3.607-.523.468-1.58.82-2.64.516 2.218-1.73 3.44-3.917 3.667-6.497H4.491c0-.015.197-1.243.806-1.266h2.71c.024-.32.086-3.254.086-3.797H6.598c-.136.406-.158.447-.268.753-.594 1.095-1.603 1.122-1.907 1.155.906-1.821 1.416-3.6 1.591-4.064.425-1.124 1.671-1.125 1.671-1.125zM13.078 6h6.377v11.33h-2.573l-2.184 1.373-.401-1.373h-1.219zm1.313 1.219v8.86h.623l.263.937 1.455-.938h1.456v-8.86z"/>
        </svg>
      )
    case 'github':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
      )
    case 'baidu':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="currentColor">
          <path d="M3.723 10.54c2.132-.47 1.838-3.07 1.777-3.639c-.104-.875-1.115-2.406-2.486-2.283c-1.723.155-1.974 2.7-1.974 2.7c-.235 1.174.557 3.687 2.683 3.22M7.68 6.172c1.176 0 2.127-1.383 2.127-3.09C9.807 1.382 8.859 0 7.683 0S5.551 1.375 5.551 3.083s.956 3.09 2.132 3.09m5.069.205c1.576.217 2.582-1.5 2.786-2.8c.204-1.29-.817-2.798-1.927-3.056c-1.12-.264-2.5 1.56-2.638 2.749c-.147 1.458.204 2.907 1.772 3.113m6.24 2.184c0-.621-.5-2.493-2.376-2.493S14.477 7.84 14.477 9.09c0 1.192.097 2.85 2.438 2.8c2.332-.059 2.077-2.7 2.077-3.324m-2.375 5.447s-2.438-1.924-3.86-3.999c-1.927-3.063-4.667-1.816-5.58-.263c-.915 1.569-2.336 2.551-2.537 2.813c-.204.259-2.94 1.766-2.33 4.516c.612 2.749 2.744 2.699 2.744 2.699s1.568.158 3.397-.258c1.83-.417 3.397.1 3.397.1s4.253 1.457 5.43-1.342c1.163-2.807-.662-4.257-.662-4.257"/>
        </svg>
      )
    case 'wangyiyun':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.046 9.388a4 4 0 0 0-.66.19c-.809.312-1.447.991-1.666 1.775a2.3 2.3 0 0 0-.074.81a1.85 1.85 0 0 0 .764 1.35a1.483 1.483 0 0 0 2.01-.286c.406-.531.355-1.183.24-1.636c-.098-.387-.22-.816-.345-1.249a65 65 0 0 1-.269-.954m-.82 10.07c-3.984 0-7.224-3.24-7.224-7.223c0-.98.226-3.02 1.884-4.822A7.2 7.2 0 0 1 9.502 5.6a.792.792 0 1 1 .587 1.472a5.62 5.62 0 0 0-2.795 2.462a5.54 5.54 0 0 0-.707 2.7a5.645 5.645 0 0 0 5.638 5.638c1.844 0 3.627-.953 4.542-2.428c1.042-1.68.772-3.931-.627-5.238a3.3 3.3 0 0 0-1.437-.777c.172.589.334 1.18.494 1.772c.284 1.12.1 2.181-.519 2.989c-.39.51-.956.888-1.592 1.064a3.04 3.04 0 0 1-2.58-.44a3.45 3.45 0 0 1-1.44-2.514c-.04-.467.002-.93.128-1.376c.35-1.256 1.356-2.339 2.622-2.826a5.5 5.5 0 0 1 .823-.246l-.134-.505c-.37-1.371.25-2.579 1.547-3.007a2.4 2.4 0 0 1 1.025-.105c.792.09 1.476.592 1.709 1.023c.258.507-.096 1.153-.706 1.153a.8.8 0 0 1-.54-.213c-.088-.08-.163-.174-.259-.247a.83.83 0 0 0-.632-.166a.81.81 0 0 0-.634.551c-.056.191-.031.406.02.595c.07.256.159.597.217.82c1.11.098 2.162.54 2.97 1.296c1.974 1.844 2.35 4.886.892 7.233c-1.197 1.93-3.509 3.177-5.889 3.177z"/>
        </svg>
      )
    case 'qqmusic':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3z"/>
        </svg>
      )
    case 'wallstreetcn':
      return (
        <LogoImage
          src="https://www.google.com/s2/favicons?domain=wallstreetcn.com&sz=64"
          label="华尔街见闻"
          size={s}
          fallback={
            <svg width={s} height={s} viewBox="0 0 24 24" role="img" aria-label="华尔街见闻">
              <rect width="24" height="24" rx="4" fill="#f59e0b" />
              <path d="M5 6h14v3H5zM5 11h9v3H5zM5 16h14v3H5z" fill="#111827" />
            </svg>
          }
        />
      )
    case 'yicai':
      return (
        <LogoImage
          src="https://www.google.com/s2/favicons?domain=yicai.com&sz=64"
          label="第一财经"
          size={s}
          fallback={
            <svg width={s} height={s} viewBox="0 0 24 24" role="img" aria-label="第一财经">
              <rect width="24" height="24" rx="4" fill="#0f766e" />
              <path d="M6 6h12v3H6zM6 10.5h7v3H6zM6 15h12v3H6z" fill="#fff7d6" />
            </svg>
          }
        />
      )
    case 'aihot':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
        </svg>
      )
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      )
  }
}

function CompactStory({ story, index }: { story: UnifiedStory; index: number }) {
  const rank = index + 1
  const isExternal = story.detailUrl.startsWith('http')
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null)

  const showTip = useCallback((e: React.MouseEvent) => {
    setTip({ x: e.clientX, y: e.clientY })
  }, [])
  const moveTip = useCallback((e: React.MouseEvent) => {
    setTip((prev) => (prev ? { x: e.clientX, y: e.clientY } : null))
  }, [])
  const hideTip = useCallback(() => setTip(null), [])

  return (
    <li className="intel-row">
      <div className="flex items-start gap-3">
        <span className="intel-rank mt-0.5 shrink-0">
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <a
            href={story.detailUrl}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="intel-title hover:underline"
            onMouseEnter={showTip}
            onMouseMove={moveTip}
            onMouseLeave={hideTip}
          >
            {story.title}
          </a>
        </div>
      </div>
      {tip &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999] whitespace-normal rounded px-3 py-2 text-xs leading-relaxed shadow-lg"
            style={{
              width: 240,
              left: tip.x - 120,
              top: tip.y - 40,
              transform: 'translateY(-100%)',
              backgroundColor: 'var(--bg-panel)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          >
            {story.title}
          </div>,
          document.body,
        )}
    </li>
  )
}

function SourceCardSkeleton({ color }: { color: string }) {
  return (
    <div className="mecha-panel intel-card p-3 flex h-full flex-col">
      <div className="mb-2 flex items-center gap-2">
        <span className="status-dot" style={{ color }} />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="intel-list max-h-[500px] overflow-y-auto pr-1">
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-1.5 border-b pb-2.5 last:border-0" style={{ borderColor: 'var(--border)' }}>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SourceCard({ source }: { source: NewsSource }) {
  const { data, isLoading, isError, error } = useSource(source)

  if (isLoading) return <SourceCardSkeleton color={source.color} />

  return (
    <div className="mecha-panel intel-card p-3 flex h-full flex-col">
      <div className="mb-2 flex items-center gap-2">
        <span style={{ color: source.color }}>
          <SourceLogo sourceId={source.id} size={18} />
        </span>
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <h2 className="shrink-0 font-display text-sm font-semibold" style={{ color: 'var(--text)' }}>
            {source.name}
          </h2>
          <span className="truncate font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {source.description}
          </span>
        </div>
      </div>

      <div className="mecha-divider mb-2" />

      {isError ? (
        <ErrorMessage message={error?.message ?? '连接失败'} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="暂无信号" />
      ) : (
        <div className="intel-list max-h-[500px] min-h-0 flex-1 overflow-y-auto pr-1">
          <ul className="space-y-3.5">
            {data.map((story, i) => (
              <CompactStory key={`${source.id}-${story.id}`} story={story} index={i} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
