import { useState } from 'react'
import { deleteEvent, deleteEventGroup, getEventColor } from '../services/events'
import { MENSTRUATION_ID } from '../constants/colors'
import { Modal, ModalHeader, Icon, Spinner } from './ui'
import { formatDate, formatTime } from '../utils/dateTime'

function formatPreviewDate(dateStr, allDay) {
  if (!dateStr) return ''
  const date = formatDate(dateStr)
  if (allDay) return date
  return `${date} ${formatTime(dateStr)}`
}

export default function EventPreview({ event, profiles, onClose, onEdit, onDeleted }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmRecurring, setConfirmRecurring] = useState(false)
  const [saving, setSaving] = useState(false)

  const profile = profiles.find((p) => p.id === event.assigned_to)
  const assignedName = profile?.username || 'Sin asignar'
  const color = getEventColor(event.assigned_to, profiles)

  const handleDelete = async (mode) => {
    setSaving(true)
    try {
      if (mode === 'all') {
        await deleteEventGroup(event.recurring_group_id)
      } else {
        await deleteEvent(event.id)
      }
      onDeleted()
    } catch {
    } finally {
      setSaving(false)
      setConfirmDelete(false)
      setConfirmRecurring(false)
    }
  }

  const handleFirstConfirm = () => {
    if (event.recurring_group_id) {
      setConfirmDelete(false)
      setConfirmRecurring(true)
    } else {
      handleDelete('single')
    }
  }

  return (
    <>
      <Modal className="relative max-w-lg max-h-[90vh] flex flex-col">
        <div className="shrink-0">
          <ModalHeader title={event.title || 'Sin título'} onClose={onClose} />
        </div>

        <div className="flex-1 overflow-y-auto pb-0 -mt-2">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-neum-text font-medium">{assignedName}</span>
          </div>

          <div className="mb-1">
            <span className="text-neum-text">{formatPreviewDate(event.start_at, event.all_day)}</span>
          </div>
          {!event.all_day && event.end_at && (
            <div className="mb-4">
              <span className="text-neum-text-muted">→ {formatPreviewDate(event.end_at, false)}</span>
            </div>
          )}
          {event.all_day && (
            <div className="mb-4">
              <span className="text-neum-text-muted text-sm">Todo el día</span>
            </div>
          )}

          {event.assigned_to === MENSTRUATION_ID && event.period_phase && (
            <div className="mb-4">
              <span className="text-sm font-medium text-red-400">
                {event.period_phase === 'start' ? 'Inicio de menstruación' : 'Fin de menstruación'}
              </span>
            </div>
          )}

          {event.description && (
            <div className="mb-6 p-4 rounded-neum-sm bg-neum-bg">
              <p className="text-neum-text whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {event.recurring_group_id && (
            <div className="mb-6">
              <span className="text-neum-text-muted text-sm">Evento recurrente</span>
            </div>
          )}
        </div>

        <div className="shrink-0 flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => onEdit(event)}
            className="flex-1 rounded-neum-sm bg-neum-surface shadow-neum-sm
              active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
              text-neum-primary px-6 py-3 text-base font-medium"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={saving}
            className="flex-1 rounded-neum-sm bg-neum-surface shadow-neum-sm
              active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
              text-red-400 px-6 py-3 text-base font-medium disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      </Modal>

      {confirmDelete && (
        <Modal className="text-center">
          <div className="flex justify-center mb-4 text-red-400">
            <Icon name="trash" className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-neum-text mb-2">Eliminar evento</h3>
          <p className="text-neum-text-muted mb-6">¿Estás seguro de que quieres eliminar <strong className="text-neum-text">{event.title || 'este evento'}</strong>?</p>
          <p className="text-xs text-neum-text-muted mb-6">Esta acción no se puede deshacer.</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              disabled={saving}
              className="flex-1 rounded-neum-sm bg-neum-surface shadow-neum-sm
                active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
                text-neum-text px-6 py-3 text-base"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleFirstConfirm}
              disabled={saving}
              className="flex-1 rounded-neum-sm shadow-neum-sm
                active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
                bg-red-400/20 text-red-400 px-6 py-3 text-base font-medium disabled:opacity-50
                flex items-center justify-center gap-2"
            >
              {saving && <Spinner size="sm" />}
              {saving ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
          </div>
        </Modal>
      )}

      {confirmRecurring && (
        <Modal className="text-center">
          <div className="flex justify-center mb-4 text-red-400">
            <Icon name="trash" className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-neum-text mb-2">Evento recurrente</h3>
          <p className="text-neum-text-muted mb-6">¿Eliminar toda la serie o solo este evento?</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleDelete('single')}
              disabled={saving}
              className="flex-1 rounded-neum-sm bg-neum-surface shadow-neum-sm
                active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
                text-neum-text px-4 py-3 text-sm"
            >
              Solo este
            </button>
            <button
              type="button"
              onClick={() => handleDelete('all')}
              disabled={saving}
              className="flex-1 rounded-neum-sm shadow-neum-sm
                active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
                bg-red-400/20 text-red-400 px-4 py-3 text-sm font-medium disabled:opacity-50
                flex items-center justify-center gap-2"
            >
              {saving && <Spinner size="sm" />}
              {saving ? 'Eliminando...' : 'Toda la serie'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
