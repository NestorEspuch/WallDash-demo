import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { LoadingState } from '../components/ui'
import EventList from './EventList'
import EventForm from './EventForm'
import TaskableList from './TaskableList'
import TaskableForm from './TaskableForm'
import { taskConfig, shoppingConfig } from '../config/taskable'
import ProfileSettings from './ProfileSettings'

const TABS = [
  { key: 'events', label: 'Eventos' },
  { key: 'tasks', label: 'Tareas' },
  { key: 'shopping', label: 'Compra' },
  { key: 'profile', label: 'Perfil' },
]

export default function MobileScreen() {
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('events')
  const [editingEvent, setEditingEvent] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [editingShopping, setEditingShopping] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (!mounted) return
      if (error || !data.session) {
        navigate('/login', { replace: true })
        return
      }
      setUser(data.session.user)
    }

    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login', { replace: true })
      } else {
        setUser(session.user)
      }
    })

    return () => {
      mounted = false
      authListener?.subscription?.unsubscribe()
    }
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setTab('edit')
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setTab('edittask')
  }

  const handleTaskSaved = () => {
    setEditingTask(null)
    setTab('tasks')
  }

  const handleNewTaskSaved = () => {
    setTab('tasks')
  }

  const handleEditShopping = (item) => {
    setEditingShopping(item)
    setTab('editshopping')
  }

  const handleShoppingSaved = () => {
    setEditingShopping(null)
    setTab('shopping')
  }

  const handleNewShoppingSaved = () => {
    setTab('shopping')
  }

  const handleSaved = () => {
    setEditingEvent(null)
    setTab('events')
  }

  if (!user) {
    return (
      <div className="w-screen h-screen bg-neum-bg flex items-center justify-center">
        <LoadingState />
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-neum-bg flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {tab === 'events' && <EventList user={user} onEdit={handleEdit} onNew={() => setTab('new')} />}
        {tab === 'tasks' && <TaskableList config={taskConfig} user={user} onEdit={handleEditTask} onNew={() => setTab('newtask')} />}
        {tab === 'shopping' && <TaskableList config={shoppingConfig} user={user} onEdit={handleEditShopping} onNew={() => setTab('newshopping')} />}
        {tab === 'new' && <EventForm user={user} onSaved={() => setTab('events')} onCancel={() => setTab('events')} />}
        {tab === 'edit' && <EventForm user={user} event={editingEvent} onSaved={handleSaved} onCancel={() => setTab('events')} />}
        {tab === 'edittask' && <TaskableForm config={taskConfig} user={user} item={editingTask} onSaved={handleTaskSaved} onCancel={() => setTab('tasks')} />}
        {tab === 'newtask' && <TaskableForm config={taskConfig} user={user} onSaved={handleNewTaskSaved} onCancel={() => setTab('tasks')} />}
        {tab === 'editshopping' && <TaskableForm config={shoppingConfig} user={user} item={editingShopping} onSaved={handleShoppingSaved} onCancel={() => setTab('shopping')} />}
        {tab === 'newshopping' && <TaskableForm config={shoppingConfig} user={user} onSaved={handleNewShoppingSaved} onCancel={() => setTab('shopping')} />}
        {tab === 'profile' && <ProfileSettings user={user} onLogout={handleLogout} />}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-neum-surface shadow-neum-inset-sm flex z-10 pb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-4 text-base font-medium transition-colors
              ${tab === t.key || (['new', 'edit'].includes(tab) && t.key === 'events') || (['edittask', 'newtask'].includes(tab) && t.key === 'tasks') || (['editshopping', 'newshopping'].includes(tab) && t.key === 'shopping') ? 'text-neum-primary' : 'text-neum-text-muted'}`}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
