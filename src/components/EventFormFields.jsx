import UserDropdown from './UserDropdown'
import { MENSTRUATION_ID } from '../constants/colors'
import { getEventColor } from '../services/events'
import { isoToLocalDate, isoToLocalTime, localDateTimeToISO } from '../utils/dateTime'

const RECURRENCE_TYPES = [
  { value: null, label: 'No repetir' },
  { value: 'daily', label: 'Cada día' },
  { value: 'weekly', label: 'Cada semana' },
  { value: 'monthly', label: 'Cada mes' },
  { value: 'yearly', label: 'Cada año' },
]

export default function EventFormFields({ form, profiles, onChange, showRecurrence, onToggleRecurrence }) {
  const startDate = isoToLocalDate(form.start_at)
  const endDate = isoToLocalDate(form.end_at)
  const startTime = form.all_day ? '' : isoToLocalTime(form.start_at)
  const endTime = form.all_day ? '' : isoToLocalTime(form.end_at)

  const update = (field, value) => onChange({ ...form, [field]: value })

  const handleAssignedChange = (id) => {
    onChange({
      ...form,
      assigned_to: id,
      period_phase: id === MENSTRUATION_ID ? form.period_phase : null,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        placeholder="Título"
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
        required
        className="w-full rounded-neum-sm bg-neum-bg shadow-neum-inset-sm
          px-4 py-3 text-neum-text placeholder-neum-text-muted
          focus:outline-none focus:ring-2 focus:ring-neum-primary-light transition-shadow"
      />

      <textarea
        placeholder="Descripción (opcional)"
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
        rows={3}
        className="w-full rounded-neum-sm bg-neum-bg shadow-neum-inset-sm
          px-4 py-3 text-neum-text placeholder-neum-text-muted resize-none
          focus:outline-none focus:ring-2 focus:ring-neum-primary-light transition-shadow"
      />

      <div className="flex items-center gap-3">
        <label className="text-neum-text">¿Todo el día?</label>
        <button
          type="button"
          onClick={() => update('all_day', !form.all_day)}
          className={`w-12 h-6 rounded-full transition-colors relative
            ${form.all_day ? 'bg-neum-primary' : 'bg-neum-text-muted'}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-[left] duration-150
            ${form.all_day ? 'left-7' : 'left-0.5'}`} />
        </button>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-neum-text-muted text-xs block mb-1">Fecha inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => update('start_at', localDateTimeToISO(e.target.value, form.all_day ? '00:00' : startTime || '00:00'))}
            className="w-full rounded-neum-sm bg-neum-bg shadow-neum-inset-sm
              px-4 py-3 text-neum-text focus:outline-none focus:ring-2 focus:ring-neum-primary-light transition-shadow"
          />
        </div>
        {!form.all_day && (
          <div className="flex-1">
            <label className="text-neum-text-muted text-xs block mb-1">Hora inicio</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => update('start_at', localDateTimeToISO(startDate, e.target.value))}
              className="w-full rounded-neum-sm bg-neum-bg shadow-neum-inset-sm
                px-4 py-3 text-neum-text focus:outline-none focus:ring-2 focus:ring-neum-primary-light transition-shadow"
            />
          </div>
        )}
      </div>

      {!form.all_day && (
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-neum-text-muted text-xs block mb-1">Fecha fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => update('end_at', localDateTimeToISO(e.target.value, endTime || '23:59'))}
              className="w-full rounded-neum-sm bg-neum-bg shadow-neum-inset-sm
                px-4 py-3 text-neum-text focus:outline-none focus:ring-2 focus:ring-neum-primary-light transition-shadow"
            />
          </div>
          <div className="flex-1">
            <label className="text-neum-text-muted text-xs block mb-1">Hora fin</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => update('end_at', localDateTimeToISO(endDate, e.target.value))}
              className="w-full rounded-neum-sm bg-neum-bg shadow-neum-inset-sm
                px-4 py-3 text-neum-text focus:outline-none focus:ring-2 focus:ring-neum-primary-light transition-shadow"
            />
          </div>
        </div>
      )}

      <div>
        <label className="text-neum-text-muted text-xs block mb-2">Asignado a</label>
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 rounded-full shrink-0" style={{ backgroundColor: getEventColor(form.assigned_to, profiles) }} />
          <UserDropdown value={form.assigned_to} onChange={handleAssignedChange} className="flex-1" />
        </div>
      </div>

      {form.assigned_to === MENSTRUATION_ID && (
        <div>
          <label className="text-neum-text-muted text-xs block mb-1">Fase</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onChange({ ...form, period_phase: 'start', title: 'MENST - Inicio' })}
              className={`flex-1 px-4 py-3 rounded-neum-sm transition-[box-shadow,background-color,color] duration-150 text-base
                ${form.period_phase === 'start'
                  ? 'shadow-neum-inset-sm bg-neum-bg text-neum-text'
                  : 'shadow-neum-sm bg-neum-surface text-neum-text-muted'
                }`}
            >
              Inicio
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...form, period_phase: 'end', title: 'MENST - Fin' })}
              className={`flex-1 px-4 py-3 rounded-neum-sm transition-[box-shadow,background-color,color] duration-150 text-base
                ${form.period_phase === 'end'
                  ? 'shadow-neum-inset-sm bg-neum-bg text-neum-text'
                  : 'shadow-neum-sm bg-neum-surface text-neum-text-muted'
                }`}
            >
              Fin
            </button>
          </div>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={onToggleRecurrence}
          className="text-neum-primary text-sm hover:underline"
        >
          {showRecurrence ? 'Ocultar recurrencia' : 'Añadir recurrencia'}
        </button>
      </div>

      {showRecurrence && (
        <div className="flex flex-col gap-3 p-4 rounded-neum-sm bg-neum-bg">
          <select
            value={form.recurring_type || ''}
            onChange={(e) => update('recurring_type', e.target.value || null)}
            className="w-full rounded-neum-sm bg-neum-surface shadow-neum-inset-sm
              px-4 py-3 text-neum-text focus:outline-none"
          >
            {RECURRENCE_TYPES.map((t) => (
              <option key={t.value} value={t.value || ''}>{t.label}</option>
            ))}
          </select>

          {form.recurring_type && (
            <>
              <div>
                <label className="text-neum-text-muted text-xs block mb-1">Cada</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={form.recurring_interval}
                  onChange={(e) => update('recurring_interval', parseInt(e.target.value) || 1)}
                  className="w-full rounded-neum-sm bg-neum-surface shadow-neum-inset-sm
                    px-4 py-3 text-neum-text focus:outline-none"
                />
              </div>
              <div>
                <label className="text-neum-text-muted text-xs block mb-1">Hasta (opcional)</label>
                <input
                  type="date"
                  value={isoToLocalDate(form.recurring_end)}
                  onChange={(e) => update('recurring_end', e.target.value ? localDateTimeToISO(e.target.value, '23:59:59') : null)}
                  className="w-full rounded-neum-sm bg-neum-surface shadow-neum-inset-sm
                    px-4 py-3 text-neum-text focus:outline-none"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
