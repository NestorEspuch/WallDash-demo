import useClock from '../hooks/useClock'
import ThemeToggle from './ThemeToggle'
import { useCarWashAdvice } from '../hooks/useCarWashAdvice'
import { speak } from '../services/tts'
import { Icon } from './ui'

function IconButton({ onClick, title, disabled, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="w-10 h-10 rounded-neum-sm bg-neum-surface shadow-neum-sm
        active:shadow-neum-inset-sm active:scale-95
        transition-[box-shadow,transform,color] duration-200
        flex items-center justify-center text-neum-text-muted hover:text-neum-primary
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
    >
      {children}
    </button>
  )
}

export default function TopBar({ onNavigate }) {
  const { date, time } = useClock()
  const { getAdvice, loading } = useCarWashAdvice()

  const handleCarWash = async () => {
    const result = await getAdvice()
    if (result?.message) {
      speak(result.message)
    }
  }

  return (
    <div className="flex items-center justify-between w-full pb-2">
      <div className="h-10 rounded-neum-sm bg-neum-surface shadow-neum-sm px-4 flex items-center gap-3">
        <span className="text-neum-text text-xl font-bold capitalize">{date}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-neum-primary" />
        <span className="text-neum-text text-xl font-bold">{time}</span>
      </div>
      <div className="flex items-center gap-3">
        <IconButton onClick={handleCarWash} title="¿Lavar el coche?" disabled={loading}>
          <Icon name="carWash" className="w-5 h-5" />
        </IconButton>
        <IconButton onClick={() => onNavigate(0)} title="YouTube Music">
          <Icon name="music" className="w-5 h-5" />
        </IconButton>
        <IconButton onClick={() => onNavigate(2)} title="Calendario">
          <Icon name="calendar" className="w-5 h-5" />
        </IconButton>
        <ThemeToggle />
      </div>
    </div>
  )
}
