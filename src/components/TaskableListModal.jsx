import { useState, useEffect } from 'react'
import { useVisibilityRefresh } from '../hooks/useVisibilityRefresh'
import { useRealtimeTaskable } from '../hooks/useRealtimeTaskable'
import useConfirmDialog from '../hooks/useConfirmDialog'
import { Modal, ModalHeader, Icon, ConfirmDialog } from './ui'
import TaskableHistory from '../mobile/TaskableHistory'

export default function TaskableListModal({ config, onClose }) {
  const { table, title, fieldName, doneField, doneAtField, service, listTitle, historyTitle, confirmTitle, confirmLabel } = config
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

  return (
    <>
      <Modal className="relative max-h-[80vh] flex flex-col">
        <ModalHeader title={listTitle} onClose={onClose} />

        <div className="flex-1 overflow-y-auto max-h-[55vh]">
          <div className="flex flex-col gap-2">
            {items.length === 0 ? (
              <p className="text-neum-text-muted text-sm text-center py-4">{config.emptyListMessage}</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-start gap-2 py-1">
                  <button
                    onClick={() => confirmDialog.open(item)}
                    className="w-5 h-5 rounded-full shrink-0 mt-0.5 bg-neum-bg shadow-neum-inset-sm
                      active:shadow-neum-sm active:scale-95 transition-[box-shadow,transform] duration-150"
                  />
                  <span className="text-neum-text text-sm whitespace-pre-wrap break-words leading-snug">
                    {item[fieldName]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={() => setShowHistory(true)}
          className="w-full rounded-neum-sm bg-neum-surface shadow-neum-sm mt-4
            active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
            text-neum-text-muted text-sm px-4 py-3 text-center"
        >
          Ver historial
        </button>
      </Modal>

      {confirmDialog.isOpen && (
        <ConfirmDialog
          title={confirmTitle}
          message={confirmDialog.item[fieldName]}
          confirmLabel={confirmLabel}
          onCancel={confirmDialog.close}
          onConfirm={handleConfirm}
        />
      )}

      {showHistory && (
        <TaskableHistory config={config} onClose={() => setShowHistory(false)} />
      )}
    </>
  )
}
