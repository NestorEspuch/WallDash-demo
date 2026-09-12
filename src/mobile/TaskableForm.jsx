import { useState } from 'react'
import { Icon, Spinner } from '../components/ui'

export default function TaskableForm({ config, user, item, onSaved, onCancel }) {
  const { service, fieldName, editTitle, createTitle, inputPlaceholder, deleteConfirm } = config
  const [value, setValue] = useState(item?.[fieldName] || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!value.trim()) return
    setError('')
    setSaving(true)
    try {
      if (item?.id) {
        await service.update(item.id, { [fieldName]: value.trim() })
      } else {
        await service.create({ [fieldName]: value.trim(), created_by: user?.id })
      }
      onSaved()
    } catch (err) {
      console.error('Error guardando item:', err)
      setError(err.message || 'Error al guardar')
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
    } catch (err) {
      console.error('Error borrando item:', err)
      setError(err.message || 'Error al borrar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-neum-text">
          {item ? editTitle : createTitle}
        </h2>
        {item?.id && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            title="Eliminar"
            className="w-10 h-10 rounded-full bg-neum-surface shadow-neum-sm
              active:shadow-neum-inset-sm active:scale-95
              transition-[box-shadow,transform] duration-150 flex items-center justify-center
              text-red-400 disabled:opacity-50"
          >
            <Icon name="trash" className="w-5 h-5" />
          </button>
        )}
      </div>

      <input
        placeholder={inputPlaceholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        autoFocus
        className="w-full rounded-neum-sm bg-neum-surface shadow-neum-inset-sm
          px-4 py-3 text-neum-text placeholder-neum-text-muted
          focus:outline-none focus:ring-2 focus:ring-neum-primary-light transition-shadow"
      />

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      <div className="flex gap-3 mt-2">
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
          {saving ? 'Guardando...' : item ? 'Guardar cambios' : createTitle}
        </button>
      </div>
    </form>
  )
}
