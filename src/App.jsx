import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { requestPosition } from './services/geolocation'
import { LoadingState } from './components/ui'
import Carousel from './carousel/Carousel'
import PinScreen from './auth/PinScreen'
import LoginScreen from './auth/LoginScreen'
import MobileScreen from './mobile/MobileScreen'

const MOBILE_MQ = '(max-width: 767px)'

function MobileGuard({ children }) {
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_MQ).matches)

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_MQ)
    const handleChange = (e) => {
      if (!e.matches) {
        navigate('/', { replace: true })
      } else {
        setIsMobile(true)
      }
    }
    if (!mql.matches) {
      navigate('/', { replace: true })
      return
    }
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [navigate])

  if (!isMobile) {
    return (
      <div className="w-screen h-screen bg-neum-bg flex items-center justify-center">
        <LoadingState />
      </div>
    )
  }

  return children
}

function LoginGuard() {
  const navigate = useNavigate()

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_MQ)
    const handleChange = (e) => {
      if (!e.matches) navigate('/', { replace: true })
    }
    if (!mql.matches) {
      navigate('/', { replace: true })
      return
    }
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [navigate])

  return <LoginScreen onLogin={() => navigate('/mobile', { replace: true })} />
}

function getInitialTheme() {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return 'dark'
}

export default function App() {
  const [pinVerified, setPinVerified] = useState(() => localStorage.getItem('pin_verified') === 'true')

  useEffect(() => {
    requestPosition()
  }, [])

  useEffect(() => {
    const theme = getInitialTheme()
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [])

  if (!pinVerified) {
    return (
      <Routes>
        <Route path="/*" element={<PinScreen onVerified={() => setPinVerified(true)} />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/*" element={<Carousel />} />
      <Route path="/login" element={<LoginGuard />} />
      <Route
        path="/mobile/*"
        element={
          <MobileGuard>
            <MobileScreen />
          </MobileGuard>
        }
      />
    </Routes>
  )
}
