import { motion } from 'motion/react'
import { Search, Moon, Sun, Bell, Settings, Menu } from 'lucide-react'
import { useState } from 'react'

export default function TopBar({ onMenuToggle }) {
  const [darkMode, setDarkMode] = useState(true)
  const user = JSON.parse(localStorage.getItem('smarthome_user') || '{}')
  const userName = user.name || 'Himanshu'

  return (
    <header className="flex items-center justify-between h-[72px] px-6 border-b border-white/[0.06]"
      style={{ background: 'rgba(7,11,24,0.8)', backdropFilter: 'blur(20px)' }}>
      {/* Left: Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <Menu size={20} />
        </button>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search devices, rooms..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-[13px] placeholder:text-white/25 focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 border border-white/10 rounded px-1.5 py-0.5 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 ml-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          {darkMode ? <Moon size={17} /> : <Sun size={17} />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#EF4444' }} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          <Settings size={17} />
        </motion.button>

        <div className="w-px h-6 bg-white/[0.08] mx-2" />

        <div className="flex items-center gap-2.5 cursor-pointer hover:bg-white/[0.04] rounded-xl px-2 py-1.5 transition-all">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6366F1, #22C55E)' }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-[13px] font-medium text-white/80 hidden sm:block">{userName}</span>
        </div>
      </div>
    </header>
  )
}
