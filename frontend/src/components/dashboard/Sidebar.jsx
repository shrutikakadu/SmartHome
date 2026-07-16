import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  LayoutDashboard, Bot, Hand, BarChart3, Mic, Home,
  Smartphone, Zap, Film, History, Bell, User, Settings,
  Crown, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
  { to: '/detection', icon: Hand, label: 'Detection' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/voice-speech', icon: Mic, label: 'Voice Control' },
  { to: '/smart-home', icon: Home, label: 'Rooms' },
  { to: '/devices', icon: Smartphone, label: 'Devices' },
  { divider: true },
  { to: '/emergency', icon: Zap, label: 'Automation' },
  { to: '/ai-training', icon: Film, label: 'Scenes' },
  { to: '/gesture-history', icon: History, label: 'History' },
  { divider: true },
  { to: '/notifications', icon: Bell, label: 'Notifications', badge: 3 },
]

const BOTTOM_ITEMS = [
  { icon: User, label: 'Profile' },
  { icon: Settings, label: 'Settings' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const user = JSON.parse(localStorage.getItem('smarthome_user') || '{}')
  const userName = user.name || 'Himanshu'

  return (
    <motion.aside
      className="fixed left-0 top-0 h-full z-50 flex flex-col"
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
      style={{
        background: 'rgba(7,11,24,0.95)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-[72px] border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
          AI
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-[15px] font-semibold tracking-tight text-white">SmartHome</div>
            <div className="text-[10px] font-medium tracking-widest uppercase" style={{ color: '#6366F1' }}>
              Intelligent Living
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {NAV_ITEMS.map((item, i) => {
          if (item.divider) {
            return (
              <div key={i} className="px-3 pt-5 pb-2">
                {!collapsed && (
                  <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/30">
                    {item.label || '—'}
                  </span>
                )}
              </div>
            )
          }
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200 relative ${
                  isActive
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{ background: 'linear-gradient(180deg, #6366F1, #8B5CF6)' }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon size={19} strokeWidth={isActive ? 2 : 1.5} />
                  {!collapsed && (
                    <span className="text-[13px] font-medium truncate">{item.label}</span>
                  )}
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: '#EF4444' }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Premium Upgrade Card */}
      {!collapsed && (
        <motion.div
          className="mx-3 mb-3 p-3.5 rounded-2xl relative overflow-hidden cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent)' }} />
          <Crown size={18} className="mb-2" style={{ color: '#F59E0B' }} />
          <div className="text-[12px] font-semibold text-white mb-0.5">Upgrade to Pro</div>
          <div className="text-[11px] text-white/50">Unlock AI features</div>
        </motion.div>
      )}

      {/* User Card */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6366F1, #22C55E)' }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-white truncate">{userName}</div>
              <div className="text-[10px] text-white/40">Premium User</div>
            </div>
          )}
          {!collapsed && (
            <div className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', color: '#000' }}>
              PRO
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[82px] w-6 h-6 rounded-full flex items-center justify-center bg-white/10 border border-white/10 text-white/50 hover:text-white hover:bg-white/20 transition-all z-50"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
}
