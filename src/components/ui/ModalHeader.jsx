import Icon from './Icon'

export default function ModalHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-neum-text">{title}</h3>
      {onClose && (
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-neum-surface shadow-neum-sm
            active:shadow-neum-inset-sm active:scale-95
            transition-[box-shadow,transform] duration-150
            flex items-center justify-center text-neum-text-muted hover:text-neum-text"
          title="Cerrar"
        >
          <Icon name="close" className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
