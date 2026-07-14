import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
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
        <div className="anim-fade-up" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
            <div style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>Loading dashboard...</div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Dashboard">
      <div className="anim-fade-up">
        {/* Page Header */}
        <div className="db-welcome">
          <h1>Welcome back, {userName} 👋</h1>
          <p>Here's what's happening in your smart home today.</p>
        </div>

        {/* KPI Strip */}
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="kpi-card">
            <div className="kpi-icon">✋</div>
            <div className="kpi-value">{kpis.gestures.toLocaleString()}</div>
            <div className="kpi-label">Total Gestures</div>
            <div className="kpi-delta">↑ +42 in last week</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">🔌</div>
            <div className="kpi-value">{kpis.devices}</div>
            <div className="kpi-label">Active Devices</div>
            <div className="kpi-delta">↑ +2 from yesterday</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">🎯</div>
            <div className="kpi-value">{kpis.accuracy}%</div>
            <div className="kpi-label">Recognition Accuracy</div>
            <div className="kpi-delta">↑ +2.1% this week</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">⚡</div>
            <div className="kpi-value">{kpis.actions}</div>
            <div className="kpi-label">Today's Actions</div>
            <div className="kpi-delta">↑ +4 vs yesterday</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div>
              <div className="card-title">⚡ Quick Actions</div>
            </div>
          </div>
          <div className="db-quick-actions">
            {QUICK_ACTIONS.map(a => (
              <button
                key={a.gesture}
                className={`db-qa-btn${activeAction === a.gesture ? ' active' : ''}`}
                onClick={() => handleAction(a)}
              >
                <span>{a.icon}</span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Two col: Recent Activity + AI Status */}
        <div className="grid-2-1">
          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">🕒 Recent Activity</div>
              </div>
              <span className="badge badge-purple">Live</span>
            </div>
            <div className="db-activity-list">
              {recentActivity.length > 0 ? recentActivity.map((item, i) => (
                <div key={i} className="db-activity-row">
                  <div className="db-activity-icon">{item.icon}</div>
                  <div className="db-activity-info">
                    <span className="db-activity-action">{item.action}</span>
                    <span className="db-activity-room">{item.room}</span>
                  </div>
                  <div className="db-activity-time">{item.time}</div>
                </div>
              )) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: '0.85rem' }}>
                  No recent activity
                </div>
              )}
            </div>
          </div>

          {/* AI Status */}
          <div className="card">
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
                  <span className="live-dot"></span>
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
                  <div className="db-progress-fill" style={{ width: `${aiAccuracy}%`, background: 'var(--green)' }}></div>
                </div>
              </div>

              <button className="btn btn-primary btn-sm" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}>
                🔄 Retrain Model
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
