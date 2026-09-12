import { useRealtime } from './useRealtime'

export function useRealtimeEvents(callback) {
  return useRealtime('events', callback)
}
