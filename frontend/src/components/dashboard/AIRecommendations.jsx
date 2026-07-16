import { motion } from 'motion/react'
import { Lightbulb, IndianRupee, ArrowRight } from 'lucide-react'

export default function AIRecommendations() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
        border: '1px solid rgba(99,102,241,0.2)',
      }}
    >
      {/* Decorative glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25), transparent)' }} />
      <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2), transparent)' }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.2)' }}>
            <Lightbulb size={16} className="text-primary" />
          </div>
          <span className="text-[13px] font-semibold text-white">AI Recommendation</span>
        </div>

        <p className="text-[12px] text-white/60 leading-relaxed mb-3">
          Living Room Light has been <span className="text-white font-medium">ON for 4 hours</span>. Consider turning it off to save energy.
        </p>

        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-white/[0.05]">
          <IndianRupee size={12} className="text-success" />
          <span className="text-[11px] text-white/50">Estimated Saving</span>
          <span className="text-[13px] font-bold text-success ml-auto">₹12</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
        >
          Turn OFF Light
          <ArrowRight size={14} />
        </motion.button>
      </div>
    </motion.div>
  )
}
