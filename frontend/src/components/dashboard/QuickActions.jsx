import { motion } from 'motion/react'
import { Plus, Mic, AlertTriangle, Zap, Clapperboard } from 'lucide-react'

const ACTIONS = [
  { icon: Plus, label: 'Add Device', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  { icon: Mic, label: 'Voice Command', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  { icon: AlertTriangle, label: 'Emergency', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  { icon: Zap, label: 'Automation', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  { icon: Clapperboard, label: 'Scenes', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
]

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Zap size={15} className="text-white/30" />
        <span className="text-[12px] font-semibold tracking-wider uppercase text-white/30">Quick Actions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((action, i) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.06 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background: action.bg }}>
                <Icon size={14} style={{ color: action.color }} />
              </div>
              <span className="text-[12px] font-medium text-white/60 group-hover:text-white/90 transition-colors">
                {action.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
