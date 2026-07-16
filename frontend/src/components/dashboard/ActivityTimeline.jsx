import { motion } from 'motion/react'
import { Lightbulb, Fan, Hand, Tv, Snowflake, Lock, DoorOpen, Camera } from 'lucide-react'

const ACTIVITIES = [
  { icon: Lightbulb, label: 'Light Turned ON', room: 'Living Room', time: '2 min ago', color: '#F59E0B', status: 'success' },
  { icon: Fan, label: 'Fan Turned OFF', room: 'Bedroom', time: '5 min ago', color: '#3B82F6', status: 'info' },
  { icon: Hand, label: 'Gesture Recognized', room: 'AI System', time: '8 min ago', color: '#8B5CF6', status: 'success' },
  { icon: Tv, label: 'TV Turned ON', room: 'Living Room', time: '12 min ago', color: '#22C55E', status: 'success' },
  { icon: Snowflake, label: 'AC Temperature Set', room: 'Bedroom', time: '18 min ago', color: '#06B6D4', status: 'info' },
  { icon: Lock, label: 'Door Locked', room: 'Garage', time: '25 min ago', color: '#EF4444', status: 'warning' },
  { icon: Camera, label: 'Motion Detected', room: 'Garage', time: '30 min ago', color: '#F59E0B', status: 'warning' },
]

export default function ActivityTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="glass p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
          <span className="text-[13px] font-semibold text-white">Recent Activity</span>
        </div>
        <motion.span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Live
        </motion.span>
      </div>

      <div className="space-y-1">
        {ACTIVITIES.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.06 }}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${item.color}15` }}>
                <Icon size={14} style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-white/80 group-hover:text-white transition-colors truncate">
                  {item.label}
                </div>
                <div className="text-[10px] text-white/30">{item.room}</div>
              </div>
              <div className="text-[10px] text-white/25 flex-shrink-0">{item.time}</div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
