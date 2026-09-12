export function localDateTimeToISO(dateStr, timeStr = '00:00') {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-').map(Number)
  const timeParts = timeStr.split(':').map(Number)
  const hours = timeParts[0] || 0
  const minutes = timeParts[1] || 0
  const seconds = timeParts[2] || 0
  const local = new Date(year, month - 1, day, hours, minutes, seconds)
  return local.toISOString()
}

export function isoToLocalDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isoToLocalTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(iso, allDay = false) {
  if (!iso) return ''
  const d = new Date(iso)
  if (allDay) {
    return d.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }
  return d.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTimeRange(startIso, endIso, allDay = false) {
  if (!startIso) return ''
  const start = formatDateTime(startIso, allDay)
  if (!endIso || allDay) return start
  const end = formatDateTime(endIso, false)
  return `${start} — ${end}`
}

export function getLocalDayRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

export function getLocalFutureRange(days = 60, date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0)
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

export function nowISO() {
  return new Date().toISOString()
}

export function todayLocalStr() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
