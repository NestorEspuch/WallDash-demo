const API = import.meta.env.VITE_ROBOROCK_API_URL + '/api/roborock'
const KEY = import.meta.env.VITE_ROBOROCK_API_KEY

async function request(path, method = 'GET', body = null) {
  const headers = { 'X-API-Key': KEY }
  if (body) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || `Error ${res.status}`)
  }
  return res.json()
}

export async function fetchStatus() {
  return request('/status')
}

export async function startCleaning() {
  return request('/start', 'POST')
}

export async function stopCleaning() {
  return request('/stop', 'POST')
}

export async function returnToDock() {
  return request('/dock', 'POST')
}

export async function checkAuthStatus() {
  return request('/auth/status')
}

export async function requestAuthCode() {
  return request('/auth/request-code', 'POST')
}

export async function verifyAuthCode(code) {
  return request('/auth/verify-code', 'POST', { code })
}
