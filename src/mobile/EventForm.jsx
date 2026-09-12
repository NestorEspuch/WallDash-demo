import { useState, useEffect, useRef } from 'react'
import EventFormFields from '../components/EventFormFields'
import { useProfiles } from '../contexts/ProfileContext'
import { createEvent, updateEvent, updateEventGroup, deleteEvent, deleteEventGroup, expandRecurrence } from '../services/events'
import { Icon, Spinner } from '../components/ui'
import { todayLocalStr, isoToLocalDate, isoToLocalTime, localDateTimeToISO } from '../utils/dateTime'

export default function EventForm({ user, event, onSaved, onCancel }) {
  const { profiles } = useProfiles()
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [startDate, setStartDate] = useState(isoToLocalDate(event?.start_at) || todayLocalStr())
  const [startTime, setStartTime] = useState(isoToLocalTime(event?.start_at) || '10:00')
  const [endDate, setEndDate] = useState(isoToLocalDate(event?.end_at) || startDate)
  const [endTime, setEndTime] = useState(isoToLocalTime(event?.end_at) || '11:00')
  const [allDay, setAllDay] = useState(event?.all_day || false)
  const [assignedTo, setAssignedTo] = useState(event ? event.assigned_to : (user?.id || null))
  const [periodPhase, setPeriodPhase] = useState(event?.period_phase || null)
  const [recurringType, setRecurringType] = useState('')
  const [recurringInterval, setRecurringInterval] = useState(1)
  const [recurringEnd, setRecurringEnd] = useState(isoToLocalDate(event?.recurring_end) || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showRecurrence, setShowRecurrence] = useState(false)

  const endTimeTouched = useRef(!!event)

  useEffect(() => {
    if (event) return
    setEndDate(startDate)
    if (!endTimeTouched.current) {
      const [h, m] = startTime.split(':').map(Number)
      const endH = (h + 1) % 24
      setEndTime(`${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }, [startDate, startTime, event])

  const form = {
    title,
    description,
    start_at: allDay ? localDateTimeToISO(startDate, '00:00:00') : localDateTimeToISO(startDate, startTime),
    end_at: allDay ? null : localDateTimeToISO(endDate, endTime || '23:59'),
    all_day: allDay,
    assigned_to: assignedTo,
    period_phase: periodPhase,
    recurring_type: recurringType || null,
    recurring_interval: recurringInterval,
    recurring_end: recurringEnd ? localDateTimeToISO(recurringEnd, '23:59:59') : null,
  }

  const handleFormChange = (next) => {
    setTitle(next.title)
    setDescription(next.description)
    setAllDay(next.all_day)
    setStartDate(isoToLocalDate(next.start_at) || startDate)
    setStartTime(next.all_day ? startTime : isoToLocalTime(next.start_at) || startTime)
    setEndDate(isoToLocalDate(next.end_at) || endDate)
    setEndTime(next.all_day ? endTime : isoToLocalTime(next.end_at) || endTime)
    setAssignedTo(next.assigned_to)
    setPeriodPhase(next.period_phase)
    setRecurringType(next.recurring_type || '')
    setRecurringInterval(next.recurring_interval || 1)
    setRecurringEnd(isoToLocalDate(next.recurring_end) || '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!allDay) {
      const start = new Date(startDate + 'T' + startTime)
      const end = new Date(endDate + 'T' + endTime)
      if (end < start) {
        setError('La fecha/hora de fin no puede ser anterior a la de inicio')
        return
      }
    }

    setSaving(true)

    const start_at = allDay ? localDateTimeToISO(startDate, '00:00:00') : localDateTimeToISO(startDate, startTime)
    const end_at = allDay
      ? null
      : localDateTimeToISO(endDate || startDate, endTime || '23:59')

    const base = {
      title,
      description,
      start_at,
      end_at,
      all_day: allDay,
      assigned_to: assignedTo,
      period_phase: periodPhase,
    }

    try {
      if (recurringType) {
        const expanded = expandRecurrence({
          ...base,
          frequency: recurringType,
          interval: recurringInterval,
          recurring_end: recurringEnd ? localDateTimeToISO(recurringEnd, '23:59:59') : null,
        })
        for (const ev of expanded) {
          const { color, ...clean } = ev
          await createEvent(clean)
        }
      } else if (event?.id) {
        if (event.recurring_group_id && confirm('¿Actualizar toda la serie? OK = todas, Cancel = solo este')) {
          await updateEventGroup(event.recurring_group_id, base)
        } else {
          await updateEvent(event.id, base)
        }
      } else {
        await createEvent(base)
      }
      onSaved()
    } catch (err) {
      console.error('Error guardando evento:', err)
      setError(err.message || 'Error al guardar el evento')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!event?.id) return
    if (!confirm('¿Borrar este evento?')) return
    setSaving(true)
    try {
      if (event.recurring_group_id && confirm('¿Borrar toda la serie?')) {
        await deleteEventGroup(event.recurring_group_id)
      } else {
        await deleteEvent(event.id)
      }
      onSaved()
    } catch (err) {
      console.error('Error borrando evento:', err)
      setError(err.message || 'Error al borrar el evento')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-neum-text">
          {event ? 'Editar evento' : 'Nuevo evento'}
        </h2>
        {event?.id && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            title="Eliminar evento"
            className="w-10 h-10 rounded-full bg-neum-surface shadow-neum-sm
              active:shadow-neum-inset-sm active:scale-95
              transition-[box-shadow,transform] duration-150 flex items-center justify-center
              text-red-400 disabled:opacity-50"
          >
            <Icon name="trash" className="w-5 h-5" />
          </button>
        )}
      </div>

      <EventFormFields
        form={form}
        profiles={profiles}
        onChange={handleFormChange}
        showRecurrence={showRecurrence}
        onToggleRecurrence={() => setShowRecurrence(!showRecurrence)}
      />

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 rounded-neum-sm bg-neum-surface shadow-neum-sm
            active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
            text-neum-text px-6 py-4 text-lg disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-neum-sm bg-neum-surface shadow-neum-sm
            active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
            text-neum-primary px-6 py-4 text-lg font-medium disabled:opacity-50
            flex items-center justify-center gap-2"
        >
          {saving && <Spinner size="sm" />}
          {saving ? 'Guardando...' : event ? 'Guardar cambios' : 'Crear evento'}
        </button>
      </div>
    </form>
  )
}
