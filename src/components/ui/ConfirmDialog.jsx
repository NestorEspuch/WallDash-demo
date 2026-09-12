import Modal from './Modal'
import NeumButton from './NeumButton'

export default function ConfirmDialog({ title, message, confirmLabel, destructive, onCancel, onConfirm }) {
  return (
    <Modal>
      <h3 className="text-lg font-bold text-neum-text mb-2">{title}</h3>
      {message && (
        <p className="text-neum-text-muted text-sm mb-6 whitespace-pre-wrap break-words">{message}</p>
      )}
      <div className="flex gap-3">
        <NeumButton onClick={onCancel} className="flex-1">
          Cancelar
        </NeumButton>
        <NeumButton
          primary
          onClick={onConfirm}
          className={`flex-1 ${destructive ? 'text-red-500' : ''}`}
        >
          {confirmLabel || 'Confirmar'}
        </NeumButton>
      </div>
    </Modal>
  )
}
