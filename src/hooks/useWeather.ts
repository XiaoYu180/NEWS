import { useState, useEffect } from 'react'

interface Weather {
  temp: number
  tempMin: number
  tempMax: number
  code: number
  city: string
  loading: boolean
  error: 'permission' | 'failed' | null
}

export function weatherEmoji(code: number): string {
  if (code <= 1) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 57) return '🌧️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 86) return '🌧️'
  return '⛈️'
}

export function weatherLabel(code: number): string {
  if (code <= 1) return '晴'
  if (code <= 3) return '多云'
  if (code <= 48) return '雾'
  if (code <= 57) return '毛毛雨'
  if (code <= 67) return '雨'
  if (code <= 77) return '雪'
  if (code <= 86) return '阵雨'
  return '雷暴'
}

async function getCoords(): Promise<{ lat: number; lon: number; city: string }> {
  // Try browser geolocation first
  if ('geolocation' in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000, maximumAge: 600000 })
      })
      const { latitude: lat, longitude: lon } = pos.coords
      let city = ''
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&accept-language=zh`,
        )
        const geoJson = await geoRes.json()
        city = geoJson.address?.city || geoJson.address?.town || geoJson.address?.county || geoJson.address?.state || ''
      } catch { /* ignore */ }
      return { lat, lon, city }
    } catch (error) {
      const geoError = error as GeolocationPositionError
      if (geoError.code === 1) {
        throw new Error('permission')
      }
      /* fall through to IP fallback */
    }
  }

  // IP-based fallback
  const ipRes = await fetch('/api/ipgeo/json/')
  const ipJson = await ipRes.json()
  return { lat: ipJson.latitude, lon: ipJson.longitude, city: ipJson.city || '' }
}

export function useWeather() {
  const [weather, setWeather] = useState<Weather>({
    temp: 0,
    tempMin: 0,
    tempMax: 0,
    code: 0,
    city: '',
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    getCoords()
      .then(async ({ lat, lon, city }) => {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
        )
        const weatherJson = await weatherRes.json()
        if (!cancelled) {
          setWeather({
            temp: Math.round(weatherJson.current.temperature_2m),
            tempMin: Math.round(weatherJson.daily.temperature_2m_min[0]),
            tempMax: Math.round(weatherJson.daily.temperature_2m_max[0]),
            code: weatherJson.current.weather_code,
            city,
            loading: false,
            error: null,
          })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setWeather((w) => ({
            ...w,
            loading: false,
            error: error instanceof Error && error.message === 'permission' ? 'permission' : 'failed',
          }))
        }
      })

    return () => { cancelled = true }
  }, [])

  return weather
}
