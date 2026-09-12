import { COLORS, DEFAULT_COLOR } from '../constants/colors'

export default function ColorPicker({ value = DEFAULT_COLOR, onChange, disabledColors = [] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {COLORS.filter(({ id }) => !disabledColors.includes(id)).map(({ id, name }) => {
        return (
          <button
            key={id}
            type="button"
            title={name}
            onClick={() => onChange(id)}
            className={`w-10 h-10 rounded-full transition-[box-shadow,transform] duration-200
              hover:scale-105
              ${value === id
                ? 'shadow-neum-inset-sm scale-110 ring-2 ring-neum-text'
                : 'shadow-neum-sm'
              }`}
            style={{ backgroundColor: `var(--ev-${id})` }}
          />
        )
      })}
    </div>
  )
}