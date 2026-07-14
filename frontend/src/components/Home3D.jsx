import { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import './Home3D.css'

const WALL_H = 50

const ROOMS = [
  { id: 'living',  name: 'Living Room', color: '#6366f1', left: '0%',   top: '0%',   w: '56%', h: '55%', devices: ['livingLight', 'livingFan', 'tv', 'curtains'] },
  { id: 'bedroom', name: 'Bedroom',     color: '#38bdf8', left: '56%',  top: '0%',   w: '44%', h: '55%', devices: ['ac', 'airPurifier', 'bedLight'] },
  { id: 'kitchen', name: 'Kitchen',     color: '#f59e0b', left: '0%',   top: '55%',  w: '32%', h: '45%', devices: ['kitchenLight', 'kitchenExhaust'] },
  { id: 'study',   name: 'Study',       color: '#2dd4bf', left: '32%',  top: '55%',  w: '34%', h: '45%', devices: ['studyLight'] },
  { id: 'bathroom',name: 'Bathroom',    color: '#ec4899', left: '66%',  top: '55%',  w: '34%', h: '32%', devices: ['waterHeater'] },
  { id: 'door',    name: 'Main Door',   color: '#ef4444', left: '66%',  top: '87%',  w: '34%', h: '13%', devices: ['smartLock'] },
]

const FURNITURE = {
  living: [
    { type: 'sofa',  left: '8%',  bottom: '15%', w: '35%', h: '30%' },
    { type: 'table', left: '20%', bottom: '50%', w: '18%', h: '14%' },
    { type: 'tv',    left: '70%', top: '12%',    w: '22%', h: '8%'  },
  ],
  bedroom: [
    { type: 'bed',     left: '10%', top: '15%',  w: '50%', h: '65%' },
    { type: 'wardrobe',left: '70%', top: '10%',  w: '22%', h: '50%' },
  ],
  kitchen: [
    { type: 'counter', left: '5%',  top: '5%',   w: '90%', h: '15%' },
    { type: 'table',   left: '25%', bottom: '15%', w: '40%', h: '25%' },
  ],
  study: [
    { type: 'desk',  left: '10%', top: '10%', w: '60%', h: '20%' },
    { type: 'chair', left: '30%', top: '40%', w: '18%', h: '18%' },
  ],
  bathroom: [
    { type: 'tub',  left: '5%',  top: '10%', w: '45%', h: '55%' },
    { type: 'sink', left: '65%', top: '15%', w: '25%', h: '30%' },
  ],
}

const ROOM_TO_ID = { 'Living Room': 'living', Bedroom: 'bedroom', Kitchen: 'kitchen', Study: 'study', Bathroom: 'bathroom', 'Main Door': 'door' }

function Room3D({ room, status, isActive, devices, deviceStates, onDeviceToggle, onRoomClick, wallH }) {
  const st = status[room.id]
  const furn = FURNITURE[room.id] || []

  return (
    <div
      className={`h3d-room${st.active ? ' active' : ''}${isActive ? ' selected' : ''}`}
      style={{ left: room.left, top: room.top, width: room.w, height: room.h, '--rc': room.color }}
      onClick={() => onRoomClick(room.id)}
    >
      {/* Floor */}
      <div className="h3d-face h3d-floor-face" style={{ '--rc': room.color }}>
        {st.active && <div className="h3d-floor-glow" />}
      </div>

      {/* Back wall */}
      <div className="h3d-face h3d-wall-back" style={{ '--rc': room.color }} />

      {/* Left wall */}
      <div className="h3d-face h3d-wall-left" style={{ '--rc': room.color }} />

      {/* Right wall */}
      <div className="h3d-face h3d-wall-right" style={{ '--rc': room.color }} />

      {/* Front wall */}
      <div className="h3d-face h3d-wall-front" style={{ '--rc': room.color }} />

      {/* Furniture */}
      {furn.map((f, i) => (
        <div
          key={i}
          className={`h3d-furn h3d-furn-${f.type}`}
          style={{ left: f.left, top: f.top, bottom: f.bottom, width: f.w, height: f.h }}
        />
      ))}

      {/* Room label */}
      <div className="h3d-room-label">{room.name}</div>

      {/* Devices */}
      <div className="h3d-devices">
        {room.devices.map(devId => {
          const dev = devices.find(d => d.id === devId)
          if (!dev) return null
          const isOn = deviceStates[devId]?.on ?? false
          return (
            <div
              key={devId}
              className={`h3d-dev${isOn ? ' on' : ''}`}
              title={dev.name}
              onClick={(e) => { e.stopPropagation(); onDeviceToggle(devId) }}
            >
              <span>{dev.icon}</span>
              <div className={`h3d-dev-dot${isOn ? ' on' : ''}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Home3D({ devices, deviceStates, onDeviceToggle, activeRoom, onRoomClick }) {
  const [rotX, setRotX] = useState(50)
  const [rotZ, setRotZ] = useState(-30)
  const [zoom, setZoom] = useState(1)
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef({ sx: 0, sy: 0, rx: 0, rz: 0 })
  const sceneRef = useRef(null)

  const status = useMemo(() => {
    const s = {}
    for (const room of ROOMS) {
      const ds = room.devices.map(id => ({ id, on: deviceStates[id]?.on ?? false }))
      s[room.id] = { devices: ds, onCount: ds.filter(d => d.on).length, total: ds.length, active: ds.some(d => d.on) }
    }
    return s
  }, [deviceStates])

  const onPointerDown = useCallback((e) => {
    if (e.target.closest('.h3d-dev') || e.target.closest('.h3d-room-label')) return
    setDragging(true)
    dragRef.current = { sx: e.clientX, sy: e.clientY, rx: rotX, rz: rotZ }
  }, [rotX, rotZ])

  const onPointerMove = useCallback((e) => {
    if (!dragging) return
    const dx = e.clientX - dragRef.current.sx
    const dy = e.clientY - dragRef.current.sy
    setRotZ(dragRef.current.rz + dx * 0.35)
    setRotX(Math.max(15, Math.min(75, dragRef.current.rx - dy * 0.25)))
  }, [dragging])

  const onPointerUp = useCallback(() => setDragging(false), [])

  useEffect(() => {
    if (!dragging) return
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => { window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('pointerup', onPointerUp) }
  }, [dragging, onPointerMove, onPointerUp])

  const onWheel = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setZoom(z => Math.max(0.5, Math.min(2, z - e.deltaY * 0.001)))
  }, [])

  useEffect(() => {
    const el = sceneRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  const reset = () => { setRotX(50); setRotZ(-30); setZoom(1) }

  return (
    <div className="h3d-container">
      <div
        ref={sceneRef}
        className={`h3d-scene${dragging ? ' dragging' : ''}`}
        onPointerDown={onPointerDown}
      >
        <div
          className="h3d-house"
          style={{ transform: `rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale(${zoom})` }}
        >
          {/* Foundation / base slab */}
          <div className="h3d-base" />

          {/* Rooms */}
          {ROOMS.map(room => (
            <Room3D
              key={room.id}
              room={room}
              status={status}
              isActive={activeRoom === 'All' || ROOM_TO_ID[activeRoom] === room.id}
              devices={devices}
              deviceStates={deviceStates}
              onDeviceToggle={onDeviceToggle}
              onRoomClick={onRoomClick}
              wallH={WALL_H}
            />
          ))}
        </div>
      </div>

      <div className="h3d-controls">
        <button className="h3d-ctrl-btn" onClick={() => setRotZ(z => z - 90)}>↺</button>
        <button className="h3d-ctrl-btn reset" onClick={reset}>⟲ Reset</button>
        <button className="h3d-ctrl-btn" onClick={() => setRotZ(z => z + 90)}>↻</button>
        <div className="h3d-ctrl-sep" />
        <button className="h3d-ctrl-btn" onClick={() => setZoom(z => Math.min(2, z + 0.15))}>＋</button>
        <span className="h3d-ctrl-zoom">{Math.round(zoom * 100)}%</span>
        <button className="h3d-ctrl-btn" onClick={() => setZoom(z => Math.max(0.5, z - 0.15))}>－</button>
      </div>

      <div className="h3d-legend">
        <div className="h3d-leg-item"><div className="h3d-leg-dot on" />ON</div>
        <div className="h3d-leg-item"><div className="h3d-leg-dot" />OFF</div>
      </div>
    </div>
  )
}
