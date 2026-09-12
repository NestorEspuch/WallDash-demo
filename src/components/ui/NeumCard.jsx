export default function NeumCard({ children, pressed, onClick, className = '' }) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`rounded-neum bg-neum-surface ${
        pressed ? 'shadow-neum-inset' : 'shadow-neum'
      } ${
        onClick
          ? 'cursor-pointer active:shadow-neum-inset active:scale-[0.98] transition-[box-shadow,transform] duration-200'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
