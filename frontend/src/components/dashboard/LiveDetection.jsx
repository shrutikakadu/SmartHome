import { motion } from 'motion/react'
import { Hand, Camera, CheckCircle2, Loader2 } from 'lucide-react'

export default function LiveDetection() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="glass p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Hand size={15} className="text-primary" />
          <span className="text-[13px] font-semibold text-white">Live Detection</span>
        </div>
        <motion.div
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-success/10"
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-[10px] font-semibold text-success">Active</span>
        </motion.div>
      </div>

      {/* Camera Status */}
      <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
        <Camera size={14} className="text-white/40" />
        <span className="text-[11px] text-white/50">Camera Status</span>
        <span className="ml-auto text-[11px] font-semibold text-success">Connected</span>
      </div>

      {/* Confidence Meter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-white/40">Confidence</span>
          <span className="text-[13px] font-bold text-white">98.6%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }}
            initial={{ width: 0 }}
            animate={{ width: '98.6%' }}
            transition={{ delay: 0.6, duration: 1.2, ease: [0.25, 0.8, 0.25, 1] }}
          />
        </div>
      </div>

      {/* Detected Gesture */}
      <div className="p-3 rounded-xl mb-3" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <div className="text-[10px] text-white/30 mb-1">Detected Gesture</div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">✌</span>
          <div>
            <div className="text-[13px] font-semibold text-white">Peace Sign</div>
            <div className="text-[10px] text-white/40">Hand Gesture Recognition</div>
          </div>
        </div>
      </div>

      {/* Predicted Command */}
      <div className="p-3 rounded-xl mb-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
        <div className="text-[10px] text-white/30 mb-1">Predicted Command</div>
        <div className="text-[13px] font-semibold text-white">Turn ON Light</div>
      </div>

      {/* Execution Status */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-success/10 border border-success/20">
        <CheckCircle2 size={14} className="text-success" />
        <span className="text-[11px] font-medium text-success">Executed Successfully</span>
      </div>
    </motion.div>
  )
}
