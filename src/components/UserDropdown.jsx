import { useEffect, useRef, useState } from 'react'
import { useProfiles } from '../contexts/ProfileContext'
import { MENSTRUATION_ID } from '../constants/colors'

export default function UserDropdown({ value, onChange, className = '' }) {
  const { profiles } = useProfiles()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({})
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = profiles.find((p) => p.id === value)
  const familiar = profiles.find((p) => p.is_familiar)
  const menstruacion = profiles.find((p) => p.is_menstruation)

  const label = value === MENSTRUATION_ID
    ? 'Menstruación'
    : selected
      ? selected.username
      : 'Familiar'

  const handleToggle = () => {
    if (!open) {
      const rect = ref.current.getBoundingClientRect()
      const below = rect.bottom + 8
      const estimatedHeight = (profiles.length + 1) * 48 + 16
      const up = below + estimatedHeight > window.innerHeight && rect.top > estimatedHeight
      setPos({
        top: up ? rect.top - estimatedHeight : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      })
    }
    setOpen(!open)
  }

  const handleOptionClick = (id) => {
    onChange(id)
    setOpen(false)
  }

  return (
    <div ref={ref} className={className}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full rounded-neum-sm bg-neum-surface shadow-neum-sm
          active:shadow-neum-inset-sm active:translate-y-px
          transition-shadow duration-150 px-4 py-3 text-neum-text text-left flex items-center gap-3"
      >
        {label}
        <span className="ml-auto text-neum-text-muted">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          className="fixed z-50 overflow-hidden rounded-neum-sm bg-neum-surface shadow-neum"
          style={pos}
        >
          {familiar && (
            <button
              type="button"
              onClick={() => handleOptionClick(null)}
              className={`w-full px-4 py-3 text-left transition-colors
                text-neum-text hover:bg-neum-bg
                ${value === null ? 'bg-neum-bg' : ''}`}
            >
              {familiar.username}
            </button>
          )}
          {menstruacion && (
            <button
              type="button"
              onClick={() => handleOptionClick(MENSTRUATION_ID)}
              className={`w-full px-4 py-3 text-left transition-colors
                text-neum-text hover:bg-neum-bg
                ${value === MENSTRUATION_ID ? 'bg-neum-bg' : ''}`}
            >
              Menstruación
            </button>
          )}
          {profiles.filter((p) => !p.is_familiar && !p.is_menstruation).map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => handleOptionClick(profile.id)}
              className={`w-full px-4 py-3 text-left transition-colors
                text-neum-text hover:bg-neum-bg
                ${value === profile.id ? 'bg-neum-bg' : ''}`}
            >
              {profile.username}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
