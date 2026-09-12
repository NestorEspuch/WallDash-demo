import { getCoords, hasGps } from './geolocation'

const FALLBACK_CITY = import.meta.env.VITE_FALLBACK_CITY || 'Madrid'

const MOCK_DATA = {
  temp: 28,
  feels_like: 30,
  description: 'Soleado',
  icon: '01d',
  humidity: 45,
  wind_speed: 8,
  city: FALLBACK_CITY,
  location: 'fallback',
}

export async function fetchWeather() {
  const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY

  if (!apiKey) {
    return { ...MOCK_DATA, source: 'mock' }
  }

  const { lat, lon } = getCoords()
  const gps = hasGps()

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`
  )

  if (!res.ok) {
    throw new Error('Error al obtener el clima')
  }

  const data = await res.json()

  return {
    temp: Math.round(data.main.temp),
    feels_like: Math.round(data.main.feels_like),
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    humidity: data.main.humidity,
    wind_speed: Math.round(data.wind.speed),
    city: data.name || (gps ? 'Ubicación actual' : FALLBACK_CITY),
    location: gps ? 'gps' : 'fallback',
    source: 'api',
  }
}

export async function fetchForecast() {
  const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY

  if (!apiKey) {
    throw new Error('No hay API key configurada')
  }

  const { lat, lon } = getCoords()

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`
  )

  if (!res.ok) {
    throw new Error('Error al obtener el pronóstico')
  }

  const data = await res.json()
  const days = new Map()

  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000)
    const dateKey = date.toISOString().slice(0, 10)
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' })
    const existing = days.get(dateKey)

    const pop = item.pop || 0
    const rain = item.rain?.['3h'] || 0
    const condition = item.weather?.[0]?.main || ''
    const description = item.weather?.[0]?.description || ''
    const temp = item.main?.temp ?? 0
    const tempMax = item.main?.temp_max ?? temp
    const tempMin = item.main?.temp_min ?? temp
    const wind = item.wind?.speed ?? 0

    if (!existing) {
      days.set(dateKey, {
        date: dateKey,
        dayName,
        popMax: pop,
        rainTotal: rain,
        condition,
        description,
        tempMax,
        tempMin,
        tempSum: temp,
        tempCount: 1,
        windSum: wind,
        windCount: 1,
      })
      return
    }

    existing.popMax = Math.max(existing.popMax, pop)
    existing.rainTotal += rain
    existing.tempMax = Math.max(existing.tempMax, tempMax)
    existing.tempMin = Math.min(existing.tempMin, tempMin)
    existing.tempSum += temp
    existing.tempCount += 1
    existing.windSum += wind
    existing.windCount += 1
    if (['Thunderstorm', 'Rain', 'Snow', 'Drizzle'].includes(condition)) {
      existing.condition = condition
      existing.description = description
    }
  })

  return Array.from(days.values())
    .map((day) => ({
      ...day,
      tempAvg: Math.round(day.tempSum / day.tempCount),
      windAvg: Math.round(day.windSum / day.windCount),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

let forecastCache = null
let forecastCacheTimestamp = 0
const FORECAST_CACHE_MS = 5 * 60 * 1000

export async function fetchForecastWithCache() {
  const now = Date.now()
  if (forecastCache && now - forecastCacheTimestamp < FORECAST_CACHE_MS) {
    return forecastCache
  }

  forecastCache = await fetchForecast()
  forecastCacheTimestamp = now
  return forecastCache
}

export function clearForecastCache() {
  forecastCache = null
  forecastCacheTimestamp = 0
}
