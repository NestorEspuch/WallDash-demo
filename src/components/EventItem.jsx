import { getColorFromMap } from '../services/events'
import { formatTime } from '../utils/dateTime'

export default function EventItem({ event, colorMap, onClick, timeLabel, highlight }) {
  const time = timeLabel || (event.all_day
    ? 'Todo el día'
    : formatTime(event.start_at))

  return (
    <button
      onClick={() => onClick?.(event)}
      className={`flex items-stretch gap-2 text-left w-full rounded-neum-sm px-3 py-2
        active:shadow-neum-inset-sm active:scale-[0.98]
        transition-[box-shadow,transform] duration-150
        ${highlight ? 'bg-[color-mix(in_srgb,var(--neum-primary)_7%,var(--neum-surface))]' : ''}`}
    >
      {highlight && (
        <span className="w-0.5 rounded-full bg-neum-primary-light" />
      )}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: getColorFromMap(colorMap, event.assigned_to) }}
          />
          <span className={`text-xs ${highlight ? 'text-neum-primary font-medium' : 'text-neum-text-muted'}`}>{time}</span>
        </div>
        <div className="text-sm text-neum-text pl-5">
          {event.title.length > 24 ? event.title.slice(0, 24) + '...' : event.title}
        </div>
      </div>
    </button>
  )
}
