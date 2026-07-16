import { motion } from 'motion/react'

const STATUS_ITEMS = [
  { label: 'MediaPipe', status: true },
  { label: 'OpenAI', status: true },
  { label: 'ESP32', status: true },
  { label: 'Backend', status: true },
]

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="mt-8 py-6 px-6 border-t border-white/[0.04]"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-2 h-2 rounded-full bg-success"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <span className="text-[11px] font-medium text-white/50">All Systems Operational</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            {STATUS_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full" style={{ background: item.status ? '#22C55E' : '#EF4444' }} />
                <span className="text-[10px] text-white/25">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Version */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/20">SmartHome AI v2.1</span>
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <span className="text-[10px] text-white/15">Built with ❤</span>
        </div>
      </div>
    </motion.footer>
  )
}
