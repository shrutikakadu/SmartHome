import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { authAPI, notificationsAPI } from '../utils/api'

export default function TopBar({ title = 'Dashboard' }) {
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const user = JSON.parse(localStorage.getItem('smarthome_user') || '{}')

  // Settings state
  const loadSettings = () => {
    try {
      return JSON.parse(localStorage.getItem('smarthome_settings') || '{}')
    } catch { return {} }
  }
  const saved = loadSettings()
  const [settings, setSettings] = useState({
    notifications: saved.notifications ?? true,
    darkMode: saved.darkMode ?? true,
    soundEffects: saved.soundEffects ?? false,
    mqttAutoConnect: saved.mqttAutoConnect ?? true,
  })

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const saveSettings = () => {
    localStorage.setItem('smarthome_settings', JSON.stringify(settings))
    setShowSettings(false)
    if (!settings.darkMode) {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  // Apply dark mode on mount
  useEffect(() => {
    if (!settings.darkMode) {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])
  const [editName, setEditName] = useState(user.name || 'User')
  const [editEmail, setEditEmail] = useState(user.email || 'user@email.com')
  const [editPhone, setEditPhone] = useState(user.phone || '')
  const notifRef = useRef(null)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Fetch notifications
  const fetchNotifs = async () => {
    try {
      const data = await notificationsAPI.getAll()
      setNotifications(data.notifications || [])
      setUnreadCount((data.notifications || []).filter(n => !n.read).length)
    } catch {}
  }

  useEffect(() => {
    fetchNotifs()
    const id = setInterval(fetchNotifs, 15000)
    return () => clearInterval(id)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    if (notifOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  const notifIcon = (type) => {
    if (type === 'gesture') return '🤚'
    if (type === 'warning') return '⚠️'
    if (type === 'success') return '✅'
    return '🔔'
  }

  return (
    <header className="topbar">
      {/* Search */}
      <div className="topbar-search">
        <span className="topbar-search-icon">🔍</span>
        <input type="text" placeholder="Search..." />
      </div>

      {/* Actions */}
      <div className="topbar-actions">
        {/* Clock */}
        <span style={{ fontSize: '0.75rem', color: 'var(--text2)', fontFamily: "'JetBrains Mono', monospace", padding: '0 4px' }}>
          {timeStr}
        </span>

        {/* Refresh */}
        <button className="topbar-icon-btn" title="Refresh" onClick={() => window.location.reload()}>🔄</button>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button className="topbar-icon-btn" title="Notifications" onClick={() => setNotifOpen(v => !v)}>
            🔔
            {unreadCount > 0 && <span className="badge" style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: 'var(--red)', borderRadius: '50%', border: '2px solid var(--bg2)', fontSize: '0.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
                )}
              </div>
              <div className="notif-dropdown-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">No notifications yet</div>
                ) : (
                  notifications.slice(0, 10).map(n => (
                    <div key={n.id} className={`notif-item${n.read ? '' : ' unread'}`}>
                      <div className="notif-item-icon">{n.icon || notifIcon(n.type)}</div>
                      <div className="notif-item-content">
                        <div className="notif-item-title">{n.title}</div>
                        <div className="notif-item-msg">{n.message}</div>
                        <div className="notif-item-time">{n.timestamp}</div>
                      </div>
                      {!n.read && <div className="notif-unread-dot"></div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button className="topbar-icon-btn" title="Settings" onClick={() => setShowSettings(true)}>⚙️</button>

        {/* User - Click to edit profile */}
        <div className="topbar-user" onClick={() => { setEditName(user.name || 'User'); setEditEmail(user.email || 'user@email.com'); setShowProfile(true); }} style={{ cursor: 'pointer' }}>
          <div className="topbar-user-avatar">{(user.name || 'A')[0].toUpperCase()}</div>
          <span className="topbar-user-name">{user.name || 'Anjali'}</span>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && createPortal(
        <div className="topbar-modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="topbar-modal" onClick={e => e.stopPropagation()}>
            <div className="topbar-modal-header">
              <h3>⚙️ Settings</h3>
              <button className="topbar-modal-close" onClick={() => setShowSettings(false)}>×</button>
            </div>
            <div className="topbar-modal-body">
              <div className="topbar-settings-item">
                <span>🔔 Notifications</span>
                <div className={`toggle${settings.notifications ? ' on' : ''}`} onClick={() => toggleSetting('notifications')}><div className="toggle-knob"></div></div>
              </div>
              <div className="topbar-settings-item">
                <span>🌙 Dark Mode</span>
                <div className={`toggle${settings.darkMode ? ' on' : ''}`} onClick={() => toggleSetting('darkMode')}><div className="toggle-knob"></div></div>
              </div>
              <div className="topbar-settings-item">
                <span>🔊 Sound Effects</span>
                <div className={`toggle${settings.soundEffects ? ' on' : ''}`} onClick={() => toggleSetting('soundEffects')}><div className="toggle-knob"></div></div>
              </div>
              <div className="topbar-settings-item">
                <span>📡 MQTT Auto-Connect</span>
                <div className={`toggle${settings.mqttAutoConnect ? ' on' : ''}`} onClick={() => toggleSetting('mqttAutoConnect')}><div className="toggle-knob"></div></div>
              </div>
              <div className="topbar-modal-actions">
                <button className="btn btn-ghost" onClick={() => setShowSettings(false)}>Close</button>
                <button className="btn btn-primary" onClick={saveSettings}>Save</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Profile Edit Modal */}
      {showProfile && createPortal(
        <div className="topbar-modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="topbar-modal" onClick={e => e.stopPropagation()}>
            <div className="topbar-modal-header">
              <h3>👤 Edit Profile</h3>
              <button className="topbar-modal-close" onClick={() => setShowProfile(false)}>×</button>
            </div>
            <div className="topbar-modal-body">
              <div className="topbar-profile-avatar-large">{(editName || 'U')[0].toUpperCase()}</div>
              <div className="topbar-profile-field">
                <label>Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="topbar-profile-field">
                <label>Email</label>
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="Your email" />
              </div>
              <div className="topbar-profile-field">
                <label>Mobile Number</label>
                <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div className="topbar-modal-actions">
                <button className="btn btn-ghost" onClick={() => setShowProfile(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={async () => {
                  try {
                    const updated = await authAPI.updateProfile({ name: editName, email: editEmail })
                    localStorage.setItem('smarthome_user', JSON.stringify({ ...user, name: updated.name, email: updated.email, phone: editPhone }))
                    setShowProfile(false)
                    window.location.reload()
                  } catch (err) {
                    alert('Failed to update profile: ' + err.message)
                  }
                }}>Save Changes</button>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
                <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={() => {
                  localStorage.removeItem('smarthome_user')
                  navigate('/auth', { replace: true })
                }}>⏻ Logout</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  )
}
