import { useEffect, useRef, useState } from 'react'

const DIM_TIMEOUT = 15000
const HOME_TIMEOUT = 30000
const INTERCEPTED_CLEAR_TIMEOUT = 150
const DIM_SCHEDULE_CHECK_INTERVAL = 60000

const NIGHT_DIM_START_HOUR = 22
const NIGHT_DIM_END_HOUR = 8

function isNightDimTime() {
  const hour = new Date().getHours()
  return hour >= NIGHT_DIM_START_HOUR || hour < NIGHT_DIM_END_HOUR
}

export function useScreenDimmer({ swiperRef }) {
  const resetTimersRef = useRef(null)
  const dimmedRef = useRef(false)
  const interceptedRef = useRef(false)
  const [dimmed, setDimmed] = useState(false)

  const setDimmedState = (value) => {
    dimmedRef.current = value
    setDimmed(value)
  }

  useEffect(() => {
    let dimTimer, homeTimer, scheduleChecker

    const applyDim = () => {
      if (!isNightDimTime()) return
      setDimmedState(true)
    }

    const wakeIfDaytime = () => {
      if (!dimmedRef.current || isNightDimTime()) return
      setDimmedState(false)
      resetTimersRef.current?.()
    }

    const goHome = () => {
      if (swiperRef.current) {
        swiperRef.current.slideToLoop(1, 300)
      }
      window.dispatchEvent(new CustomEvent('app-reset'))
      resetTimers()
    }

    const resetTimers = () => {
      clearTimeout(dimTimer)
      clearTimeout(homeTimer)
      dimTimer = setTimeout(applyDim, DIM_TIMEOUT)
      homeTimer = setTimeout(goHome, HOME_TIMEOUT)
    }

    resetTimersRef.current = resetTimers

    scheduleChecker = setInterval(wakeIfDaytime, DIM_SCHEDULE_CHECK_INTERVAL)

    resetTimers()

    return () => {
      clearTimeout(dimTimer)
      clearTimeout(homeTimer)
      clearInterval(scheduleChecker)
    }
  }, [swiperRef])

  useEffect(() => {
    const onActivity = () => {
      if (dimmedRef.current) return
      setDimmedState(false)
      resetTimersRef.current?.()
    }

    window.addEventListener('touchstart', onActivity)
    window.addEventListener('mousemove', onActivity)

    return () => {
      window.removeEventListener('touchstart', onActivity)
      window.removeEventListener('mousemove', onActivity)
    }
  }, [])

  useEffect(() => {
    const clearIntercepted = () => {
      interceptedRef.current = false
    }

    const intercept = (e) => {
      if (dimmedRef.current) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        setDimmedState(false)
        resetTimersRef.current?.()
        interceptedRef.current = true
        setTimeout(clearIntercepted, INTERCEPTED_CLEAR_TIMEOUT)
        return
      }

      if (interceptedRef.current) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        clearIntercepted()
      }
    }

    const options = { capture: true, passive: false }

    document.addEventListener('pointerdown', intercept, options)
    document.addEventListener('mousedown', intercept, options)
    document.addEventListener('touchstart', intercept, options)
    document.addEventListener('click', intercept, options)

    return () => {
      document.removeEventListener('pointerdown', intercept, options)
      document.removeEventListener('mousedown', intercept, options)
      document.removeEventListener('touchstart', intercept, options)
      document.removeEventListener('click', intercept, options)
    }
  }, [])

  return { dimmed }
}
