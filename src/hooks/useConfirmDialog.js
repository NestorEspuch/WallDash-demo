import { useState, useCallback } from 'react'

export default function useConfirmDialog() {
  const [item, setItem] = useState(null)

  const open = useCallback((target) => {
    setItem(target)
  }, [])

  const close = useCallback(() => {
    setItem(null)
  }, [])

  return { item, open, close, isOpen: item !== null }
}
