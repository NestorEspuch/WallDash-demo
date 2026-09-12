import { useEffect } from 'react'

export function usePeriodicRefresh(callback, intervalMs = 30000) {
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        callback()
      }
    }, intervalMs)
    return () => clearInterval(id)
  }, [])
}
