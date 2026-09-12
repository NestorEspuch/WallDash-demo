import { useState, useEffect } from 'react'
import { fetchWeather } from '../services/weather'

const TWO_MIN = 2 * 60 * 1000

export default function useWeather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchWeather()
        if (mounted) {
          setWeather(data)
          setError(null)
        }
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, TWO_MIN)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return { weather, loading, error }
}
