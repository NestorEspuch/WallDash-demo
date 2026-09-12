import { useRef, Suspense, lazy } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { LoadingState } from '../components/ui'
import YouTubeScreen from './YouTubeScreen'
import HomeScreen from './HomeScreen'
import { useScreenDimmer } from '../hooks/useScreenDimmer'

const CalendarScreen = lazy(() => import('./CalendarScreen'))

export default function Carousel() {
  const swiperRef = useRef(null)
  const { dimmed } = useScreenDimmer({ swiperRef })

  return (
    <>
      <div className={`w-screen h-screen ${dimmed ? 'pointer-events-none' : ''}`}>
        <Swiper
          onSwiper={(swiper) => { swiperRef.current = swiper }}
          loop
          initialSlide={1}
          slidesPerView={1}
          speed={300}
          allowTouchMove={!dimmed}
        >
          <SwiperSlide><YouTubeScreen /></SwiperSlide>
          <SwiperSlide><HomeScreen onNavigate={(index) => swiperRef.current?.slideToLoop(index, 300)} /></SwiperSlide>
          <SwiperSlide>
            <Suspense fallback={(
              <div className="w-screen h-screen bg-neum-bg flex items-center justify-center">
                <LoadingState />
              </div>
            )}>
              <CalendarScreen />
            </Suspense>
          </SwiperSlide>
        </Swiper>
      </div>

      {dimmed && (
        <div
          className="fixed inset-0 z-[9999] bg-black touch-none select-none pointer-events-auto"
        />
      )}
    </>
  )
}
