// API Utility — Centralized fetch layer for all backend calls
const BASE = '/api'

function getToken() {
  const user = JSON.parse(localStorage.getItem('smarthome_user') || '{}')
  return user.token || null
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(`${BASE}${path}`, opts)
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Request failed')
  return data
}

// ── Auth ──
export const authAPI = {
  register: (name, email, password) => request('POST', '/auth/register', { name, email, password }),
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  me: () => request('GET', '/auth/me'),
  updateProfile: (data) => request('PUT', '/auth/profile', data),
}

// ── Health ──
export const healthAPI = {
  check: () => request('GET', '/health'),
}

// ── Devices ──
export const devicesAPI = {
  getAll: () => request('GET', '/devices'),
  toggle: (device_id, state) => request('POST', '/device/toggle', { device_id, state }),
  bulkUpdate: (devices) => request('PUT', '/devices/state', { devices }),
  getOne: (id) => request('GET', `/device/${id}`),
}

// ── Gesture ──
export const gestureAPI = {
  send: (gesture, action, device_id, confidence) => request('POST', '/gesture', { gesture, action, device_id, confidence }),
  history: () => request('GET', '/gesture/history'),
}

// ── Chat ──
export const chatAPI = {
  send: (message) => request('POST', '/chat', { message }),
}

// ── Emergency ──
export const emergencyAPI = {
  getContacts: () => request('GET', '/emergency/contacts'),
  addContact: (name, phone, relation) => request('POST', '/emergency/contacts', { name, phone, relation }),
  deleteContact: (id) => request('DELETE', `/emergency/contacts/${id}`),
  trigger: (type, message) => request('POST', '/emergency/trigger', { type, message }),
}

// ── Weather ──
export const weatherAPI = {
  get: () => request('GET', '/weather'),
}

// ── Analytics ──
export const analyticsAPI = {
  get: () => request('GET', '/analytics'),
}

// ── Notifications ──
export const notificationsAPI = {
  getAll: () => request('GET', '/notifications'),
  add: (type, title, message, icon) => request('POST', '/notifications', { type, title, message, icon }),
  markAllRead: () => request('POST', '/notifications/read-all'),
}

// ── Admin ──
export const adminAPI = {
  stats: () => request('GET', '/admin/stats'),
  logs: () => request('GET', '/admin/logs'),
}

// ── Training ──
export const trainingAPI = {
  status: () => request('GET', '/training/status'),
  start: () => request('POST', '/training/start'),
  stop: () => request('POST', '/training/stop'),
}
