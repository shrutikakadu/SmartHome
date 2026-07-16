import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Layout from '../components/Layout'
import ChatBot from '../components/ChatBot'
import EnergyChart from '../components/EnergyChart'
import { healthAPI, analyticsAPI, notificationsAPI, devicesAPI, gestureAPI } from '../utils/api'
import './dashboard.css'

const QUICK_ACTIONS = [
  { icon: '💡', label: 'Light ON',    gesture: 'light_on',  device_id: 'light_living', action: 'turn_on' },
  { icon: '📵', label: 'Fan OFF',     gesture: 'fan_off',   device_id: 'fan_bedroom',  action: 'turn_off' },
  { icon: '📺', label: 'TV ON',       gesture: 'tv_on',     device_id: 'tv_living',    action: 'turn_on' },
  { icon: '❄️', label: 'AC ON',       gesture: 'ac_on',     device_id: 'ac_bedroom',   action: 'turn_on' },
  { icon: '🔒', label: 'Door Lock',   gesture: 'door_lock', device_id: 'door_main',    action: 'lock' },
  { icon: '🪟', label: 'Curtains Open', gesture: 'curtains_open', device_id: 'curtains_living', action: 'open' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }
  })
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.07, type: 'spring', stiffness: 260, damping: 20 }
  })
}

const slideLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }
  }
}

const slideRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }
  }
}

function AnimatedNumber({ value, duration = 1.2 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const num = typeof value === 'number' ? value : parseFloat(value) || 0
    if (num === 0) { setDisplay(0); return }

    let start = 0
    const startTime = performance.now()
    const step = (now) => {
      const elapsed = (now - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * num))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value, duration])

  return <>{display.toLocaleString()}</>
}

export default function DashboardPage() {
  const [activeAction, setActiveAction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('User')
  const [kpis, setKpis] = useState({
    gestures: 0, devices: 0, accuracy: 0, actions: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [aiAccuracy, setAiAccuracy] = useState(0)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('smarthome_user') || '{}')
    if (user.name) setUserName(user.name)

    fetchDashboard()

    const interval = setInterval(fetchDashboard, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchDashboard() {
    try {
      const [health, analytics, notifData] = await Promise.all([
        healthAPI.check(),
        analyticsAPI.get(),
        notificationsAPI.getAll(),
      ])

      setKpis({
        gestures: analytics.total_gestures || 0,
        devices: health.devices_on || 0,
        accuracy: analytics.accuracy || 0,
        actions: (notifData.notifications || []).length,
      })

      setAiAccuracy(analytics.accuracy || 0)

      const mapped = (notifData.notifications || []).map(n => ({
        icon: n.icon || '📋',
        action: n.title,
        room: n.type || 'System',
        time: new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }))
      setRecentActivity(mapped)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action) => {
    setActiveAction(action.gesture)
    try {
      await gestureAPI.send(action.gesture, action.action, action.device_id, 1.0)
    } catch (err) {
      console.error('Gesture send error:', err)
    }
    setTimeout(() => setActiveAction(null), 1500)
  }

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <motion.div
            style={{ textAlign: 'center' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <motion.div
              style={{ fontSize: '2rem', marginBottom: 12 }}
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              ⏳
            </motion.div>
            <div style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>Loading dashboard...</div>
          </motion.div>
        </div>
      </Layout>
    )
  }

  const KPI_DATA = [
    { icon: '✋', value: kpis.gestures, label: 'Total Gestures', delta: '↑ +42 in last week' },
    { icon: '🔌', value: kpis.devices, label: 'Active Devices', delta: '↑ +2 from yesterday' },
    { icon: '🎯', value: kpis.accuracy, label: 'Recognition Accuracy', delta: '↑ +2.1% this week', suffix: '%' },
    { icon: '⚡', value: kpis.actions, label: "Today's Actions", delta: '↑ +4 vs yesterday' },
  ]

  return (
    <Layout title="Dashboard">
      {/* Page Header */}
      <motion.div className="db-welcome" variants={fadeUp} initial="hidden" animate="visible">
        <h1>Welcome back, {userName} 👋</h1>
        <p>Here's what's happening in your smart home today.</p>
      </motion.div>

      {/* KPI Strip */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {KPI_DATA.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            className="kpi-card"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            custom={i}
            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}
          >
            <div className="kpi-icon">{kpi.icon}</div>
            <div className="kpi-value">
              <AnimatedNumber value={kpi.value} />{kpi.suffix || ''}
            </div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-delta">{kpi.delta}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        className="card"
        style={{ marginBottom: 20 }}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0.4}
      >
        <div className="card-header">
          <div>
            <div className="card-title">⚡ Quick Actions</div>
          </div>
        </div>
        <div className="db-quick-actions">
          {QUICK_ACTIONS.map((a, i) => (
            <motion.button
              key={a.gesture}
              className={`db-qa-btn${activeAction === a.gesture ? ' active' : ''}`}
              onClick={() => handleAction(a)}
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              custom={i + 0.3}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeAction === a.gesture ? 'active' : 'idle'}
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0.5, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  {a.icon}
                </motion.span>
              </AnimatePresence>
              <span>{a.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Energy Consumption */}
      <EnergyChart />

      {/* Two col: Recent Activity + AI Status */}
      <div className="grid-2-1">
        {/* Recent Activity */}
        <motion.div className="card" variants={slideLeft} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <div className="card-header">
            <div>
              <div className="card-title">🕒 Recent Activity</div>
            </div>
            <motion.span
              className="badge badge-purple"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              Live
            </motion.span>
          </div>
          <div className="db-activity-list">
            {recentActivity.length > 0 ? recentActivity.map((item, i) => (
              <motion.div
                key={i}
                className="db-activity-row"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06, duration: 0.35 }}
              >
                <div className="db-activity-icon">{item.icon}</div>
                <div className="db-activity-info">
                  <span className="db-activity-action">{item.action}</span>
                  <span className="db-activity-room">{item.room}</span>
                </div>
                <div className="db-activity-time">{item.time}</div>
              </motion.div>
            )) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: '0.85rem' }}>
                No recent activity
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Status */}
        <motion.div className="card" variants={slideRight} initial="hidden" animate="visible" transition={{ delay: 0.35 }}>
          <div className="card-header">
            <div>
              <div className="card-title">🤖 AI Status</div>
            </div>
            <button style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '1rem' }}>?</button>
          </div>
          <div className="db-ai-status">
            <div className="db-ai-row">
              <span className="db-ai-label">Model</span>
              <span className="db-ai-val">SL-v2.1</span>
            </div>
            <div className="db-ai-row">
              <span className="db-ai-label">Status</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <motion.span
                  className="live-dot"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                />
                <span style={{ color: 'var(--green)', fontSize: '0.78rem', fontWeight: 600 }}>Active</span>
              </span>
            </div>
            <div className="db-ai-row">
              <span className="db-ai-label">Accuracy</span>
              <span className="db-ai-val">{aiAccuracy}%</span>
            </div>
            <div className="db-ai-row">
              <span className="db-ai-label">Response Time</span>
              <span className="db-ai-val">0.4s</span>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text2)', marginBottom: 5 }}>
                <span>Accuracy</span><span style={{ color: 'var(--green)' }}>{aiAccuracy}%</span>
              </div>
              <div className="db-progress-track">
                <motion.div
                  className="db-progress-fill"
                  style={{ background: 'var(--green)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${aiAccuracy}%` }}
                  transition={{ delay: 0.6, duration: 1.2, ease: [0.25, 0.8, 0.25, 1] }}
                />
              </div>
            </div>

            <motion.button
              className="btn btn-primary btn-sm"
              style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              🔄 Retrain Model
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Floating AI Chatbot */}
      <ChatBot />
    </Layout>
  )
}
