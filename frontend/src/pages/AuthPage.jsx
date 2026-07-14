import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI } from '../utils/api'
import './auth.css'

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

export default function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('smarthome_user')
    if (user) navigate('/dashboard', { replace: true })
  }, [navigate])

  const validate = () => {
    const e = {}
    if (mode === 'signup' && !form.name.trim()) e.name = 'Name is required'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email'
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); setShake(true); setTimeout(() => setShake(false), 600); return }
    setErrors({})
    setLoading(true)

    try {
      let data
      if (mode === 'login') {
        data = await authAPI.login(form.email, form.password)
      } else {
        data = await authAPI.register(form.name, form.email, form.password)
      }

      localStorage.setItem('smarthome_user', JSON.stringify({
        name: data.user.name,
        email: data.user.email,
        token: data.token,
        role: data.user.role,
      }))

      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong'
      if (msg.toLowerCase().includes('email') && !msg.toLowerCase().includes('password')) {
        setErrors({ email: msg })
      } else if (msg.toLowerCase().includes('password')) {
        setErrors({ password: msg })
      } else if (msg.toLowerCase().includes('name')) {
        setErrors({ name: msg })
      } else {
        setErrors({ password: msg })
      }
      setShake(true)
      setTimeout(() => setShake(false), 600)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setForm({ name: '', email: '', password: '' })
    setErrors({})
  }

  const fillDemo = () => {
    setForm({ name: 'Alex', email: 'admin@home.com', password: 'admin123' })
    setErrors({})
  }

  return (
    <div className="auth-root">
      {/* ── Particles ── */}
      <div className="auth-particles" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="auth-particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${7 + Math.random() * 9}s`,
          }} />
        ))}
      </div>

      {/* ── Left Branding Panel ── */}
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <button className="auth-back" onClick={() => navigate('/')}>← Back to Home</button>

          <div className="auth-brand">
            <div className="auth-brand-icon">🏠</div>
            <div>
              <div className="auth-brand-name">Smart Home</div>
              <div className="auth-brand-tagline">Sign Language Smart Automation</div>
            </div>
          </div>

          <div className="auth-panel-visual">
            <div className="auth-visual-glow" />
            <div className="auth-hand-anim">
              {['👋', '🤚', '✌️', '👍'].map((e, i) => (
                <div key={i} className="auth-emoji-float" style={{ animationDelay: `${i * 0.6}s`, '--dx': `${[-30,-15,10,28][i]}px`, '--dy': `${[-40,-10,-25,5][i]}px` }}>{e}</div>
              ))}
              <div className="auth-hand-center">🤲</div>
            </div>
          </div>

          <div className="auth-panel-features">
            {[
              { icon: '🤚', text: '16 Gesture Commands' },
              { icon: '💡', text: '22 Smart Devices' },
              { icon: '⚡', text: 'Real-Time AI, 20+ FPS' },
              { icon: '🔒', text: 'MQTT + Security System' },
            ].map((f, i) => (
              <div key={i} className="auth-pf-item">
                <span className="auth-pf-icon">{f.icon}</span>
                <span className="auth-pf-text">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-form-panel">
        <div className={`auth-card ${shake ? 'shake' : ''}`}>
          {/* Mode toggle */}
          <div className="auth-mode-toggle">
            <button className={`auth-mode-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => mode !== 'login' && switchMode()}>
              Sign In
            </button>
            <button className={`auth-mode-btn ${mode === 'signup' ? 'active' : ''}`} onClick={() => mode !== 'signup' && switchMode()}>
              Sign Up
            </button>
          </div>

          <div className="auth-card-header">
            <h1 className="auth-title">
              {mode === 'login' ? 'Welcome back 👋' : 'Create account 🚀'}
            </h1>
            <p className="auth-subtitle">
              {mode === 'login'
                ? 'Sign in to your smart home dashboard'
                : 'Set up your Smart Home account'}
            </p>
          </div>

          {/* Demo credentials hint */}
          {mode === 'login' && (
            <div className="auth-demo-hint">
              <span>🎯 Demo account:</span>
              <button className="auth-demo-fill" onClick={fillDemo}>admin@home.com / admin123</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Name field (signup only) */}
            <div className={`auth-field-wrap ${mode === 'signup' ? 'visible' : 'hidden'}`}>
              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-name">Full Name</label>
                <div className={`auth-input-wrap ${errors.name ? 'error' : ''}`}>
                  <span className="auth-input-icon">👤</span>
                  <input
                    id="auth-name"
                    className="auth-input"
                    type="text"
                    placeholder="Alex Johnson"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    autoComplete="name"
                  />
                </div>
                {errors.name && <div className="auth-error">{errors.name}</div>}
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-email">Email Address</label>
              <div className={`auth-input-wrap ${errors.email ? 'error' : ''}`}>
                <span className="auth-input-icon">✉️</span>
                <input
                  id="auth-email"
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                />
              </div>
              {errors.email && <div className="auth-error">{errors.email}</div>}
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-password">Password</label>
              <div className={`auth-input-wrap ${errors.password ? 'error' : ''}`}>
                <span className="auth-input-icon">🔑</span>
                <input
                  id="auth-password"
                  className="auth-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder={mode === 'login' ? '••••••••' : 'Min 6 characters'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button type="button" className="auth-eye" onClick={() => setShowPass(s => !s)} aria-label="Toggle password">
                  <EyeIcon open={showPass} />
                </button>
              </div>
              {errors.password && <div className="auth-error">{errors.password}</div>}
            </div>

            <button className={`auth-submit ${loading ? 'loading' : ''}`} type="submit" id="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  <span>{mode === 'login' ? '🚀 Sign In' : '✨ Create Account'}</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            {' '}
            <button className="auth-switch-btn" onClick={switchMode}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
