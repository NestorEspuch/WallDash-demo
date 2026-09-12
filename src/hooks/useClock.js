import { useState, useEffect } from 'react'

export default function useClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const date = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(now)

  const time = new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit', minute: '2-digit',
  }).format(now)

  return { date, time }
}
