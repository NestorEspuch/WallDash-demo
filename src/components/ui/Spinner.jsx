export default function Spinner({ size = 'md', color = 'neum-primary' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-[3px]',
    xl: 'w-8 h-8 border-[3px]',
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full border-current border-t-transparent animate-spin text-${color}`} />
  )
}
