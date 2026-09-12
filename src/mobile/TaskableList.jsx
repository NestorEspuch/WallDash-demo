import { useState, useEffect } from 'react'
import { useVisibilityRefresh } from '../hooks/useVisibilityRefresh'
import { useRealtimeTaskable } from '../hooks/useRealtimeTaskable'
import useConfirmDialog from '../hooks/useConfirmDialog'
import { Icon, ConfirmDialog } from '../components/ui'
import TaskableHistory from './TaskableHistory'

export default function TaskableList({ config, onEdit, onNew }) {
  const { table, fieldName, doneField, doneAtField, service, listTitle, createTitle, emptyListMessage, confirmTitle, confirmLabel, deleteConfirm } = config
  const [items, setItems] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const confirmDialog = useConfirmDialog()

  const load = async () => {
    const data = await service.fetchPending()
    setItems(data)
  }

  useEffect(() => { load() }, [])
  useRealtimeTaskable(table, load)
  useVisibilityRefresh(load)

  const handleConfirm = async () => {
    const item = confirmDialog.item
    if (!item) return
    try {
      await service.update(item.id, { [doneField]: true, [doneAtField]: new Date().toISOString() })
      load()
    } catch {}
    confirmDialog.close()
  }

  const handleDelete = async (item) => {
    if (!confirm(deleteConfirm)) return
    try {
      await service.delete(item.id)
      load()
    } catch {}
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-neum-text">{listTitle}</h2>
        <button
          onClick={onNew}
          className="w-10 h-10 rounded-full bg-neum-surface shadow-neum-sm
            active:shadow-neum-inset-sm active:scale-95 transition-[box-shadow,transform] duration-150
            flex items-center justify-center text-neum-primary"
          title={createTitle}
        >
          <Icon name="plus" className="w-5 h-5" />
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-neum-text-muted">{emptyListMessage}</p>
      )}

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-neum bg-neum-surface shadow-neum-sm p-4 flex items-center gap-3"
          >
            <button
              onClick={() => confirmDialog.open(item)}
              className="w-6 h-6 rounded-full shrink-0 bg-neum-bg shadow-neum-inset-sm
                flex items-center justify-center
                active:shadow-neum-sm active:scale-95 transition-[box-shadow,transform] duration-150"
            />
            <button
              onClick={() => onEdit(item)}
              className="flex-1 text-left min-w-0"
            >
              <h3 className="text-neum-text font-medium text-sm whitespace-pre-wrap break-words">{item[fieldName]}</h3>
              <p className="text-neum-text-muted text-xs mt-0.5">
                {formatDate(item.created_at)}
              </p>
            </button>
            <button
              onClick={() => handleDelete(item)}
              className="w-8 h-8 rounded-full shrink-0 bg-neum-surface shadow-neum-sm
                active:shadow-neum-inset-sm active:scale-95 transition-[box-shadow,transform] duration-150
                flex items-center justify-center text-red-400"
              title="Eliminar"
            >
              <Icon name="trash" className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowHistory(true)}
        className="rounded-neum bg-neum-surface shadow-neum-sm
          active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
          text-neum-text-muted text-sm px-4 py-3 text-center mt-2"
      >
        Ver historial
      </button>

      {showHistory && (
        <TaskableHistory config={config} onClose={() => setShowHistory(false)} />
      )}

      {confirmDialog.isOpen && (
        <ConfirmDialog
          title={confirmTitle}
          message={confirmDialog.item[fieldName]}
          confirmLabel={confirmLabel}
          onCancel={confirmDialog.close}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
