export default function Modal({ children, onClose, className = '' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className={`w-full max-w-sm rounded-neum bg-neum-surface shadow-neum p-6 ${className}`}>
        {children}
      </div>
    </div>
  )
}
