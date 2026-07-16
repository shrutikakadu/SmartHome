import { motion } from 'motion/react'
import { Bell, Camera, Lock, Zap, X, Check } from 'lucide-react'

const NOTIFICATIONS = [
  { icon: Camera, title: 'Motion Detected', desc: 'Motion detected in Garage area', time: '2 min ago', color: '#F59E0B', unread: true },
  { icon: Lock, title: 'Door Locked', desc: 'Front door has been locked', time: '10 min ago', color: '#22C55E', unread: true },
  { icon: Zap, title: 'Energy Limit Alert', desc: 'Daily energy usage exceeded 8 kWh', time: '1 hr ago', color: '#EF4444', unread: true },
]

export default function NotificationsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5 }}
      className="glass p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-warning" />
          <span className="text-[13px] font-semibold text-white">Notifications</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-danger/20 text-danger">
            {NOTIFICATIONS.filter(n => n.unread).length}
          </span>
        </div>
        <button className="text-[11px] text-white/30 hover:text-white/60 transition-colors">
          Clear All
        </button>
      </div>

      <div className="space-y-2">
        {NOTIFICATIONS.map((notif, i) => {
          const Icon = notif.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${notif.color}15` }}>
                <Icon size={14} style={{ color: notif.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-white">{notif.title}</span>
                  {notif.unread && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </div>
                <div className="text-[11px] text-white/40 mt-0.5">{notif.desc}</div>
                <div className="text-[10px] text-white/25 mt-1">{notif.time}</div>
              </div>
              <button className="p-1 rounded hover:bg-white/[0.06] text-white/20 hover:text-white/50 transition-all mt-0.5">
                <X size={12} />
              </button>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
