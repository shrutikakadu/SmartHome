import { NavLink, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { divider: true, label: 'MAIN' },
  { to: '/dashboard',       icon: '📊', label: 'Dashboard' },
  { to: '/smart-home',      icon: '🏡', label: 'Smart Home' },
  { to: '/detection',       icon: '🤖', label: 'Detection' },
  { divider: true, label: 'TOOLS' },
  { to: '/gesture-history', icon: '📋', label: 'Gesture History' },
  { to: '/analytics',       icon: '📈', label: 'Analytics' },
  { to: '/ai-assistant',    icon: '💬', label: 'AI Assistant' },
  { to: '/voice-speech',    icon: '🎙️', label: 'Voice & Speech' },
  { to: '/ecosystem',       icon: '🔌', label: 'Universal Hub' },
  { divider: true, label: 'SYSTEM' },
  { to: '/devices',         icon: '🔌', label: 'Devices' },
  { to: '/emergency',       icon: '🚨', label: 'Emergency', badge: '!' },
  { to: '/ai-training',     icon: '🧠', label: 'AI Training' },
]

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('smarthome_user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('smarthome_user')
    navigate('/auth')
  }

  const handleNavClick = () => {
    if (onClose) onClose()
  }

  return (
    <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">✋</div>
        <div className="sidebar-logo-text">Smart <span>Home</span></div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item, i) => {
          if (item.divider) {
            return <div key={i} className="sidebar-section-label">{item.label}</div>
          }
          // Hide Universal Hub for standard users
          if (item.to === '/ecosystem' && user.role !== 'admin') {
            return null
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={handleNavClick}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="nav-item-badge">{item.badge}</span>}
            </NavLink>
          )
        })}
      </nav>


    </aside>
  )
}
