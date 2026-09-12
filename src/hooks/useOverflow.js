import { useState, useEffect, useRef } from 'react'

export default function useOverflow(dependency) {
  const ref = useRef(null)
  const [hasOverflow, setHasOverflow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const check = () => {
      setHasOverflow(el.scrollHeight > el.clientHeight)
    }

    check()

    const observer = new ResizeObserver(check)
    observer.observe(el)
    window.addEventListener('resize', check)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', check)
    }
  }, [dependency])

  return { ref, hasOverflow }
}
