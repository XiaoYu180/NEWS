import { useState, useEffect, useRef, useMemo, useCallback, type CSSProperties, type DragEvent } from 'react'
import { createPortal } from 'react-dom'
import { newsSources } from '../api/sources'
import { SourceCard } from '../components/news/SourceCard'
import { useDailyQuote } from '../hooks/useDailyQuote'
import { useDarkMode } from '../hooks/useDarkMode'
import { useHolidays } from '../hooks/useHolidays'
import { CATEGORIES, type CategoryId } from '../types'

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
    <div className="layout-control mecha-panel flex items-center gap-2 px-3 py-2 font-mono text-xs">
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
    const missingIds = allIds.filter((id) => !validIds.includes(id))
    return validIds.length > 0 ? [...validIds, ...missingIds] : allIds
  } catch {
    return allIds
  }
}

function getDefaultSourceOrderIds(): string[] {
  return [...newsSources]
    .sort((a, b) => {
      if (a.category === b.category) return 0
      if (a.category === 'music') return 1
      if (b.category === 'music') return -1
      return 0
    })
    .map((source) => source.id)
}

function getInitialSourceOrderIds(): string[] {
  const allIds = newsSources.map((source) => source.id)
  const defaultIds = getDefaultSourceOrderIds()
  const stored = localStorage.getItem(SOURCE_ORDER_KEY)

  if (!stored) return defaultIds

  try {
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return defaultIds

    const validIds = parsed.filter((id): id is string => allIds.includes(id))
    const missingIds = defaultIds.filter((id) => !validIds.includes(id))
    return [...validIds, ...missingIds]
  } catch {
    return defaultIds
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
  onToggleBatch,
  onShowAll,
}: {
  visibleSourceIds: string[]
  onToggle: (sourceId: string) => void
  onToggleBatch: (sourceIds: string[], visible: boolean) => void
  onShowAll: () => void
}) {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<Set<CategoryId>>(new Set())
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

  const sourcesByCategory = useMemo(() => {
    const map = new Map<CategoryId, typeof newsSources>()
    for (const c of CATEGORIES) map.set(c.id, [])
    for (const s of newsSources) map.get(s.category)!.push(s)
    return map
  }, [])

  const toggleCollapse = (catId: CategoryId) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(catId)) next.delete(catId)
      else next.add(catId)
      return next
    })
  }

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
          <div className="source-select-header mb-3 flex items-center justify-between gap-3">
            <span className="source-select-title whitespace-nowrap">
              选择要展示的卡片
            </span>
            <button type="button" className="source-reset-btn" onClick={onShowAll}>
              全部
            </button>
          </div>
          <div className="source-category-list">
            {CATEGORIES.map((cat) => {
              const sources = sourcesByCategory.get(cat.id) ?? []
              const visibleCount = sources.filter((s) => visibleSourceIds.includes(s.id)).length
              const allVisible = visibleCount === sources.length
              const noneVisible = visibleCount === 0
              const isCollapsed = collapsed.has(cat.id)
              const checkboxIcon = allVisible ? '☑' : noneVisible ? '☐' : '◐'

              return (
                <div key={cat.id} className="source-category-block">
                  <div
                    className="source-category-row"
                    onClick={() => toggleCollapse(cat.id)}
                  >
                    <span
                      className={`source-category-check ${allVisible ? 'source-category-check-active' : ''} ${!allVisible && !noneVisible ? 'source-category-check-mixed' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        const ids = sources.map((s) => s.id)
                        onToggleBatch(ids, !allVisible)
                      }}
                    >
                      {checkboxIcon}
                    </span>
                    <span className="source-category-name">
                      {cat.name}
                    </span>
                    <span className="source-category-count">
                      {visibleCount}/{sources.length}
                    </span>
                    <span className={`source-category-arrow ${isCollapsed ? 'source-category-arrow-collapsed' : ''}`}>
                      ▾
                    </span>
                  </div>
                  {!isCollapsed && (
                    <div className="source-option-list">
                      {sources.map((source) => {
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
                              {active ? '☑' : '☐'}
                            </span>
                            <span className="source-toggle-dot shrink-0" style={{ background: source.color }} />
                            <span>{source.name}</span>
                          </button>
                        )
                      })}
                    </div>
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

function WeekCalendar() {
  const today = new Date()
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth()) // 0-based
  const ref = useRef<HTMLDivElement>(null)

  // Fetch only the years currently visible in the week strip or month view.
  const years = useMemo(() => {
    const y = new Set([today.getFullYear(), viewYear])
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() + mondayOffset)

    for (let i = 0; i < 7; i += 1) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      y.add(date.getFullYear())
    }

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
  const quote = useDailyQuote()
  const { dark, toggle: toggleDark } = useDarkMode()
  const [quoteTip, setQuoteTip] = useState<{ x: number; y: number } | null>(null)
  const showQuoteTip = useCallback((e: React.MouseEvent) => setQuoteTip({ x: e.clientX, y: e.clientY }), [])
  const moveQuoteTip = useCallback((e: React.MouseEvent) => setQuoteTip((prev) => (prev ? { x: e.clientX, y: e.clientY } : null)), [])
  const hideQuoteTip = useCallback(() => setQuoteTip(null), [])
  const [columnCount, setColumnCount] = useState(() => {
    const stored = localStorage.getItem('news-column-count')
    return clampColumnCount(stored ? Number(stored) : 5)
  })
  const [visibleSourceIds, setVisibleSourceIds] = useState(getInitialVisibleSourceIds)
  const [sourceOrderIds, setSourceOrderIds] = useState(getInitialSourceOrderIds)
  const [draggingSourceId, setDraggingSourceId] = useState<string | null>(null)
  const [dragOverSourceId, setDragOverSourceId] = useState<string | null>(null)
  const [dragPreview, setDragPreview] = useState<{ sourceId: string; x: number; y: number; width: number } | null>(null)

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

  const handleToggleCategory = (sourceIds: string[], visible: boolean) => {
    const nextIds = visible
      ? [...new Set([...visibleSourceIds, ...sourceIds])]
      : visibleSourceIds.filter((id) => !sourceIds.includes(id))
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

    const rect = event.currentTarget.getBoundingClientRect()
    setDragPreview({ sourceId, x: event.clientX, y: event.clientY, width: rect.width })

    const img = new Image()
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
    event.dataTransfer.setDragImage(img, 0, 0)
  }

  const handleDrag = (event: DragEvent<HTMLDivElement>) => {
    if (event.clientX === 0 && event.clientY === 0) return
    setDragPreview((current) => current ? { ...current, x: event.clientX, y: event.clientY } : current)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault()
    const draggedId = draggingSourceId ?? event.dataTransfer.getData('text/plain')

    if (!draggedId) return

    updateSourceOrderIds(moveSourceBefore(sourceOrderIds, draggedId, targetId))
    setDraggingSourceId(null)
    setDragOverSourceId(null)
    setDragPreview(null)
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
  const draggingSource = dragPreview ? sourceById.get(dragPreview.sourceId) : undefined

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="top-toolbar mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="top-left-tools flex flex-wrap items-center gap-3">
          <a
            href="https://xiaoyu180.cn"
            className="mecha-panel portfolio-link-card px-4 py-2 font-mono text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            作品集
          </a>
          <WeekCalendar />
          <div className="quote-card mecha-panel flex items-center gap-2 px-4 py-2 font-mono text-sm" style={{ color: 'var(--accent-orange)' }} title={quote?.from}>
            {!quote ? (
              <span style={{ color: 'var(--text)' }}>正在获取每日一言...</span>
            ) : (
              <>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>每日一言</span>
                <span
                  className="font-bold max-w-xs truncate cursor-default"
                  onMouseEnter={showQuoteTip}
                  onMouseMove={moveQuoteTip}
                  onMouseLeave={hideQuoteTip}
                >
                  {quote.text}
                </span>
                <span className="text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>—— {quote.from}</span>
              </>
            )}
          </div>
        </div>
        <div className="top-right-tools flex flex-wrap items-center justify-end gap-3">
          <LayoutControl columnCount={columnCount} onChange={handleColumnChange} />
          <SourceVisibilityControl
            visibleSourceIds={visibleSourceIds}
            onToggle={handleToggleSource}
            onToggleBatch={handleToggleCategory}
            onShowAll={handleShowAllSources}
          />
          <button
            type="button"
            onClick={toggleDark}
            className="mecha-btn text-xs"
            title={dark ? '切换日间模式' : '切换深夜模式'}
          >
            {dark ? '日间' : '夜间'}
          </button>
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
              onDrag={handleDrag}
              onDragEnd={() => {
                setDraggingSourceId(null)
                setDragOverSourceId(null)
                setDragPreview(null)
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

      {quoteTip && quote &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999] whitespace-pre-wrap rounded px-3 py-2 text-sm leading-relaxed shadow-lg"
            style={{
              maxWidth: 320,
              left: quoteTip.x - 160,
              top: quoteTip.y - 24,
              transform: 'translateY(-100%)',
              backgroundColor: 'var(--bg-panel)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          >
            {quote.text}
          </div>,
          document.body,
        )}

      {dragPreview && draggingSource &&
        createPortal(
          <div
            className="drag-preview-card"
            style={{
              left: dragPreview.x,
              top: dragPreview.y,
              width: Math.min(dragPreview.width, 360),
            }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: draggingSource.color }}>
                <span className="status-dot" />
              </span>
              <span className="font-semibold">{draggingSource.name}</span>
            </div>
            <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              拖动到目标位置后松开
            </div>
          </div>,
          document.body,
        )}

    </main>
  )
}
