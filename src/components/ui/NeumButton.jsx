export default function NeumButton({ children, primary, className = '', ...props }) {
  return (
    <button
      className={`rounded-neum-sm bg-neum-surface shadow-neum-sm
        active:shadow-neum-inset-sm active:translate-y-px
        transition-[box-shadow,transform] duration-150 select-none
        ${primary
          ? 'text-neum-primary px-8 py-4 text-lg font-medium'
          : 'text-neum-text px-6 py-3 text-base'
        }
        ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
