import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { gestureAPI } from '../utils/api'
import './gestureHistory.css'

export default function GestureHistoryPage() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('time')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    gestureAPI.history()
      .then(data => {
        setHistory(data.history || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = history.filter(h =>
    (h.gesture || '').toLowerCase().includes(search.toLowerCase()) ||
    (h.action || '').toLowerCase().includes(search.toLowerCase()) ||
    (h.device_id || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <Layout title="Gesture History">
        <div className="anim-fade-up" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: '1.2rem', color: 'var(--text2)' }}>Loading gesture history...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Gesture History">
      <div className="anim-fade-up">
        <div className="page-header" style={{ marginBottom: 18 }}>
          <h1>📋 Gesture History</h1>
          <p>View all recognized gestures</p>
        </div>

        {/* Controls */}
        <div className="gh-controls">
          <div className="topbar-search" style={{ maxWidth: 280 }}>
            <span className="topbar-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search gestures..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-ghost btn-sm">⬇ Export CSV</button>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="gh-table-wrap">
            <table className="gh-table">
              <thead>
                <tr>
                  <th>Gesture</th>
                  <th>Action</th>
                  <th>Meaning</th>
                  <th>Device</th>
                  <th>Confidence</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="gh-table-row">
                    <td><span className="gh-gest-icon">{row.gesture}</span></td>
                    <td><span className="gh-sign">{row.action}</span></td>
                    <td><span className="gh-meaning">{row.gesture}</span></td>
                    <td><span className="gh-device">{row.device_id || '—'}</span></td>
                    <td>
                      <div className="gh-conf-wrap">
                        <span className="gh-conf-val">{row.conf != null ? row.conf.toFixed(2) : '—'}%</span>
                        <div className="gh-conf-bar">
                          <div style={{ width: `${row.conf || 0}%`, background: (row.conf || 0) > 97 ? 'var(--green)' : (row.conf || 0) > 94 ? 'var(--amber)' : 'var(--red)' }}></div>
                        </div>
                      </div>
                    </td>
                    <td><span className="gh-time">{row.time}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
