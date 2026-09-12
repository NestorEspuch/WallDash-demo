import Spinner from './Spinner'

export default function LoadingState({ size = 'lg', color = 'neum-primary', className = '' }) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <Spinner size={size} color={color} />
    </div>
  )
}
