import { useState, useEffect, useCallback, useRef } from 'react'
import {
  fetchStatus,
  checkAuthStatus,
  requestAuthCode,
  verifyAuthCode,
} from '../services/roborock'

const POLL_INTERVAL = 30_000

export default function useRoborock(enabled = true) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [authMessage, setAuthMessage] = useState(null)
  const mounted = useRef(true)

  const load = useCallback(async () => {
    try {
      const data = await fetchStatus()
      if (mounted.current) {
        setStatus(data)
        setError(null)
        setNeedsAuth(false)
        setRateLimited(false)
      }
    } catch (err) {
      if (!mounted.current) return
      if (err.message.includes('428') || err.message.includes('2FA_REQUIRED')) {
        setNeedsAuth(true)
        setError(null)
      } else if (err.message.includes('503') || err.message.includes('RATE_LIMITED')) {
        setRateLimited(true)
        setError(null)
      } else {
        setError(err.message)
      }
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  const requestCode = useCallback(async () => {
    try {
      setAuthMessage(null)
      await requestAuthCode()
      if (mounted.current) setAuthMessage('Código enviado al email')
    } catch (err) {
      if (mounted.current) setAuthMessage(err.message)
    }
  }, [])

  const verifyCode = useCallback(async (code) => {
    try {
      setAuthMessage(null)
      await verifyAuthCode(code)
      if (mounted.current) {
        setNeedsAuth(false)
        setAuthMessage(null)
        setLoading(true)
        await load()
      }
    } catch (err) {
      if (mounted.current) setAuthMessage(err.message)
    }
  }, [load])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    mounted.current = true
    load()
    const interval = setInterval(load, POLL_INTERVAL)
    return () => {
      mounted.current = false
      clearInterval(interval)
    }
  }, [load, enabled])

  return { status, loading, error, refresh: load, needsAuth, rateLimited, requestCode, verifyCode, authMessage }
}
