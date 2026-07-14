import { useState, useEffect } from 'react'
import { devicesAPI } from '../utils/api'
import Layout from '../components/Layout'
import Home3D from '../components/Home3D'
import './smarthomeControl.css'

const ROOMS = ['All', 'Living Room', 'Bedroom', 'Study', 'Kitchen']

const DEVICES = [
  { id: 'livingLight',   name: 'Living Room Light', room: 'Living Room',    icon: '💡', cat: 'light',   color: '#f59e0b' },
  { id: 'livingFan',    name: 'Bedroom Fan',        room: 'Living Room',    icon: '🌀', cat: 'fan',     color: '#2dd4bf' },
  { id: 'tv',           name: 'TV',                 room: 'Living Room',    icon: '📺', cat: 'tv',      color: '#818cf8' },
  { id: 'ac',           name: 'Air Conditioner',    room: 'Bedroom',        icon: '❄️', cat: 'ac',      color: '#38bdf8', temp: 24 },
  { id: 'smartLock',    name: 'Smart Lock',         room: 'Main Door',      icon: '🔒', cat: 'lock',    color: '#f59e0b', locked: true },
  { id: 'curtains',     name: 'Curtains',           room: 'Living Room',    icon: '🪟', cat: 'curtain', color: '#c084fc' },
  { id: 'waterHeater',  name: 'Water Heater',       room: 'Bathroom',       icon: '🚿', cat: 'heat',    color: '#fb923c' },
  { id: 'airPurifier',  name: 'Air Purifier',       room: 'Bedroom',        icon: '💨', cat: 'air',     color: '#22c55e' },
  { id: 'studyLight',   name: 'Study Light',        room: 'Study',          icon: '💡', cat: 'light',   color: '#f59e0b' },
  { id: 'kitchenLight', name: 'Kitchen Light',      room: 'Kitchen',        icon: '💡', cat: 'light',   color: '#f59e0b' },
  { id: 'kitchenExhaust','name': 'Exhaust Fan',     room: 'Kitchen',        icon: '💨', cat: 'fan',     color: '#2dd4bf' },
  { id: 'bedLight',     name: 'Bedroom Light',      room: 'Bedroom',        icon: '💡', cat: 'light',   color: '#f59e0b' },
]

const defaultState = Object.fromEntries(
  DEVICES.map(d => [d.id, { on: d.id === 'livingLight' || d.id === 'tv' || d.id === 'ac', temp: d.temp || null }])
)

export default function SmartHomePage() {
  const [activeRoom, setActiveRoom] = useState('All')
  const [devices, setDevices] = useState(defaultState)
  const [temps, setTemps] = useState({ ac: 24 })
  const [show3D, setShow3D] = useState(true)

  const fetchDevices = async () => {
    try {
      const res = await devicesAPI.getAll()
      const backendDevices = res.devices || {}
      setDevices(prev => {
        const next = { ...prev }
        for (const key of Object.keys(next)) {
          if (key in backendDevices) {
            next[key] = { ...next[key], on: !!backendDevices[key] }
          }
        }
        return next
      })
    } catch (err) {
      console.error('Failed to fetch devices:', err)
    }
  }

  useEffect(() => {
    fetchDevices()
    const interval = setInterval(fetchDevices, 30000)
    return () => clearInterval(interval)
  }, [])

  const toggle = async (id) => {
    const newState = !devices[id].on
    setDevices(prev => ({ ...prev, [id]: { ...prev[id], on: newState } }))
    try {
      await devicesAPI.toggle(id, newState)
    } catch (err) {
      console.error('Toggle failed:', err)
      setDevices(prev => ({ ...prev, [id]: { ...prev[id], on: !newState } }))
    }
  }

  const visibleDevices = activeRoom === 'All'
    ? DEVICES
    : DEVICES.filter(d => d.room === activeRoom)

  const onCount = Object.values(devices).filter(d => d.on).length

  return (
    <Layout title="Smart Home">
      <div className="anim-fade-up">
        {/* Header */}
        <div className="sh-ctrl-header">
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 4 }}>🏡 Smart Home</h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>Manage your devices</p>
          </div>
          <div className="sh-ctrl-stats">
            <div className="sh-ctrl-stat">
              <span className="sh-ctrl-stat-val" style={{ color: 'var(--green)' }}>{onCount}</span>
              <span className="sh-ctrl-stat-lbl">ON</span>
            </div>
            <div className="sh-ctrl-stat-divider"></div>
            <div className="sh-ctrl-stat">
              <span className="sh-ctrl-stat-val">{DEVICES.length - onCount}</span>
              <span className="sh-ctrl-stat-lbl">OFF</span>
            </div>
            <div className="sh-ctrl-stat-divider"></div>
            <div className="sh-ctrl-stat">
              <span className="sh-ctrl-stat-val">{DEVICES.length}</span>
              <span className="sh-ctrl-stat-lbl">TOTAL</span>
            </div>
          </div>
        </div>

        {/* Room Tabs */}
        <div className="sh-room-tabs">
          {ROOMS.map(r => (
            <button
              key={r}
              className={`sh-room-tab${activeRoom === r ? ' active' : ''}`}
              onClick={() => setActiveRoom(r)}
            >{r}</button>
          ))}
        </div>

        {/* 3D Home Layout */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div>
              <div className="card-title">🏠 3D Home Layout</div>
              <div className="card-subtitle">Click rooms to filter devices. Click device icons to toggle.</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text3)', fontWeight: 600 }}>
                {show3D ? 'ON' : 'OFF'}
              </span>
              <div
                className={`toggle${show3D ? ' on' : ''}`}
                onClick={() => setShow3D(v => !v)}
                style={{ cursor: 'pointer' }}
              >
                <div className="toggle-knob"></div>
              </div>
            </div>
          </div>
          {show3D && (
            <Home3D
              devices={DEVICES}
              deviceStates={devices}
              onDeviceToggle={toggle}
              activeRoom={activeRoom}
              onRoomClick={(roomId) => {
                const roomMap = { living: 'Living Room', bedroom: 'Bedroom', kitchen: 'Kitchen', study: 'Study', bathroom: 'Bathroom', door: 'Main Door' }
                setActiveRoom(roomMap[roomId] || 'All')
              }}
            />
          )}
        </div>

        {/* Device Grid */}
        <div className="sh-device-grid">
          {visibleDevices.map(dev => {
            const isOn = devices[dev.id]?.on
            return (
              <div
                key={dev.id}
                className={`sh-device-card${isOn ? ' on' : ''}`}
                style={{ '--acc': dev.color }}
                onClick={() => toggle(dev.id)}
              >
                <div className="sh-dc-glow"></div>
                <div className="sh-dc-top">
                  <span className="sh-dc-icon">{dev.icon}</span>
                  <div className={`toggle${isOn ? ' on' : ''}`} onClick={e => { e.stopPropagation(); toggle(dev.id) }}>
                    <div className="toggle-knob"></div>
                  </div>
                </div>
                <div className="sh-dc-name">{dev.name}</div>
                <div className="sh-dc-room">{dev.room}</div>
                <div className={`sh-dc-status${isOn ? ' on' : ''}`}>
                  {dev.cat === 'ac' && isOn ? `${temps.ac}°C` : isOn ? '● ON' : '○ OFF'}
                </div>
              </div>
            )
          })}
        </div>

        {/* AC Temperature (if AC is on) */}
        {devices['ac']?.on && (
          <div className="card" style={{ maxWidth: 420 }}>
            <div className="card-title" style={{ marginBottom: 14 }}>❄️ Air Conditioner — Temperature</div>
            <div style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 900, color: 'var(--blue)', marginBottom: 12 }}>
              {temps.ac}°C
            </div>
            <input
              type="range"
              min={16} max={30}
              value={temps.ac}
              onChange={e => setTemps(t => ({ ...t, ac: +e.target.value }))}
              className="sh-temp-range-input"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text3)', marginTop: 5 }}>
              <span>16°C</span><span>30°C</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
