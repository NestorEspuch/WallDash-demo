import { supabase } from './supabase'
import { resolveColorId, colorVar } from '../constants/colors'
import { localDateTimeToISO } from '../utils/dateTime'

export async function fetchEvents(start, end) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('start_at', start)
    .lte('start_at', end)
    .order('start_at')
  if (error) return []
  return data
}

export async function fetchEventsOverlapping(start, end) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .lte('start_at', end)
    .or(`end_at.gte.${start},end_at.is.null`)
    .order('start_at')
  if (error) return []
  const rangeStart = new Date(start).getTime()
  const rangeEnd = new Date(end).getTime()
  return (data || []).filter((e) => {
    const eventStart = new Date(e.start_at).getTime()
    const eventEnd = e.end_at ? new Date(e.end_at).getTime() : eventStart
    return eventEnd >= rangeStart && eventStart <= rangeEnd
  })
}

export async function fetchPastEvents({ dateFrom, dateTo, assignedTo }) {
  const now = new Date().toISOString()
  let query = supabase
    .from('events')
    .select('*')
    .lt('start_at', now)
    .or(`end_at.lt.${now},end_at.is.null`)
    .order('start_at', { ascending: false })

  if (dateFrom) query = query.gte('start_at', localDateTimeToISO(dateFrom, '00:00:00'))
  if (dateTo) query = query.lte('start_at', localDateTimeToISO(dateTo, '23:59:59'))
  if (assignedTo !== undefined && assignedTo !== null) query = query.eq('assigned_to', assignedTo)

  const { data } = await query
  return data || []
}

export async function createEvent(event) {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateEvent(id, updates) {
  const { data, error } = await supabase
    .from('events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteEvent(id) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function deleteEventGroup(groupId) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('recurring_group_id', groupId)
  if (error) throw error
}

export async function updateEventGroup(groupId, updates) {
  const { data, error } = await supabase
    .from('events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('recurring_group_id', groupId)
    .select()
  if (error) throw error
  return data
}

export function expandRecurrence(event) {
  const MAX = 200
  const groupId = crypto.randomUUID()
  const events = []
  const start = new Date(event.start_at)
  const end = event.recurring_end ? new Date(event.recurring_end) : new Date(start)
  end.setUTCFullYear(end.getUTCFullYear() + 1)

  let count = 0
  let current = new Date(start)
  const duration = event.end_at
    ? new Date(event.end_at).getTime() - start.getTime()
    : 0

  while (current <= end && count < MAX) {
    events.push({
      ...event,
      recurring_group_id: groupId,
      start_at: current.toISOString(),
      end_at: event.all_day
        ? current.toISOString()
        : event.end_at
          ? new Date(current.getTime() + duration).toISOString()
          : null,
    })

    switch (event.frequency) {
      case 'daily':
        current.setUTCDate(current.getUTCDate() + (event.interval || 1))
        break
      case 'weekly':
        current.setUTCDate(current.getUTCDate() + 7 * (event.interval || 1))
        break
      case 'monthly':
        current.setUTCMonth(current.getUTCMonth() + (event.interval || 1))
        break
      case 'yearly':
        current.setUTCFullYear(current.getUTCFullYear() + (event.interval || 1))
        break
      default:
        current = new Date(end.getTime() + 1)
    }
    count++
  }

  return events
}

export function eventsToFullCalendar(events) {
  return events.map((e) => ({
    id: String(e.id),
    title: e.title,
    start: e.start_at,
    end: e.end_at || undefined,
    allDay: e.all_day,
    extendedProps: {
      description: e.description,
      assignedTo: e.assigned_to,
      recurringGroupId: e.recurring_group_id,
    },
  }))
}

export function getEventColor(assignedTo, profiles) {
  let identifier
  if (!assignedTo) {
    const familiar = profiles.find(p => p.is_familiar)
    identifier = resolveColorId(familiar?.color)
  } else {
    const profile = profiles.find(p => p.id === assignedTo)
    identifier = resolveColorId(profile?.color)
  }
  return colorVar(identifier)
}

export function buildColorMap(profiles) {
  const map = new Map()
  let familiarId = null
  for (const p of profiles) {
    map.set(p.id, colorVar(resolveColorId(p.color)))
    if (p.is_familiar) familiarId = p.id
  }
  if (familiarId) map.set(null, map.get(familiarId))
  return map
}

export function getColorFromMap(colorMap, assignedTo) {
  return colorMap.get(assignedTo) ?? colorMap.get(null) ?? 'var(--ev-morado)'
}
