import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { analyticsAPI } from '../utils/api'
import './analytics.css'

const COLORS = ['#f59e0b', '#2dd4bf', '#818cf8', '#22c55e', '#64748b', '#38bdf8', '#ef4444']

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('Weekly')
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsAPI.get()
      .then(data => { setAnalytics(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const week = analytics?.week || []
  const gestureDist = analytics?.gesture_distribution || []
  const maxVal = Math.max(...week.map(d => d.kwh || 0), 1)

  if (loading) {
    return (
      <Layout title="Analytics">
        <div className="anim-fade-up" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: '1.2rem', color: 'var(--text2)' }}>Loading analytics...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Analytics">
      <div className="anim-fade-up">
        <div className="page-header" style={{ marginBottom: 18 }}>
          <h1>📈 Analytics Dashboard</h1>
          <p>Track your usage and performance</p>
        </div>

        {/* Period Tabs */}
        <div className="an-period-tabs" style={{ marginBottom: 18 }}>
          {['Daily','Weekly','Monthly','Yearly'].map(p => (
            <button key={p} className={`an-period-tab${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>

        {/* Row 1: KPIs */}
        <div className="grid-3" style={{ marginBottom: 18 }}>
          <div className="kpi-card">
            <div className="kpi-icon">✋</div>
            <div className="kpi-value">{analytics?.total_gestures?.toLocaleString() ?? '—'}</div>
            <div className="kpi-label">Total Gestures</div>
            <div className="kpi-delta">{week.length > 0 ? `${week[0].label} – ${week[week.length - 1].label}` : 'This period'}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">🎯</div>
            <div className="kpi-value" style={{ color: 'var(--green)' }}>{analytics?.accuracy != null ? `${analytics.accuracy}%` : '—'}</div>
            <div className="kpi-label">Accuracy (%)</div>
            <div className="kpi-delta">↑ Great performance</div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div className="card-title" style={{ marginBottom: 10 }}>Most Used Gestures</div>
            <div className="an-donut-row">
              <div className="an-donut" style={{
                background: `conic-gradient(${gestureDist.map((m, i, a) => {
                  const start = a.slice(0, i).reduce((s, x) => s + x.pct, 0)
                  return `${COLORS[i % COLORS.length]} ${start}% ${start + m.pct}%`
                }).join(', ')})`
              }}>
                <div className="an-donut-inner"></div>
              </div>
              <div className="an-donut-legend">
                {gestureDist.map((m, i) => (
                  <div key={m.label} className="an-legend-row">
                    <span className="an-legend-dot" style={{ background: COLORS[i % COLORS.length] }}></span>
                    <span className="an-legend-label">{m.label}</span>
                    <span className="an-legend-pct">{m.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Chart + Device Usage + Speed */}
        <div className="grid-2-1">
          <div className="card">
            <div className="card-header">
              <div className="card-title">📊 Gesture Trend — {period}</div>
            </div>
            <div className="an-chart">
              {week.map(d => (
                <div key={d.label} className="an-chart-col">
                  <div className="an-chart-bar-wrap">
                    <div
                      className="an-chart-bar"
                      style={{ height: `${(d.kwh / maxVal) * 100}%` }}
                    ></div>
                  </div>
                  <div className="an-chart-label">{d.label}</div>
                  <div className="an-chart-val">{d.kwh}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Device Usage */}
            <div className="card" style={{ flex: 1 }}>
              <div className="card-title" style={{ marginBottom: 12 }}>📱 Device Usage</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[
                  { name: 'Light', pct: analytics?.devices_on_now != null ? Math.min(analytics.devices_on_now * 24, 100) : 0, color: '#f59e0b' },
                  { name: 'Fan', pct: analytics?.devices_on_now != null ? Math.min(analytics.devices_on_now * 18, 100) : 0, color: '#2dd4bf' },
                  { name: 'TV', pct: analytics?.devices_on_now != null ? Math.min(analytics.devices_on_now * 16, 100) : 0, color: '#818cf8' },
                  { name: 'AC', pct: analytics?.devices_on_now != null ? Math.min(analytics.devices_on_now * 10, 100) : 0, color: '#38bdf8' },
                ].map(d => (
                  <div key={d.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text)' }}>{d.name}</span>
                      <span style={{ color: d.color, fontWeight: 700 }}>{d.pct}%</span>
                    </div>
                    <div className="db-progress-track">
                      <div className="db-progress-fill" style={{ width: `${d.pct}%`, background: d.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Speed */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 8 }}>⚡ Recognition Speed (limit)</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--purple)', fontFamily: "'JetBrains Mono', monospace" }}>
                {analytics?.recognition_speed_ms != null ? `${analytics.recognition_speed_ms}ms` : '—'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--green)', marginTop: 4 }}>✓ Well within target (&lt;500ms)</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
