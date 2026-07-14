import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { devicesAPI } from '../utils/api'
import './deviceManagement.css'

const DEVICE_META = {
  light:       { name: 'Living Room Light', room: 'Living Room' },
  fan:         { name: 'Bedroom Fan',       room: 'Bedroom' },
  tv:          { name: 'TV',                room: 'Living Room' },
  lock:        { name: 'Smart Lock',        room: 'Main Door' },
  ac:          { name: 'Air Conditioner',   room: 'Bedroom' },
  curtains:    { name: 'Curtains',          room: 'Living Room' },
}

function getDeviceMeta(key) {
  const lower = key.toLowerCase()
  if (DEVICE_META[lower]) return DEVICE_META[lower]
  if (lower.includes('light'))  return { name: 'Light',  room: 'Living Room' }
  if (lower.includes('fan'))    return { name: 'Fan',    room: 'Bedroom' }
  if (lower.includes('tv'))     return { name: 'TV',     room: 'Living Room' }
  if (lower.includes('ac') || lower.includes('air')) return { name: 'Air Conditioner', room: 'Bedroom' }
  if (lower.includes('lock'))   return { name: 'Smart Lock', room: 'Main Door' }
  if (lower.includes('curtain'))return { name: 'Curtains', room: 'Living Room' }
  return { name: key, room: 'Unknown' }
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
            status: isOn ? 'Online' : 'Offline',
            lastSeen: isOn ? 'Active now' : '—',
          }
        })
        setDevices(list)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchDevices() }, [])

  const toggle = async (id, currentState) => {
    try {
      const newState = currentState === 'Online' ? false : true
      await devicesAPI.toggle(id, newState)
      setDevices(d => d.map(dev =>
        dev.id === id
          ? { ...dev, status: newState ? 'Online' : 'Offline', lastSeen: newState ? 'Active now' : '—' }
          : dev
      ))
    } catch {
      /* silently fail */
    }
  }

  const remove = (i) => setDevices(d => d.filter((_, idx) => idx !== i))

  const addDevice = () => {
    if (!newDevice.name || !newDevice.room) return
    setDevices(d => [...d, { id: newDevice.name, name: newDevice.name, room: newDevice.room, status: 'Online', lastSeen: 'Just now' }])
    setNewDevice({ name: '', room: '' })
    setShowAdd(false)
  }

  if (loading) {
    return (
      <Layout title="Device Management">
        <div className="anim-fade-up" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: '1.2rem', color: 'var(--text2)' }}>Loading devices...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Device Management">
      <div className="anim-fade-up">
        <div className="dv-header">
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 3 }}>🔌 Device Management</h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>Add, remove and configure devices</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(v => !v)}>+ Add Device</button>
        </div>

        {/* Add Form */}
        {showAdd && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Add New Device</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                className="chat-input" style={{ flex: 1, minWidth: 200 }}
                placeholder="Device name..."
                value={newDevice.name}
                onChange={e => setNewDevice(n => ({ ...n, name: e.target.value }))}
              />
              <input
                className="chat-input" style={{ flex: 1, minWidth: 150 }}
                placeholder="Room..."
                value={newDevice.room}
                onChange={e => setNewDevice(n => ({ ...n, room: e.target.value }))}
              />
              <button className="btn btn-primary" onClick={addDevice}>Add</button>
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="gh-table">
              <thead>
                <tr>
                  <th>Device Name</th>
                  <th>Room</th>
                  <th>Status</th>
                  <th>Last Seen</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((dev, i) => (
                  <tr key={dev.id || i} className="gh-table-row">
                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>{dev.name}</td>
                    <td style={{ color: 'var(--text2)' }}>{dev.room}</td>
                    <td>
                      <span className={`badge ${dev.status === 'Online' ? 'badge-green' : 'badge-red'}`}>
                        {dev.status === 'Online' && <span className="live-dot" style={{ width: 5, height: 5 }}></span>}
                        {dev.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text3)', fontSize: '0.72rem', fontFamily: 'monospace' }}>{dev.lastSeen}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" title="Toggle" onClick={() => toggle(dev.id, dev.status)}>🔄</button>
                        <button className="btn btn-danger btn-sm" title="Delete" onClick={() => remove(i)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="grid-3">
          <div className="kpi-card">
            <div className="kpi-icon">🔌</div>
            <div className="kpi-value">{devices.length}</div>
            <div className="kpi-label">Total Devices</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">✅</div>
            <div className="kpi-value" style={{ color: 'var(--green)' }}>{devices.filter(d => d.status === 'Online').length}</div>
            <div className="kpi-label">Online</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">❌</div>
            <div className="kpi-value" style={{ color: 'var(--red)' }}>{devices.filter(d => d.status === 'Offline').length}</div>
            <div className="kpi-label">Offline</div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
