import { useState, useRef, useCallback } from 'react'
import { startListening as startSpeechRecognition } from '../services/speech'
import { askGemini } from '../services/gemini'
import { speak } from '../services/tts'

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  )
}

const STATES = {
  idle: { color: 'text-neum-text', shadow: 'shadow-neum' },
  listening: { color: 'text-green-500', shadow: 'shadow-neum' },
  processing: { color: 'text-amber-500', shadow: 'shadow-neum' },
  speaking: { color: 'text-sky-500', shadow: 'shadow-neum' },
  stopping: { color: 'text-red-500', shadow: 'shadow-neum-inset' },
  denied: { color: 'text-red-400', shadow: 'shadow-neum' },
}

function Spinner() {
  return (
    <div className="w-6 h-6 rounded-full border-[3px] border-current border-t-transparent animate-spin" />
  )
}

export default function VoiceAssistantButton() {
  const [status, setStatus] = useState('idle')
  const stopTimerRef = useRef(null)
  const streamRef = useRef(null)
  const listenerRef = useRef(null)
  const busyRef = useRef(false)
  const cancelledRef = useRef(false)
  const lastClickRef = useRef(0)

  const processText = async (text) => {
    console.log('Usuario dijo:', text)
    setStatus('processing')
    const response = await askGemini(text)
    console.log('Gemini:', response)
    setStatus('speaking')
    await speak(response)
  }

  const cleanup = useCallback(() => {
    if (listenerRef.current) {
      listenerRef.current.abort()
      listenerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const goToIdle = useCallback(() => {
    setStatus('idle')
  }, [])

  const goToStopping = useCallback(() => {
    setStatus('stopping')
    clearTimeout(stopTimerRef.current)
    stopTimerRef.current = setTimeout(goToIdle, 800)
  }, [goToIdle])

  const beginListening = useCallback(async () => {
    if (busyRef.current) return
    busyRef.current = true
    cancelledRef.current = false

    if (status === 'denied') {
      setStatus('idle')
      busyRef.current = false
      return
    }

    setStatus('listening')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (cancelledRef.current) {
        stream.getTracks().forEach((t) => t.stop())
        busyRef.current = false
        return
      }
      streamRef.current = stream
    } catch {
      setStatus('denied')
      busyRef.current = false
      return
    }

    try {
      const listener = startSpeechRecognition()
      listenerRef.current = listener
      const text = await listener
      listenerRef.current = null
      cleanup()
      await processText(text)
      goToStopping()
    } catch {
      cleanup()
      goToStopping()
    }

    busyRef.current = false
  }, [status, cleanup, goToStopping])

  const stopListening = useCallback(() => {
    cancelledRef.current = true
    cleanup()
    goToStopping()
  }, [cleanup, goToStopping])

  const handleClick = useCallback(() => {
    const now = Date.now()
    if (now - lastClickRef.current < 300) return
    lastClickRef.current = now

    if (status === 'stopping' || status === 'speaking' || status === 'processing') return
    if (busyRef.current && status !== 'listening') return

    if (status === 'listening') {
      stopListening()
      return
    }

    beginListening()
  }, [status, stopListening, beginListening])

  const current = STATES[status]

  return (
    <button
      onClick={handleClick}
      className={`w-24 h-24 rounded-full bg-neum-surface ${current.shadow}
        active:shadow-neum-inset active:scale-95
        transition-[box-shadow,transform] duration-200 flex items-center justify-center
        ${current.color}
        ${status === 'listening' ? 'animate-pulse' : ''}`}
    >
      {status === 'processing' ? <Spinner /> : <MicIcon />}
    </button>
  )
}
