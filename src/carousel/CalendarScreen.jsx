import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { fetchEventsOverlapping, eventsToFullCalendar, buildColorMap, getColorFromMap } from '../services/events'
import { useProfiles } from '../contexts/ProfileContext'
import { useRealtimeEvents } from '../hooks/useRealtimeEvents'
import { useVisibilityRefresh } from '../hooks/useVisibilityRefresh'
import EventModal from '../components/EventModal'
import EventPreview from '../components/EventPreview'
import ThemeToggle from '../components/ThemeToggle'

export default function CalendarScreen() {
  const { profiles } = useProfiles()
  const [modalDate, setModalDate] = useState(null)
  const [previewEvent, setPreviewEvent] = useState(null)
  const [editEvent, setEditEvent] = useState(null)
  const [range, setRange] = useState({ start: null, end: null })
  const [now, setNow] = useState(new Date())
  const [viewTitle, setViewTitle] = useState('')
  const [currentView, setCurrentView] = useState('dayGridMonth')
  const calendarRef = useRef(null)

  const colorMap = useMemo(() => buildColorMap(profiles), [profiles])

  const eventSource = useCallback(async (fetchInfo, successCallback, failureCallback) => {
    try {
      const data = await fetchEventsOverlapping(fetchInfo.start.toISOString(), fetchInfo.end.toISOString())
      const fcEvents = eventsToFullCalendar(data).map((e) => {
        const color = getColorFromMap(colorMap, e.extendedProps.assignedTo)
        return { ...e, backgroundColor: color, borderColor: color }
      })
      successCallback(fcEvents)
    } catch (err) {
      failureCallback(err)
    }
  }, [colorMap])

  const refreshEvents = useCallback(() => {
    calendarRef.current?.getApi().refetchEvents()
  }, [])

  useRealtimeEvents(refreshEvents)
  useVisibilityRefresh(refreshEvents)

  useEffect(() => {
    if (profiles.length > 0) refreshEvents()
  }, [profiles, refreshEvents])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const handleReset = () => {
      setModalDate(null)
      setPreviewEvent(null)
      setEditEvent(null)
    }
    window.addEventListener('app-reset', handleReset)
    return () => window.removeEventListener('app-reset', handleReset)
  }, [])

  const handleDatesSet = useCallback((arg) => {
    const start = arg.start.toISOString()
    const end = arg.end.toISOString()
    setRange({ start, end })
    const title = arg.view.title
    setViewTitle(title.charAt(0).toUpperCase() + title.slice(1))
    setCurrentView(arg.view.type)
  }, [])

  const handleDateClick = useCallback((arg) => {
    const dateStr = arg.dateStr
    const timeStr = arg.allDay === false
      ? dateStr.slice(11, 16)
      : `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
    const datePart = dateStr.slice(0, 10)
    setModalDate(datePart + 'T' + timeStr)
    setPreviewEvent(null)
    setEditEvent(null)
  }, [])

  const handleSelect = useCallback((arg) => {
    const startStr = arg.startStr
    setModalDate(startStr)
    setPreviewEvent(null)
    setEditEvent(null)
    calApi()?.unselect()
  }, [])

  const handleEventClick = useCallback((arg) => {
    const event = arg.event
    setPreviewEvent({
      id: parseInt(event.id),
      title: event.title,
      description: event.extendedProps.description || '',
      start_at: event.start?.toISOString() || '',
      end_at: event.end?.toISOString() || null,
      all_day: event.allDay || false,
      assigned_to: event.extendedProps.assignedTo || null,
      recurring_group_id: event.extendedProps.recurringGroupId || null,
    })
    setModalDate(null)
    setEditEvent(null)
    setTimeout(() => {
      document.querySelector('.fc-more-popover')?.remove()
    }, 0)
  }, [])

  const handleEdit = useCallback((event) => {
    setEditEvent(event)
    setPreviewEvent(null)
  }, [])

  const handleSaved = useCallback(() => {
    setModalDate(null)
    setPreviewEvent(null)
    setEditEvent(null)
    refreshEvents()
  }, [refreshEvents])

  const handleDeleted = useCallback(() => {
    setPreviewEvent(null)
    setEditEvent(null)
    refreshEvents()
  }, [refreshEvents])

  const calApi = () => calendarRef.current?.getApi()

  return (
    <div className="w-screen h-screen bg-neum-bg flex flex-col overflow-hidden relative">
      <div className="flex-1 px-7 pt-3 pb-7 flex flex-col">
        <div className="flex items-center gap-3 mt-4 mb-6 flex-wrap">
          <div className="flex gap-2">
            {['dayGridMonth', 'timeGridWeek', 'timeGridDay'].map((v) => (
              <button
                key={v}
                onClick={() => calApi()?.changeView(v)}
                className={`cal-btn ${currentView === v ? 'active' : ''}`}
              >
                {v === 'timeGridWeek' ? 'Semana' : v === 'dayGridMonth' ? 'Mes' : 'Día'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mx-auto">
            <button onClick={() => calApi()?.prev()} className="cal-btn cal-btn-arrow">
              ‹
            </button>
            <span className="text-xl font-semibold text-neum-primary rounded-neum-sm bg-neum-surface shadow-neum-sm px-5 py-2 whitespace-nowrap">
              {viewTitle ? viewTitle.charAt(0).toUpperCase() + viewTitle.slice(1) : ''}
            </span>
            <button onClick={() => calApi()?.next()} className="cal-btn cal-btn-arrow">
              ›
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => calApi()?.today()} className="cal-btn">
              Hoy
            </button>
            <ThemeToggle />
          </div>
        </div>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          height="100%"
          expandRows
          slotEventOverlap={false}
          dayMaxEvents={3}
          eventMinHeight={20}
          weekends
          now={now}
          nowIndicator={true}
          scrollToNow={true}
          events={eventSource}
          selectable={true}
          dateClick={handleDateClick}
          select={handleSelect}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          headerToolbar={false}
          titleFormat={{ year: 'numeric', month: 'long' }}
          dayHeaderFormat={{ weekday: 'short' }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          noEventsText="Sin eventos"
        />
      </div>

      {modalDate && (
        <EventModal
          date={modalDate}
          defaultAllDay={false}
          currentUserId={null}
          profiles={profiles}
          onClose={() => setModalDate(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}

      {previewEvent && (
        <EventPreview
          event={previewEvent}
          profiles={profiles}
          onClose={() => setPreviewEvent(null)}
          onEdit={handleEdit}
          onDeleted={handleDeleted}
        />
      )}

      {editEvent && (
        <EventModal
          event={editEvent}
          currentUserId={null}
          profiles={profiles}
          onClose={() => setEditEvent(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}
