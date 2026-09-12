import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchPastEvents, deleteEvent, deleteEventGroup, buildColorMap, getColorFromMap } from '../services/events'
import { useProfiles } from '../contexts/ProfileContext'
import { MENSTRUATION_ID } from '../constants/colors'
import { formatDateTimeRange } from '../utils/dateTime'

export default function EventHistory({ onEdit, onClose }) {
  const { profiles } = useProfiles()
  const [events, setEvents] = useState([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [assignedTo, setAssignedTo] = useState(undefined)
  const [loading, setLoading] = useState(true)

  const colorMap = useMemo(() => buildColorMap(profiles), [profiles])

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetchPastEvents({ dateFrom, dateTo, assignedTo })
    setEvents(data)
    setLoading(false)
  }, [dateFrom, dateTo, assignedTo])

  useEffect(() => { load() }, [load])

  const handleDelete = async (event) => {
    if (!confirm('¿Borrar este evento?')) return
    try {
      if (event.recurring_group_id && confirm('¿Borrar toda la serie?')) {
        await deleteEventGroup(event.recurring_group_id)
      } else {
        await deleteEvent(event.id)
      }
      load()
    } catch {}
  }

  const assigneeOptions = [
    { value: '', label: 'Todos' },
    { value: 'null', label: 'Familiar' },
    { value: MENSTRUATION_ID, label: 'Menstruación' },
    ...profiles.filter((p) => !p.is_familiar && !p.is_menstruation).map((p) => ({ value: p.id, label: p.username })),
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-neum bg-neum-surface shadow-neum p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neum-text">Historial de eventos</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neum-surface shadow-neum-sm
              active:shadow-neum-inset-sm transition-shadow duration-150
              flex items-center justify-center text-neum-text-muted text-lg"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-neum-text-muted text-xs block mb-1">Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-neum-sm bg-neum-bg shadow-neum-inset-sm
                  px-3 py-2 text-neum-text text-sm focus:outline-none focus:ring-2 focus:ring-neum-primary-light"
              />
            </div>
            <div className="flex-1">
              <label className="text-neum-text-muted text-xs block mb-1">Hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-neum-sm bg-neum-bg shadow-neum-inset-sm
                  px-3 py-2 text-neum-text text-sm focus:outline-none focus:ring-2 focus:ring-neum-primary-light"
              />
            </div>
          </div>
          <select
            value={assignedTo === undefined ? '' : assignedTo === null ? 'null' : assignedTo}
            onChange={(e) => {
              const v = e.target.value
              setAssignedTo(v === '' ? undefined : v === 'null' ? null : v)
            }}
            className="w-full rounded-neum-sm bg-neum-bg shadow-neum-inset-sm
              px-3 py-2 text-neum-text text-sm focus:outline-none focus:ring-2 focus:ring-neum-primary-light"
          >
            {assigneeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 rounded-full border-[3px] border-neum-primary border-t-transparent animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-neum-text-muted text-center py-8">No hay eventos pasados con estos filtros.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {events.map((event) => (
              <div key={event.id} className="rounded-neum bg-neum-surface shadow-neum-sm p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getColorFromMap(colorMap, event.assigned_to) }} />
                      <h3 className="text-neum-text font-medium text-sm truncate">{event.title}</h3>
                    </div>
                    <p className="text-neum-text-muted text-xs">
                      {formatDateTimeRange(event.start_at, event.end_at, event.all_day)}
                    </p>
                    {event.description && (
                      <p className="text-neum-text-muted text-xs mt-1 truncate">{event.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => onEdit(event)}
                      className="w-8 h-8 rounded-full bg-neum-surface shadow-neum-sm
                        active:shadow-neum-inset-sm transition-shadow duration-150
                        flex items-center justify-center text-neum-primary text-sm"
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(event) }}
                      className="w-8 h-8 rounded-full bg-neum-surface shadow-neum-sm
                        active:shadow-neum-inset-sm transition-shadow duration-150
                        flex items-center justify-center text-red-400 text-sm"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
