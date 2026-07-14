import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { emergencyAPI } from '../utils/api'
import './emergency.css'

export default function EmergencyPage() {
  const [triggered, setTriggered] = useState(false)
  const [sent, setSent] = useState({ sms: false, call: false, location: false })
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    emergencyAPI.getContacts()
      .then(data => {
        setContacts(data.contacts || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const trigger = async () => {
    setTriggered(true)
    try {
      await emergencyAPI.trigger('sos', 'Emergency SOS activated')
    } catch {
      /* silently fail */
    }
  }

  const action = async (key, label) => {
    setSent(s => ({ ...s, [key]: true }))
    try {
      await emergencyAPI.trigger(key, `${label} sent to emergency contacts`)
    } catch {
      /* silently fail */
    }
  }

  if (loading) {
    return (
      <Layout title="Emergency Alert">
        <div className="anim-fade-up" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: '1.2rem', color: 'var(--text2)' }}>Loading emergency data...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Emergency Alert">
      <div className="anim-fade-up">
        <div className="page-header" style={{ marginBottom: 18 }}>
          <h1>🚨 Emergency Alert</h1>
          <p>We are here to help you</p>
        </div>

        <div className="emer-layout">
          {/* SOS Panel */}
          <div className="card emer-main-card">
            <div className={`emer-sos-btn${triggered ? ' triggered' : ''}`} onClick={trigger}>
              <span>SOS</span>
            </div>

            {triggered && (
              <div className="emer-alert-banner">
                <span>⚠️</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--red)' }}>Emergency gesture detected!</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text2)', marginTop: 2 }}>Alert sent to your emergency contacts.</div>
                </div>
              </div>
            )}

            <div className="emer-actions">
              <button
                className={`emer-action-btn${sent.sms ? ' done' : ''}`}
                onClick={() => action('sms', 'SMS')}
              >
                <span>📱</span>
                <span>{sent.sms ? '✓ Sent' : 'Send SMS'}</span>
              </button>
              <button
                className={`emer-action-btn${sent.call ? ' done' : ''}`}
                onClick={() => action('call', 'Call')}
              >
                <span>📞</span>
                <span>{sent.call ? '✓ Calling...' : 'Call Contact'}</span>
              </button>
              <button
                className={`emer-action-btn${sent.location ? ' done' : ''}`}
                onClick={() => action('location', 'Location')}
              >
                <span>📍</span>
                <span>{sent.location ? '✓ Shared' : 'Share Location'}</span>
              </button>
            </div>

            {triggered && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
                onClick={() => { setTriggered(false); setSent({ sms: false, call: false, location: false }) }}
              >
                Cancel Alert
              </button>
            )}
          </div>

          {/* Info panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>📞 Emergency Contacts</div>
              {contacts.map(c => (
                <div key={c.id} className="emer-contact">
                  <div className="emer-contact-avatar">{c.name[0]}</div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{c.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text3)' }}>{c.phone} · {c.relation}</div>
                  </div>
                </div>
              ))}
              {contacts.length === 0 && (
                <div style={{ padding: 10, textAlign: 'center', color: 'var(--text3)', fontSize: '0.8rem' }}>No contacts added</div>
              )}
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>ℹ️ Emergency Gestures</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { g: '🆘', label: 'SOS', desc: 'Triggers emergency alert' },
                  { g: '📞', label: 'Phone', desc: 'Calls primary contact' },
                  { g: '🤚', label: 'Stop', desc: 'Cancels alert' },
                ].map(e => (
                  <div key={e.label} className="emer-gesture-row">
                    <span style={{ fontSize: '1.3rem' }}>{e.g}</span>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{e.label}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text3)' }}>{e.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
