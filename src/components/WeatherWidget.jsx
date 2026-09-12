import useWeather from '../hooks/useWeather'
import { useWeatherAdvice } from '../hooks/useWeatherAdvice'
import { speak } from '../services/tts'
import { NeumCard, Icon, LoadingState } from './ui'

function SunIcon({ className = '' }) {
  return (
    <svg viewBox="-1 -1 66 66" className={`w-28 h-28 text-amber-400 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="32" cy="32" r="10" fill="currentColor" stroke="none"/>
      <path d="M32 2v8M32 54v8M2 32h8M54 32h8M8.7 8.7l5.7 5.7M49.6 49.6l5.7 5.7M8.7 55.3l5.7-5.7M49.6 14.4l5.7-5.7"/>
    </svg>
  )
}

function MoonIcon({ className = '' }) {
  return (
    <svg viewBox="-10.5 -4 63.5 63.5" className={`w-28 h-28 text-indigo-300 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M48 34a22 22 0 0 1-22-22A22 22 0 0 1 28 2 26 26 0 1 0 48 34Z" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function CloudIcon({ className = '' }) {
  return (
    <svg viewBox="4 -4 54 54" className={`w-28 h-28 text-neum-text-muted ${className}`} fill="currentColor" stroke="none">
      <path d="M44 40a12 12 0 0 0 0-24 14 14 0 0 0-26-2 10 10 0 0 0-2 20h28Z"/>
    </svg>
  )
}

function RainIcon({ className = '' }) {
  return (
    <svg viewBox="0 0.5 63 63" className={`w-28 h-28 text-neum-text-muted ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M44 38a12 12 0 0 0 0-24 14 14 0 0 0-26-2 10 10 0 0 0-2 20h28Z" fill="currentColor" stroke="none"/>
      <path d="M20 44v6M28 46v6M36 44v8M24 52v6M32 54v6"/>
    </svg>
  )
}

function CloudSunIcon({ className = '' }) {
  return (
    <svg viewBox="5 0 46 46" className={`w-28 h-28 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="28" cy="22" r="8" fill="#fbbf24" stroke="#fbbf24"/>
      <path d="M28 4v4M28 36v4M8 22h4M44 22h4M13.3 10.3l2.8 2.8M42.8 39.8l2.8 2.8M13.3 33.7l2.8-2.8" stroke="#fbbf24"/>
      <path d="M40 42a8 8 0 0 0 0-16 10 10 0 0 0-18-2 7 7 0 0 0-1 14h19Z" fill="#9ca3af" stroke="none"/>
    </svg>
  )
}

const ICON_MAP = {
  '01d': SunIcon,
  '01n': MoonIcon,
  '02d': CloudSunIcon,
  '02n': CloudSunIcon,
  '03d': CloudIcon,
  '03n': CloudIcon,
  '04d': CloudIcon,
  '04n': CloudIcon,
  '09d': RainIcon,
  '09n': RainIcon,
  '10d': RainIcon,
  '10n': RainIcon,
  '11d': RainIcon,
  '11n': RainIcon,
  '13d': CloudIcon,
  '13n': CloudIcon,
  '50d': CloudIcon,
  '50n': CloudIcon,
}

export default function WeatherWidget() {
  const { weather, loading, error } = useWeather()
  const { getAdvice, loading: adviceLoading } = useWeatherAdvice()

  const IconComponent = weather ? (ICON_MAP[weather.icon] || SunIcon) : null

  const handleClick = async () => {
    if (adviceLoading) return
    const result = await getAdvice()
    if (result?.message) {
      speak(result.message)
    }
  }

  return (
    <NeumCard
      onClick={handleClick}
      className="flex flex-col items-center justify-center p-10 w-[286px]"
    >
      {loading && !weather && <LoadingState size="lg" className="h-full" />}
      {error && !weather && (
        <p className="text-neum-text-muted text-sm">No disponible</p>
      )}
      {weather && IconComponent && (
        <div className="flex flex-col items-center gap-6">
          <IconComponent className="mb-4"/>

          <p className="text-neum-text text-8xl font-extralight tracking-tight">
            {weather.temp}<span className="text-5xl font-light text-neum-text-muted align-super">º</span>
          </p>

          <p className="text-neum-text text-lg flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full inline-block ${weather.location === 'gps' ? 'bg-green-500' : 'bg-amber-500'}`} />
            {weather.city}
          </p>

          <div className="flex flex-col items-center gap-1">
            <p className="text-neum-text text-lg capitalize">{weather.description}</p>

            <p className="text-neum-text-muted text-sm">
              Sensaci&oacute;n de {weather.feels_like}º
            </p>

            <div className="w-4/5 h-px rounded-full bg-neum-primary-light/50" />

            <div className="flex gap-8">
              <span className="text-neum-text-muted text-sm flex items-center gap-1.5">
                <Icon name="droplet" className="w-4 h-4" />
                {weather.humidity}%
              </span>
              <span className="text-neum-text-muted text-sm flex items-center gap-1.5">
                <Icon name="wind" className="w-4 h-4" />
                {weather.wind_speed} km/h
              </span>
            </div>
          </div>
        </div>
      )}
    </NeumCard>
  )
}
