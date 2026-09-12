import { useState, useEffect, useCallback } from 'react'
import { Modal, ModalHeader, Icon, LoadingState, EmptyState } from '../components/ui'

export default function TaskableHistory({ config, onClose }) {
  const { service, fieldName, doneField, doneAtField, historyTitle, emptyHistoryMessage } = config
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await service.fetchDone()
    setItems(data)
    setLoading(false)
  }, [service])

  useEffect(() => { load() }, [load])

  const handleReopen = async (item) => {
    try {
      await service.update(item.id, {
        [doneField]: false,
        [doneAtField]: null,
        created_at: new Date().toISOString(),
      })
      load()
    } catch {}
  }

  const handleDelete = async (item) => {
    if (!confirm(config.deleteConfirm)) return
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
    <Modal className="relative max-w-lg max-h-[90vh] overflow-y-auto">
      <ModalHeader title={historyTitle} onClose={onClose} />

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState>{emptyHistoryMessage}</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-neum bg-neum-surface shadow-neum-sm p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-neum-text font-medium text-sm whitespace-pre-wrap break-words">{item[fieldName]}</h3>
                  <p className="text-neum-text-muted text-xs mt-0.5">
                    Hecha {formatDate(item[doneAtField])}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleReopen(item)}
                    className="w-8 h-8 rounded-full bg-neum-surface shadow-neum-sm
                      active:shadow-neum-inset-sm transition-shadow duration-150
                      flex items-center justify-center text-neum-primary text-sm"
                    title="Reabrir"
                  >
                    <Icon name="check" className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="w-8 h-8 rounded-full bg-neum-surface shadow-neum-sm
                      active:shadow-neum-inset-sm transition-shadow duration-150
                      flex items-center justify-center text-red-400 text-sm"
                    title="Eliminar"
                  >
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
