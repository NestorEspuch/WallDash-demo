import { useState, useEffect } from 'react'
import WeatherWidget from '../components/WeatherWidget'
import CalendarWidget from '../components/CalendarWidget'
import NextAppointmentsWidget from '../components/NextAppointmentsWidget'
import VoiceAssistantButton from '../components/VoiceAssistantButton'
import TopBar from '../components/TopBar'
import TaskableWidget from '../components/TaskableWidget'
import { taskConfig, shoppingConfig } from '../config/taskable'
import EventPreview from '../components/EventPreview'
import EventModal from '../components/EventModal'
import { useProfiles } from '../contexts/ProfileContext'

export default function HomeScreen({ onNavigate }) {
  const { profiles } = useProfiles()
  const [previewEvent, setPreviewEvent] = useState(null)
  const [editEvent, setEditEvent] = useState(null)

  useEffect(() => {
    const handleReset = () => {
      setPreviewEvent(null)
      setEditEvent(null)
    }
    window.addEventListener('app-reset', handleReset)
    return () => window.removeEventListener('app-reset', handleReset)
  }, [])

  const handleEdit = (event) => {
    setEditEvent(event)
    setPreviewEvent(null)
  }

  const handleSaved = () => {
    setEditEvent(null)
    setPreviewEvent(null)
  }

  const handleDeleted = () => {
    setPreviewEvent(null)
    setEditEvent(null)
  }

  return (
    <div className="w-screen h-screen bg-neum-bg grid grid-rows-[auto_1fr_auto] p-6 gap-6">
      <TopBar onNavigate={onNavigate} />
      <div className="flex items-center justify-center min-h-0 pt-3">
        <div className="flex flex-row items-stretch gap-6 justify-center max-h-[760px] min-h-[560px]">
          <TaskableWidget config={taskConfig} />
          <WeatherWidget />
          <div className="flex flex-col gap-6">
            <CalendarWidget onEventClick={setPreviewEvent} />
            <NextAppointmentsWidget onEventClick={setPreviewEvent} />
          </div>
          <TaskableWidget config={shoppingConfig} />
        </div>
      </div>
      <div className="flex items-center justify-center pt-3">
        <VoiceAssistantButton />
      </div>

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
          profiles={profiles}
          currentUserId={null}
          onClose={() => setEditEvent(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}