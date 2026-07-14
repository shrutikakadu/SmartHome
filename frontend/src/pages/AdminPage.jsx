import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { adminAPI } from '../utils/api'
import './admin.css'

const ROLE_COLORS = { Admin: '#6366f1', User: '#22c55e', Researcher: '#f59e0b' }

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminAPI.stats(), adminAPI.logs()])
      .then(([s, l]) => {
        setStats(s)
        setLogs(l.logs || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const roleDist = stats?.role_distribution || []

  if (loading) {
    return (
      <Layout title="Admin Panel">
        <div className="anim-fade-up" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: '1.2rem', color: 'var(--text2)' }}>Loading admin data...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Admin Panel">
      <div className="anim-fade-up">
        <div className="page-header" style={{ marginBottom: 18 }}>
          <h1>⚙️ Admin Dashboard</h1>
          <p>System overview and management</p>
        </div>

        {/* KPIs */}
        <div className="grid-4" style={{ marginBottom: 18 }}>
          <div className="kpi-card">
            <div className="kpi-icon">👥</div>
            <div className="kpi-value">{stats?.total_users?.toLocaleString() ?? '—'}</div>
            <div className="kpi-label">Total Users</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">🔌</div>
            <div className="kpi-value">{stats?.total_devices ?? '—'}</div>
            <div className="kpi-label">Total Devices</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">✋</div>
            <div className="kpi-value">{stats?.total_gestures?.toLocaleString() ?? '—'}</div>
            <div className="kpi-label">Total Gestures</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">🟢</div>
            <div className="kpi-value" style={{ color: 'var(--green)' }}>{stats?.active_today ?? '—'}</div>
            <div className="kpi-label">Active Today</div>
          </div>
        </div>

        <div className="grid-2-1">
          {/* System Logs */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">📋 System Logs</div>
              <button className="btn btn-ghost btn-sm">⬇ Export</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {logs.map((log) => (
                <div key={log.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: 8, background: 'var(--surface2)',
                  border: '1px solid var(--border)', marginBottom: 2
                }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text)' }}>{log.message}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text3)', fontFamily: 'monospace' }}>{log.time}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: '0.8rem' }}>No logs available</div>
              )}
            </div>
          </div>

          {/* User Role Distribution */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>👥 User Role Distribution</div>
            <div className="admin-donut-row">
              <div className="an-donut" style={{
                background: `conic-gradient(${roleDist.map((r, i, a) => {
                  const start = a.slice(0, i).reduce((s, x) => s + x.pct, 0)
                  return `${ROLE_COLORS[r.role] || '#64748b'} ${start}% ${start + r.pct}%`
                }).join(', ')})`
              }}>
                <div className="an-donut-inner" style={{ width: 55, height: 55 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text)' }}>{stats?.total_users || 0}</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              {roleDist.map(r => (
                <div key={r.role} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: ROLE_COLORS[r.role] || '#64748b', flexShrink: 0 }}></div>
                  <span style={{ flex: 1, color: 'var(--text2)' }}>{r.role}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{r.count}</span>
                  <span style={{ color: 'var(--text3)', width: 36, textAlign: 'right' }}>{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
