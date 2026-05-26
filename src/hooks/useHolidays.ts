import { useState, useEffect } from 'react'

export interface HolidayData {
  holidays: Map<string, string>  // date → name
  workdays: Set<string>          // make-up work days
}

const API = 'https://cdn.jsdelivr.net/npm/chinese-days/dist/years'

function parseName(raw: string): string {
  return raw.split(',')[1] ?? ''
}

export function useHolidays(years: number[]): HolidayData {
  const [data, setData] = useState<HolidayData>({ holidays: new Map(), workdays: new Set() })

  useEffect(() => {
    let cancelled = false

    async function load() {
      const holidays = new Map<string, string>()
      const workdays = new Set<string>()

      const results = await Promise.allSettled(
        years.map((year) =>
          fetch(`${API}/${year}.json`)
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null)
        )
      )

      if (cancelled) return

      for (const r of results) {
        if (r.status !== 'fulfilled' || !r.value) continue
        const json = r.value as { holidays: Record<string, string>; workdays: Record<string, string> }
        for (const [date, val] of Object.entries(json.holidays)) {
          holidays.set(date, parseName(val))
        }
        for (const date of Object.keys(json.workdays)) {
          workdays.add(date)
        }
      }

      setData({ holidays, workdays })
    }

    load()
    return () => { cancelled = true }
  }, [years.join(',')])

  return data
}
