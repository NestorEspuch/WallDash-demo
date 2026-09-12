import { useState, useRef, useCallback } from 'react'
import { fetchForecastWithCache } from '../services/weather'
import { getCarWashAdvice } from '../services/carWashAdvice'

let cachedAdvice = null

export function useCarWashAdvice() {
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState(cachedAdvice)
  const [error, setError] = useState(null)
  const fetchingRef = useRef(false)

  const getAdvice = useCallback(async () => {
    if (fetchingRef.current) return null
    fetchingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const result = await getCarWashAdvice(fetchForecastWithCache)
      cachedAdvice = result
      setAdvice(result)
      return result
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [])

  return { getAdvice, advice, loading, error }
}
