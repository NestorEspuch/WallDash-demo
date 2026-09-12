import { useRealtime } from './useRealtime'

export function useRealtimeTaskable(table, callback) {
  return useRealtime(table, callback)
}
