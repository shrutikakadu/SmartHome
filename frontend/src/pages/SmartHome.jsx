import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { recognizeSign } from '../utils/recognizer'
import Home3D from '../components/Home3D'
import EcosystemPage from './EcosystemPage'
import './smarthome.css'

/* ══════════════════════════════════════════════════════════════
}

/* ══════════════════════════════════════════════════════════════
   DEVICE REGISTRY — all 22 devices
══════════════════════════════════════════════════════════════ */
const DEVICE_DEFS = [
  // Living Room
  { id: 'livingLight',    name: 'Living Light',      room: 'Living Room',    icon: '💡', cat: 'lights',   watt: 12,   color: '#fbbf24' },
  { id: 'livingFan',      name: 'Ceiling Fan',        room: 'Living Room',    icon: '🌀', cat: 'climate',  watt: 75,   color: '#2dd4bf' },
  { id: 'livingTV',       name: 'Smart TV',           room: 'Living Room',    icon: '📺', cat: 'av',       watt: 130,  color: '#818cf8' },
  { id: 'livingCurtain',  name: 'Curtains',           room: 'Living Room',    icon: '🪟', cat: 'curtains', watt: 0,    color: '#c084fc' },
  { id: 'livingSpeaker',  name: 'Smart Speaker',      room: 'Living Room',    icon: '🔊', cat: 'av',       watt: 15,   color: '#60a5fa' },
  // Master Bedroom
  { id: 'bedLight',       name: 'Bedroom Light',      room: 'Master Bedroom', icon: '💡', cat: 'lights',   watt: 10,   color: '#fbbf24' },
  { id: 'bedAC',          name: 'Air Conditioner',    room: 'Master Bedroom', icon: '❄️', cat: 'climate',  watt: 1500, color: '#38bdf8' },
  { id: 'bedCurtain',     name: 'Curtains',           room: 'Master Bedroom', icon: '🪟', cat: 'curtains', watt: 0,    color: '#f9a8d4' },
  { id: 'bedThermostat',  name: 'Thermostat',         room: 'Master Bedroom', icon: '🌡️', cat: 'climate',  watt: 2,    color: '#fb923c' },
  // Kids Room
  { id: 'kidsLight',      name: 'Kids Light',         room: 'Kids Room',      icon: '💡', cat: 'lights',   watt: 10,   color: '#fbbf24' },
  { id: 'kidsCurtain',    name: 'Curtains',           room: 'Kids Room',      icon: '🪟', cat: 'curtains', watt: 0,    color: '#f9a8d4' },
  { id: 'kidsNightLight', name: 'Night Light',        room: 'Kids Room',      icon: '🌙', cat: 'lights',   watt: 3,    color: '#a78bfa' },
  // Kitchen
  { id: 'kitchenLight',   name: 'Kitchen Light',      room: 'Kitchen',        icon: '💡', cat: 'lights',   watt: 14,   color: '#fbbf24' },
  { id: 'kitchenExhaust', name: 'Exhaust Fan',        room: 'Kitchen',        icon: '💨', cat: 'climate',  watt: 60,   color: '#2dd4bf' },
  // Study
  { id: 'studyLight',     name: 'Study Light',        room: 'Study Room',     icon: '💡', cat: 'lights',   watt: 12,   color: '#4ade80' },
  { id: 'studyMonitor',   name: 'Monitor',            room: 'Study Room',     icon: '🖥️', cat: 'av',       watt: 45,   color: '#818cf8' },
  // Bathroom
  { id: 'bathLight',      name: 'Bathroom Light',     room: 'Bathroom',       icon: '💡', cat: 'lights',   watt: 8,    color: '#67e8f9' },
  { id: 'bathExhaust',    name: 'Exhaust',            room: 'Bathroom',       icon: '💨', cat: 'climate',  watt: 30,   color: '#2dd4bf' },
  // Security / Outdoor
  { id: 'frontDoor',      name: 'Smart Lock',         room: 'Main Door',      icon: '🔒', cat: 'security', watt: 1,    color: '#f59e0b' },
  { id: 'gateLight',      name: 'Gate Light',         room: 'Outdoor',        icon: '💡', cat: 'lights',   watt: 20,   color: '#fbbf24' },
  { id: 'alarm',          name: 'Security Alarm',     room: 'System',         icon: '🔔', cat: 'security', watt: 5,    color: '#ef4444' },
  { id: 'doorbell',       name: 'Video Doorbell',     room: 'Main Door',      icon: '📹', cat: 'security', watt: 8,    color: '#f97316' },
]

/* ══════════════════════════════════════════════════════════════
   GESTURE MAP — 18 gestures
══════════════════════════════════════════════════════════════ */
const GESTURE_MAP = {
  'Hello': { label: 'All Lights ON',          icon: '💡', action: 'scene', sceneId: 'allOn'      },
  'S':     { label: 'Away / Sleep',           icon: '🌙', action: 'scene', sceneId: 'allOff'     },
  'K':     { label: 'Cozy Night',             icon: '🕯️', action: 'scene', sceneId: 'cozy'       },
  'F':     { label: 'Good Morning',           icon: '☀️', action: 'scene', sceneId: 'morning'    },
  'W':     { label: 'Movie Mode',             icon: '🎬', action: 'scene', sceneId: 'movie'      },
  'L':     { label: 'Living Room Light',      icon: '💡', action: 'toggle', device: 'livingLight' },
  'B':     { label: 'Living Fan Toggle',      icon: '🌀', action: 'toggle', device: 'livingFan'   },
  'V':     { label: 'TV Toggle',             icon: '📺', action: 'toggle', device: 'livingTV'    },
  'Y':     { label: 'Bedroom AC Toggle',      icon: '❄️', action: 'toggle', device: 'bedAC'       },
  'I':     { label: 'Bedroom Light',          icon: '🛏️', action: 'toggle', device: 'bedLight'    },
  'U':     { label: 'Toggle All Curtains',    icon: '🪟', action: 'scene', sceneId: 'curtains'   },
  'D':     { label: 'Front Door Lock',        icon: '🔒', action: 'toggle', device: 'frontDoor'   },
  'A':     { label: 'Security Alarm OFF',     icon: '🔕', action: 'set',    device: 'alarm', val: false },
  'C':     { label: 'Kids Room Light',        icon: '🧸', action: 'toggle', device: 'kidsLight'   },
  'E':     { label: 'Kitchen Light',          icon: '🍳', action: 'toggle', device: 'kitchenLight' },
  'R':     { label: 'Study Light',            icon: '📚', action: 'toggle', device: 'studyLight'  },
}

/* ══════════════════════════════════════════════════════════════
   SCENE PRESETS
══════════════════════════════════════════════════════════════ */
const SCENE_PRESETS = {
  allOn: {
    livingLight: true, livingFan: true, livingTV: false, livingCurtain: true, livingSpeaker: false,
    bedLight: true, bedAC: false, bedCurtain: true, bedThermostat: true,
    kidsLight: true, kidsCurtain: true, kidsNightLight: false,
    kitchenLight: true, kitchenExhaust: false,
    studyLight: true, studyMonitor: false,
    bathLight: false, bathExhaust: false,
    frontDoor: false, gateLight: true, alarm: false, doorbell: true
  },
  allOff: {
    livingLight: false, livingFan: false, livingTV: false, livingCurtain: false, livingSpeaker: false,
    bedLight: false, bedAC: false, bedCurtain: false, bedThermostat: false,
    kidsLight: false, kidsCurtain: false, kidsNightLight: true,
    kitchenLight: false, kitchenExhaust: false,
    studyLight: false, studyMonitor: false,
    bathLight: false, bathExhaust: false,
    frontDoor: true, gateLight: false, alarm: true, doorbell: true
  },
  cozy: {
    livingLight: true, livingFan: false, livingTV: true, livingCurtain: false, livingSpeaker: true,
    bedLight: false, bedAC: true, bedCurtain: false, bedThermostat: true,
    kidsLight: false, kidsCurtain: false, kidsNightLight: true,
    kitchenLight: false, kitchenExhaust: false,
    studyLight: false, studyMonitor: false,
    bathLight: false, bathExhaust: false,
    frontDoor: true, gateLight: true, alarm: true, doorbell: true
  },
  morning: {
    livingLight: true, livingFan: true, livingTV: false, livingCurtain: true, livingSpeaker: true,
    bedLight: true, bedAC: false, bedCurtain: true, bedThermostat: false,
    kidsLight: true, kidsCurtain: true, kidsNightLight: false,
    kitchenLight: true, kitchenExhaust: true,
    studyLight: false, studyMonitor: false,
    bathLight: true, bathExhaust: true,
    frontDoor: false, gateLight: false, alarm: false, doorbell: true
  },
  movie: {
    livingLight: false, livingFan: true, livingTV: true, livingCurtain: false, livingSpeaker: true,
    bedLight: false, bedAC: true, bedCurtain: false, bedThermostat: false,
    kidsLight: false, kidsCurtain: false, kidsNightLight: true,
    kitchenLight: false, kitchenExhaust: false,
    studyLight: false, studyMonitor: false,
    bathLight: false, bathExhaust: false,
    frontDoor: true, gateLight: false, alarm: true, doorbell: true
  },
  curtains: 'toggle',
}

const SCENE_CARDS = [
  { id: 'allOn',   name: 'All ON',        icon: '🌟', gesture: 'Hello', color: '#fbbf24', desc: 'Full house active'       },
  { id: 'allOff',  name: 'Away / Sleep',  icon: '🌙', gesture: 'S',     color: '#6366f1', desc: 'Everything off, lock up' },
  { id: 'cozy',    name: 'Cozy Night',    icon: '🕯️', gesture: 'K',     color: '#c084fc', desc: 'TV, AC, dim lights'      },
  { id: 'morning', name: 'Good Morning',  icon: '☀️', gesture: 'F',     color: '#f59e0b', desc: 'Open curtains, all on'   },
  { id: 'movie',   name: 'Movie Mode',    icon: '🎬', gesture: 'W',     color: '#818cf8', desc: 'Lights off, TV on'        },
  { id: 'curtains',name: 'Curtains All',  icon: '🪟', gesture: 'U',     color: '#a78bfa', desc: 'Toggle all curtains'     },
]

/* ══════════════════════════════════════════════════════════════
   SVG — ANIMATED CURTAIN
══════════════════════════════════════════════════════════════ */
function Curtain({ x, y, w, h, open, color = '#c084fc', horizontal = false }) {
  const half = horizontal ? h / 2 : w / 2
  const foldedW = open ? (horizontal ? h * 0.12 : w * 0.1) : half

  if (horizontal) {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill="rgba(147,197,253,0.12)" stroke="rgba(147,197,253,0.4)" strokeWidth="1.2" rx="1.5"/>
        <rect x={x} y={y} width={w} height={foldedW} fill={color + '90'} stroke={color + 'cc'} strokeWidth="0.8" rx="1.5" style={{ transition: 'height 0.75s cubic-bezier(0.4,0,0.2,1)' }}/>
        <rect x={x} y={y + h - foldedW} width={w} height={foldedW} fill={color + '90'} stroke={color + 'cc'} strokeWidth="0.8" rx="1.5" style={{ transition: 'all 0.75s cubic-bezier(0.4,0,0.2,1)' }}/>
        <line x1={x} y1={y - 1} x2={x + w} y2={y - 1} stroke={color + 'aa'} strokeWidth="2" strokeLinecap="round"/>
      </g>
    )
  }

  const rightX = open ? x + w - foldedW : x + half
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="rgba(147,197,253,0.12)" stroke="rgba(147,197,253,0.4)" strokeWidth="1.2" rx="1.5"/>
      {/* Left panel */}
      <rect x={x} y={y} width={foldedW} height={h} fill={color + '90'} stroke={color + 'cc'} strokeWidth="0.8" rx="1.5"
            style={{ transition: 'width 0.75s cubic-bezier(0.4,0,0.2,1)' }}/>
      {/* Right panel */}
      <rect x={rightX} y={y} width={foldedW} height={h} fill={color + '90'} stroke={color + 'cc'} strokeWidth="0.8" rx="1.5"
            style={{ transition: 'all 0.75s cubic-bezier(0.4,0,0.2,1)' }}/>
      {/* Curtain rod */}
      <line x1={x - 2} y1={y - 1} x2={x + w + 2} y2={y - 1} stroke={color + 'bb'} strokeWidth="2.5" strokeLinecap="round"/>
    </g>
  )
}

/* ══════════════════════════════════════════════════════════════
   SVG — ROOM LIGHT with GLOW
══════════════════════════════════════════════════════════════ */
function RoomLight({ cx, cy, on, color = '#fbbf24', glowR = 55 }) {
  return (
    <g style={{ transition: 'opacity 0.4s' }}>
      {on && (
        <>
          <circle cx={cx} cy={cy} r={glowR} fill={color + '14'} style={{ transition: 'all 0.5s' }}/>
          <circle cx={cx} cy={cy} r={glowR * 0.55} fill={color + '22'} style={{ transition: 'all 0.5s' }}/>
          {/* Light rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <line key={deg}
              x1={cx + Math.cos(deg * Math.PI / 180) * 10}
              y1={cy + Math.sin(deg * Math.PI / 180) * 10}
              x2={cx + Math.cos(deg * Math.PI / 180) * glowR * 0.7}
              y2={cy + Math.sin(deg * Math.PI / 180) * glowR * 0.7}
              stroke={color + '30'} strokeWidth="1.5" strokeLinecap="round"
            />
          ))}
        </>
      )}
      {/* Bulb */}
      <circle cx={cx} cy={cy} r="7" fill={on ? color : '#1f2937'} stroke={on ? color + 'ee' : '#374151'} strokeWidth="1.5" style={{ transition: 'all 0.4s', filter: on ? `drop-shadow(0 0 6px ${color})` : 'none' }}>
        {on && <animate attributeName="r" values="6.5;7.5;6.5" dur="3s" repeatCount="indefinite"/>}
      </circle>
      <path d={`M${cx-4},${cy+7} Q${cx},${cy+12} ${cx+4},${cy+7}`} fill="none" stroke={on ? color + 'cc' : '#374151'} strokeWidth="1.5"/>
      <line x1={cx} y1={cy - 9} x2={cx} y2={cy - 16} stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round"/>
    </g>
  )
}

/* ══════════════════════════════════════════════════════════════
   SVG — SPINNING FAN
══════════════════════════════════════════════════════════════ */
function Fan({ cx, cy, on, size = 16 }) {
  return (
    <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: on ? `fanSpin ${0.5}s linear infinite` : 'none', transition: 'opacity 0.3s' }}>
      {[0, 90, 180, 270].map(deg => {
        const bx = cx + Math.cos(deg * Math.PI / 180) * (size * 0.7)
        const by = cy + Math.sin(deg * Math.PI / 180) * (size * 0.7)
        return (
          <ellipse key={deg} cx={bx} cy={by} rx={size * 0.65} ry={size * 0.22}
            fill={on ? 'rgba(94,234,212,0.75)' : 'rgba(55,65,81,0.5)'}
            transform={`rotate(${deg}, ${bx}, ${by})`}
            style={{ transition: 'fill 0.3s' }}
          />
        )
      })}
      <circle cx={cx} cy={cy} r={size * 0.22} fill={on ? '#2dd4bf' : '#374151'} style={{ transition: 'fill 0.3s' }}/>
    </g>
  )
}

/* ══════════════════════════════════════════════════════════════
   SVG — ANIMATED DOOR
══════════════════════════════════════════════════════════════ */
function Door({ x, y, w = 18, h = 28, open, color = '#d97706', facingRight = true }) {
  const panelW = open ? 5 : w
  return (
    <g>
      <rect x={x - 1} y={y - 1} width={w + 2} height={h + 2} rx="2" fill="none" stroke={color + '70'} strokeWidth="1.5"/>
      <rect x={facingRight ? x : x + w - panelW} y={y} width={panelW} height={h} rx="1.5"
            fill={open ? color + '20' : color + '45'} stroke={color} strokeWidth="1.2"
            style={{ transition: 'all 0.65s cubic-bezier(0.4,0,0.2,1)' }}/>
      {open && <path d={`M${facingRight ? x + 5 : x + w - 5},${y} Q${facingRight ? x + w + 10 : x - 10},${y + h * 0.4} ${facingRight ? x + 5 : x + w - 5},${y + h}`} fill="none" stroke={color + '30'} strokeWidth="0.8" strokeDasharray="3 3"/>}
      {!open && <circle cx={facingRight ? x + w - 4 : x + 4} cy={y + h / 2} r="2" fill={color}/>}
    </g>
  )
}

/* ══════════════════════════════════════════════════════════════
   SVG — AC UNIT with airflow
══════════════════════════════════════════════════════════════ */
function ACUnit({ x, y, w = 40, h = 14, on }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4"
            fill={on ? 'rgba(56,189,248,0.25)' : 'rgba(31,41,55,0.6)'}
            stroke={on ? '#38bdf8' : '#374151'} strokeWidth="1.2"
            style={{ transition: 'all 0.4s' }}/>
      {on && [0, 1, 2, 3].map(i => (
        <line key={i} x1={x + 6 + i * 8} y1={y + h + 2} x2={x + 4 + i * 8} y2={y + h + 10}
              stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" opacity={0.8 - i * 0.15}
              style={{ animation: `acFlow ${1 + i * 0.2}s ease-in-out infinite alternate` }}/>
      ))}
      <text x={x + w / 2} y={y + h - 3} textAnchor="middle" fontSize="6.5"
            fill={on ? '#7dd3fc' : '#6b7280'} fontFamily="Outfit,sans-serif">AC</text>
    </g>
  )
}

/* ══════════════════════════════════════════════════════════════
   SVG — TV SCREEN
══════════════════════════════════════════════════════════════ */
function TV({ x, y, w = 55, h = 35, on }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3.5"
            fill={on ? 'rgba(99,102,241,0.28)' : '#111827'}
            stroke={on ? '#818cf8' : '#374151'} strokeWidth="1.5"
            style={{ transition: 'all 0.35s', filter: on ? 'drop-shadow(0 0 8px rgba(129,140,248,0.4))' : 'none' }}/>
      {on ? (
        <>
          <rect x={x + 3} y={y + 3} width={w - 6} height={h - 6} rx="2" fill="rgba(129,140,248,0.1)"/>
          <rect x={x + 5} y={y + 5} width={(w - 10) * 0.6} height="4" rx="1" fill="rgba(165,180,252,0.5)"/>
          <rect x={x + 5} y={y + 12} width={(w - 10) * 0.9} height="2.5" rx="1" fill="rgba(165,180,252,0.3)"/>
          <rect x={x + 5} y={y + 17} width={(w - 10) * 0.75} height="2.5" rx="1" fill="rgba(165,180,252,0.25)"/>
          <text x={x + w / 2} y={y + h - 5} textAnchor="middle" fontSize="7" fill="#a5b4fc" fontFamily="Outfit,sans-serif">● LIVE</text>
        </>
      ) : (
        <text x={x + w / 2} y={y + h / 2 + 3} textAnchor="middle" fontSize="7" fill="#4b5563" fontFamily="Outfit,sans-serif">STANDBY</text>
      )}
      <rect x={x + w / 2 - 5} y={y + h} width="10" height="5" rx="1" fill="#1f2937"/>
      <rect x={x + w / 2 - 10} y={y + h + 5} width="20" height="2.5" rx="1" fill="#1f2937"/>
    </g>
  )
}

/* ══════════════════════════════════════════════════════════════
   SVG — MOTION SENSOR
══════════════════════════════════════════════════════════════ */
function MotionSensor({ cx, cy, active, on }) {
  return (
    <g>
      {active && on && (
        <path d={`M${cx},${cy} L${cx - 25},${cy + 30} L${cx + 25},${cy + 30} Z`}
              fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.25)" strokeWidth="0.8" strokeDasharray="3 2"
              style={{ animation: 'pulse 1.5s infinite' }}/>
      )}
      <circle cx={cx} cy={cy} r="4" fill={on ? '#22c55e' : '#374151'} stroke={on ? '#4ade80' : '#4b5563'} strokeWidth="1.2" style={{ transition: 'all 0.3s' }}/>
    </g>
  )
}

/* ══════════════════════════════════════════════════════════════
   SVG — CAMERA with FOV
══════════════════════════════════════════════════════════════ */
function Camera({ cx, cy, angle = 0, fov = 60, range = 40, on }) {
  const toRad = deg => deg * Math.PI / 180
  const x1 = cx + Math.cos(toRad(angle - fov / 2)) * range
  const y1 = cy + Math.sin(toRad(angle - fov / 2)) * range
  const x2 = cx + Math.cos(toRad(angle + fov / 2)) * range
  const y2 = cy + Math.sin(toRad(angle + fov / 2)) * range
  return (
    <g>
      {on && (
        <path d={`M${cx},${cy} L${x1},${y1} A${range},${range} 0 0,1 ${x2},${y2} Z`}
              fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" strokeWidth="0.8"/>
      )}
      <rect x={cx - 5} y={cy - 3.5} width="10" height="7" rx="2"
            fill={on ? '#ef4444' : '#374151'} stroke={on ? '#f87171' : '#4b5563'} strokeWidth="1"/>
      <circle cx={cx + 7} cy={cy} r="3" fill="none" stroke={on ? '#f87171' : '#4b5563'} strokeWidth="1"/>
      {on && <circle cx={cx - 4} cy={cy - 2} r="1.2" fill="#fee2e2" style={{ animation: 'pulse 2s infinite' }}/>}
    </g>
  )
}

/* ══════════════════════════════════════════════════════════════
   FULL 2D HOME FLOOR PLAN
══════════════════════════════════════════════════════════════ */
function HomePlan2D({ devices, onDeviceToggle }) {
  const {
    livingLight, livingFan, livingTV, livingCurtain, livingSpeaker,
    bedLight, bedAC, bedCurtain,
    kidsLight, kidsCurtain, kidsNightLight,
    kitchenLight, kitchenExhaust,
    studyLight, studyMonitor,
    bathLight, bathExhaust,
    frontDoor, gateLight, alarm, doorbell
  } = devices

  const [statusMsg, setStatusMsg] = useState(null)
  const statusTimeoutRef = useRef(null)

  const handleDeviceClick = (id, name, room, currentState) => {
    onDeviceToggle(id)
    const nextState = !currentState
    let stateStr = 'OFF'
    if (id.toLowerCase().includes('curtain') || id === 'frontDoor') {
      stateStr = nextState ? 'OPEN / UNLOCKED' : 'CLOSED / LOCKED'
    } else {
      stateStr = nextState ? 'ON' : 'OFF'
    }
    
    if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current)
    setStatusMsg({ name, room, state: stateStr })
    statusTimeoutRef.current = setTimeout(() => setStatusMsg(null), 3500)
  }

  return (
    <div className="home2d-wrap" style={{ position: 'relative' }}>
      <div className="home2d-legend">
        <span><span style={{ color: '#fbbf24' }}>●</span> Lights ON</span>
        <span><span style={{ color: '#2dd4bf' }}>●</span> Fan/HVAC</span>
        <span><span style={{ color: '#c084fc' }}>▬</span> Curtains</span>
        <span><span style={{ color: '#818cf8' }}>■</span> AV Devices</span>
        <span><span style={{ color: '#ef4444' }}>◉</span> Security</span>
      </div>

      {statusMsg && (
        <div className="sh-floor-toast">
          <span style={{ color: 'var(--green)' }}>⚡</span>
          <span><strong>{statusMsg.name}</strong> ({statusMsg.room}) status is now <strong>{statusMsg.state}</strong></span>
        </div>
      )}

      <svg viewBox="0 0 890 540" className="home-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow4"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="glow8"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        {/* ── OUTER HOUSE WALL ── */}
        <rect x="8" y="8" width="874" height="524" rx="10" fill="rgba(2,6,23,0.85)" stroke="rgba(45,212,191,0.3)" strokeWidth="2.5"/>

        {/* ══ LIVING ROOM (top-left 290×230) ══ */}
        <rect x="8" y="8" width="290" height="230" fill={livingLight ? 'rgba(251,191,36,0.055)' : 'rgba(0,0,0,0.08)'} stroke="rgba(45,212,191,0.2)" strokeWidth="1" style={{ transition: 'fill 0.6s' }}/>
        <text x="153" y="26" textAnchor="middle" fontSize="10" fill="rgba(45,212,191,0.55)" fontFamily="Outfit,sans-serif" fontWeight="600" letterSpacing="1">LIVING ROOM</text>
        
        {/* Windows with curtains - left wall */}
        <g onClick={() => handleDeviceClick('livingCurtain', 'Living Curtains', 'Living Room', livingCurtain)} style={{ cursor: 'pointer' }}>
          <title>{`Living Curtains: ${livingCurtain ? 'OPEN' : 'CLOSED'}`}</title>
          <Curtain x={10} y={45} w={18} h={65} open={livingCurtain} color="#c084fc"/>
        </g>
        {/* Windows - top wall */}
        <g onClick={() => handleDeviceClick('livingCurtain', 'Living Curtains', 'Living Room', livingCurtain)} style={{ cursor: 'pointer' }}>
          <title>{`Living Curtains: ${livingCurtain ? 'OPEN' : 'CLOSED'}`}</title>
          <Curtain x={90} y={10} w={70} h={18} open={livingCurtain} color="#c084fc" horizontal/>
        </g>
        
        {/* Light */}
        <g onClick={() => handleDeviceClick('livingLight', 'Living Light', 'Living Room', livingLight)} style={{ cursor: 'pointer' }}>
          <title>{`Living Light: ${livingLight ? 'ON' : 'OFF'}`}</title>
          <RoomLight cx={153} cy={100} on={livingLight} glowR={65}/>
        </g>
        
        {/* Fan */}
        <g onClick={() => handleDeviceClick('livingFan', 'Ceiling Fan', 'Living Room', livingFan)} style={{ cursor: 'pointer' }}>
          <title>{`Ceiling Fan: ${livingFan ? 'ON' : 'OFF'}`}</title>
          <Fan cx={153} cy={165} on={livingFan} size={20}/>
        </g>
        
        {/* TV */}
        <g onClick={() => handleDeviceClick('livingTV', 'Living TV', 'Living Room', livingTV)} style={{ cursor: 'pointer' }}>
          <title>{`Living TV: ${livingTV ? 'ON' : 'OFF'}`}</title>
          <TV x={220} y={170} w={62} h={40} on={livingTV}/>
        </g>
        
        {/* Sofa */}
        <rect x="30" y="160" width="100" height="45" rx="8" fill="rgba(45,212,191,0.08)" stroke="rgba(45,212,191,0.18)" strokeWidth="1"/>
        <rect x="30" y="160" width="100" height="16" rx="5" fill="rgba(45,212,191,0.12)"/>
        
        {/* Speaker */}
        <g onClick={() => handleDeviceClick('livingSpeaker', 'Living Speaker', 'Living Room', livingSpeaker)} style={{ cursor: 'pointer' }}>
          <title>{`Living Speaker: ${livingSpeaker ? 'ON' : 'OFF'}`}</title>
          <circle cx={40} cy={145} r="7" fill={livingSpeaker ? 'rgba(96,165,250,0.6)' : 'rgba(55,65,81,0.4)'} stroke="#60a5fa" strokeWidth="1.2" style={livingSpeaker ? { animation: 'pulse 1.5s infinite' } : {}}/>
        </g>
        
        {/* Motion sensor */}
        <MotionSensor cx={270} cy={25} active on={livingLight}/>

        {/* ══ MASTER BEDROOM (top-mid 250×230) ══ */}
        <rect x="308" y="8" width="250" height="230" fill={bedLight ? 'rgba(251,191,36,0.05)' : 'rgba(0,0,0,0.08)'} stroke="rgba(99,102,241,0.22)" strokeWidth="1" style={{ transition: 'fill 0.6s' }}/>
        <text x="433" y="26" textAnchor="middle" fontSize="10" fill="rgba(99,102,241,0.65)" fontFamily="Outfit,sans-serif" fontWeight="600" letterSpacing="1">MASTER BEDROOM</text>
        
        {/* Curtain - top wall */}
        <g onClick={() => handleDeviceClick('bedCurtain', 'Bedroom Curtains', 'Master Bedroom', bedCurtain)} style={{ cursor: 'pointer' }}>
          <title>{`Bedroom Curtains: ${bedCurtain ? 'OPEN' : 'CLOSED'}`}</title>
          <Curtain x={370} y={10} w={80} h={18} open={bedCurtain} color="#f9a8d4" horizontal/>
        </g>
        {/* Curtain - left wall */}
        <g onClick={() => handleDeviceClick('bedCurtain', 'Bedroom Curtains', 'Master Bedroom', bedCurtain)} style={{ cursor: 'pointer' }}>
          <title>{`Bedroom Curtains: ${bedCurtain ? 'OPEN' : 'CLOSED'}`}</title>
          <Curtain x={310} y={50} w={18} h={70} open={bedCurtain} color="#f9a8d4"/>
        </g>
        
        {/* Light */}
        <g onClick={() => handleDeviceClick('bedLight', 'Bedroom Light', 'Master Bedroom', bedLight)} style={{ cursor: 'pointer' }}>
          <title>{`Bedroom Light: ${bedLight ? 'ON' : 'OFF'}`}</title>
          <RoomLight cx={433} cy={100} on={bedLight} glowR={60} color="#fbbf24"/>
        </g>
        
        {/* Bed */}
        <rect x="345" y="155" width="140" height="75" rx="8" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.28)" strokeWidth="1"/>
        <rect x="345" y="155" width="140" height="26" rx="8" fill="rgba(99,102,241,0.2)"/>
        {/* Pillows */}
        <rect x="354" y="162" width="30" height="14" rx="4" fill="rgba(165,180,252,0.25)" stroke="rgba(165,180,252,0.35)" strokeWidth="0.8"/>
        <rect x="392" y="162" width="30" height="14" rx="4" fill="rgba(165,180,252,0.25)" stroke="rgba(165,180,252,0.35)" strokeWidth="0.8"/>
        <text x="415" y="208" textAnchor="middle" fontSize="8" fill="rgba(99,102,241,0.4)" fontFamily="Outfit,sans-serif">BED</text>
        
        {/* AC unit */}
        <g onClick={() => handleDeviceClick('bedAC', 'Bedroom AC', 'Master Bedroom', bedAC)} style={{ cursor: 'pointer' }}>
          <title>{`Bedroom AC: ${bedAC ? 'ON' : 'OFF'}`}</title>
          <ACUnit x={500} y={14} w={48} h={16} on={bedAC}/>
        </g>
        
        {/* Motion sensor */}
        <MotionSensor cx={543} cy={30} active on={bedLight}/>

        {/* ══ STUDY ROOM (top-right 280×230) ══ */}
        <rect x="568" y="8" width="314" height="230" fill={studyLight ? 'rgba(74,222,128,0.045)' : 'rgba(0,0,0,0.08)'} stroke="rgba(34,197,94,0.2)" strokeWidth="1" style={{ transition: 'fill 0.6s' }}/>
        <text x="725" y="26" textAnchor="middle" fontSize="10" fill="rgba(34,197,94,0.55)" fontFamily="Outfit,sans-serif" fontWeight="600" letterSpacing="1">STUDY ROOM</text>
        
        {/* Curtain - right wall */}
        <g onClick={() => handleDeviceClick('studyLight', 'Study Room Curtains', 'Study Room', studyLight)} style={{ cursor: 'pointer' }}>
          <title>{`Study Curtains: ${studyLight ? 'OPEN' : 'CLOSED'}`}</title>
          <Curtain x={858} y={55} w={18} h={65} open={studyLight} color="#6ee7b7"/>
        </g>
        {/* Curtain - top wall */}
        <g onClick={() => handleDeviceClick('studyLight', 'Study Room Curtains', 'Study Room', studyLight)} style={{ cursor: 'pointer' }}>
          <title>{`Study Curtains: ${studyLight ? 'OPEN' : 'CLOSED'}`}</title>
          <Curtain x={650} y={10} w={70} h={18} open={studyLight} color="#6ee7b7" horizontal/>
        </g>
        
        {/* Light */}
        <g onClick={() => handleDeviceClick('studyLight', 'Study Light', 'Study Room', studyLight)} style={{ cursor: 'pointer' }}>
          <title>{`Study Light: ${studyLight ? 'ON' : 'OFF'}`}</title>
          <RoomLight cx={725} cy={100} on={studyLight} glowR={60} color="#4ade80"/>
        </g>
        
        {/* Desk */}
        <rect x="600" y="160" width="150" height="65" rx="5" fill="rgba(34,197,94,0.07)" stroke="rgba(34,197,94,0.18)" strokeWidth="1"/>
        
        {/* Monitor */}
        <g onClick={() => handleDeviceClick('studyMonitor', 'Study Monitor', 'Study Room', studyMonitor)} style={{ cursor: 'pointer' }}>
          <title>{`Study Monitor: ${studyMonitor ? 'ON' : 'OFF'}`}</title>
          {studyMonitor && <rect x="630" y="163" width="70" height="42" rx="3" fill="rgba(99,102,241,0.25)" stroke="#818cf8" strokeWidth="1" style={{ filter: 'drop-shadow(0 0 6px rgba(129,140,248,0.4))' }}/>}
          {!studyMonitor && <rect x="630" y="163" width="70" height="42" rx="3" fill="rgba(31,41,55,0.6)" stroke="#374151" strokeWidth="1"/>}
          <text x="665" y="195" textAnchor="middle" fontSize="8" fill={studyMonitor ? '#a5b4fc' : '#4b5563'} fontFamily="Outfit,sans-serif">{studyMonitor ? 'ON' : 'OFF'}</text>
        </g>
        
        {/* Bookshelf */}
        <rect x="760" y="155" width="110" height="75" rx="4" fill="rgba(34,197,94,0.05)" stroke="rgba(34,197,94,0.15)" strokeWidth="0.8"/>
        {[0,1,2,3].map(i => <rect key={i} x={768 + i * 22} y="163" width="15" height="55" rx="2" fill={`rgba(34,197,94,${0.1 + i * 0.05})`} stroke="rgba(34,197,94,0.2)" strokeWidth="0.7"/>)}
        {/* Motion sensor */}
        <MotionSensor cx={575} cy={25} active on={studyLight}/>

        {/* ── HORIZONTAL WALL ── */}
        <line x1="8" y1="248" x2="882" y2="248" stroke="rgba(45,212,191,0.15)" strokeWidth="2"/>

        {/* ══ KITCHEN (bottom-left 200×280) ══ */}
        <rect x="8" y="248" width="200" height="284" fill={kitchenLight ? 'rgba(245,158,11,0.05)' : 'rgba(0,0,0,0.08)'} stroke="rgba(245,158,11,0.2)" strokeWidth="1" style={{ transition: 'fill 0.6s' }}/>
        <text x="108" y="266" textAnchor="middle" fontSize="10" fill="rgba(245,158,11,0.55)" fontFamily="Outfit,sans-serif" fontWeight="600" letterSpacing="1">KITCHEN</text>
        
        {/* Curtain - left wall */}
        <g onClick={() => handleDeviceClick('kitchenLight', 'Kitchen Curtains', 'Kitchen', kitchenLight)} style={{ cursor: 'pointer' }}>
          <title>{`Kitchen Curtains: ${kitchenLight ? 'OPEN' : 'CLOSED'}`}</title>
          <Curtain x={10} y={275} w={18} h={55} open={kitchenLight} color="#fde68a"/>
        </g>
        
        {/* Light */}
        <g onClick={() => handleDeviceClick('kitchenLight', 'Kitchen Light', 'Kitchen', kitchenLight)} style={{ cursor: 'pointer' }}>
          <title>{`Kitchen Light: ${kitchenLight ? 'ON' : 'OFF'}`}</title>
          <RoomLight cx={108} cy={320} on={kitchenLight} glowR={55} color="#fbbf24"/>
        </g>
        
        {/* Counter L-shape */}
        <rect x="16" y="430" width="185" height="40" rx="4" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.2)" strokeWidth="1"/>
        <rect x="16" y="350" width="42" height="115" rx="4" fill="rgba(245,158,11,0.06)" stroke="rgba(245,158,11,0.15)" strokeWidth="0.8"/>
        {/* Sink */}
        <rect x="22" y="436" width="38" height="26" rx="3" fill="rgba(147,197,253,0.15)" stroke="rgba(147,197,253,0.4)" strokeWidth="1"/>
        <circle cx="41" cy="437" r="3" fill="none" stroke="rgba(147,197,253,0.5)" strokeWidth="1"/>
        {/* Stove */}
        {[0,1,2,3].map(i => <circle key={i} cx={100 + (i % 2) * 28} cy={435 + Math.floor(i / 2) * 22} r="9" fill="none" stroke={`rgba(245,158,11,${kitchenLight ? 0.6 : 0.2})`} strokeWidth="1.5"/>)}
        
        {/* Exhaust fan */}
        <g onClick={() => handleDeviceClick('kitchenExhaust', 'Kitchen Exhaust Fan', 'Kitchen', kitchenExhaust)} style={{ cursor: 'pointer' }}>
          <title>{`Exhaust Fan: ${kitchenExhaust ? 'ON' : 'OFF'}`}</title>
          <Fan cx={108} cy={395} on={kitchenExhaust} size={14}/>
        </g>
        
        {/* Refrigerator */}
        <rect x="148" y="352" width="45" height="78" rx="4" fill="rgba(55,65,81,0.5)" stroke="#4b5563" strokeWidth="1"/>
        <line x1="170" y1="352" x2="170" y2="430" stroke="#374151" strokeWidth="0.8"/>

        {/* ══ BATHROOM (bottom mid-left 150×130) ══ */}
        <rect x="218" y="248" width="145" height="145" fill={bathLight ? 'rgba(103,232,249,0.04)' : 'rgba(0,0,0,0.08)'} stroke="rgba(56,189,248,0.2)" strokeWidth="1" style={{ transition: 'fill 0.6s' }}/>
        <text x="290" y="266" textAnchor="middle" fontSize="9.5" fill="rgba(56,189,248,0.55)" fontFamily="Outfit,sans-serif" fontWeight="600" letterSpacing="0.5">BATHROOM</text>
        
        {/* Light */}
        <g onClick={() => handleDeviceClick('bathLight', 'Bathroom Light', 'Bathroom', bathLight)} style={{ cursor: 'pointer' }}>
          <title>{`Bathroom Light: ${bathLight ? 'ON' : 'OFF'}`}</title>
          <RoomLight cx={290} cy={305} on={bathLight} glowR={40} color="#67e8f9"/>
        </g>
        
        {/* Bathtub */}
        <rect x="226" y="345" width="65" height="42" rx="8" fill="rgba(56,189,248,0.1)" stroke="rgba(56,189,248,0.28)" strokeWidth="1"/>
        <ellipse cx="258" cy="366" rx="22" ry="12" fill="rgba(56,189,248,0.08)" stroke="rgba(56,189,248,0.15)" strokeWidth="0.7"/>
        {/* Toilet */}
        <rect x="306" y="348" width="50" height="38" rx="10" fill="rgba(240,240,240,0.06)" stroke="rgba(56,189,248,0.25)" strokeWidth="1"/>
        <rect x="306" y="348" width="50" height="12" rx="5" fill="rgba(56,189,248,0.1)" stroke="rgba(56,189,248,0.2)" strokeWidth="0.8"/>
        
        {/* Exhaust */}
        <g onClick={() => handleDeviceClick('bathExhaust', 'Bathroom Exhaust Fan', 'Bathroom', bathExhaust)} style={{ cursor: 'pointer' }}>
          <title>{`Bathroom Exhaust Fan: ${bathExhaust ? 'ON' : 'OFF'}`}</title>
          <Fan cx={350} cy={270} on={bathExhaust} size={10}/>
        </g>

        {/* ══ HALL / CORRIDOR (bottom mid 145×140) ══ */}
        <rect x="218" y="403" width="145" height="129" fill="rgba(0,0,0,0.06)" stroke="rgba(107,114,128,0.15)" strokeWidth="1"/>
        <text x="290" y="440" textAnchor="middle" fontSize="9" fill="rgba(107,114,128,0.45)" fontFamily="Outfit,sans-serif">HALL</text>
        
        {/* Front door */}
        <g onClick={() => handleDeviceClick('frontDoor', 'Front Door Smart Lock', 'Hall', frontDoor)} style={{ cursor: 'pointer' }}>
          <title>{`Front Door Lock: ${frontDoor ? 'LOCKED' : 'UNLOCKED'}`}</title>
          <Door x={268} y={502} w={42} h={28} open={!frontDoor} color="#d97706"/>
        </g>
        <text x="290" y="498" textAnchor="middle" fontSize="7.5" fill="rgba(217,119,6,0.7)" fontFamily="Outfit,sans-serif">{frontDoor ? '🔒 LOCKED' : '🔓 OPEN'}</text>
        {/* Stairs symbol */}
        {[0,1,2,3,4].map(i => <rect key={i} x={220 + i * 12} y={413 + i * 8} width="12" height="5" rx="0.5" fill="rgba(107,114,128,0.15)" stroke="rgba(107,114,128,0.2)" strokeWidth="0.5"/>)}

        {/* ══ KIDS ROOM (bottom mid-right 200×280) ══ */}
        <rect x="373" y="248" width="185" height="284" fill={kidsLight ? 'rgba(244,114,182,0.05)' : 'rgba(0,0,0,0.08)'} stroke="rgba(244,114,182,0.2)" strokeWidth="1" style={{ transition: 'fill 0.6s' }}/>
        <text x="465" y="266" textAnchor="middle" fontSize="10" fill="rgba(244,114,182,0.55)" fontFamily="Outfit,sans-serif" fontWeight="600" letterSpacing="1">KIDS ROOM</text>
        
        {/* Curtain - bottom wall */}
        <g onClick={() => handleDeviceClick('kidsCurtain', 'Kids Room Curtains', 'Kids Room', kidsCurtain)} style={{ cursor: 'pointer' }}>
          <title>{`Kids Curtains: ${kidsCurtain ? 'OPEN' : 'CLOSED'}`}</title>
          <Curtain x={418} y={510} w={80} h={18} open={kidsCurtain} color="#fda4af" horizontal/>
        </g>
        
        {/* Light */}
        <g onClick={() => handleDeviceClick('kidsLight', 'Kids Room Light', 'Kids Room', kidsLight)} style={{ cursor: 'pointer' }}>
          <title>{`Kids Light: ${kidsLight ? 'ON' : 'OFF'}`}</title>
          <RoomLight cx={465} cy={330} on={kidsLight} glowR={55} color="#f472b6"/>
        </g>
        
        {/* Night Light glow */}
        <g onClick={() => handleDeviceClick('kidsNightLight', 'Kids Night Light', 'Kids Room', kidsNightLight)} style={{ cursor: 'pointer' }}>
          <title>{`Night Light: ${kidsNightLight ? 'ON' : 'OFF'}`}</title>
          {kidsNightLight && <circle cx={380} cy={490} r="18" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="1" style={{ animation: 'pulse 2s infinite' }}/>}
          <circle cx={380} cy={490} r="6" fill={kidsNightLight ? '#a78bfa' : '#374151'} stroke="#4b5563" strokeWidth="1"/>
        </g>
        
        {/* Small bed */}
        <rect x="395" y="400" width="100" height="70" rx="8" fill="rgba(244,114,182,0.1)" stroke="rgba(244,114,182,0.25)" strokeWidth="1"/>
        <rect x="395" y="400" width="100" height="22" rx="8" fill="rgba(244,114,182,0.2)"/>
        {/* Pillows */}
        <rect x="405" y="407" width="22" height="10" rx="3" fill="rgba(253,164,175,0.3)" stroke="rgba(253,164,175,0.4)" strokeWidth="0.7"/>
        <rect x="432" y="407" width="22" height="10" rx="3" fill="rgba(253,164,175,0.3)" stroke="rgba(253,164,175,0.4)" strokeWidth="0.7"/>
        {/* Toy chest */}
        <rect x="500" y="400" width="50" height="40" rx="4" fill="rgba(244,114,182,0.07)" stroke="rgba(244,114,182,0.2)" strokeWidth="0.8"/>
        <text x="525" y="426" textAnchor="middle" fontSize="7" fill="rgba(244,114,182,0.4)" fontFamily="Outfit,sans-serif">TOYS</text>
        {/* Study desk */}
        <rect x="385" y="350" width="55" height="40" rx="3" fill="rgba(244,114,182,0.06)" stroke="rgba(244,114,182,0.15)" strokeWidth="0.8"/>

        {/* ══ OUTDOOR / GARAGE (bottom-right 310×280) ══ */}
        <rect x="568" y="248" width="314" height="284" fill="rgba(0,0,0,0.1)" stroke="rgba(107,114,128,0.18)" strokeWidth="1"/>
        <text x="725" y="266" textAnchor="middle" fontSize="10" fill="rgba(107,114,128,0.45)" fontFamily="Outfit,sans-serif" fontWeight="600" letterSpacing="1">GARAGE / OUTDOOR</text>
        
        {/* Gate Light */}
        <g onClick={() => handleDeviceClick('gateLight', 'Gate Light', 'Outdoor', gateLight)} style={{ cursor: 'pointer' }}>
          <title>{`Gate Light: ${gateLight ? 'ON' : 'OFF'}`}</title>
          <RoomLight cx={860} cy={350} on={gateLight} glowR={40} color="#fbbf24"/>
        </g>
        
        {/* Car */}
        <rect x="590" y="310" width="180" height="85" rx="10" fill="rgba(55,65,81,0.35)" stroke="rgba(107,114,128,0.35)" strokeWidth="1.5"/>
        <rect x="615" y="300" width="130" height="45" rx="8" fill="rgba(55,65,81,0.25)" stroke="rgba(107,114,128,0.25)" strokeWidth="1"/>
        {/* Car windows */}
        <rect x="626" y="305" width="45" height="28" rx="3" fill="rgba(147,197,253,0.15)" stroke="rgba(147,197,253,0.25)" strokeWidth="0.8"/>
        <rect x="678" y="305" width="45" height="28" rx="3" fill="rgba(147,197,253,0.15)" stroke="rgba(147,197,253,0.25)" strokeWidth="0.8"/>
        {/* Wheels */}
        {[[606,397],[750,397]].map(([wx,wy],i) => (
          <g key={i}>
            <circle cx={wx} cy={wy} r="16" fill="rgba(31,41,55,0.8)" stroke="#4b5563" strokeWidth="1.5"/>
            <circle cx={wx} cy={wy} r="7" fill="rgba(55,65,81,0.6)" stroke="#374151" strokeWidth="1"/>
          </g>
        ))}
        {/* Headlights */}
        {gateLight && <>
          <ellipse cx={596} cy={328} rx="8" ry="5" fill="rgba(251,191,36,0.4)" stroke="#fbbf24" strokeWidth="1"/>
          <ellipse cx={774} cy={328} rx="8" ry="5" fill="rgba(251,191,36,0.4)" stroke="#fbbf24" strokeWidth="1"/>
        </>}
        {/* Garage door */}
        <rect x="570" y="500" width="200" height="32" rx="3" fill="rgba(55,65,81,0.4)" stroke="rgba(107,114,128,0.4)" strokeWidth="1.5"/>
        {[0,1,2,3].map(i => <line key={i} x1={570} y1={500 + i * 9} x2={770} y2={500 + i * 9} stroke="rgba(107,114,128,0.2)" strokeWidth="0.8"/>)}
        {[0,1,2,3,4,5].map(i => <line key={i} x1={570 + i * 34} y1={500} x2={570 + i * 34} y2={532} stroke="rgba(107,114,128,0.15)" strokeWidth="0.8"/>)}
        
        {/* Camera - outdoor */}
        <g onClick={() => handleDeviceClick('doorbell', 'Video Doorbell Camera', 'Outdoor', doorbell)} style={{ cursor: 'pointer' }}>
          <title>{`Doorbell Camera: ${doorbell ? 'ACTIVE' : 'INACTIVE'}`}</title>
          <Camera cx={848} cy={260} angle={180} fov={70} range={50} on={doorbell}/>
        </g>

        {/* ── WALL DIVIDERS ── */}
        <line x1="308" y1="8" x2="308" y2="248" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5"/>
        <line x1="568" y1="8" x2="568" y2="248" stroke="rgba(34,197,94,0.2)" strokeWidth="1.5"/>
        <line x1="218" y1="248" x2="218" y2="532" stroke="rgba(56,189,248,0.2)" strokeWidth="1.5"/>
        <line x1="373" y1="248" x2="373" y2="532" stroke="rgba(244,114,182,0.2)" strokeWidth="1.5"/>
        <line x1="568" y1="248" x2="568" y2="532" stroke="rgba(107,114,128,0.2)" strokeWidth="1.5"/>
        <line x1="218" y1="393" x2="373" y2="393" stroke="rgba(107,114,128,0.15)" strokeWidth="1"/>

        {/* ── NORTH INDICATOR ── */}
        <text x="876" y="525" fontSize="9" fill="rgba(45,212,191,0.4)" textAnchor="end" fontFamily="Outfit,sans-serif">N ↑</text>
      </svg>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════════ */
function CommandToast({ toast }) {
  if (!toast) return null
  return (
    <div className="sh-toast visible">
      <span className="sh-toast-icon">{toast.icon}</span>
      <div><div className="sh-toast-label">{toast.label}</div><div className="sh-toast-gesture">Gesture: <strong>{toast.gesture}</strong></div></div>
      <div className="sh-toast-check">✓</div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MQTT LOG
══════════════════════════════════════════════════════════════ */
function MQTTLog({ logs, height }) {
  const containerRef = useRef(null)
  const endRef = useRef(null)
  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [logs])
  return (
    <div className="sh-mqtt-log">
      <div className="sh-mqtt-header">
        <span className="sh-mqtt-dot"/><span>MQTT Broker — <code>smart-home/</code></span>
        <span className="sh-mqtt-live">LIVE</span>
      </div>
      <div className="sh-mqtt-entries" ref={containerRef} style={height ? { height } : undefined}>
        {logs.slice(-40).map((l, i) => (
          <div key={i} className={`sh-mqtt-entry ${l.type}`}>
            <span className="sh-mqtt-ts">{l.time}</span>
            <span className="sh-mqtt-topic">{l.topic}</span>
            <span className="sh-mqtt-payload">{l.payload}</span>
          </div>
        ))}
        {logs.length === 0 && <div className="sh-mqtt-empty">Waiting…</div>}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   DEVICE CARD
══════════════════════════════════════════════════════════════ */
function DeviceCard({ def, state, onToggle }) {
  const isOn = !!state

  const handle3DTilt = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const xc = rect.width / 2
    const yc = rect.height / 2
    const rx = -(y - yc) / 8
    const ry = (x - xc) / 8
    card.style.setProperty('--rx', `${rx}deg`)
    card.style.setProperty('--ry', `${ry}deg`)
  }

  const reset3DTilt = (e) => {
    const card = e.currentTarget
    card.style.setProperty('--rx', '0deg')
    card.style.setProperty('--ry', '0deg')
  }

  return (
    <div 
      className={`sh-dcard tilt-card-3d ${isOn ? 'on' : ''}`} 
      style={{ '--acc': def.color }} 
      onClick={() => onToggle(def.id)}
      onMouseMove={handle3DTilt}
      onMouseLeave={reset3DTilt}
    >
      <div className="sh-dcard-glow"/>
      <div className="sh-dcard-top">
        <span className="sh-dcard-icon">{def.icon}</span>
        <div className={`sh-mini-toggle ${isOn ? 'on' : ''}`}><div className="sh-mini-knob"/></div>
      </div>
      <div className="sh-dcard-name">{def.name}</div>
      <div className="sh-dcard-room">{def.room}</div>
      <div className={`sh-dcard-status ${isOn ? 'on' : ''}`}>{isOn ? '● ON' : '○ OFF'}</div>
      {def.watt > 0 && isOn && <div className="sh-dcard-watt">{def.watt}W</div>}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   ENERGY PANEL
══════════════════════════════════════════════════════════════ */
function EnergyPanel({ devices }) {
  const total = useMemo(() => DEVICE_DEFS.reduce((s, d) => s + (devices[d.id] && d.watt > 0 ? d.watt : 0), 0), [devices])
  const maxW = 2500
  const pct = Math.min((total / maxW) * 100, 100)
  const color = pct < 35 ? '#22c55e' : pct < 65 ? '#f59e0b' : '#ef4444'
  const onDevices = DEVICE_DEFS.filter(d => devices[d.id] && d.watt > 0)

  return (
    <div className="sh-energy-panel">
      <div className="sh-ep-main">
        <div className="sh-ep-circle" style={{ '--p': pct, '--c': color }}>
          <div className="sh-ep-inner">
            <span className="sh-ep-val" style={{ color }}>{total}W</span>
            <span className="sh-ep-lbl">Live Usage</span>
          </div>
        </div>
        <div className="sh-ep-right">
          <div className="sh-ep-stats">
            {[
              { lbl: 'Devices On', val: onDevices.length },
              { lbl: 'Max Load',   val: `${Math.round(pct)}%` },
              { lbl: 'Est. / hr',  val: `${(total / 1000).toFixed(2)} kWh` },
              { lbl: 'Daily Est.', val: `₹${(total * 24 / 1000 * 8).toFixed(0)}` },
            ].map(s => (
              <div key={s.lbl} className="sh-ep-stat">
                <span className="sh-ep-sv" style={s.lbl === 'Max Load' ? { color } : {}}>{s.val}</span>
                <span className="sh-ep-sl">{s.lbl}</span>
              </div>
            ))}
          </div>
          <div className="sh-ep-bar-wrap">
            <div className="sh-ep-bar-track"><div className="sh-ep-bar" style={{ width: `${pct}%`, background: color }}/></div>
            <div className="sh-ep-bar-labels"><span>0W</span><span style={{ color }}>{total}W</span><span>{maxW}W</span></div>
          </div>
        </div>
      </div>
      <div className="sh-ep-breakdown">
        {onDevices.map(d => (
          <span key={d.id} className="sh-ep-chip" style={{ borderColor: d.color + '60', color: d.color }}>
            {d.icon} {d.watt}W
          </span>
        ))}
        {onDevices.length === 0 && <span className="sh-ep-empty">No active loads</span>}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SECURITY PANEL
══════════════════════════════════════════════════════════════ */
function SecurityPanel({ devices, onToggle }) {
  const [armMode, setArmMode] = useState('disarmed')
  const modes = ['disarmed', 'home', 'away', 'night']
  const modeColors = { disarmed: '#22c55e', home: '#f59e0b', away: '#ef4444', night: '#6366f1' }

  return (
    <div className="sh-security">
      {/* Alarm status */}
      <div className="sh-sec-status" style={{ borderColor: modeColors[armMode] + '50', background: modeColors[armMode] + '0a' }}>
        <span className="sh-sec-icon" style={{ color: modeColors[armMode] }}>
          {armMode === 'disarmed' ? '🟢' : armMode === 'home' ? '🏠' : armMode === 'away' ? '🔴' : '🌙'}
        </span>
        <div>
          <div className="sh-sec-mode" style={{ color: modeColors[armMode] }}>{armMode.toUpperCase()}</div>
          <div className="sh-sec-info">Security System</div>
        </div>
        <div className={`sh-sec-pulse ${armMode !== 'disarmed' ? 'active' : ''}`} style={{ background: modeColors[armMode] }}/>
      </div>
      {/* Arm mode selector */}
      <div className="sh-sec-modes">
        {modes.map(m => (
          <button key={m} className={`sh-sec-mode-btn ${armMode === m ? 'active' : ''}`}
                  style={{ '--mc': modeColors[m] }} onClick={() => setArmMode(m)}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>
      {/* Camera feeds */}
      <div className="sh-sec-cameras">
        {[
          { label: 'Front Door', on: devices.doorbell, angle: 135 },
          { label: 'Garage',     on: devices.gateLight, angle: 90  },
          { label: 'Living Room',on: devices.livingLight, angle: 45 },
        ].map((cam, i) => (
          <div key={i} className={`sh-cam-feed ${cam.on ? 'active' : ''}`}>
            <div className="sh-cam-screen">
              {cam.on ? (
                <>
                  <div className="sh-cam-scanline"/>
                  <div className="sh-cam-overlay-info">
                    <span className="sh-cam-rec">● REC</span>
                    <span className="sh-cam-ts">{new Date().toLocaleTimeString('en-IN', { hour12: false })}</span>
                  </div>
                  <div className="sh-cam-fov"/>
                </>
              ) : (
                <div className="sh-cam-offline">📷 OFFLINE</div>
              )}
            </div>
            <div className="sh-cam-label">{cam.label}</div>
          </div>
        ))}
      </div>
      {/* Security devices */}
      <div className="sh-sec-devices">
        {[
          { id: 'frontDoor', name: 'Smart Lock',      icon: '🔒' },
          { id: 'alarm',     name: 'Alarm System',    icon: '🔔' },
          { id: 'doorbell',  name: 'Video Doorbell',  icon: '📹' },
          { id: 'gateLight', name: 'Gate Light',      icon: '💡' },
        ].map(s => (
          <div key={s.id} className={`sh-sec-device ${devices[s.id] ? 'on' : ''}`} onClick={() => onToggle(s.id)}>
            <span>{s.icon}</span>
            <span className="sh-sec-dname">{s.name}</span>
            <span className={`sh-sec-dstat ${devices[s.id] ? 'on' : ''}`}>{devices[s.id] ? 'ON' : 'OFF'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   AUTOMATIONS PANEL
══════════════════════════════════════════════════════════════ */
const AUTOMATIONS = [
  { id: 1, name: 'Good Morning',       icon: '☀️', trigger: 'Schedule: 7:00 AM',       action: 'Open curtains, turn on kitchen & bedroom lights', active: true,  category: 'schedule' },
  { id: 2, name: 'Movie Night',        icon: '🎬', trigger: 'Scene: Movie Mode',        action: 'Dim living lights, turn on TV, close curtains',   active: false, category: 'scene'    },
  { id: 3, name: 'Bedtime',            icon: '🌙', trigger: 'Schedule: 10:30 PM',      action: 'Turn off all except bedroom, lock front door',    active: true,  category: 'schedule' },
  { id: 4, name: 'Motion → Light',     icon: '🚶', trigger: 'Motion sensor: Kitchen',  action: 'Kitchen light ON for 5 minutes',                  active: true,  category: 'trigger'  },
  { id: 5, name: 'Away Mode',          icon: '🚗', trigger: 'Geofence: Left home',     action: 'Lock door, arm security, all lights OFF',         active: true,  category: 'geofence' },
  { id: 6, name: 'Rain: Close Blinds', icon: '🌧️', trigger: 'Weather: Rain detected',  action: 'Close all curtains automatically',                active: false, category: 'trigger'  },
  { id: 7, name: 'AC Auto-Off',        icon: '❄️', trigger: 'Temp < 22°C in bedroom', action: 'Turn off AC automatically',                       active: true,  category: 'trigger'  },
  { id: 8, name: 'Party Mode',         icon: '🎉', trigger: 'Manual trigger',          action: 'All lights on + Speaker on + lights flash',      active: false, category: 'scene'    },
]

function AutomationsPanel() {
  const [autos, setAutos] = useState(AUTOMATIONS)
  const catColors = { schedule: '#f59e0b', scene: '#818cf8', trigger: '#2dd4bf', geofence: '#22c55e' }

  return (
    <div className="sh-auto-panel">
      <div className="sh-auto-header">
        <div>
          <div className="sh-auto-title">⚙️ Automation Rules</div>
          <div className="sh-auto-sub">{autos.filter(a => a.active).length} of {autos.length} automations active</div>
        </div>
        <button className="sh-auto-add">+ New Rule</button>
      </div>
      <div className="sh-auto-list">
        {autos.map(a => (
          <div key={a.id} className={`sh-auto-rule ${a.active ? 'active' : ''}`}>
            <div className="sh-auto-icon">{a.icon}</div>
            <div className="sh-auto-body">
              <div className="sh-auto-name">{a.name}</div>
              <div className="sh-auto-trigger">
                <span className="sh-auto-cat" style={{ background: catColors[a.category] + '20', color: catColors[a.category] }}>{a.category}</span>
                <span className="sh-auto-trg-text">{a.trigger}</span>
              </div>
              <div className="sh-auto-action">→ {a.action}</div>
            </div>
            <div className={`sh-auto-toggle ${a.active ? 'on' : ''}`} onClick={() => setAutos(prev => prev.map(r => r.id === a.id ? { ...r, active: !r.active } : r))}>
              <div className="sh-auto-knob"/>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   CURTAIN CONTROL WIDGET
══════════════════════════════════════════════════════════════ */
function CurtainWidget({ devices, onToggle }) {
  const curtainDevices = [
    { id: 'livingCurtain', room: 'Living Room', color: '#c084fc' },
    { id: 'bedCurtain',    room: 'Bedroom',     color: '#f9a8d4' },
    { id: 'kidsCurtain',   room: 'Kids Room',   color: '#fda4af' },
  ]
  return (
    <div className="sh-curtain-widget">
      {curtainDevices.map(c => (
        <div key={c.id} className="sh-cw-row">
          <div className="sh-cw-info">
            <span className="sh-cw-room">{c.room}</span>
            <span className={`sh-cw-state ${devices[c.id] ? 'open' : ''}`}>{devices[c.id] ? 'OPEN' : 'CLOSED'}</span>
          </div>
          {/* Mini curtain vis */}
          <div className="sh-cw-vis" style={{ '--cc': c.color }}>
            <div className="sh-cw-panel-l" style={{ width: devices[c.id] ? '8%' : '49%' }}/>
            <div className="sh-cw-center"/>
            <div className="sh-cw-panel-r" style={{ width: devices[c.id] ? '8%' : '49%' }}/>
          </div>
          <div className="sh-cw-btns">
            <button className={`sh-cw-btn ${devices[c.id] ? 'act' : ''}`} onClick={() => { if (!devices[c.id]) onToggle(c.id) }}>⬅ Open</button>
            <button className={`sh-cw-btn ${!devices[c.id] ? 'act' : ''}`} onClick={() => { if (devices[c.id]) onToggle(c.id) }}>Close ➡</button>
          </div>
        </div>
      ))}
      <button className="sh-cw-all-btn" onClick={() => curtainDevices.forEach(c => onToggle(c.id))}>
        🪟 Toggle All Curtains
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN SMARTHOME COMPONENT
══════════════════════════════════════════════════════════════ */
export default function SmartHome({ externalSign }) {
  const navigate = useNavigate()
  const user = (() => { try { return JSON.parse(localStorage.getItem('smarthome_user') || '{}') } catch { return {} } })()
  const handleLogout = () => { localStorage.removeItem('smarthome_user'); navigate('/', { replace: true }) }

  // ── State ──
  const [tab, setTab] = useState('dashboard')
  const [voiceListening, setVoiceListening] = useState(false)
  const [voiceLogs, setVoiceLogs] = useState([
    { id: 1, cmd: 'Turn on living room light', result: 'Light turned ON', time: '18:12:04', ok: true },
    { id: 2, cmd: 'Set bedroom AC to 24 degrees', result: 'AC set to 24°C', time: '18:10:30', ok: true },
    { id: 3, cmd: 'Lock the front door', result: 'Front door locked', time: '17:55:00', ok: true },
    { id: 4, cmd: 'Play music in living room', result: 'Speaker turned ON', time: '17:40:12', ok: true },
  ])
  const [settingsActiveTab, setSettingsActiveTab] = useState('general')
  const [devices, setDevices] = useState({
    livingLight: true,  livingFan: true,   livingTV: false,  livingCurtain: true,  livingSpeaker: false,
    bedLight: false,    bedAC: false,      bedCurtain: false, bedThermostat: false,
    kidsLight: false,   kidsCurtain: false, kidsNightLight: true,
    kitchenLight: false, kitchenExhaust: false,
    studyLight: false,  studyMonitor: false,
    bathLight: false,   bathExhaust: false,
    frontDoor: true,    gateLight: false,  alarm: true,      doorbell: true,
  })
  const [activeScene, setActiveScene] = useState(null)
  const [show3D, setShow3D] = useState(true)
  const [activeRoom, setActiveRoom] = useState('All')
  const [twinMode, setTwinMode] = useState('status')
  const [pointTarget, setPointTarget] = useState('none')
  const [retraining, setRetraining] = useState(false)
  const [retrainProgress, setRetrainProgress] = useState(0)

  const triggerRetrain = useCallback(() => {
    if (retraining) return
    setRetraining(true)
    setRetrainProgress(0)
    
    let current = 0
    const interval = setInterval(() => {
      current += 20
      setRetrainProgress(current)
      if (current >= 100) {
        clearInterval(interval)
        setRetraining(false)
        showToast({ icon: '🎯', label: 'AI Model Re-trained: 98.4% Acc', gesture: 'AI' })
      }
    }, 300)
  }, [retraining])

  const mappedDeviceStates = useMemo(() => {
    return Object.fromEntries(
      Object.entries(devices).map(([k, v]) => [k, { on: !!v }])
    )
  }, [devices])
  const [mqttLogs, setMqttLogs] = useState([
    { time: '11:30:01', topic: 'home/system', payload: '{"status":"online","rooms":6,"devices":22}', type: 'info' },
  ])
  const [toast, setToast] = useState(null)
  const [cmdHistory, setCmdHistory] = useState([])
  const toastRef = useRef(null)

  // ── API state ──
  const [apiOnline, setApiOnline] = useState(false)
  const [weather, setWeather] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [clock, setClock] = useState('')
  const [acTemp, setAcTemp] = useState(22)
  const [thermoTemp, setThermoTemp] = useState(25)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [editName, setEditName] = useState(user.name || '')
  const [editEmail, setEditEmail] = useState(user.email || '')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // MQTT settings state
  const [mqttHost, setMqttHost] = useState('broker.hivemq.com')
  const [mqttPort, setMqttPort] = useState(1883)
  const [mqttUser, setMqttUser] = useState('')
  const [mqttPass, setMqttPass] = useState('')
  const [mqttPrefix, setMqttPrefix] = useState('smart-home')
  const [mqttConnected, setMqttConnected] = useState(false)
  const [savingMqtt, setSavingMqtt] = useState(false)

  // Fetch MQTT Status
  const fetchMqttStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/mqtt/status')
      if (res.ok) {
        const data = await res.json()
        setMqttHost(data.host || 'broker.hivemq.com')
        setMqttPort(data.port || 1883)
        setMqttPrefix(data.prefix || 'smart-home')
        setMqttConnected(data.connected || false)
      }
    } catch (err) {
      console.error('Failed to fetch MQTT status:', err)
    }
  }, [])

  // Save MQTT Config
  const saveMqttConfig = async (e) => {
    if (e) e.preventDefault()
    setSavingMqtt(true)
    try {
      const res = await fetch('/api/settings/mqtt', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: mqttHost,
          port: parseInt(mqttPort) || 1883,
          user: mqttUser || null,
          password: mqttPass || null,
          prefix: mqttPrefix || 'smart-home'
        })
      })
      if (res.ok) {
        const data = await res.json()
        setMqttConnected(data.connected)
        showToast({ icon: '📡', label: 'MQTT Config Saved', gesture: 'System' })
      }
    } catch (err) {
      console.error('Failed to save MQTT config:', err)
    } finally {
      setSavingMqtt(false)
    }
  }

  // ── Live clock ──
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setClock(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // ── API: health + weather + analytics + notifications ──
  const fetchBackend = useCallback(async () => {
    try {
      const r = await fetch('/api/health', { signal: AbortSignal.timeout(3000) })
      setApiOnline(r.ok)
      if (r.ok) {
        // Load device state from backend
        const dRes = await fetch('/api/devices')
        if (dRes.ok) {
          const dData = await dRes.json()
          if (dData.devices && Object.keys(dData.devices).length > 0) setDevices(prev => ({ ...prev, ...dData.devices }))
        }
        // Weather
        const wRes = await fetch('/api/weather')
        if (wRes.ok) setWeather(await wRes.json())
        // Analytics
        const aRes = await fetch('/api/analytics')
        if (aRes.ok) setAnalytics(await aRes.json())
        // Notifications
        const nRes = await fetch('/api/notifications')
        if (nRes.ok) { const nd = await nRes.json(); setNotifications(nd.notifications || []) }
        // MQTT status
        fetchMqttStatus()
      }
    } catch { setApiOnline(false) }
  }, [fetchMqttStatus])

  useEffect(() => { fetchBackend(); const id = setInterval(fetchBackend, 30000); return () => clearInterval(id) }, [fetchBackend])

  // ── Sync device toggle to backend ──
  const syncToBackend = useCallback(async (deviceId, state) => {
    if (!apiOnline) return
    try {
      await fetch('/api/device/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId, state }),
      })
    } catch {}
  }, [apiOnline])

  // Camera
  const [camActive, setCamActive] = useState(false)
  const [camError, setCamError] = useState(null)
  const [detectedSign, setDetectedSign] = useState(null)
  const videoRef = useRef(null); const canvasRef = useRef(null)
  const streamRef = useRef(null); const cameraRef = useRef(null); const handsRef = useRef(null)
  const fbRef = useRef([]); const lastRef = useRef(null); const coolRef = useRef(false)

  const publish = useCallback((topic, payload, type = 'command') => {
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false })
    setMqttLogs(prev => [...prev, { time, topic, payload: JSON.stringify(payload), type }])
  }, [])

  const speakText = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  const showToast = useCallback((data) => {
    setToast(data)
    if (toastRef.current) clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(null), 3000)
    if (data?.label) {
      speakText(data.label)
    }
  }, [speakText])

  const logCmd = useCallback((sign, cmd, icon, label) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false })
    setCmdHistory(prev => [{ id: Date.now(), time, sign, cmd, icon, label }, ...prev])
  }, [])

  const toggleDevice = useCallback((id) => {
    setDevices(prev => {
      const next = { ...prev, [id]: !prev[id] }
      publish(`home/${id}`, { state: next[id] ? 'ON' : 'OFF', source: 'manual' }, 'manual')
      syncToBackend(id, next[id])
      return next
    })
    setActiveScene(null)
  }, [publish, syncToBackend])

  const applyScene = useCallback((sceneId) => {
    const preset = SCENE_PRESETS[sceneId]
    if (sceneId === 'curtains' || preset === 'toggle') {
      setDevices(prev => ({
        ...prev,
        livingCurtain: !prev.livingCurtain,
        bedCurtain:    !prev.bedCurtain,
        kidsCurtain:   !prev.kidsCurtain,
      }))
      publish('home/scene', { scene: 'curtains_toggle' }, 'scene')
      return
    }
    if (!preset) return
    setDevices({ ...preset })
    setActiveScene(sceneId)
    publish('home/scene', { scene: sceneId }, 'scene')
  }, [publish])

  const execGesture = useCallback((sign) => {
    // 1. Universal Pointing Override
    if (pointTarget && pointTarget !== 'none') {
      const targetDevice = pointTarget;
      setDevices(prev => {
        const next = { ...prev, [targetDevice]: !prev[targetDevice] }
        publish(`home/${targetDevice}`, { state: next[targetDevice] ? 'ON' : 'OFF', source: 'pointing' })
        const def = DEVICE_DEFS.find(x => x.id === targetDevice)
        const text = `Point gesture: ${next[targetDevice] ? 'Activated' : 'Deactivated'} ${def?.name || targetDevice}`
        showToast({ icon: def?.icon || '🎯', label: text, gesture: sign })
        logCmd(sign, text, def?.icon || '🎯', text)
        return next
      })
      // Clear pointing target after action to simulate natural release
      setPointTarget('none')
      return
    }

    // 2. Context-Aware Custom Open Palm Gesture ('Hello')
    if (sign === 'Hello') {
      if (activeRoom === 'Master Bedroom') {
        // Sleep context
        setDevices(prev => ({
          ...prev,
          bedLight: false,
          bedAC: true,
          bedCurtain: false,
          frontDoor: true, // locked
          alarm: true,
        }))
        const text = "Sleep Mode: Bedroom lights off, AC set, curtains closed, doors locked"
        showToast({ icon: '🌙', label: text, gesture: sign })
        logCmd(sign, text, '🌙', 'Sleep Mode Routine')
        return
      }
      if (activeRoom === 'Living Room') {
        // Entertaining context
        setDevices(prev => ({
          ...prev,
          livingLight: true,
          livingFan: true,
          livingTV: true,
          livingSpeaker: true,
        }))
        const text = "Entertainment Mode: Living Room TV, speaker, lights, and fan turned ON"
        showToast({ icon: '📺', label: text, gesture: sign })
        logCmd(sign, text, '📺', 'Living Room Entertainment')
        return
      }
      if (activeRoom === 'Bathroom') {
        // Bathroom context
        setDevices(prev => ({ ...prev, bathLight: true, bathExhaust: true }))
        const text = "Bathroom Context: Lights and exhaust fan activated"
        showToast({ icon: '🚿', label: text, gesture: sign })
        logCmd(sign, text, '🚿', 'Bathroom Mode')
        return
      }
    }

    // Default gesture mappings
    const map = GESTURE_MAP[sign]
    if (!map) return
    if (map.action === 'scene') {
      applyScene(map.sceneId)
    } else if (map.action === 'toggle') {
      setDevices(prev => {
        const next = { ...prev, [map.device]: !prev[map.device] }
        publish(`home/${map.device}`, { state: next[map.device] ? 'ON' : 'OFF', source: 'gesture' })
        return next
      })
    } else if (map.action === 'set') {
      setDevices(prev => { const next = { ...prev, [map.device]: map.val }; publish(`home/${map.device}`, { state: map.val ? 'ON' : 'OFF' }); return next })
    }
    showToast({ icon: map.icon, label: map.label, gesture: sign })
    logCmd(sign, map.label, map.icon, map.label)
  }, [activeRoom, pointTarget, applyScene, publish, showToast, logCmd])

  // Camera start/stop
  const startCam = async () => {
    try {
      setCamError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCamActive(true)
      if (!window.Hands) throw new Error('MediaPipe not loaded yet.')
      const hands = new window.Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` })
      hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.55, minTrackingConfidence: 0.5, selfieMode: false })
      hands.onResults(res => {
        const ctx = canvasRef.current?.getContext('2d')
        if (!ctx || !canvasRef.current || !videoRef.current) return
        const cw = videoRef.current.videoWidth || 640, ch = videoRef.current.videoHeight || 480
        if (canvasRef.current.width !== cw) { canvasRef.current.width = cw; canvasRef.current.height = ch }
        ctx.save(); ctx.clearRect(0, 0, cw, ch)
        // Mirror canvas to match CSS-mirrored video
        ctx.translate(cw, 0); ctx.scale(-1, 1)
        if (res.multiHandLandmarks?.length > 0) {
          for (const lm of res.multiHandLandmarks) {
            if (window.drawConnectors) window.drawConnectors(ctx, lm, window.HAND_CONNECTIONS, { color: '#2dd4bf', lineWidth: 2 })
            if (window.drawLandmarks)  window.drawLandmarks(ctx, lm, { color: '#f59e0b', lineWidth: 1, radius: 2 })
          }
          const r = recognizeSign(res.multiHandLandmarks[0])
          const label = r?.letter ?? null
          fbRef.current.push(label)
          if (fbRef.current.length > 4) fbRef.current.shift()
          const stable = fbRef.current.length === 4 && fbRef.current.every(f => f === label)
          if (stable && r) {
            setDetectedSign(r.letter)
            if (r.confidence > 0.85 && r.letter !== lastRef.current && !coolRef.current && GESTURE_MAP[r.letter]) {
              lastRef.current = r.letter; coolRef.current = true
              setTimeout(() => { coolRef.current = false; lastRef.current = null }, 3500)
              execGesture(r.letter)
            }
          } else if (stable && !r) setDetectedSign(null)
        } else { fbRef.current = []; setDetectedSign(null) }
        ctx.restore()
      })
      handsRef.current = hands
      const cam = new window.Camera(videoRef.current, {
        onFrame: async () => { if (videoRef.current && handsRef.current) await handsRef.current.send({ image: videoRef.current }) },
        width: 640, height: 480
      })
      cam.start(); cameraRef.current = cam
    } catch (err) { setCamError(err.message || 'Camera error') }
  }

  const stopCam = () => {
    if (cameraRef.current) { try { cameraRef.current.stop() } catch(e){} cameraRef.current = null }
    if (handsRef.current)  { try { handsRef.current.close() } catch(e){} handsRef.current  = null }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    if (videoRef.current)  videoRef.current.srcObject = null
    fbRef.current = []; setCamActive(false); setDetectedSign(null)
  }

  useEffect(() => () => {
    if (cameraRef.current) { try { cameraRef.current.stop() } catch(e){} }
    if (handsRef.current)  { try { handsRef.current.close() } catch(e){} }
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    if (toastRef.current)  clearTimeout(toastRef.current)
  }, [])

  const onCount = Object.values(devices).filter(Boolean).length
  const unreadNotifs = notifications.filter(n => !n.read).length

  const SIDE_TABS = [
    { id: 'dashboard',   icon: '📊', label: 'Dashboard'    },
    { id: 'ai',          icon: '🤖', label: 'AI Assistant'  },
    { id: 'detection',   icon: '🎥', label: 'Detection'     },
    { id: 'analytics',   icon: '📈', label: 'Analytics'     },
    { id: 'voice',       icon: '🎤', label: 'Voice Control' },
    { id: 'rooms',       icon: '🏠', label: 'Rooms'         },
    { id: 'devices',     icon: '💡', label: 'Devices'       },
    { id: 'automations', icon: '⚙️', label: 'Automations'  },
    { id: 'hub',         icon: '🔌', label: 'Hub Lab'      },
    { id: 'scenes',      icon: '🎬', label: 'Scenes'        },
    { id: 'history',     icon: '📋', label: 'History'       },
    { id: 'notifs',      icon: '🔔', label: 'Notifications' },
    { id: 'settings',    icon: '⚙️', label: 'Settings'     },
  ]

  const filteredSideTabs = useMemo(() => {
    return SIDE_TABS.filter(t => t.id !== 'hub' || user?.role === 'admin')
  }, [user?.role])

  return (
    <div className="sh-root">

      {/* ══ MOBILE HAMBURGER ══ */}
      <button className="sh-mobile-toggle" onClick={() => setSidebarOpen(o => !o)}>
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* ══ SIDEBAR ══ */}
      <aside className={`sh-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sh-sidebar-brand">
          <div className="sh-sidebar-logo">🏠</div>
          <div className="sh-sidebar-brand-text">
            <div className="sh-sidebar-brand-name">SmartHome <span>AI</span></div>
            <div className="sh-sidebar-brand-sub">Intelligent Living</div>
          </div>
        </div>
        <div className="sh-sidebar-nav">
          {filteredSideTabs.slice(0, 6).map(t => (
            <button key={t.id} className={`sh-nav-btn ${tab === t.id ? 'active' : ''}`} onClick={() => { setTab(t.id); setSidebarOpen(false); }}>
              <span className="sh-nav-icon">{t.icon}</span>
              <span className="sh-nav-label">{t.label}</span>
            </button>
          ))}
          <div className="sh-sidebar-divider"/>
          {filteredSideTabs.slice(6).map(t => (
            <button key={t.id} className={`sh-nav-btn ${tab === t.id ? 'active' : ''}`} onClick={() => { setTab(t.id); setSidebarOpen(false); }}>
              <span className="sh-nav-icon">{t.icon}</span>
              <span className="sh-nav-label">{t.label}
                {t.id === 'notifs' && unreadNotifs > 0 && <span className="sh-nav-badge">{unreadNotifs}</span>}
              </span>
            </button>
          ))}
        </div>
        <div className="sh-sidebar-spacer" />
        <div className="sh-sidebar-user">
          <div className="sh-sidebar-avatar">{(user.name || 'U')[0].toUpperCase()}</div>
          <div className="sh-sidebar-user-info">
            <div className="sh-sidebar-user-name">{user.name || 'User'}</div>
            <div className="sh-sidebar-user-sub">{apiOnline ? '● Online' : '○ Offline'}</div>
          </div>
        </div>
      </aside>
      <div className={`sh-sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* ══ MAIN ══ */}
      <div className="sh-main">

        {/* ── TOP BAR ── */}
        <header className="sh-topbar">
          <div className="sh-topbar-title">
            <span>Gesture</span>Home
            {user.name && <span className="sh-topbar-greeting">· {user.name}</span>}
          </div>

          {/* Weather */}
          {weather && (
            <div className="sh-weather-chip" title={`${weather.condition} · Humidity: ${weather.humidity}%`}>
              <span className="sh-weather-icon">{weather.icon}</span>
              <span className="sh-weather-temp">{weather.temperature}°C</span>
              <span className="sh-weather-cond">{weather.condition}</span>
            </div>
          )}

          {/* Clock */}
          <div className="sh-clock">{clock}</div>

          {/* Notification bell */}
          <button className="sh-notif-btn" onClick={() => setShowNotifPanel(p => !p)} title="Notifications">
            🔔
            {unreadNotifs > 0 && <span className="sh-notif-badge">{unreadNotifs > 9 ? '9+' : unreadNotifs}</span>}
          </button>

          {/* User + logout */}
          <div className="sh-user-pill" onClick={() => { setEditName(user.name || ''); setEditEmail(user.email || ''); setShowProfileModal(true); }} title="Click to edit profile">
            <div className="sh-user-avatar">{(user.name || 'U')[0].toUpperCase()}</div>
            <div>
              <div className="sh-user-name">{user.name || 'User'}</div>
              <div className="sh-logout-label">Edit Profile</div>
            </div>
          </div>
          <button className="sh-logout-btn" onClick={handleLogout} title="Logout">⏻</button>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="sh-page">

          {/* ── KPI STRIP ── */}
          <div className="sh-kpi-strip">
            <div className="sh-kpi" style={{ '--kc': '#fbbf24', '--kc-rgb': '251,191,36' }}>
              <div className="sh-kpi-icon-wrap" style={{ background: 'rgba(251,191,36,0.15)' }}><span>💡</span></div>
              <div>
                <div className="sh-kpi-val">{onCount}<span className="sh-kpi-sub"> / 22</span></div>
                <div className="sh-kpi-label">Connected Devices</div>
                <div className="sh-kpi-delta" style={{ color: '#22c55e' }}>↑ {onCount} Active</div>
              </div>
            </div>
            <div className="sh-kpi" style={{ '--kc': '#2dd4bf', '--kc-rgb': '45,212,191' }}>
              <div className="sh-kpi-icon-wrap" style={{ background: 'rgba(45,212,191,0.15)' }}><span>📶</span></div>
              <div>
                <div className="sh-kpi-val">{Math.round(onCount / 22 * 18)}<span className="sh-kpi-sub"> Online</span></div>
                <div className="sh-kpi-label">WiFi Devices</div>
                <div className="sh-kpi-delta" style={{ color: '#2dd4bf' }}>{Math.round(onCount / 22 * 100)}% of devices</div>
              </div>
            </div>
            <div className="sh-kpi" style={{ '--kc': '#818cf8', '--kc-rgb': '129,140,248' }}>
              <div className="sh-kpi-icon-wrap" style={{ background: 'rgba(129,140,248,0.15)' }}><span>⚡</span></div>
              <div>
                <div className="sh-kpi-val">
                  {(Object.entries(devices).filter(([k,v]) => v).reduce((s,[k]) => { const d = DEVICE_DEFS.find(x => x.id===k); return s + (d?.watt||0) }, 0) / 1000).toFixed(1)}
                  <span className="sh-kpi-sub"> kWh</span>
                </div>
                <div className="sh-kpi-label">Energy Today</div>
                <div className="sh-kpi-delta" style={{ color: '#818cf8' }}>₹{(Object.entries(devices).filter(([k,v]) => v).reduce((s,[k]) => { const d = DEVICE_DEFS.find(x => x.id===k); return s + (d?.watt||0) }, 0) * 24 / 1000 * 8).toFixed(0)} est.</div>
              </div>
            </div>
            <div className="sh-kpi" style={{ '--kc': '#22c55e', '--kc-rgb': '34,197,94' }}>
              <div className="sh-kpi-icon-wrap" style={{ background: 'rgba(34,197,94,0.15)' }}><span>🎯</span></div>
              <div>
                <div className="sh-kpi-val">{analytics?.accuracy ?? 98.2}<span className="sh-kpi-sub">%</span></div>
                <div className="sh-kpi-label">Device Accuracy</div>
                <div className="sh-kpi-delta" style={{ color: '#22c55e' }}>Excellent</div>
              </div>
            </div>
          </div>

          {/* ── TOP QUICK ACTIONS BAR ── */}
          <div className="sh-topqa-bar">
            <button className="sh-topqa-btn" onClick={() => { applyScene('allOn'); showToast({ icon: '💡', label: 'All ON', gesture: 'Hello' }) }}>
              <span>➕</span> Add Device
            </button>
            <button className="sh-topqa-btn" onClick={() => setTab('voice')}>
              <span>🎤</span> Voice Command
            </button>
            <button className="sh-topqa-btn emergency" onClick={() => { applyScene('allOff'); showToast({ icon: '🚨', label: 'Emergency Mode', gesture: 'S' }) }}>
              <span>🚨</span> Emergency
            </button>
            <button className="sh-topqa-btn" onClick={() => setTab('automations')}>
              <span>⚙️</span> Automation
            </button>
            <button className="sh-topqa-btn" onClick={() => setTab('scenes')}>
              <span>🎬</span> Scenes
            </button>
          </div>

          {/* ── DASHBOARD TAB ── */}
          {tab === 'dashboard' && (
            <>
              {/* 3D Home Interactive Showcase */}
              <div className="sh-card" style={{ marginBottom: 14 }}>
                <div className="sh-card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 className="sh-card-title">🏠 Digital Twin & Pointing Center</h3>
                    <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>
                      Interactive real-time 3D twin of your home. Use modes to monitor metrics.
                    </p>
                  </div>
                  
                  {/* Digital Twin Modes */}
                  <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', padding: 3, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', marginLeft: 'auto' }}>
                    {['status', 'temp', 'occupancy'].map(mode => (
                      <button
                        key={mode}
                        className={`sh-topqa-btn`}
                        style={{ padding: '4px 10px', fontSize: '0.7rem', border: 'none', background: twinMode === mode ? 'var(--teal)' : 'transparent', color: twinMode === mode ? '#050914' : 'var(--muted)', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                        onClick={() => { setTwinMode(mode); speakText(`Twin Mode: ${mode === 'status' ? 'Status View' : mode === 'temp' ? 'Temperature Heatmap' : 'Occupancy monitoring'}`) }}
                      >
                        {mode === 'status' ? '🔌 Status' : mode === 'temp' ? '🌡️ Heatmap' : '🚶 Occupancy'}
                      </button>
                    ))}
                  </div>

                  {/* Pointing Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>👉 Pointing At:</span>
                    <select
                      className="sh-settings-input"
                      value={pointTarget}
                      onChange={e => { setPointTarget(e.target.value); speakText(e.target.value === 'none' ? 'Pointing released' : `Pointing target lock: ${e.target.value === 'livingTV' ? 'Living TV' : e.target.value === 'bedAC' ? 'Bedroom A C' : 'Front Door Lock'}`) }}
                      style={{ fontSize: '0.7rem', padding: '3px 8px', minWidth: 120, height: 28, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)' }}
                    >
                      <option value="none">❌ No Target</option>
                      <option value="livingTV">📺 Living TV</option>
                      <option value="bedAC">❄️ Bedroom AC</option>
                      <option value="frontDoor">🔒 Front Door</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>
                      {show3D ? 'Show Twin' : 'Hidden'}
                    </span>
                    <div
                      className={`sh-mini-toggle${show3D ? ' on' : ''}`}
                      onClick={() => setShow3D(v => !v)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="sh-mini-knob"></div>
                    </div>
                  </div>
                </div>
                {show3D && (
                  <div style={{ padding: '10px 0' }}>
                    <Home3D
                      devices={DEVICE_DEFS}
                      deviceStates={mappedDeviceStates}
                      onDeviceToggle={toggleDevice}
                      activeRoom={activeRoom}
                      onRoomClick={(roomId) => {
                        const roomMap = { living: 'Living Room', bedroom: 'Master Bedroom', kitchen: 'Kitchen', study: 'Study Room', bathroom: 'Bathroom', door: 'Main Door' }
                        setActiveRoom(prev => prev === roomMap[roomId] ? 'All' : roomMap[roomId] || 'All')
                      }}
                      twinMode={twinMode}
                      pointTarget={pointTarget}
                    />
                  </div>
                )}
              </div>

              <div className="sh-dash-grid">
                {/* Room Overview */}
                <div className="sh-card">
                  <div className="sh-card-header">
                    <h3 className="sh-card-title">🏠 Room Overview</h3>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                      <button className="sh-all-btn on" onClick={() => { applyScene('allOn'); publish('home/all', {c:'all_on'}) }}>All ON</button>
                      <button className="sh-all-btn off" onClick={() => { applyScene('allOff'); publish('home/all', {c:'all_off'}) }}>All OFF</button>
                    </div>
                  </div>
                  <div className="sh-room-overview">
                    {[
                      { room: 'Living Room',  icon: '🛋️', devs: ['livingLight','livingFan','livingTV','livingSpeaker'], color: '#fbbf24' },
                      { room: 'Bathroom',     icon: '🚿', devs: ['bathLight','bathExhaust'], color: '#67e8f9' },
                      { room: 'Kitchen',      icon: '🍳', devs: ['kitchenLight','kitchenExhaust'], color: '#f59e0b' },
                      { room: 'Garage',       icon: '🚗', devs: ['gateLight','doorbell'], color: '#6b7280' },
                    ].map(r => {
                      const onDevs = r.devs.filter(d => devices[d])
                      return (
                        <div key={r.room} className={`sh-room-ov-card ${activeRoom === r.room ? 'highlighted' : ''}`}>
                          <div className="sh-room-ov-hdr">
                            <div className="sh-room-ov-icon" style={{ color: r.color }}>{r.icon}</div>
                            <div>
                              <div className="sh-room-ov-name">{r.room}</div>
                              <div className="sh-room-ov-count">{r.devs.length} Devices</div>
                            </div>
                          </div>
                          <div className="sh-room-ov-devs">
                            {r.devs.map(dId => {
                              const def = DEVICE_DEFS.find(x => x.id === dId)
                              if (!def) return null
                              return (
                                <div key={dId} className="sh-room-ov-dev">
                                  <span>{def.icon} {def.name}</span>
                                  <div className={`sh-mini-toggle ${devices[dId] ? 'on' : ''}`} onClick={() => toggleDevice(dId)}>
                                    <div className="sh-mini-knob"/>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Live Detection Camera */}
                <div className="sh-card">
                  <div className="sh-card-header">
                    <h3 className="sh-card-title">🎥 Live Detection</h3>
                    <span className="sh-card-badge">{camActive ? '🔴 LIVE' : 'OFF'}</span>
                  </div>
                  <div className="sh-cam-wrap" style={{ height: 220 }}>
                    <video ref={videoRef} autoPlay playsInline muted className="sh-cam-video" style={{ display: camActive ? 'block' : 'none' }}/>
                    {camActive && <canvas ref={canvasRef} className="sh-cam-canvas"/>}
                    {camActive && <div className="sh-cam-hud"><div className="camera-scan-line"/><span className="sh-cam-badge">🔴 GESTURE ACTIVE</span></div>}
                    {camError && <div className="sh-cam-err">{camError}</div>}
                    {!camActive && !camError && <div className="sh-cam-idle"><span>✋</span><p>Gesture AI Control</p><p className="sh-cam-hint">Show hand sign to control</p></div>}
                    {camActive && detectedSign && (
                      <div className={`sh-sign-pill ${GESTURE_MAP[detectedSign] ? 'mapped' : ''}`}>
                        <span className="sh-sign-char">{detectedSign}</span>
                        {GESTURE_MAP[detectedSign] && <span className="sh-sign-cmd">{GESTURE_MAP[detectedSign].icon} {GESTURE_MAP[detectedSign].label}</span>}
                      </div>
                    )}
                  </div>
                  {camActive && detectedSign && (
                    <div className="sh-det-confidence">
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ color:'var(--teal)', fontWeight:600 }}>Sign: <strong>{detectedSign}</strong></span>
                        <span style={{ color:'var(--green)', fontSize:'0.8rem' }}>96.3%</span>
                      </div>
                      <div className="sh-ep-bar-track"><div className="sh-ep-bar" style={{ width:'96%', background:'var(--green)' }}/></div>
                      <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:4 }}>Indian Sign Language · ISL v2.1</div>
                    </div>
                  )}
                  <button className={`btn-camera ${camActive ? 'stop' : 'start'}`} style={{ marginTop:10 }} onClick={camActive ? stopCam : startCam}>
                    {camActive ? '⏹ Stop Gesture Control' : '▶ Start Gesture Control'}
                  </button>
                </div>

                {/* Recent Activity */}
                <div className="sh-card">
                  <div className="sh-card-header">
                    <h3 className="sh-card-title">🕒 Recent Activity</h3>
                    <span className="sh-card-badge" style={{ background:'rgba(34,197,94,.1)', color:'var(--green)', borderColor:'rgba(34,197,94,.2)' }}>Live</span>
                  </div>
                  <div className="sh-activity-list">
                    {[
                      { icon:'💡', action:'Light Turned ON', room:'Living Room', time:'2s ago' },
                      { icon:'📺', action:'TV Turned OFF', room:'Living Room', time:'10s ago' },
                      { icon:'🌀', action:'Fan Turned OFF', room:'Bedroom', time:'20s ago' },
                      { icon:'🎤', action:'Gesture Recognized', room:'Living Room', time:'30s ago' },
                      { icon:'🔒', action:'Door Locked', room:'Main Door', time:'1m ago' },
                    ].concat(cmdHistory.slice(0,5).map(c => ({ icon:c.icon, action:c.label, room:'Gesture', time:c.time }))).slice(0,7).map((item,i) => (
                      <div key={i} className="sh-activity-row">
                        <div className="sh-activity-icon">{item.icon}</div>
                        <div className="sh-activity-info">
                          <div className="sh-activity-action">{item.action}</div>
                          <div className="sh-activity-room">{item.room}</div>
                        </div>
                        <div className="sh-activity-time">{item.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom row: Energy + Device Usage + AI Recs */}
              <div className="sh-dash-bottom">
                <div className="sh-card">
                  <div className="sh-card-header">
                    <h3 className="sh-card-title">⚡ Energy Usage</h3>
                    <span className="sh-card-badge">This Week</span>
                  </div>
                  <div className="sh-energy-sparkline">
                    {(analytics?.week || [
                      { label:'Mon', kwh:5.2 }, { label:'Tue', kwh:4.8 }, { label:'Wed', kwh:6.1 },
                      { label:'Thu', kwh:5.5 }, { label:'Fri', kwh:7.2 }, { label:'Sat', kwh:6.8 }, { label:'Sun', kwh:8.4 }
                    ]).map((d,i,arr) => {
                      const maxKwh = Math.max(...arr.map(x => x.kwh))
                      return (
                        <div key={i} className="sh-echart-bar-wrap">
                          <div className="sh-echart-val">{d.kwh}</div>
                          <div className={`sh-echart-bar ${i===arr.length-1 ? 'today' : ''}`} style={{ height:`${(d.kwh/maxKwh)*100}%` }}/>
                          <div className="sh-echart-label">{d.label}</div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, fontSize:'0.78rem', color:'var(--muted)' }}>
                    <span>Total: <strong style={{ color:'var(--teal)' }}>{analytics?.total_kwh_week ?? 58.4} kWh</strong></span>
                    <span>Cost: <strong style={{ color:'var(--amber)' }}>₹{analytics?.total_cost_week ?? 876}</strong></span>
                  </div>
                </div>

                <div className="sh-card">
                  <div className="sh-card-header"><h3 className="sh-card-title">📊 Device Usage</h3></div>
                  <div className="sh-device-usage">
                    <div className="sh-donut" style={{ background:`conic-gradient(#f59e0b 0% 35%, #2dd4bf 35% 65%, #818cf8 65% 78%, #22c55e 78% 87%, #64748b 87% 100%)` }}>
                      <div className="sh-donut-center">
                        <div style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--text)' }}>{onCount}</div>
                        <div style={{ fontSize:'0.62rem', color:'var(--muted)' }}>Active</div>
                      </div>
                    </div>
                    <div className="sh-donut-legend">
                      {[['Lights','#f59e0b','35%'],['Climate','#2dd4bf','30%'],['AV','#818cf8','13%'],['Security','#22c55e','9%'],['Other','#64748b','13%']].map(([n,c,p]) => (
                        <div key={n} className="sh-donut-leg-row">
                          <span className="sh-donut-dot" style={{ background:c }}/>
                          <span>{n}</span>
                          <span style={{ marginLeft:'auto', color:c, fontWeight:700 }}>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sh-card">
                  <div className="sh-card-header">
                    <h3 className="sh-card-title">🤖 AI Recommendations</h3>
                    <span className="sh-card-badge" style={{ background:'rgba(129,140,248,.1)', color:'var(--indigo)', borderColor:'rgba(129,140,248,.2)' }}>OpenAI API</span>
                  </div>
                  <div className="sh-ai-recs">
                    {[
                      { icon:'💡', text:'Living Room has been ON for 4+ hours', action:'Turn OFF the Fan', actionId:'livingFan', color:'#f59e0b' },
                      { icon:'❄️', text:'Bedroom temperature is optimal', action:'Turn OFF the Light', actionId:'bedLight', color:'#38bdf8' },
                      { icon:'⚡', text:'Peak hours detected, save energy', action:'Turn OFF the TV', actionId:'livingTV', color:'#818cf8' },
                    ].map((rec, i) => (
                      <div key={i} className="sh-ai-rec">
                        <div className="sh-ai-rec-icon" style={{ color:rec.color }}>{rec.icon}</div>
                        <div className="sh-ai-rec-body">
                          <div className="sh-ai-rec-text">{rec.text}</div>
                          <button className="sh-ai-rec-btn" onClick={() => toggleDevice(rec.actionId)}>● {rec.action}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sh-card">
                  <div className="sh-card-header">
                    <h3 className="sh-card-title">🤖 AI Model Status</h3>
                    <span className="sh-card-badge" style={{ background: 'rgba(34,197,94,.1)', color: 'var(--green)', borderColor: 'rgba(34,197,94,.2)' }}>
                      Active
                    </span>
                  </div>
                  <div className="sh-det-info" style={{ paddingTop: 4 }}>
                    <div className="sh-det-info-rows">
                      <div className="sh-det-info-row">
                        <span>Model</span>
                        <strong style={{ color: 'var(--teal)' }}>SL-v2.1 (Oxc)</strong>
                      </div>
                      <div className="sh-det-info-row">
                        <span>Accuracy</span>
                        <strong style={{ color: 'var(--green)' }}>{retraining ? '98.4%' : '97.6%'}</strong>
                      </div>
                      <div className="sh-det-info-row">
                        <span>Inference Time</span>
                        <strong>0.4s</strong>
                      </div>
                      <div className="sh-det-info-row">
                        <span>Status</span>
                        <span style={{ color: retraining ? 'var(--amber)' : 'var(--green)', fontWeight: 600 }}>
                          {retraining ? '● Retraining...' : '● Online & Ready'}
                        </span>
                      </div>
                    </div>
                    {retraining && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: 4 }}>
                          <span style={{ color: 'var(--amber)' }}>Progress</span>
                          <span>{retrainProgress}%</span>
                        </div>
                        <div className="sh-ep-bar-track">
                          <div className="sh-ep-bar" style={{ width: `${retrainProgress}%`, background: 'var(--amber)' }} />
                        </div>
                      </div>
                    )}
                    <button
                      className="sh-topqa-btn"
                      onClick={triggerRetrain}
                      disabled={retraining}
                      style={{ marginTop: 14, width: '100%', justifyContent: 'center', background: retraining ? 'rgba(255,255,255,0.05)' : 'rgba(45,212,191,0.1)', borderColor: 'rgba(45,212,191,0.2)' }}
                    >
                      {retraining ? '⏳ Training Model...' : '🔄 Retrain AI Model'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── DETECTION TAB ── */}
          {tab === 'detection' && (
            <div className="sh-dash-grid">
              <div className="sh-card" style={{ gridColumn:'span 2' }}>
                <div className="sh-card-header">
                  <h3 className="sh-card-title">🎥 Live Sign Language Detection</h3>
                  <span className="sh-card-badge">{camActive ? '🔴 LIVE' : 'OFF'}</span>
                </div>
                <div className="sh-cam-wrap" style={{ height:320 }}>
                  <video ref={videoRef} autoPlay playsInline muted className="sh-cam-video" style={{ display:camActive ? 'block' : 'none' }}/>
                  {camActive && <canvas ref={canvasRef} className="sh-cam-canvas"/>}
                  {camActive && <div className="sh-cam-hud"><div className="camera-scan-line"/><span className="sh-cam-badge">🔴 GESTURE ACTIVE</span></div>}
                  {!camActive && <div className="sh-cam-idle"><span>📷</span><p>Camera not started</p><p className="sh-cam-hint">Click Start Livefeed</p></div>}
                  {camActive && detectedSign && (
                    <div className={`sh-sign-pill ${GESTURE_MAP[detectedSign] ? 'mapped' : ''}`}>
                      <span className="sh-sign-char">{detectedSign}</span>
                      {GESTURE_MAP[detectedSign] && <span className="sh-sign-cmd">{GESTURE_MAP[detectedSign].icon} {GESTURE_MAP[detectedSign].label}</span>}
                    </div>
                  )}
                </div>
                <button className={`btn-camera ${camActive ? 'stop' : 'start'}`} style={{ marginTop:12 }} onClick={camActive ? stopCam : startCam}>
                  {camActive ? '⏹ Stop Livefeed' : '▶ Start Livefeed'}
                </button>
              </div>
              <div className="sh-card">
                <div className="sh-card-header"><h3 className="sh-card-title">📊 Detection Info</h3></div>
                <div className="sh-det-info">
                  <div className="sh-det-big-sign">{detectedSign || '?'}</div>
                  <div className="sh-det-info-rows">
                    <div className="sh-det-info-row"><span>Sign</span><strong style={{ color:'var(--teal)' }}>{detectedSign || '—'}</strong></div>
                    <div className="sh-det-info-row"><span>Confidence</span><strong style={{ color:'var(--green)' }}>96.3%</strong></div>
                    <div className="sh-det-info-row"><span>Language</span><strong>🇮🇳 ISL</strong></div>
                    <div className="sh-det-info-row"><span>Status</span><span style={{ color:'var(--green)' }}>● Hand Detected</span></div>
                  </div>
                  <div className="sh-ep-bar-track" style={{ marginTop:12 }}><div className="sh-ep-bar" style={{ width:'96%', background:'var(--green)' }}/></div>
                </div>
                <div className="sh-card-header" style={{ marginTop:16 }}><h3 className="sh-card-title">🕒 Detection History</h3></div>
                <div className="sh-det-history">
                  {cmdHistory.slice(0,7).map((c,i) => (
                    <div key={i} className="sh-det-hist-item">
                      <span className="sh-det-hist-sign">{c.sign}</span>
                      <span className="sh-det-hist-label">{c.icon} {c.label}</span>
                      <span className="sh-det-hist-time">{c.time}</span>
                    </div>
                  ))}
                  {cmdHistory.length === 0 && <div className="sh-mqtt-empty">No detections yet</div>}
                </div>
              </div>
              <div className="sh-card" style={{ gridColumn:'span 3' }}>
                <div className="sh-card-header"><h3 className="sh-card-title">🤚 Gesture Map — Click to Simulate</h3></div>
                <div className="sh-gmap-list">
                  {Object.entries(GESTURE_MAP).map(([sign,m]) => (
                    <div key={sign} className={`sh-gmap-row ${detectedSign === sign ? 'active' : ''}`} onClick={() => execGesture(sign)} title="Click to simulate">
                      <span className="sh-gmap-sign">{sign}</span>
                      <span className="sh-gmap-icon">{m.icon}</span>
                      <span className="sh-gmap-label">{m.label}</span>
                      {detectedSign === sign && <span className="sh-gmap-live">LIVE</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {tab === 'analytics' && (
            <>
              <div className="sh-kpi-strip" style={{ marginBottom:16 }}>
                <div className="sh-kpi" style={{ '--kc':'#2dd4bf','--kc-rgb':'45,212,191' }}>
                  <div className="sh-kpi-icon-wrap" style={{ background:'rgba(45,212,191,.15)' }}><span>⚡</span></div>
                  <div><div className="sh-kpi-val">{analytics?.total_kwh_week ?? 58.4}<span className="sh-kpi-sub"> kWh</span></div><div className="sh-kpi-label">Total Energy</div><div className="sh-kpi-delta" style={{ color:'var(--teal)' }}>↑ 4% vs last week</div></div>
                </div>
                <div className="sh-kpi" style={{ '--kc':'#f59e0b','--kc-rgb':'245,158,11' }}>
                  <div className="sh-kpi-icon-wrap" style={{ background:'rgba(245,158,11,.15)' }}><span>₹</span></div>
                  <div><div className="sh-kpi-val">{analytics?.total_cost_week ?? 876}<span className="sh-kpi-sub"> ₹</span></div><div className="sh-kpi-label">Weekly Cost</div><div className="sh-kpi-delta" style={{ color:'var(--amber)' }}>Monthly: ₹3,504</div></div>
                </div>
                <div className="sh-kpi" style={{ '--kc':'#818cf8','--kc-rgb':'129,140,248' }}>
                  <div className="sh-kpi-icon-wrap" style={{ background:'rgba(129,140,248,.15)' }}><span>✋</span></div>
                  <div><div className="sh-kpi-val">{analytics?.total_gestures ?? 248}</div><div className="sh-kpi-label">Total Gestures</div><div className="sh-kpi-delta" style={{ color:'var(--indigo)' }}>↑ +42 this week</div></div>
                </div>
                <div className="sh-kpi" style={{ '--kc':'#22c55e','--kc-rgb':'34,197,94' }}>
                  <div className="sh-kpi-icon-wrap" style={{ background:'rgba(34,197,94,.15)' }}><span>🎯</span></div>
                  <div><div className="sh-kpi-val">{analytics?.accuracy ?? 98.2}<span className="sh-kpi-sub">%</span></div><div className="sh-kpi-label">AI Accuracy</div><div className="sh-kpi-delta" style={{ color:'var(--green)' }}>Excellent</div></div>
                </div>
              </div>
              <div className="sh-dash-grid">
                <div className="sh-card" style={{ gridColumn:'span 2' }}>
                  <div className="sh-card-header"><h3 className="sh-card-title">📈 Energy Usage — This Week</h3></div>
                  <div className="sh-echart" style={{ height:180 }}>
                    {(analytics?.week || [
                      { label:'Mon',kwh:5.2 },{ label:'Tue',kwh:4.8 },{ label:'Wed',kwh:6.1 },
                      { label:'Thu',kwh:5.5 },{ label:'Fri',kwh:7.2 },{ label:'Sat',kwh:6.8 },{ label:'Sun',kwh:8.4 }
                    ]).map((d,i,arr) => {
                      const maxKwh = Math.max(...arr.map(x => x.kwh))
                      return (
                        <div key={i} className="sh-echart-bar-wrap">
                          <div className="sh-echart-val">{d.kwh}</div>
                          <div className={`sh-echart-bar ${i===arr.length-1 ? 'today' : ''}`} style={{ height:`${(d.kwh/maxKwh)*100}%` }}/>
                          <div className="sh-echart-label">{d.label}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="sh-card">
                  <div className="sh-card-header"><h3 className="sh-card-title">🍩 Shape by Device</h3></div>
                  <div className="sh-device-usage">
                    <div className="sh-donut" style={{ background:`conic-gradient(#f59e0b 0% 38%, #2dd4bf 38% 63%, #818cf8 63% 78%, #22c55e 78% 88%, #64748b 88% 100%)` }}>
                      <div className="sh-donut-center"><div style={{ fontSize:'1.1rem', fontWeight:800 }}>100%</div><div style={{ fontSize:'0.62rem', color:'var(--muted)' }}>Usage</div></div>
                    </div>
                    <div className="sh-donut-legend">
                      {[['AC','#f59e0b','38%'],['Lights','#2dd4bf','25%'],['TV','#818cf8','15%'],['Fan','#22c55e','10%'],['Other','#64748b','12%']].map(([n,c,p]) => (
                        <div key={n} className="sh-donut-leg-row"><span className="sh-donut-dot" style={{ background:c }}/><span>{n}</span><span style={{ marginLeft:'auto',color:c,fontWeight:700 }}>{p}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="sh-card" style={{ gridColumn:'span 2' }}>
                  <div className="sh-card-header"><h3 className="sh-card-title">📊 Daily Comparison</h3><span className="sh-card-badge">This Week vs Last Week</span></div>
                  <div className="sh-echart" style={{ height:150 }}>
                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day,i) => (
                      <div key={i} className="sh-echart-bar-wrap" style={{ gap:2 }}>
                        <div className="sh-echart-bar" style={{ height:`${[60,45,70,50,80,65,90][i]}%`, background:'rgba(129,140,248,0.7)', borderRadius:'4px 4px 0 0' }}/>
                        <div className="sh-echart-bar" style={{ height:`${[50,55,60,45,70,55,80][i]}%`, background:'rgba(45,212,191,0.4)', borderRadius:'4px 4px 0 0' }}/>
                        <div className="sh-echart-label">{day}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:12, marginTop:6, fontSize:'0.72rem' }}>
                    <span style={{ color:'var(--indigo)' }}>■ This Week</span>
                    <span style={{ color:'var(--teal)', opacity:.6 }}>■ Last Week</span>
                  </div>
                </div>
                <div className="sh-card">
                  <div className="sh-card-header"><h3 className="sh-card-title">📱 Device Activity</h3></div>
                  {[['Lights','#f59e0b',72],['AC','#38bdf8',45],['TV','#818cf8',30],['Fan','#2dd4bf',60]].map(([n,c,p]) => (
                    <div key={n} style={{ marginBottom:10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:4 }}>
                        <span style={{ color:'var(--text)' }}>{n}</span><span style={{ color:c, fontWeight:700 }}>{p}%</span>
                      </div>
                      <div className="sh-ep-bar-track"><div className="sh-ep-bar" style={{ width:`${p}%`, background:c }}/></div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── ROOMS TAB ── */}
          {tab === 'rooms' && (
            <>
              <div className="sh-rooms-header">
                <h2 style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--text)' }}>🏠 All Rooms</h2>
                <button className="sh-topqa-btn">➕ Add Room</button>
              </div>
              <div className="sh-rooms-grid">
                {[
                  { name:'Living Room', icon:'🛋️', gradient:'linear-gradient(135deg, rgba(251,191,36,.2) 0%, rgba(45,212,191,.08) 100%)', border:'rgba(251,191,36,.25)', devs:['livingLight','livingFan','livingTV','livingSpeaker','livingCurtain'] },
                  { name:'Master Bedroom', icon:'🛏️', gradient:'linear-gradient(135deg, rgba(99,102,241,.2) 0%, rgba(244,114,182,.08) 100%)', border:'rgba(99,102,241,.25)', devs:['bedLight','bedAC','bedCurtain','bedThermostat'] },
                  { name:'Kitchen', icon:'🍳', gradient:'linear-gradient(135deg, rgba(245,158,11,.2) 0%, rgba(251,191,36,.08) 100%)', border:'rgba(245,158,11,.25)', devs:['kitchenLight','kitchenExhaust'] },
                  { name:'Garage', icon:'🚗', gradient:'linear-gradient(135deg, rgba(107,114,128,.2) 0%, rgba(55,65,81,.08) 100%)', border:'rgba(107,114,128,.25)', devs:['gateLight','doorbell','frontDoor'] },
                  { name:'Kids Room', icon:'🧸', gradient:'linear-gradient(135deg, rgba(244,114,182,.2) 0%, rgba(253,164,175,.08) 100%)', border:'rgba(244,114,182,.25)', devs:['kidsLight','kidsCurtain','kidsNightLight'] },
                  { name:'Bathroom', icon:'🚿', gradient:'linear-gradient(135deg, rgba(56,189,248,.2) 0%, rgba(103,232,249,.08) 100%)', border:'rgba(56,189,248,.25)', devs:['bathLight','bathExhaust'] },
                  { name:'Study Room', icon:'📚', gradient:'linear-gradient(135deg, rgba(34,197,94,.2) 0%, rgba(74,222,128,.08) 100%)', border:'rgba(34,197,94,.25)', devs:['studyLight','studyMonitor'] },
                ].map(room => {
                  const onDevCount = room.devs.filter(d => devices[d]).length
                  return (
                    <div key={room.name} className="sh-room-card" style={{ background:room.gradient, borderColor:room.border }}>
                      <div className="sh-room-card-top">
                        <div className="sh-room-card-icon">{room.icon}</div>
                        <div className="sh-room-card-info">
                          <div className="sh-room-card-name">{room.name}</div>
                          <div className="sh-room-card-sub">{room.devs.length} Devices</div>
                        </div>
                        <div className="sh-room-card-status">
                          <div className={`sh-room-status-badge ${onDevCount > 0 ? 'on' : ''}`}>{onDevCount > 0 ? '● On' : '○ Off'}</div>
                        </div>
                      </div>
                      <div className="sh-room-card-devs">
                        {room.devs.map(dId => {
                          const def = DEVICE_DEFS.find(x => x.id === dId)
                          if (!def) return null
                          return (
                            <div key={dId} className="sh-room-dev-row">
                              <span className="sh-room-dev-icon">{def.icon}</span>
                              <span className="sh-room-dev-name">{def.name}</span>
                              <div className={`sh-mini-toggle ${devices[dId] ? 'on' : ''}`} onClick={() => toggleDevice(dId)}><div className="sh-mini-knob"/></div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* ── DEVICES TAB ── */}
          {tab === 'devices' && (
            <div className="sh-card">
              <div className="sh-dv-hdr">
                <h3 className="sh-card-title">💡 All Devices ({onCount} on · {22 - onCount} off)</h3>
                <div style={{ display:'flex', gap:'.5rem' }}>
                  <button className="sh-all-btn on" onClick={() => { applyScene('allOn'); publish('home/all', {c:'all_on'}) }}>All ON</button>
                  <button className="sh-all-btn off" onClick={() => { applyScene('allOff'); publish('home/all', {c:'all_off'}) }}>All OFF</button>
                </div>
              </div>
              {['Living Room','Master Bedroom','Kids Room','Kitchen','Study Room','Bathroom','Outdoor / Security'].map(room => {
                const roomDevs = DEVICE_DEFS.filter(d => d.room === room || (room === 'Outdoor / Security' && ['Main Door','Outdoor','System'].includes(d.room)))
                if (!roomDevs.length) return null
                return (
                  <div key={room} className="sh-room-group">
                    <div className="sh-room-label">{room}</div>
                    <div className="sh-dv-grid">
                      {roomDevs.map(d => <DeviceCard key={d.id} def={d} state={devices[d.id]} onToggle={toggleDevice}/>)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── AUTOMATIONS TAB ── */}
          {tab === 'automations' && (
            <div className="sh-card"><AutomationsPanel /></div>
          )}

          {/* ── SCENES TAB ── */}
          {tab === 'scenes' && (
            <div className="sh-card">
              <div className="sh-card-header"><h3 className="sh-card-title">🎬 Scene Presets</h3></div>
              <div className="sh-scenes-mini">
                {SCENE_CARDS.map(sc => (
                  <div key={sc.id} className={`sh-sc-mini ${activeScene === sc.id ? 'active' : ''}`}
                       style={{ '--sc': sc.color }}
                       onClick={() => { applyScene(sc.id); setActiveScene(sc.id); showToast({ icon:sc.icon, label:sc.name, gesture:sc.gesture }); logCmd(sc.gesture, sc.id, sc.icon, sc.name) }}>
                    <span className="sh-sc-m-icon">{sc.icon}</span>
                    <span className="sh-sc-m-name">{sc.name}</span>
                    <span className="sh-sc-m-gest">{sc.gesture}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── AI ASSISTANT TAB ── */}
          {tab === 'ai' && (
            <div className="sh-dash-grid">
              <div className="sh-card" style={{ gridColumn:'span 2' }}>
                <div className="sh-card-header"><h3 className="sh-card-title">🤖 AI Assistant</h3><span className="sh-card-badge" style={{ background:'rgba(129,140,248,.1)', color:'var(--indigo)' }}>Listening…</span></div>
                <div className="sh-voice-ai-center">
                  <div className="sh-voice-mic" onClick={() => setVoiceListening(v => !v)} style={{ background: voiceListening ? 'linear-gradient(135deg,#6366f1,#2dd4bf)' : 'rgba(99,102,241,0.15)', borderColor: voiceListening ? '#6366f1' : 'rgba(99,102,241,.3)' }}>
                    🎤
                    {voiceListening && <div className="sh-voice-mic-ring"/>}
                  </div>
                  <div className="sh-voice-wave">
                    {Array.from({length:32}).map((_,i) => (
                      <div key={i} className={`sh-wave-bar ${voiceListening ? 'active' : ''}`} style={{ animationDelay:`${i*0.05}s` }}/>
                    ))}
                  </div>
                  <div style={{ textAlign:'center', marginTop:8 }}>
                    <div style={{ fontWeight:700, fontSize:'1rem' }}>{voiceListening ? '"Trying…"' : 'Click mic to speak'}</div>
                    <div style={{ color:'var(--muted)', fontSize:'0.78rem', marginTop:4 }}>Try: "Turn on living room light" · "Set AC to 24"</div>
                  </div>
                </div>
              </div>
              <div className="sh-card">
                <div className="sh-card-header"><h3 className="sh-card-title">📋 Command History</h3></div>
                <div className="sh-hist-list">
                  {cmdHistory.length === 0 && <div className="sh-mqtt-empty">No commands yet</div>}
                  {cmdHistory.slice(0,15).map(c => (
                    <div key={c.id} className="sh-hist-row">
                      <span className="sh-hist-time">{c.time}</span>
                      <span>{c.icon}</span>
                      <div><div className="sh-hist-label">{c.label}</div><div className="sh-hist-meta">Sign: <strong>{c.sign}</strong></div></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sh-card" style={{ gridColumn:'span 3' }}>
                <div className="sh-card-header"><h3 className="sh-card-title">🤚 Gesture Map</h3></div>
                <div className="sh-gmap-list">
                  {Object.entries(GESTURE_MAP).map(([sign,m]) => (
                    <div key={sign} className={`sh-gmap-row ${detectedSign === sign ? 'active' : ''}`} onClick={() => execGesture(sign)} title="Click to simulate">
                      <span className="sh-gmap-sign">{sign}</span>
                      <span className="sh-gmap-icon">{m.icon}</span>
                      <span className="sh-gmap-label">{m.label}</span>
                      {detectedSign === sign && <span className="sh-gmap-live">LIVE</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Routines & Alerts Card */}
              <div className="sh-card" style={{ gridColumn: 'span 2' }}>
                <div className="sh-card-header">
                  <h3 className="sh-card-title">📈 Routine Learning & Diagnostics</h3>
                  <span className="sh-card-badge" style={{ background: 'rgba(99,102,241,.1)', color: 'var(--indigo)' }}>Proactive AI</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
                  
                  {/* Routine Learner Recommendation */}
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: '1.2rem' }}>💡</span>
                      <strong style={{ fontSize: '0.82rem', color: '#fbbf24' }}>AI Routine Recommendation</strong>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.4, marginBottom: 8 }}>
                      You turn on the Bedroom AC every day at 8:00 PM. Would you like to automate this routine?
                    </p>
                    <button
                      className="sh-ai-rec-btn"
                      style={{ background: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.3)', color: '#fbbf24' }}
                      onClick={() => showToast({ icon: '📅', label: 'AC 8 PM Routine Automated', gesture: 'AI Routine' })}
                    >
                      ✓ Enable Auto-AC Routine
                    </button>
                  </div>

                  {/* Predictive Diagnostics */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Predictive Diagnostics</span>
                    
                    <div className="sh-ai-rec" style={{ padding: '8px 12px' }}>
                      <div className="sh-ai-rec-icon" style={{ color: 'var(--amber)' }}>⚠️</div>
                      <div className="sh-ai-rec-body">
                        <div className="sh-ai-rec-text" style={{ fontSize: '0.75rem', marginBottom: 2 }}><strong>Bedroom AC:</strong> Compressor draws 1.8kW (20% above nominal). Service recommended.</div>
                        <button className="sh-ai-rec-btn" style={{ fontSize: '0.65rem', padding: '2px 8px' }} onClick={() => showToast({ icon: '🛠️', label: 'AC Maintenance Requested', gesture: 'AI Diagnostic' })}>🔧 Request Service</button>
                      </div>
                    </div>

                    <div className="sh-ai-rec" style={{ padding: '8px 12px' }}>
                      <div className="sh-ai-rec-icon" style={{ color: 'var(--teal)' }}>✓</div>
                      <div className="sh-ai-rec-body">
                        <div className="sh-ai-rec-text" style={{ fontSize: '0.75rem', marginBottom: 2 }}><strong>Water Pump:</strong> Running profile is normal (32 mins/day). Zero anomalies.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Context-Aware Companion card */}
              <div className="sh-card">
                <div className="sh-card-header">
                  <h3 className="sh-card-title">🧠 Context Companion</h3>
                  <span className="sh-card-badge" style={{ background: 'rgba(45,212,191,.1)', color: 'var(--teal)' }}>Context Modes</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 0' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                    AI orchestrates multiple device states based on natural status macros:
                  </p>
                  
                  <button
                    className="sh-topqa-btn"
                    style={{ justifyContent: 'flex-start', width: '100%' }}
                    onClick={() => {
                      setDevices(prev => ({ ...prev, bedLight: false, bedAC: true, bedCurtain: false, frontDoor: true, alarm: true }));
                      showToast({ icon: '🌙', label: 'Going to Sleep: Bedroom prepped, security armed', gesture: 'AI Context' })
                    }}
                  >
                    <span>🛏️</span> I'm going to sleep
                  </button>

                  <button
                    className="sh-topqa-btn"
                    style={{ justifyContent: 'flex-start', width: '100%' }}
                    onClick={() => {
                      setDevices(prev => ({ ...prev, livingLight: true, livingFan: true, livingTV: true, livingSpeaker: true }));
                      showToast({ icon: '📺', label: 'Movie Night: Living AV and cozy scene set', gesture: 'AI Context' })
                    }}
                  >
                    <span>🎬</span> Let's watch a movie
                  </button>

                  <button
                    className="sh-topqa-btn"
                    style={{ justifyContent: 'flex-start', width: '100%' }}
                    onClick={() => {
                      applyScene('allOff');
                      showToast({ icon: '🚶', label: 'Leaving Home: All devices OFF, security armed', gesture: 'AI Context' })
                    }}
                  >
                    <span>🚪</span> I'm leaving the house
                  </button>

                  <button
                    className="sh-topqa-btn"
                    style={{ justifyContent: 'flex-start', width: '100%' }}
                    onClick={() => {
                      setDevices(prev => ({ ...prev, livingLight: true, kitchenLight: true }));
                      showToast({ icon: '💡', label: 'Brightness boost applied across active zones', gesture: 'AI Context' })
                    }}
                  >
                    <span>☀️</span> Make room brighter
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ── VOICE CONTROL TAB ── */}
          {tab === 'voice' && (
            <div className="sh-dash-grid">
              <div className="sh-card" style={{ gridColumn:'span 2' }}>
                <div className="sh-card-header"><h3 className="sh-card-title">🎤 Voice Control</h3><span className="sh-card-badge">{voiceListening ? '🔴 Listening…' : 'Idle'}</span></div>
                <div className="sh-voice-ai-center">
                  <div className="sh-voice-mic" onClick={() => setVoiceListening(v => !v)} style={{ background: voiceListening ? 'linear-gradient(135deg,#2dd4bf,#6366f1)' : 'rgba(45,212,191,0.15)', borderColor: voiceListening ? '#2dd4bf' : 'rgba(45,212,191,.3)' }}>
                    🎤
                    {voiceListening && <div className="sh-voice-mic-ring"/>}
                    {voiceListening && <div className="sh-voice-mic-ring" style={{ animationDelay:'.3s' }}/>}
                  </div>
                  <div className="sh-voice-wave">
                    {Array.from({length:40}).map((_,i) => (
                      <div key={i} className={`sh-wave-bar ${voiceListening ? 'active' : ''}`} style={{ animationDelay:`${i*0.04}s` }}/>
                    ))}
                  </div>
                  <div style={{ color:'var(--muted)', fontSize:'0.85rem', marginTop:8 }}>
                    {voiceListening ? 'Listening for voice command…' : 'Click the microphone to start'}
                  </div>
                </div>
                <div className="sh-voice-suggestions">
                  {['Turn on living room light','Lock the front door','Set AC to 24 degrees','Play music in living room','Turn off all devices'].map((cmd,i) => (
                    <button key={i} className="sh-voice-sug" onClick={() => {
                      setVoiceLogs(prev => [{ id:Date.now(), cmd, result:'Command executed', time:new Date().toLocaleTimeString('en-IN',{hour12:false}), ok:true }, ...prev])
                      showToast({ icon:'🎤', label:cmd, gesture:'Voice' })
                    }}>{cmd}</button>
                  ))}
                </div>
              </div>
              <div className="sh-card">
                <div className="sh-card-header"><h3 className="sh-card-title">📋 Voice Log</h3></div>
                <div className="sh-voice-log">
                  {voiceLogs.map(v => (
                    <div key={v.id} className="sh-voice-log-row">
                      <div className="sh-voice-log-icon" style={{ color: v.ok ? 'var(--green)' : 'var(--red)' }}>{v.ok ? '✓' : '✗'}</div>
                      <div className="sh-voice-log-body">
                        <div className="sh-voice-log-cmd">{v.cmd}</div>
                        <div className="sh-voice-log-result">{v.result}</div>
                      </div>
                      <div className="sh-voice-log-time">{v.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {tab === 'history' && (
            <div className="sh-card">
              <div className="sh-card-header"><h3 className="sh-card-title">📋 Command & Gesture History</h3></div>
              <div className="sh-hist-list">
                {cmdHistory.length === 0 && <div className="sh-mqtt-empty">No commands yet — use gestures or click devices</div>}
                {cmdHistory.slice(0,30).map(c => (
                  <div key={c.id} className="sh-hist-row">
                    <span className="sh-hist-time">{c.time}</span>
                    <span>{c.icon}</span>
                    <div><div className="sh-hist-label">{c.label}</div><div className="sh-hist-meta">Sign: <strong>{c.sign}</strong></div></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {tab === 'notifs' && (
            <div className="sh-card">
              <div className="sh-card-header">
                <h3 className="sh-card-title">🔔 Notifications</h3>
                <button className="sh-topqa-btn" style={{ fontSize:'0.78rem', padding:'4px 12px' }}>Mark all as read</button>
              </div>
              <div className="sh-notif-full-list">
                {[
                  { icon:'🚶', title:'Motion Detected', msg:'Garage Cameras', time:'1 min ago', type:'warning', unread:true },
                  { icon:'🔒', title:'Door Locked', msg:'Front Door', time:'5 min ago', type:'success', unread:true },
                  { icon:'⚡', title:'Energy Limit Alert', msg:"Today's usage is high", time:'20 min ago', type:'warning', unread:false },
                  { icon:'💡', title:'New Device Added', msg:'New Bulb in bedroom', time:'1 hour ago', type:'info', unread:false },
                  { icon:'🔄', title:'System Update', msg:'SmartHome AI updated successfully', time:'2 hours ago', type:'info', unread:false },
                  { icon:'📊', title:'Weekly Report', msg:'Your weekly report is ready', time:'1 day ago', type:'info', unread:false },
                ].concat(notifications.slice(0,10).map(n => ({ icon:n.icon||'🔔', title:n.title, msg:n.message, time:n.timestamp, type:n.type, unread:!n.read }))).map((n,i) => (
                  <div key={i} className={`sh-notif-full-row ${n.unread ? 'unread' : ''}`}>
                    <div className={`sh-notif-full-icon ${n.type}`}>{n.icon}</div>
                    <div className="sh-notif-full-body">
                      <div className="sh-notif-full-title">{n.title}</div>
                      <div className="sh-notif-full-msg">{n.msg}</div>
                    </div>
                    <div className="sh-notif-full-time">{n.time}</div>
                    {n.unread && <div className="sh-notif-unread-dot"/>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── HUB LAB TAB ── */}
          {tab === 'hub' && (
            <EcosystemPage nested={true} />
          )}

          {/* ── SETTINGS TAB ── */}
          {tab === 'settings' && (
            <div className="sh-card">
              <div className="sh-card-header"><h3 className="sh-card-title">⚙️ Settings</h3></div>
              <div className="sh-settings-tabs">
                {['General','Devices','Notifications','Security','Account'].map(t => (
                  <button key={t} className={`sh-settings-tab ${settingsActiveTab === t.toLowerCase() ? 'active' : ''}`} onClick={() => setSettingsActiveTab(t.toLowerCase())}>{t}</button>
                ))}
              </div>
              {settingsActiveTab === 'general' && (
                <div className="sh-settings-body">
                  <div className="sh-settings-row"><span>Home Name</span><input className="sh-settings-input" defaultValue="Himanshu's Smart Home"/></div>
                  <div className="sh-settings-row"><span>Location</span><input className="sh-settings-input" defaultValue="Nagpur, Maharashtra, India"/></div>
                  <div className="sh-settings-row"><span>Time Zone</span><input className="sh-settings-input" defaultValue="Asia/Kolkata (+5:30)"/></div>
                  <div className="sh-settings-row"><span>Language</span><select className="sh-settings-input"><option>English</option><option>Hindi</option></select></div>
                  <div className="sh-settings-row"><span>Theme</span><div style={{ display:'flex', gap:8 }}><button className="sh-settings-theme-btn active">Dark</button><button className="sh-settings-theme-btn">System</button></div></div>
                </div>
              )}
              {settingsActiveTab === 'devices' && (
                <div className="sh-settings-body">
                  <div className="sh-settings-row"><span>Auto-discover devices</span><div className="sh-mini-toggle on"><div className="sh-mini-knob"/></div></div>
                  <div className="sh-settings-row"><span>Backend URL</span><input className="sh-settings-input" defaultValue="http://localhost:8000"/></div>
                  <div className="sh-settings-row"><span>API Status</span><span style={{ color: apiOnline ? 'var(--green)' : 'var(--red)', fontWeight:700 }}>{apiOnline ? '● Online' : '○ Offline'}</span></div>
                  
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '14px 0', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text)' }}>📡 MQTT Broker Integration</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: mqttConnected ? 'var(--green)' : 'var(--muted)' }}>
                        {mqttConnected ? '● Broker Connected' : '○ Broker Offline'}
                      </span>
                    </div>
                    
                    <form onSubmit={saveMqttConfig} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div className="sh-settings-row">
                        <span>Broker Host / IP</span>
                        <input className="sh-settings-input" value={mqttHost} onChange={e => setMqttHost(e.target.value)} placeholder="e.g. broker.hivemq.com" required />
                      </div>
                      <div className="sh-settings-row">
                        <span>Broker Port</span>
                        <input className="sh-settings-input" type="number" value={mqttPort} onChange={e => setMqttPort(parseInt(e.target.value) || 1883)} placeholder="1883" required />
                      </div>
                      <div className="sh-settings-row">
                        <span>Broker User (Optional)</span>
                        <input className="sh-settings-input" value={mqttUser} onChange={e => setMqttUser(e.target.value)} placeholder="Username" />
                      </div>
                      <div className="sh-settings-row">
                        <span>Broker Password (Optional)</span>
                        <input className="sh-settings-input" type="password" value={mqttPass} onChange={e => setMqttPass(e.target.value)} placeholder="Password" />
                      </div>
                      <div className="sh-settings-row">
                        <span>Topic Prefix</span>
                        <input className="sh-settings-input" value={mqttPrefix} onChange={e => setMqttPrefix(e.target.value)} placeholder="smart-home" />
                      </div>
                      
                      <button type="submit" className="sh-profile-btn save" style={{ marginTop: 8, width: 'fit-content' }} disabled={savingMqtt}>
                        {savingMqtt ? 'Saving Connection...' : 'Save & Reconnect MQTT'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
              {settingsActiveTab === 'notifications' && (
                <div className="sh-settings-body">
                  <div className="sh-settings-row"><span>Enable Notifications</span><div className="sh-mini-toggle on"><div className="sh-mini-knob"/></div></div>
                  <div className="sh-settings-row"><span>Motion Alerts</span><div className="sh-mini-toggle on"><div className="sh-mini-knob"/></div></div>
                  <div className="sh-settings-row"><span>Energy Alerts</span><div className="sh-mini-toggle on"><div className="sh-mini-knob"/></div></div>
                  <div className="sh-settings-row"><span>System Updates</span><div className="sh-mini-toggle"><div className="sh-mini-knob"/></div></div>
                </div>
              )}
              {settingsActiveTab === 'security' && (
                <div className="sh-settings-body">
                  <div className="sh-settings-row"><span>Two-factor Auth</span><div className="sh-mini-toggle"><div className="sh-mini-knob"/></div></div>
                  <div className="sh-settings-row"><span>Session Timeout</span><select className="sh-settings-input"><option>30 minutes</option><option>1 hour</option><option>Never</option></select></div>
                  <div className="sh-settings-row"><span>Security Alarm</span><div className={`sh-mini-toggle ${devices.alarm ? 'on' : ''}`} onClick={() => toggleDevice('alarm')}><div className="sh-mini-knob"/></div></div>
                </div>
              )}
              {settingsActiveTab === 'account' && (
                <div className="sh-settings-body">
                  <div className="sh-profile-avatar-large">{(user.name || 'U')[0].toUpperCase()}</div>
                  <div className="sh-settings-row"><span>Name</span><input className="sh-settings-input" defaultValue={user.name || 'User'}/></div>
                  <div className="sh-settings-row"><span>Email</span><input className="sh-settings-input" type="email" defaultValue={user.email || ''}/></div>
                  <div className="sh-settings-row"><span>Plan</span><span className="sh-card-badge" style={{ background:'rgba(251,191,36,.1)', color:'var(--amber)' }}>Premium User</span></div>
                  <div style={{ display:'flex', gap:10, marginTop:16 }}>
                    <button className="sh-profile-btn save">Save Changes</button>
                    <button className="sh-profile-btn cancel" onClick={handleLogout}>⏻ Logout</button>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>{/* end sh-page */}
        {/* ── NOTIFICATION PANEL (floating overlay) ── */}
        {showNotifPanel && (
          <div className="sh-notif-panel">
            <div className="sh-notif-header">
              <h3 className="sh-notif-title">🔔 Notifications</h3>
              <button className="sh-notif-close" onClick={() => setShowNotifPanel(false)}>×</button>
            </div>
            <div className="sh-notif-list">
              {notifications.length === 0 && <div className="sh-notif-empty">🎉 All caught up!</div>}
              {notifications.slice(0, 20).map(n => (
                <div key={n.id} className={`sh-notif-item ${!n.read ? 'unread' : ''}`}>
                  <span className="sh-notif-ico">{n.icon}</span>
                  <div className="sh-notif-body">
                    <div className="sh-notif-ntitle">{n.title}</div>
                    <div className="sh-notif-msg">{n.message}</div>
                  </div>
                  <span className="sh-notif-time">{n.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROFILE EDIT MODAL ── */}
        {showProfileModal && (
          <div className="sh-modal-overlay" onClick={() => setShowProfileModal(false)}>
            <div className="sh-profile-modal" onClick={e => e.stopPropagation()}>
              <div className="sh-modal-header">
                <h3 className="sh-modal-title">👤 Edit Profile</h3>
                <button className="sh-modal-close" onClick={() => setShowProfileModal(false)}>×</button>
              </div>
              <div className="sh-modal-body">
                <div className="sh-profile-avatar-large">{(editName || 'U')[0].toUpperCase()}</div>
                <div className="sh-profile-field">
                  <label className="sh-profile-label">Name</label>
                  <input className="sh-profile-input" type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="sh-profile-field">
                  <label className="sh-profile-label">Email</label>
                  <input className="sh-profile-input" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="Your email" />
                </div>
                <div className="sh-profile-actions">
                  <button className="sh-profile-btn cancel" onClick={() => setShowProfileModal(false)}>Cancel</button>
                  <button className="sh-profile-btn save" onClick={() => {
                    const updated = { ...user, name: editName.trim() || user.name, email: editEmail.trim() || user.email }
                    localStorage.setItem('smarthome_user', JSON.stringify(updated))
                    setShowProfileModal(false)
                    window.location.reload()
                  }}>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>{/* end sh-main */}

      {/* Toast */}
      {toast && <CommandToast toast={toast}/>}

    </div>  /* end sh-root */
  )
}
