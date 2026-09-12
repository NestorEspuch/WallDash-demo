import { useEffect, useRef } from 'react'
import { supabase } from '../services/supabase'

const channels = new Map()
const subscribers = new Map()

function removeChannel(table) {
  const channel = channels.get(table)
  if (channel) {
    supabase.removeChannel(channel)
    channels.delete(table)
  }
  subscribers.delete(table)
}

function ensureChannel(table) {
  if (channels.has(table)) return channels.get(table)

  const channel = supabase
    .channel(`db-${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
      const subs = subscribers.get(table)
      if (subs) subs.forEach(cb => cb())
    })
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
        channels.delete(table)
        setTimeout(() => ensureChannel(table), 2000)
      }
    })

  channels.set(table, channel)
  return channel
}

export function useRealtime(table, callback) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const wrapped = () => callbackRef.current()
    if (!subscribers.has(table)) subscribers.set(table, new Set())
    subscribers.get(table).add(wrapped)
    ensureChannel(table)

    return () => {
      const subs = subscribers.get(table)
      if (!subs) return
      subs.delete(wrapped)
      if (subs.size === 0) {
        setTimeout(() => {
          if (subscribers.get(table)?.size === 0) {
            removeChannel(table)
          }
        }, 5000)
      }
    }
  }, [table])
}
