import { useState, useEffect, useMemo } from 'react'
import { useVisibilityRefresh } from '../hooks/useVisibilityRefresh'
import { usePeriodicRefresh } from '../hooks/usePeriodicRefresh'
import { useRealtimeTaskable } from '../hooks/useRealtimeTaskable'
import useOverflow from '../hooks/useOverflow'
import useConfirmDialog from '../hooks/useConfirmDialog'
import { NeumCard, Icon, ConfirmDialog } from './ui'
import TaskableFormModal from './TaskableFormModal'
import TaskableListModal from './TaskableListModal'

export default function TaskableWidget({ config }) {
  const { table, title, fieldName, doneField, doneAtField, iconName, createTitle } = config
  const service = config.service

  const [pendingItems, setPendingItems] = useState([])
  const [doneItems, setDoneItems] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [showFullList, setShowFullList] = useState(false)
  const confirmDialog = useConfirmDialog()

  const allItems = useMemo(() => [...pendingItems, ...doneItems], [pendingItems, doneItems])

  const load = async () => {
    const [pending, done] = await Promise.all([service.fetchPending(), service.fetchDone()])
    setPendingItems(pending)
    setDoneItems(done)
  }

  useEffect(() => { load() }, [])
  useRealtimeTaskable(table, load)
  useVisibilityRefresh(load)
  usePeriodicRefresh(load)

  const { ref: listRef, hasOverflow } = useOverflow(allItems)

  const handleConfirm = async () => {
    const item = confirmDialog.item
    if (!item) return
    try {
      if (item[doneField]) {
        await service.update(item.id, { [doneField]: false, [doneAtField]: null })
      } else {
        await service.update(item.id, { [doneField]: true, [doneAtField]: new Date().toISOString() })
      }
      load()
    } catch {}
    confirmDialog.close()
  }

  const renderItem = (item) => (
    <div key={item.id} className="flex items-start gap-2">
      <button
        onClick={() => confirmDialog.open(item)}
        className={`w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center transition-[box-shadow,transform] duration-150 ${
          item[doneField]
            ? 'bg-neum-bg shadow-neum-inset-sm text-neum-primary'
            : 'bg-neum-bg shadow-neum-inset-sm active:shadow-neum-sm active:scale-95'
        }`}
      >
        {item[doneField] && <Icon name="check" className="w-3 h-3" />}
      </button>
      <button
        onClick={() => setEditingItem(item)}
        className={`text-left min-w-0 flex-1 text-sm whitespace-pre-wrap break-words leading-snug ${
          item[doneField] ? 'text-neum-text-muted line-through' : 'text-neum-text'
        }`}
      >
        {item[fieldName]}
      </button>
    </div>
  )

  const isEmpty = allItems.length === 0

  return (
    <div className="relative w-[286px]">
      <NeumCard className="absolute inset-0 flex flex-col p-6 w-full">
        <div className="flex items-center gap-2 mb-4">
          <Icon name={iconName} className="w-5 h-5 text-neum-primary shrink-0" />
          <span className="text-neum-text text-lg font-medium flex-1">{title}</span>
          <button
            onClick={() => setEditingItem({})}
            className="w-8 h-8 rounded-full bg-neum-surface shadow-neum-sm
              active:shadow-neum-inset-sm active:scale-95 transition-[box-shadow,transform] duration-150
              flex items-center justify-center text-neum-primary"
            title={createTitle}
          >
            <Icon name="plus" className="w-4 h-4" />
          </button>
        </div>

        <div ref={listRef} className="flex-1 overflow-hidden min-h-0">
          {isEmpty ? (
            <p className="text-neum-text-muted text-sm text-center py-2">
              {config.emptyMessage}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {allItems.map((item) => renderItem(item))}
            </div>
          )}
        </div>

        {hasOverflow && (
          <button
            onClick={() => setShowFullList(true)}
            className="text-neum-primary text-lg font-bold text-center mt-2 py-1 hover:underline"
          >
            ...
          </button>
        )}

        {confirmDialog.isOpen && (
          <ConfirmDialog
            title={confirmDialog.item[doneField] ? config.unconfirmTitle : config.confirmTitle}
            message={confirmDialog.item[fieldName]}
            confirmLabel={confirmDialog.item[doneField] ? config.unconfirmLabel : config.confirmLabel}
            onCancel={confirmDialog.close}
            onConfirm={handleConfirm}
          />
        )}

        {editingItem && (
          <TaskableFormModal
            config={config}
            item={editingItem.id ? editingItem : null}
            onClose={() => setEditingItem(null)}
            onSaved={() => { setEditingItem(null); load() }}
          />
        )}

        {showFullList && (
          <TaskableListModal
            config={config}
            onClose={() => setShowFullList(false)}
          />
        )}
      </NeumCard>
    </div>
  )
}
