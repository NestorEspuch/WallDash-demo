import { useState, useRef, useCallback } from 'react'
import { getTodayWeatherAdvice } from '../services/weatherAdvice'

export function useWeatherAdvice() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchingRef = useRef(false)

  const getAdvice = useCallback(async () => {
    if (fetchingRef.current) return null
    fetchingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const result = await getTodayWeatherAdvice()
      return result
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [])

  return { getAdvice, loading, error }
}
