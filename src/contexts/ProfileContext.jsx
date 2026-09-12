import { createContext, useContext, useState, useEffect } from 'react'
import { getProfiles, supabase } from '../services/supabase'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfiles().then((data) => {
      setProfiles(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('global-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        getProfiles().then(setProfiles)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <ProfileContext.Provider value={{ profiles, loading }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfiles() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfiles debe usarse dentro de ProfileProvider')
  return ctx
}
