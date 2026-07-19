import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { devicesAPI } from '../utils/api'
import './deviceManagement.css'

const DEVICE_ICONS = {
  light: '💡', fan: '🌀', tv: '📺', lock: '🔒',
  ac: '❄️', curtain: '🪟', heat: '🚿', air: '💨',
}

const DEVICE_META = {
  light:    { name: 'Living Room Light', room: 'Living Room',  cat: 'light'   },
  fan:      { name: 'Bedroom Fan',       room: 'Bedroom',      cat: 'fan'     },
  tv:       { name: 'Smart TV',          room: 'Living Room',  cat: 'tv'      },
  lock:     { name: 'Smart Lock',        room: 'Main Door',    cat: 'lock'    },
  ac:       { name: 'Air Conditioner',   room: 'Bedroom',      cat: 'ac'      },
  curtains: { name: 'Curtains',          room: 'Living Room',  cat: 'curtain' },
}

function getDeviceMeta(key) {
  const lower = key.toLowerCase()
  if (DEVICE_META[lower]) return DEVICE_META[lower]
  
  let brandSuffix = ''
  let cleanKey = lower
  let room = 'Living Room'
  
  if (lower.startsWith('philips_hue_')) {
    brandSuffix = ' (Hue)'
    cleanKey = lower.replace('philips_hue_', '')
    room = 'Living Room'
  } else if (lower.startsWith('xiaomi_home_')) {
    brandSuffix = ' (Xiaomi)'
    cleanKey = lower.replace('xiaomi_home_', '')
    room = 'Master Bedroom'
  } else if (lower.startsWith('tplink_kasa_')) {
    brandSuffix = ' (Kasa)'
    cleanKey = lower.replace('tplink_kasa_', '')
    room = 'Kitchen'
  } else if (lower.startsWith('google_home_')) {
    brandSuffix = ' (Google)'
    cleanKey = lower.replace('google_home_', '')
    room = 'Study Room'
  } else if (lower.startsWith('apple_home_')) {
    brandSuffix = ' (Apple)'
    cleanKey = lower.replace('apple_home_', '')
    room = 'Main Door'
  } else if (lower.startsWith('amazon_alexa_')) {
    brandSuffix = ' (Alexa)'
    cleanKey = lower.replace('amazon_alexa_', '')
    room = 'Outdoor'
  }
  
  const name = cleanKey.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + brandSuffix
  
  let cat = 'light'
  if (cleanKey.includes('light') || cleanKey.includes('bulb')) cat = 'light'
  else if (cleanKey.includes('fan') || cleanKey.includes('exhaust')) cat = 'fan'
  else if (cleanKey.includes('tv') || cleanKey.includes('speaker') || cleanKey.includes('hub') || cleanKey.includes('monitor')) cat = 'tv'
  else if (cleanKey.includes('ac') || cleanKey.includes('purifier') || cleanKey.includes('climate')) cat = 'ac'
  else if (cleanKey.includes('lock')) cat = 'lock'
  else if (cleanKey.includes('curtain')) cat = 'curtain'
  else if (cleanKey.includes('plug') || cleanKey.includes('switch')) cat = 'light'
  
  return { name, room, cat }
}

export default function DeviceManagementPage() {
  const [devices, setDevices] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newDevice, setNewDevice] = useState({ name: '', room: '' })
  const [loading, setLoading] = useState(true)

  const fetchDevices = () => {
    devicesAPI.getAll()
      .then(data => {
        const raw = data.devices || {}
        const list = Object.entries(raw).map(([key, isOn]) => {
          const meta = getDeviceMeta(key)
          return {
            id: key,
            name: meta.name,
            room: meta.room,
            cat: meta.cat,
            status: isOn ? 'online' : 'offline',
            lastSeen: isOn ? 'Active now' : 'Inactive',
          }
        })
        setDevices(list)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchDevices() }, [])

  const toggle = async (id, currentStatus) => {
    try {
      const newState = currentStatus !== 'online'
      await devicesAPI.toggle(id, newState)
      setDevices(d => d.map(dev =>
        dev.id === id
          ? { ...dev, status: newState ? 'online' : 'offline', lastSeen: newState ? 'Active now' : 'Inactive' }
          : dev
      ))
    } catch { /* silent */ }
  }

  const remove = (i) => setDevices(d => d.filter((_, idx) => idx !== i))

  const addDevice = () => {
    if (!newDevice.name || !newDevice.room) return
    setDevices(d => [...d, {
      id: newDevice.name.toLowerCase().replace(/\s+/g, '_'),
      name: newDevice.name,
      room: newDevice.room,
      cat: 'light',
      status: 'online',
      lastSeen: 'Just added'
    }])
    setNewDevice({ name: '', room: '' })
    setShowAdd(false)
  }

  const onlineCount  = devices.filter(d => d.status === 'online').length
  const offlineCount = devices.filter(d => d.status === 'offline').length

  if (loading) {
    return (
      <Layout title="Device Management">
        <div className="anim-fade-up" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: '2rem', opacity: 0.2, marginBottom: 12 }}>🔌</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text2)' }}>Loading devices...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Device Management">
      <div className="anim-fade-up">
        {/* Header */}
        <div className="dv-header">
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 3 }}>🔌 Device Management</h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>
              {devices.length} device{devices.length !== 1 ? 's' : ''} configured · {onlineCount} online
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={fetchDevices}
              style={{ fontSize: '0.78rem' }}
            >
              🔄 Refresh
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowAdd(v => !v)}
            >
              {showAdd ? '✕ Cancel' : '+ Add Device'}
            </button>
          </div>
        </div>

        {/* Add Device Form */}
        {showAdd && (
          <div className="card dv-add-form" style={{ marginBottom: 18 }}>
            <div className="card-title">Add New Device</div>
            <div className="dv-add-inputs">
              <input
                className="dv-input"
                placeholder="Device name (e.g. Bedroom Light)..."
                value={newDevice.name}
                onChange={e => setNewDevice(n => ({ ...n, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addDevice()}
              />
              <input
                className="dv-input"
                placeholder="Room (e.g. Bedroom)..."
                value={newDevice.room}
                onChange={e => setNewDevice(n => ({ ...n, room: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addDevice()}
              />
              <button className="btn btn-primary" onClick={addDevice}>Add</button>
            </div>
          </div>
        )}

        {/* Device Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
          <div className="dv-table-wrap">
            {devices.length === 0 ? (
              <div className="dv-empty">
                <div className="dv-empty-icon">🔌</div>
                <div className="dv-empty-text">No devices found</div>
                <div className="dv-empty-hint">Add a device above or wait for auto-discovery</div>
              </div>
            ) : (
              <table className="dv-table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Room</th>
                    <th>Status</th>
                    <th>Last Seen</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((dev, i) => (
                    <tr key={dev.id || i}>
                      <td>
                        <div className={`dv-device-name-cell${dev.status === 'online' ? ' online' : ''}`}>
                          <div className="dv-device-icon-wrap">
                            {DEVICE_ICONS[dev.cat] || '🔌'}
                          </div>
                          <div>
                            <div className="dv-device-name">{dev.name}</div>
                            <div className="dv-device-id">{dev.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="dv-room-tag">🏠 {dev.room}</span>
                      </td>
                      <td>
                        <span className={`dv-status-badge ${dev.status}`}>
                          {dev.status === 'online' && (
                            <span className="live-dot" style={{ width: 5, height: 5, flexShrink: 0 }}></span>
                          )}
                          {dev.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td>
                        <span className="dv-last-seen">{dev.lastSeen}</span>
                      </td>
                      <td>
                        <div className="dv-actions">
                          <button
                            className="dv-action-btn"
                            title={dev.status === 'online' ? 'Turn Off' : 'Turn On'}
                            onClick={() => toggle(dev.id, dev.status)}
                          >
                            {dev.status === 'online' ? '⏸' : '▶'}
                          </button>
                          <button
                            className="dv-action-btn"
                            title="Configure"
                          >
                            ⚙️
                          </button>
                          <button
                            className="dv-action-btn danger"
                            title="Remove"
                            onClick={() => remove(i)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* KPI Strip */}
        <div className="dv-kpi-strip">
          <div className="card dv-kpi">
            <div className="dv-kpi-icon">🔌</div>
            <div>
              <div className="dv-kpi-val">{devices.length}</div>
              <div className="dv-kpi-label">Total Devices</div>
            </div>
          </div>
          <div className="card dv-kpi">
            <div className="dv-kpi-icon" style={{ background: 'rgba(34,197,94,0.1)' }}>✅</div>
            <div>
              <div className="dv-kpi-val" style={{ color: '#22c55e' }}>{onlineCount}</div>
              <div className="dv-kpi-label">Online</div>
            </div>
          </div>
          <div className="card dv-kpi">
            <div className="dv-kpi-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>❌</div>
            <div>
              <div className="dv-kpi-val" style={{ color: '#ef4444' }}>{offlineCount}</div>
              <div className="dv-kpi-label">Offline</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
