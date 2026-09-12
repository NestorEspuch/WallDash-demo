import { useState } from 'react'
import { Modal, ModalHeader, NeumInput, NeumButton, Icon, Spinner } from './ui'

export default function TaskableFormModal({ config, item, onClose, onSaved }) {
  const { service, fieldName, editTitle, createTitle, deleteConfirm } = config
  const [value, setValue] = useState(item?.[fieldName] || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!value.trim()) return
    setSaving(true)
    try {
      if (item?.id) {
        await service.update(item.id, { [fieldName]: value.trim() })
      } else {
        await service.create({ [fieldName]: value.trim() })
      }
      onSaved()
    } catch {
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!item?.id) return
    if (!confirm(deleteConfirm)) return
    setSaving(true)
    try {
      await service.delete(item.id)
      onSaved()
    } catch {
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-neum-text">{item ? editTitle : createTitle}</h3>
          {item?.id && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              title="Eliminar"
              className="w-9 h-9 rounded-full bg-neum-surface shadow-neum-sm
                active:shadow-neum-inset-sm active:scale-95
                transition-[box-shadow,transform] duration-150 flex items-center justify-center
                text-red-400 disabled:opacity-50"
            >
              <Icon name="trash" className="w-5 h-5" />
            </button>
          )}
        </div>

        <NeumInput
          placeholder={config.inputPlaceholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          autoFocus
          className="mb-4"
        />

        <div className="flex gap-3">
          <NeumButton type="button" onClick={onClose} className="flex-1">
            Cancelar
          </NeumButton>
          <NeumButton
            type="submit"
            primary
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {saving && <Spinner size="sm" />}
            {saving ? 'Guardando...' : item ? 'Guardar' : 'Crear'}
          </NeumButton>
        </div>
      </form>
    </Modal>
  )
}
