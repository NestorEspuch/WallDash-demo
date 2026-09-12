const FALLBACK_COORDS = {
  lat: parseFloat(import.meta.env.VITE_FALLBACK_LAT) || 40.4168,
  lon: parseFloat(import.meta.env.VITE_FALLBACK_LON) || -3.7038,
}

let cachedCoords = null
let resolved = false

export function requestPosition() {
  if (resolved) return

  if (!navigator.geolocation) {
    resolved = true
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      cachedCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude }
      resolved = true
    },
    () => {
      resolved = true
    },
    { timeout: 5000, enableHighAccuracy: false }
  )
}

export function getCoords() {
  return cachedCoords || FALLBACK_COORDS
}

export function hasGps() {
  return cachedCoords !== null
}
