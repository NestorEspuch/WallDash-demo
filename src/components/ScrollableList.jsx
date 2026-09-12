import { useRef, useState, useEffect, useCallback } from 'react'

export default function ScrollableList({ children, className = '' }) {
  const containerRef = useRef(null)
  const [thumbHeight, setThumbHeight] = useState(0)
  const [thumbTop, setThumbTop] = useState(0)

  const updateThumb = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const { scrollHeight, clientHeight, scrollTop } = el
    if (scrollHeight <= clientHeight) {
      setThumbHeight(0)
      return
    }
    const trackHeight = clientHeight
    const height = Math.max((clientHeight / scrollHeight) * trackHeight, 30)
    const maxScroll = scrollHeight - clientHeight
    const maxThumbTop = trackHeight - height
    const top = maxScroll > 0 ? (scrollTop / maxScroll) * maxThumbTop : 0
    setThumbHeight(height)
    setThumbTop(top)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    updateThumb()
    el.addEventListener('scroll', updateThumb)
    window.addEventListener('resize', updateThumb)
    return () => {
      el.removeEventListener('scroll', updateThumb)
      window.removeEventListener('resize', updateThumb)
    }
  }, [updateThumb])

  return (
    <div className="flex-1 min-h-0 relative">
      <div
        ref={containerRef}
        className="h-full overflow-y-auto scrollbar-hidden"
      >
        <div className={className}>
          {children}
        </div>
      </div>
      {thumbHeight > 0 && (
        <div className="absolute top-0 right-1 bottom-0 w-1.5 rounded-full bg-neum-bg shadow-neum-inset-sm pointer-events-none">
          <div
            className="absolute right-0 w-1.5 rounded-full bg-neum-primary-light shadow-neum-sm"
            style={{ height: thumbHeight, top: thumbTop }}
          />
        </div>
      )}
    </div>
  )
}
