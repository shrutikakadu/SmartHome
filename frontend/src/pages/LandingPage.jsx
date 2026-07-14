import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './landing.css'

/* ── Animated counter hook ── */
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

/* ── Floating particles ── */
function Particles() {
  return (
    <div className="lp-particles" aria-hidden="true">
      {Array.from({ length: 22 }).map((_, i) => (
        <div key={i} className="lp-particle" style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${2 + Math.random() * 4}px`,
          height: `${2 + Math.random() * 4}px`,
          animationDelay: `${Math.random() * 8}s`,
          animationDuration: `${6 + Math.random() * 10}s`,
          opacity: 0.15 + Math.random() * 0.35,
        }} />
      ))}
    </div>
  )
}

/* ── Animated Hand SVG ── */
function GestureHand({ gesture = 'wave', active = false }) {
  const hands = {
    wave: (
      <svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="lp-hand-svg">
        <defs>
          <linearGradient id="handGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2dd4bf"/>
            <stop offset="100%" stopColor="#6366f1"/>
          </linearGradient>
        </defs>
        {/* Palm */}
        <ellipse cx="60" cy="110" rx="32" ry="38" fill="url(#handGrad)" opacity="0.85"/>
        {/* Fingers */}
        {[
          { x: 28, y1: 110, y2: 42, rx: 7 },
          { x: 43, y1: 105, y2: 32, rx: 7 },
          { x: 60, y1: 100, y2: 28, rx: 7 },
          { x: 77, y1: 105, y2: 35, rx: 7 },
          { x: 90, y1: 112, y2: 55, rx: 6 },
        ].map((f, i) => (
          <rect key={i} x={f.x - f.rx} y={f.y2} width={f.rx * 2} height={f.y1 - f.y2}
            rx={f.rx} fill="url(#handGrad)" opacity="0.9"
            style={{ transformOrigin: `${f.x}px ${f.y1}px`, animation: active ? `fingerWave 1.6s ease-in-out ${i * 0.12}s infinite alternate` : 'none' }}
          />
        ))}
        {/* Thumb */}
        <ellipse cx="22" cy="122" rx="8" ry="18" fill="url(#handGrad)" opacity="0.85" transform="rotate(-30 22 122)"/>
        {/* Glow ring */}
        <circle cx="60" cy="110" r="46" stroke="url(#handGrad)" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 6"/>
      </svg>
    ),
    lock: (
      <svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="lp-hand-svg">
        <defs>
          <linearGradient id="lockGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b"/>
            <stop offset="100%" stopColor="#ef4444"/>
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="115" rx="32" ry="36" fill="url(#lockGrad)" opacity="0.8"/>
        {/* Thumb + Index (D gesture) */}
        <ellipse cx="22" cy="118" rx="8" ry="18" fill="url(#lockGrad)" opacity="0.85" transform="rotate(-30 22 118)"/>
        <rect x="51" y="38" width="14" height="70" rx="7" fill="url(#lockGrad)" opacity="0.9"/>
        {/* Curled fingers */}
        {[43, 60, 77, 90].map((x, i) => (
          <ellipse key={i} cx={x} cy={112} rx={7} ry={9} fill="url(#lockGrad)" opacity="0.7"/>
        ))}
        <circle cx="60" cy="110" r="46" stroke="url(#lockGrad)" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 6"/>
      </svg>
    ),
    peace: (
      <svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="lp-hand-svg">
        <defs>
          <linearGradient id="peaceGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8"/>
            <stop offset="100%" stopColor="#2dd4bf"/>
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="115" rx="32" ry="36" fill="url(#peaceGrad)" opacity="0.8"/>
        <ellipse cx="22" cy="118" rx="8" ry="18" fill="url(#peaceGrad)" opacity="0.85" transform="rotate(-30 22 118)"/>
        {/* Index + Middle up */}
        <rect x="44" y="35" width="14" height="75" rx="7" fill="url(#peaceGrad)" opacity="0.9"/>
        <rect x="62" y="35" width="14" height="75" rx="7" fill="url(#peaceGrad)" opacity="0.9"/>
        {/* Ring + Pinky curled */}
        {[78, 92].map((x, i) => (
          <ellipse key={i} cx={x} cy={115} rx={6} ry={9} fill="url(#peaceGrad)" opacity="0.65"/>
        ))}
        <circle cx="60" cy="110" r="46" stroke="url(#peaceGrad)" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 6"/>
      </svg>
    ),
  }
  return (
    <div className={`lp-hand-wrap ${active ? 'active' : ''}`}>
      {hands[gesture] || hands.wave}
    </div>
  )
}

/* ── Stats section ── */
function StatsSection({ visible }) {
  const devices = useCounter(22, 1800, visible)
  const gestures = useCounter(16, 1600, visible)
  const rooms = useCounter(6, 1200, visible)
  const fps = useCounter(20, 2000, visible)
  const stats = [
    { val: devices, suffix: '', label: 'Smart Devices', icon: '💡' },
    { val: gestures, suffix: '+', label: 'Gestures', icon: '🤚' },
    { val: rooms, suffix: '', label: 'Rooms', icon: '🏠' },
    { val: fps, suffix: ' FPS', label: 'Real-Time AI', icon: '⚡' },
  ]
  return (
    <div className="lp-stats-grid">
      {stats.map((s, i) => (
        <div key={i} className="lp-stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="lp-stat-icon">{s.icon}</div>
          <div className="lp-stat-val">{s.val}{s.suffix}</div>
          <div className="lp-stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

const FEATURES = [
  {
    icon: '🤚',
    title: 'Real-Time Gesture AI',
    desc: 'MediaPipe hand tracking at 20+ FPS. Show a sign — your home reacts instantly. No voice, no touch, no app.',
    color: '#2dd4bf',
    tag: 'MediaPipe + TFLite',
  },
  {
    icon: '🏠',
    title: '22 Smart Devices',
    desc: 'Control lights, fans, AC, curtains, TV, security locks, and more across 6 rooms from one dashboard.',
    color: '#818cf8',
    tag: '6 Rooms',
  },
  {
    icon: '📡',
    title: 'MQTT Protocol',
    desc: 'Industry-standard IoT messaging. Every gesture publishes to an MQTT broker for real hardware control.',
    color: '#f59e0b',
    tag: 'IoT Ready',
  },
  {
    icon: '🔒',
    title: 'Security System',
    desc: 'Arm, disarm, lock doors, and view camera feeds. Security modes: Home, Away, Night, Disarmed.',
    color: '#ef4444',
    tag: 'Smart Lock + Alarm',
  },
  {
    icon: '⚡',
    title: 'Energy Monitor',
    desc: 'Live wattage tracking per device. See daily cost estimates and usage breakdowns in real time.',
    color: '#22c55e',
    tag: 'Live Usage',
  },
  {
    icon: '⚙️',
    title: 'Automations',
    desc: 'Scheduled rules, geofence triggers, and scene presets. Set it once, let your home run itself.',
    color: '#c084fc',
    tag: 'Smart Rules',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '📷',
    title: 'Camera Detects Hand',
    desc: 'Your webcam captures your hand in real time. MediaPipe assigns 21 landmark coordinates per frame.',
    color: '#2dd4bf',
  },
  {
    step: '02',
    icon: '🧠',
    title: 'AI Recognises Gesture',
    desc: 'A lightweight TFLite neural network classifies the gesture with 90%+ accuracy at 20+ FPS.',
    color: '#818cf8',
  },
  {
    step: '03',
    icon: '📡',
    title: 'Command Sent via MQTT',
    desc: 'The gesture maps to a device command published over MQTT to control your real smart home hardware.',
    color: '#f59e0b',
  },
  {
    step: '04',
    icon: '🏠',
    title: 'Home Responds Instantly',
    desc: 'Lights turn on, AC adjusts, doors lock — all without touching a single switch or saying a word.',
    color: '#22c55e',
  },
]

const GESTURES = [
  { sign: 'Hello (Wave)', action: 'All Lights ON',       icon: '💡', color: '#fbbf24' },
  { sign: 'S',            action: 'Sleep / Away Mode',   icon: '🌙', color: '#6366f1' },
  { sign: 'K',            action: 'Cozy Night Scene',    icon: '🕯️', color: '#c084fc' },
  { sign: 'L',            action: 'Living Room Light',   icon: '🏠', color: '#2dd4bf' },
  { sign: 'D',            action: 'Lock Front Door',     icon: '🔒', color: '#f59e0b' },
  { sign: 'V',            action: 'Toggle Smart TV',     icon: '📺', color: '#818cf8' },
  { sign: 'B',            action: 'Ceiling Fan',         icon: '🌀', color: '#38bdf8' },
  { sign: 'Y',            action: 'Bedroom AC',          icon: '❄️', color: '#60a5fa' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const statsRef = useRef(null)
  const [statsVisible, setStatsVisible] = useState(false)
  const [currentHand, setCurrentHand] = useState(0)
  const hands = ['wave', 'peace', 'lock']

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsVisible(true)
    }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHand(h => (h + 1) % hands.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="lp-root">
      <Particles />

      {/* ── NAVBAR ── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <span className="lp-logo-icon">🏠</span>
            <span className="lp-logo-text">GestureHome</span>
          </div>
          <div className="lp-nav-links">
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#how" className="lp-nav-link">How It Works</a>
            <a href="#gestures" className="lp-nav-link">Gestures</a>
          </div>
          <div className="lp-nav-ctas">
            <button className="lp-btn-ghost" onClick={() => navigate('/auth')}>Sign In</button>
            <button className="lp-btn-primary" onClick={() => navigate('/auth?mode=signup')}>Get Started →</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-bg-blob lp-blob-1" />
        <div className="lp-hero-bg-blob lp-blob-2" />
        <div className="lp-hero-bg-blob lp-blob-3" />

        <div className="lp-hero-content">
          <div className="lp-hero-badge">
            <span className="lp-badge-dot" />
            AI-Powered · Real-Time · Accessible
          </div>

          <h1 className="lp-hero-title">
            Control Your Home<br />
            <span className="lp-gradient-text">With a Gesture</span>
          </h1>

          <p className="lp-hero-sub">
            A sign language-powered smart home system. Show your hand — MediaPipe AI recognises 
            the gesture and controls 22 devices across 6 rooms in real time via MQTT.
            Built for accessibility. Designed for everyone.
          </p>

          <div className="lp-hero-ctas">
            <button className="lp-hero-btn-primary" onClick={() => navigate('/auth?mode=signup')}>
              <span>🚀</span> Launch Dashboard
            </button>
            <a href="#how" className="lp-hero-btn-ghost">
              <span>▶</span> See How It Works
            </a>
          </div>

          <div className="lp-hero-badges">
            <span className="lp-badge-pill">🎯 90%+ Accuracy</span>
            <span className="lp-badge-pill">⚡ 20+ FPS</span>
            <span className="lp-badge-pill">📡 MQTT Ready</span>
            <span className="lp-badge-pill">♿ Accessibility First</span>
          </div>
        </div>

        <div className="lp-hero-visual">
          <div className="lp-hero-glow" />
          <div className="lp-hero-phone">
            <div className="lp-phone-screen">
              <div className="lp-phone-header">
                <div className="lp-phone-dot red" />
                <div className="lp-phone-dot yellow" />
                <div className="lp-phone-dot green" />
                <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: '#6b7280' }}>GestureHome · Dashboard</span>
              </div>
              <div className="lp-phone-dash">
                <div className="lp-phone-greeting">Welcome back, Alex 👋</div>
                <div className="lp-phone-status">
                  <span className="lp-status-live">● LIVE</span>
                  <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>8 devices on</span>
                </div>
                <div className="lp-phone-devices">
                  {[
                    { icon: '💡', name: 'Living Room', on: true,  color: '#fbbf24' },
                    { icon: '❄️', name: 'Bedroom AC',  on: true,  color: '#38bdf8' },
                    { icon: '📺', name: 'Smart TV',    on: false, color: '#818cf8' },
                    { icon: '🔒', name: 'Front Door',  on: true,  color: '#f59e0b' },
                  ].map((d, i) => (
                    <div key={i} className={`lp-phone-device ${d.on ? 'on' : ''}`} style={{ '--dc': d.color }}>
                      <span>{d.icon}</span>
                      <span className="lp-pd-name">{d.name}</span>
                      <div className={`lp-pd-toggle ${d.on ? 'on' : ''}`}>
                        <div className="lp-pd-knob" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="lp-phone-gesture-bar">
                  <span>🤚 Gesture detected: </span>
                  <strong style={{ color: '#2dd4bf' }}>Hello → All Lights ON</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="lp-hero-hand-orbit">
            <GestureHand gesture={hands[currentHand]} active />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="lp-stats-section" ref={statsRef}>
        <div className="lp-section-inner">
          <div className="lp-section-label">By the numbers</div>
          <h2 className="lp-section-title">Built for Scale</h2>
          <StatsSection visible={statsVisible} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-features" id="features">
        <div className="lp-section-inner">
          <div className="lp-section-label">Features</div>
          <h2 className="lp-section-title">Everything You Need</h2>
          <p className="lp-section-sub">A complete smart home automation system — gesture AI, MQTT, energy monitoring, security, and more.</p>
          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="lp-feature-card" style={{ '--fc': f.color, animationDelay: `${i * 0.08}s` }}>
                <div className="lp-fc-glow" />
                <div className="lp-fc-icon">{f.icon}</div>
                <div className="lp-fc-tag">{f.tag}</div>
                <h3 className="lp-fc-title">{f.title}</h3>
                <p className="lp-fc-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-how" id="how">
        <div className="lp-section-inner">
          <div className="lp-section-label">Process</div>
          <h2 className="lp-section-title">How It Works</h2>
          <p className="lp-section-sub">Four simple steps from hand gesture to home response.</p>
          <div className="lp-how-grid">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={i} className="lp-how-card" style={{ '--hc': s.color }}>
                <div className="lp-how-step">{s.step}</div>
                <div className="lp-how-icon">{s.icon}</div>
                <h3 className="lp-how-title">{s.title}</h3>
                <p className="lp-how-desc">{s.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && <div className="lp-how-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GESTURES ── */}
      <section className="lp-gestures" id="gestures">
        <div className="lp-section-inner">
          <div className="lp-section-label">Controls</div>
          <h2 className="lp-section-title">Gesture Reference</h2>
          <p className="lp-section-sub">16 sign language gestures map to home automation commands.</p>
          <div className="lp-gesture-grid">
            {GESTURES.map((g, i) => (
              <div key={i} className="lp-gesture-chip" style={{ '--gc': g.color }}>
                <span className="lp-gc-icon">{g.icon}</span>
                <div>
                  <div className="lp-gc-sign">{g.sign}</div>
                  <div className="lp-gc-action">{g.action}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="lp-gesture-more">+ 8 more gesture commands in the dashboard</p>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="lp-cta-banner">
        <div className="lp-cta-bg-blob" />
        <div className="lp-section-inner lp-cta-inner">
          <h2 className="lp-cta-title">Ready to Control Your Home?</h2>
          <p className="lp-cta-sub">Create your account and access the full smart home dashboard instantly.</p>
          <button className="lp-hero-btn-primary lp-cta-btn" onClick={() => navigate('/auth?mode=signup')}>
            🏠 Get Started Free
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-section-inner lp-footer-inner">
          <div className="lp-logo">
            <span className="lp-logo-icon">🏠</span>
            <span className="lp-logo-text">GestureHome</span>
          </div>
          <p className="lp-footer-copy">Sign Language Smart Home · Built with MediaPipe, TFLite & MQTT · Accessibility First</p>
        </div>
      </footer>
    </div>
  )
}
