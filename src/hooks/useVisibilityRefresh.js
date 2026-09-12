import { useEffect } from 'react'

export function useVisibilityRefresh(callback) {
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        callback()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])
}
