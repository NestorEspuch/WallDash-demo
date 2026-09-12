import { useState, useEffect, useCallback, useMemo } from 'react'
import { NeumCard } from './ui'
import { fetchEvents, buildColorMap } from '../services/events'
import { useProfiles } from '../contexts/ProfileContext'
import { useRealtimeEvents } from '../hooks/useRealtimeEvents'
import { useVisibilityRefresh } from '../hooks/useVisibilityRefresh'
import { usePeriodicRefresh } from '../hooks/usePeriodicRefresh'
import { MENSTRUATION_ID } from '../constants/colors'
import { getLocalFutureRange, formatTime } from '../utils/dateTime'
import ScrollableList from './ScrollableList'
import EventItem from './EventItem'

function formatEventDate(eventDateStr) {
  const eventDate = new Date(eventDateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
  const timeStr = formatTime(eventDateStr)

  if (eventDay.getTime() === tomorrow.getTime()) {
    return 'Mañana ' + timeStr
  }

  const diffDays = (eventDay - today) / (24 * 60 * 60 * 1000)
  if (diffDays < 7) {
    const weekday = eventDate.toLocaleDateString('es-ES', { weekday: 'short' })
    return weekday + ' ' + timeStr
  }

  return eventDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + ' ' + timeStr
}

function isTomorrowDate(eventDateStr) {
  const eventDate = new Date(eventDateStr)
  const now = new Date()
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
  return eventDay.getTime() === tomorrow.getTime()
}

export default function NextAppointmentsWidget({ onEventClick }) {
  const { profiles } = useProfiles()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const colorMap = useMemo(() => buildColorMap(profiles), [profiles])

  const loadNext = useCallback(async () => {
    const { start, end } = getLocalFutureRange()
    const data = await fetchEvents(start, end)
    const now = new Date()
    const upcoming = data.filter((e) => new Date(e.start_at) > now && e.assigned_to !== MENSTRUATION_ID).slice(0, 5)
    setEvents(upcoming)
    setLoading(false)
  }, [])

  useRealtimeEvents(loadNext)
  useVisibilityRefresh(loadNext)
  usePeriodicRefresh(loadNext)

  useEffect(() => {
    loadNext()
  }, [loadNext])

  if (!loading && events.length === 0) return null

  return (
    <NeumCard className="flex flex-col p-6 w-[286px] flex-1 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-neum-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="text-sm font-semibold text-neum-text">Pr&oacute;ximas citas</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 rounded-full border-[3px] border-neum-primary border-t-transparent animate-spin" />
        </div>
      ) : events.length === 0 ? null : (
        <ScrollableList className="flex flex-col gap-1">
          {events.map((e) => (
            <EventItem
              key={e.id}
              event={e}
              colorMap={colorMap}
              onClick={onEventClick}
              timeLabel={e.all_day ? 'Todo el día' : formatEventDate(e.start_at)}
              highlight={isTomorrowDate(e.start_at)}
            />
          ))}
        </ScrollableList>
      )}
    </NeumCard>
  )
}
