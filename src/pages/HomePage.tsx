import { useState, useEffect, useRef, useMemo, type CSSProperties, type DragEvent } from 'react'
import { newsSources } from '../api/sources'
import { SourceCard } from '../components/news/SourceCard'
import { useWeather, weatherEmoji, weatherLabel } from '../hooks/useWeather'
import { useHolidays } from '../hooks/useHolidays'

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const COLUMN_OPTIONS = [1, 2, 3, 4, 5, 6]
const SOURCE_VISIBILITY_KEY = 'news-visible-source-ids'
const SOURCE_ORDER_KEY = 'news-source-order-ids'

function clampColumnCount(value: number): number {
  if (!Number.isFinite(value)) return 5
  return Math.min(6, Math.max(1, Math.round(value)))
}

function LayoutControl({
  columnCount,
  onChange,
}: {
  columnCount: number
  onChange: (value: number) => void
}) {
  return (
    <div className="mecha-panel flex items-center gap-2 px-3 py-2 font-mono text-xs">
      <span className="whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
        每行列数
      </span>
      <div className="flex items-center gap-1">
        {COLUMN_OPTIONS.map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => onChange(count)}
            className={`layout-count-btn ${columnCount === count ? 'layout-count-btn-active' : ''}`}
            aria-pressed={columnCount === count}
          >
            {count}
          </button>
        ))}
      </div>
    </div>
  )
}

function getInitialVisibleSourceIds(): string[] {
  const allIds = newsSources.map((source) => source.id)
  const stored = localStorage.getItem(SOURCE_VISIBILITY_KEY)

  if (!stored) return allIds

  try {
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return allIds

    const validIds = parsed.filter((id): id is string => allIds.includes(id))
    return validIds.length > 0 ? validIds : allIds
  } catch {
    return allIds
  }
}

function getInitialSourceOrderIds(): string[] {
  const allIds = newsSources.map((source) => source.id)
  const stored = localStorage.getItem(SOURCE_ORDER_KEY)

  if (!stored) return allIds

  try {
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return allIds

    const validIds = parsed.filter((id): id is string => allIds.includes(id))
    const missingIds = allIds.filter((id) => !validIds.includes(id))
    return [...validIds, ...missingIds]
  } catch {
    return allIds
  }
}

function moveSourceBefore(sourceIds: string[], draggedId: string, targetId: string): string[] {
  if (draggedId === targetId) return sourceIds

  const withoutDragged = sourceIds.filter((id) => id !== draggedId)
  const targetIndex = withoutDragged.indexOf(targetId)

  if (targetIndex === -1) return sourceIds

  const nextIds = [...withoutDragged]
  nextIds.splice(targetIndex, 0, draggedId)
  return nextIds
}

function SourceVisibilityControl({
  visibleSourceIds,
  onToggle,
  onShowAll,
}: {
  visibleSourceIds: string[]
  onToggle: (sourceId: string) => void
  onShowAll: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selectedCount = visibleSourceIds.length

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="source-select relative font-mono text-xs">
      <button
        type="button"
        className="mecha-panel source-select-trigger flex items-center justify-between gap-3 px-3 py-2"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span>展示卡片</span>
        <span className="source-select-count">
          {selectedCount}/{newsSources.length}
        </span>
        <span className="source-select-caret">{open ? '收起' : '选择'}</span>
      </button>

      {open && (
        <div className="mecha-panel source-select-menu absolute right-0 top-full z-40 mt-2 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
              选择要展示的卡片
            </span>
            <button type="button" className="source-reset-btn" onClick={onShowAll}>
              全部
            </button>
          </div>
          <div className="space-y-1.5">
            {newsSources.map((source) => {
              const active = visibleSourceIds.includes(source.id)

              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => onToggle(source.id)}
                  className={`source-option ${active ? 'source-option-active' : ''}`}
                  aria-pressed={active}
                >
                  <span className="source-checkbox" aria-hidden="true">
                    {active ? '✓' : ''}
                  </span>
                  <span className="source-toggle-dot" style={{ background: source.color }} />
                  <span>{source.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function WeekCalendar() {
  const today = new Date()
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth()) // 0-based
  const ref = useRef<HTMLDivElement>(null)

  // Fetch holidays for viewed year + adjacent years
  const years = useMemo(() => {
    const y = new Set([today.getFullYear(), viewYear])
    y.add(viewYear - 1)
    y.add(viewYear + 1)
    return Array.from(y).sort()
  }, [viewYear])
  const { holidays: holidayMap, workdays: workdaySet } = useHolidays(years)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // --- week strip ---
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)

  // --- month grid ---
  const firstDay = new Date(viewYear, viewMonth, 1)
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // Monday=0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const goPrev = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11) }
    else setViewMonth(viewMonth - 1)
  }
  const goNext = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0) }
    else setViewMonth(viewMonth + 1)
  }

  return (
    <div ref={ref} className="relative mt-1 inline-block">
      {/* trigger — week strip */}
      <button
        onClick={() => setOpen(!open)}
        className="mecha-panel calendar-trigger flex cursor-pointer items-center gap-0.5 px-3 py-1.5 font-mono"
      >
        {Array.from({ length: 7 }, (_, i) => {
          const date = new Date(monday)
          date.setDate(monday.getDate() + i)
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          const isToday = date.toDateString() === today.toDateString()
          const holidayName = holidayMap.get(key)
          const isHoliday = !!holidayName
          const isWorkday = workdaySet.has(key)
          const isWeekend = i >= 5

          let bg = 'transparent'
          let textColor = 'var(--text)'
          let labelColor = 'var(--text-muted)'
          let title = ''

          if (isToday) {
            bg = 'var(--accent-orange)'
            textColor = '#000'
            labelColor = '#000'
          } else if (isHoliday) {
            textColor = '#ff2d55'
            labelColor = '#ff2d55'
            title = holidayName ?? ''
          } else if (isWorkday) {
            textColor = '#3f3527'
            labelColor = '#3f3527'
            title = '补班'
          } else if (isWeekend) {
            textColor = '#ff2d55'
            labelColor = '#ff2d55'
          }

          return (
            <div
              key={i}
              className={`calendar-week-day flex w-9 flex-col items-center rounded py-0.5 ${isToday ? 'calendar-day-today' : ''}`}
              style={{ backgroundColor: bg, opacity: isToday ? 1 : 0.7 }}
              title={title}
            >
              <span className="text-[9px] leading-none" style={{ color: labelColor }}>
                {WEEKDAYS[i]}
              </span>
              <span className="text-sm font-bold leading-none" style={{ color: textColor }}>
                {date.getDate()}
              </span>
              {isWorkday && (
                <span className="workday-badge text-[8px] font-bold leading-none">
                  班
                </span>
              )}
            </div>
          )
        })}
      </button>

      {/* dropdown — month view */}
      {open && (
        <div
          className="mecha-panel calendar-popover absolute left-0 top-full z-50 mt-1 p-5 font-mono"
          style={{ minWidth: 336 }}
        >
          {/* nav */}
          <div className="mb-3 flex items-center justify-between">
            <button onClick={goPrev} className="calendar-nav-btn px-2 text-lg" style={{ color: 'var(--accent-orange)' }}>
              {'<'}
            </button>
            <span className="text-base font-bold" style={{ color: 'var(--text)' }}>
              {viewYear} {MONTHS[viewMonth]}
            </span>
            <button onClick={goNext} className="calendar-nav-btn px-2 text-lg" style={{ color: 'var(--accent-orange)' }}>
              {'>'}
            </button>
          </div>

          {/* day-of-week headers */}
          <div className="mb-2 grid grid-cols-7 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* day grid */}
          <div className="grid grid-cols-7 gap-x-1.5 gap-y-1 text-center">
            {/* padding cells */}
            {Array.from({ length: startPad }, (_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {/* day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1
              const date = new Date(viewYear, viewMonth, d)
              const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
              const isToday = date.toDateString() === today.toDateString()
              const holidayName = holidayMap.get(key)
              const isHoliday = !!holidayName
              const isWorkday = workdaySet.has(key)
              const weekendIdx = (startPad + i) % 7
              const isWeekend = weekendIdx === 5 || weekendIdx === 6

              let bg = 'transparent'
              let color = 'var(--text)'
              if (isToday) { bg = 'var(--accent-orange)'; color = '#000' }
              else if (isHoliday) color = '#ff2d55'
              else if (isWorkday) color = '#3f3527'
              else if (isWeekend) color = '#ff2d55'

              return (
                <div
                  key={d}
                  className={`calendar-day flex h-12 w-9 flex-col items-center justify-center rounded leading-none ${isToday ? 'calendar-day-today' : ''}`}
                  style={{ backgroundColor: bg, color }}
                >
                  <span className="text-sm font-bold">{d}</span>
                  {isHoliday && (
                    <span className="mt-0.5 text-[10px] font-bold" style={{ color: '#ff2d55' }}>
                      {holidayName}
                    </span>
                  )}
                  {isWorkday && (
                    <span className="workday-badge mt-0.5 text-[10px] font-bold">
                      班
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function HomePage() {
  const weather = useWeather()
  const [columnCount, setColumnCount] = useState(() => {
    const stored = localStorage.getItem('news-column-count')
    return clampColumnCount(stored ? Number(stored) : 5)
  })
  const [visibleSourceIds, setVisibleSourceIds] = useState(getInitialVisibleSourceIds)
  const [sourceOrderIds, setSourceOrderIds] = useState(getInitialSourceOrderIds)
  const [draggingSourceId, setDraggingSourceId] = useState<string | null>(null)
  const [dragOverSourceId, setDragOverSourceId] = useState<string | null>(null)

  const handleColumnChange = (value: number) => {
    const next = clampColumnCount(value)
    setColumnCount(next)
    localStorage.setItem('news-column-count', String(next))
  }

  const updateVisibleSourceIds = (nextIds: string[]) => {
    setVisibleSourceIds(nextIds)
    localStorage.setItem(SOURCE_VISIBILITY_KEY, JSON.stringify(nextIds))
  }

  const handleToggleSource = (sourceId: string) => {
    const nextIds = visibleSourceIds.includes(sourceId)
      ? visibleSourceIds.filter((id) => id !== sourceId)
      : [...visibleSourceIds, sourceId]

    updateVisibleSourceIds(nextIds)
  }

  const handleShowAllSources = () => {
    updateVisibleSourceIds(newsSources.map((source) => source.id))
  }

  const updateSourceOrderIds = (nextIds: string[]) => {
    setSourceOrderIds(nextIds)
    localStorage.setItem(SOURCE_ORDER_KEY, JSON.stringify(nextIds))
  }

  const handleDragStart = (event: DragEvent<HTMLDivElement>, sourceId: string) => {
    setDraggingSourceId(sourceId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', sourceId)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault()
    const draggedId = draggingSourceId ?? event.dataTransfer.getData('text/plain')

    if (!draggedId) return

    updateSourceOrderIds(moveSourceBefore(sourceOrderIds, draggedId, targetId))
    setDraggingSourceId(null)
    setDragOverSourceId(null)
  }

  const sourceById = useMemo(
    () => new Map(newsSources.map((source) => [source.id, source])),
    [],
  )
  const visibleSources = sourceOrderIds.flatMap((sourceId) => {
    const source = sourceById.get(sourceId)
    return source && visibleSourceIds.includes(source.id) ? [source] : []
  })

  const gridStyle = {
    '--news-grid-columns': `repeat(${columnCount}, minmax(0, 1fr))`,
  } as CSSProperties

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://xiaoyu180.cn"
            className="mecha-panel portfolio-link-card px-4 py-2 font-mono text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            作品集
          </a>
          <WeekCalendar />
          <div className="mecha-panel flex items-center gap-2 px-4 py-2 font-mono text-sm" style={{ color: 'var(--accent-orange)' }}>
            {weather.loading ? (
              <span style={{ color: 'var(--text)' }}>正在努力的获取天气信息中</span>
            ) : weather.error === 'permission' ? (
              <span style={{ color: 'var(--text)' }}>未获取到权限</span>
            ) : weather.error === 'failed' ? (
              <span style={{ color: 'var(--text)' }}>未获取到天气信息</span>
            ) : (
              <>
                <span className="text-lg">{weatherEmoji(weather.code)}</span>
                <span style={{ color: 'var(--text)' }}>{weather.city || '当前位置'}</span>
                <span className="font-bold">{weather.tempMin}°~{weather.tempMax}°</span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{weatherLabel(weather.code)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <SourceVisibilityControl
            visibleSourceIds={visibleSourceIds}
            onToggle={handleToggleSource}
            onShowAll={handleShowAllSources}
          />
          <LayoutControl columnCount={columnCount} onChange={handleColumnChange} />
        </div>
      </div>

      <div className="mecha-divider mb-6" />

      {visibleSources.length > 0 ? (
        <div className="news-grid grid gap-4" style={gridStyle}>
          {visibleSources.map((source) => (
            <div
              key={source.id}
              className={[
                'draggable-source-card',
                draggingSourceId === source.id ? 'draggable-source-card-active' : '',
                draggingSourceId && dragOverSourceId === source.id && draggingSourceId !== source.id
                  ? 'draggable-source-card-over'
                  : '',
              ].filter(Boolean).join(' ')}
              draggable
              onDragStart={(event) => handleDragStart(event, source.id)}
              onDragEnd={() => {
                setDraggingSourceId(null)
                setDragOverSourceId(null)
              }}
              onDragEnter={() => {
                if (draggingSourceId && draggingSourceId !== source.id) {
                  setDragOverSourceId(source.id)
                }
              }}
              onDragOver={(event) => {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
                if (draggingSourceId && draggingSourceId !== source.id) {
                  setDragOverSourceId(source.id)
                }
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setDragOverSourceId((current) => (current === source.id ? null : current))
                }
              }}
              onDrop={(event) => handleDrop(event, source.id)}
              title="拖动卡片可调整显示顺序"
            >
              <SourceCard source={source} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mecha-panel p-6 text-center font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
          未选择任何卡片
        </div>
      )}
    </main>
  )
}
