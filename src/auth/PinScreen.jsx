import { useState, useRef, useEffect } from 'react'
import { getTabletPin } from '../services/supabase'

const PIN_LENGTH = 4

export default function PinScreen({ onVerified }) {
  const [pin, setPin] = useState([])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputsRef = useRef([])

  const correctPinRef = useRef(null)

  useEffect(() => {
    getTabletPin().then((p) => { correctPinRef.current = p })
  }, [])

  useEffect(() => {
    inputsRef.current[pin.length]?.focus()
  }, [pin])

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace') {
      setPin((prev) => prev.slice(0, -1))
      setError(false)
    }
  }

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '')
    if (!val) return

    const newPin = [...pin]
    newPin[idx] = val.slice(-1)
    setPin(newPin)
    setError(false)

    if (newPin.length === PIN_LENGTH && newPin.every(Boolean)) {
      checkPin(newPin)
    }
  }

  const checkPin = async (entered) => {
    setLoading(true)
    setError(false)

    const currentPin = correctPinRef.current
    if (entered.join('') === currentPin) {
      localStorage.setItem('pin_verified', 'true')
      localStorage.setItem('pin_verified_at', Date.now())
      onVerified()
    } else {
      setError(true)
      setPin([])
      setLoading(false)
    }
  }

  return (
    <div className="w-screen h-screen bg-neum-bg flex flex-col items-center justify-center gap-8 px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neum-text mb-2">WallDash</h1>
        <p className="text-neum-text-muted">Introduce el PIN de acceso</p>
      </div>

      <div className="flex gap-4">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el }}
            type="tel"
            maxLength={1}
            inputMode="numeric"
            pattern="[0-9]"
            value={pin[i] || ''}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={e => {
              if (e.key === 'Backspace' && !pin[i]) {
                const prev = document.activeElement?.previousElementSibling
                prev?.focus()
                setPin(p => p.slice(0, -1))
              }
              handleKeyDown(e)
            }}
            className={`w-14 h-16 text-center text-2xl font-bold rounded-neum-sm bg-neum-surface
              shadow-neum-inset-sm outline-none transition-shadow duration-150
              text-neum-text placeholder-neum-text-muted
              ${pin[i] ? 'ring-2 ring-neum-primary-light' : ''}
              ${error ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-neum-primary-light'}`}
            autoComplete="off"
          />
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-sm">PIN incorrecto. Inténtalo de nuevo.</p>
      )}

      {loading && <div className="w-6 h-6 rounded-full border-[3px] border-neum-primary border-t-transparent animate-spin" />}
    </div>
  )
}
