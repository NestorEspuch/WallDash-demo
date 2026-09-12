import { useState, useEffect, useRef } from 'react'
import EventFormFields from './EventFormFields'
import { createEvent, updateEvent, expandRecurrence } from '../services/events'
import { todayLocalStr, localDateTimeToISO } from '../utils/dateTime'

const defaultEvent = (date) => {
  const d = date || todayLocalStr() + 'T00:00'
  const datePart = d.slice(0, 10)
  const timePart = d.slice(11, 16) || '00:00'
  const startAt = localDateTimeToISO(datePart, timePart)
  return {
    title: '',
    description: '',
    start_at: startAt,
    end_at: startAt,
    all_day: true,
    assigned_to: null,
    period_phase: null,
    recurring_type: null,
    recurring_interval: 1,
    recurring_end: null,
  }
}

export default function EventModal({ date, event, currentUserId, profiles, onClose, onSaved, onDeleted, defaultAllDay }) {
  const [form, setForm] = useState(() => {
    if (event) {
      return {
        ...event,
        color: undefined,
        recurring_type: null,
        recurring_interval: 1,
        recurring_end: null,
      }
    }
    const ev = defaultEvent(date)
    if (defaultAllDay !== undefined) ev.all_day = defaultAllDay
    const defaultProfile = currentUserId
      ? profiles.find((p) => p.id === currentUserId)
      : profiles.find((p) => p.is_familiar)
    if (defaultProfile) {
      ev.assigned_to = currentUserId || null
    }
    return ev
  })
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [showRecurrence, setShowRecurrence] = useState(false)
  const [error, setError] = useState('')

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (savingRef.current) return
    savingRef.current = true
    setError('')

    const normalized = {
      ...form,
      end_at: form.all_day ? form.start_at : form.end_at,
    }

    if (!normalized.all_day && new Date(normalized.end_at) < new Date(normalized.start_at)) {
      setError('La fecha/hora de fin no puede ser anterior a la de inicio')
      savingRef.current = false
      return
    }

    setSaving(true)

    try {
      const pick = (src) => {
        const out = {}
        const fields = ['title', 'description', 'start_at', 'end_at', 'all_day', 'assigned_to', 'period_phase']
        for (const f of fields) {
          if (src[f] !== undefined) out[f] = src[f]
        }
        if (src.recurring_group_id) out.recurring_group_id = src.recurring_group_id
        return out
      }
      if (normalized.recurring_type) {
        const expanded = expandRecurrence(normalized)
        const batchSize = 10
        for (let i = 0; i < expanded.length; i += batchSize) {
          await Promise.all(expanded.slice(i, i + batchSize).map(ev => createEvent(pick(ev))))
        }
      } else if (event?.id) {
        const data = pick(normalized)
        await updateEvent(event.id, data)
      } else {
        await createEvent(pick(normalized))
      }
      onSaved()
    } catch (err) {
      console.error('EventModal save error:', err)
      setError('Error al guardar')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form onSubmit={handleSubmit} className="relative w-full max-w-lg max-h-[90vh] rounded-neum bg-neum-surface shadow-neum flex flex-col" noValidate>
        <div className="shrink-0 px-6 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neum-text">
              {event?.id ? 'Editar evento' : 'Nuevo evento'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-neum-surface shadow-neum-sm
                active:shadow-neum-inset-sm active:scale-95 transition-[box-shadow,transform] duration-150
                flex items-center justify-center text-neum-text-muted shrink-0"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          <EventFormFields
            form={form}
            profiles={profiles}
            onChange={setForm}
            showRecurrence={showRecurrence}
            onToggleRecurrence={() => setShowRecurrence(!showRecurrence)}
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </div>

        <div className="shrink-0 px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-neum-sm bg-neum-surface shadow-neum-sm
              active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
              text-neum-text px-6 py-3 text-base"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-neum-sm bg-neum-surface shadow-neum-sm
              active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
              text-neum-primary px-8 py-3 text-lg font-medium disabled:opacity-50
              flex items-center justify-center gap-2"
          >
            {saving && <div className="w-5 h-5 rounded-full border-[3px] border-current border-t-transparent animate-spin" />}
            {saving ? 'Guardando...' : event?.id ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  )
}
