export default function NeumInput({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-neum-sm bg-neum-surface shadow-neum-inset-sm
        px-4 py-3 text-neum-text placeholder-neum-text-muted
        focus:outline-none focus:ring-2 focus:ring-neum-primary-light
        transition-shadow duration-150
        ${className}`}
      {...props}
    />
  )
}
