import { useState, useEffect, useMemo, useCallback } from 'react'
import { buildColorMap, getColorFromMap, fetchEventsOverlapping } from '../services/events'
import { useProfiles } from '../contexts/ProfileContext'
import { useRealtimeEvents } from '../hooks/useRealtimeEvents'
import { useVisibilityRefresh } from '../hooks/useVisibilityRefresh'
import { LoadingState } from '../components/ui'
import { getLocalDayRange, formatDateTimeRange } from '../utils/dateTime'
import EventHistory from './EventHistory'

const VISIBLE_STEP = 10

export default function EventList({ user, onEdit, onNew }) {
  const { profiles } = useProfiles()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(VISIBLE_STEP)
  const [showHistory, setShowHistory] = useState(false)

  const colorMap = useMemo(() => buildColorMap(profiles), [profiles])

  const { start } = getLocalDayRange()
  const end = new Date(new Date(start).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetchEventsOverlapping(start, end)
    setEvents(data)
    setLoading(false)
  }, [start, end])

  useEffect(() => { load() }, [load])
  useRealtimeEvents(load)
  useVisibilityRefresh(load)

  const visible = events.slice(0, visibleCount)
  const remaining = events.length - visibleCount

  const renderEvent = (event, clickable = true) => (
    <div
      key={event.id}
      onClick={() => clickable && onEdit(event)}
      className={`rounded-neum bg-neum-surface shadow-neum-sm p-4 ${clickable ? 'cursor-pointer active:shadow-neum-inset-sm active:translate-y-px' : ''} transition-[box-shadow,transform] duration-150`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getColorFromMap(colorMap, event.assigned_to) }} />
        <h3 className="text-neum-text font-medium text-sm">{event.title}</h3>
      </div>
      <p className="text-neum-text-muted text-xs">
        {formatDateTimeRange(event.start_at, event.end_at, event.all_day)}
      </p>
      {event.description && (
        <p className="text-neum-text-muted text-xs mt-1 break-words">{event.description}</p>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-neum-text">Próximos eventos</h2>
        <button
          onClick={onNew}
          className="w-10 h-10 rounded-full bg-neum-surface shadow-neum-sm
            active:shadow-neum-inset-sm active:scale-95 transition-[box-shadow,transform] duration-150
            flex items-center justify-center text-neum-primary"
          title="Nuevo evento"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
      {loading ? (
        <LoadingState />
      ) : events.length === 0 ? (
        <p className="text-neum-text-muted">No hay eventos próximos.</p>
      ) : (
        visible.map((event) => renderEvent(event))
      )}

      {remaining > 0 && (
        <button
          onClick={() => setVisibleCount((c) => c + VISIBLE_STEP)}
          className="rounded-neum bg-neum-surface shadow-neum-sm
            active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
            text-neum-primary text-sm font-medium px-4 py-3 text-center"
        >
          + {remaining} eventos m&aacute;s
        </button>
      )}

      <button
        onClick={() => setShowHistory(true)}
        className="rounded-neum bg-neum-surface shadow-neum-sm
          active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
          text-neum-text-muted text-sm px-4 py-3 text-center mt-2"
      >
        Ver historial
      </button>

      {showHistory && (
        <EventHistory
          onEdit={onEdit}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  )
}
