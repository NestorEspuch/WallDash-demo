import { useState, useEffect, useCallback, useMemo } from 'react'
import { NeumCard } from './ui'
import { fetchEventsOverlapping, buildColorMap } from '../services/events'
import { useProfiles } from '../contexts/ProfileContext'
import { useRealtimeEvents } from '../hooks/useRealtimeEvents'
import { useVisibilityRefresh } from '../hooks/useVisibilityRefresh'
import { usePeriodicRefresh } from '../hooks/usePeriodicRefresh'
import { MENSTRUATION_ID } from '../constants/colors'
import { getLocalDayRange, formatTime } from '../utils/dateTime'
import ScrollableList from './ScrollableList'
import EventItem from './EventItem'

export default function CalendarWidget({ onEventClick }) {
  const { profiles } = useProfiles()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const colorMap = useMemo(() => buildColorMap(profiles), [profiles])

  const loadToday = useCallback(async () => {
    const { start, end } = getLocalDayRange()
    const data = await fetchEventsOverlapping(start, end)
    setEvents(data)
    setLoading(false)
  }, [])

  const eventLabel = (e) => {
    if (e.all_day) return 'Todo el día'
    if (e.end_at) {
      const startDay = new Date(e.start_at)
      const endDay = new Date(e.end_at)
      const s = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate())
      const en = new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate())
      if (en.getTime() > s.getTime()) {
        return 'Hasta ' + endDay.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      }
    }
    return formatTime(e.start_at)
  }

  useRealtimeEvents(loadToday)
  useVisibilityRefresh(loadToday)
  usePeriodicRefresh(loadToday)

  useEffect(() => {
    loadToday()
  }, [loadToday])

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <NeumCard className="flex flex-col p-6 w-[286px] flex-1 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-neum-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="text-sm font-semibold text-neum-text capitalize">{today}</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 rounded-full border-[3px] border-neum-primary border-t-transparent animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <p className="text-neum-text-muted text-sm text-center py-8">No hay eventos para hoy</p>
      ) : (
        <ScrollableList className="flex flex-col gap-1">
          {events.filter((e) => e.assigned_to !== MENSTRUATION_ID).map((e) => (
            <EventItem key={e.id} event={e} colorMap={colorMap} onClick={onEventClick} timeLabel={eventLabel(e)} />
          ))}
        </ScrollableList>
      )}
    </NeumCard>
  )
}
