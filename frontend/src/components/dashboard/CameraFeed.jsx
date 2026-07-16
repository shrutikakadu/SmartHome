import { motion } from 'motion/react'
import { Camera, Maximize2, Volume2, Settings } from 'lucide-react'

export default function CameraFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="glass overflow-hidden"
    >
      {/* Camera Preview */}
      <div className="relative aspect-video bg-gradient-to-br from-bg2 to-bg flex items-center justify-center overflow-hidden">
        {/* Simulated camera feed background */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.05) 0%, transparent 70%)'
        }} />

        {/* Detection box */}
        <motion.div
          className="absolute w-[40%] h-[55%] border-2 rounded-lg"
          style={{ borderColor: '#22C55E', top: '20%', left: '30%' }}
          animate={{
            boxShadow: [
              '0 0 10px rgba(34,197,94,0.3)',
              '0 0 20px rgba(34,197,94,0.5)',
              '0 0 10px rgba(34,197,94,0.3)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          {/* Corner markers */}
          <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 rounded-tl" style={{ borderColor: '#22C55E' }} />
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 rounded-tr" style={{ borderColor: '#22C55E' }} />
          <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 rounded-bl" style={{ borderColor: '#22C55E' }} />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 rounded-br" style={{ borderColor: '#22C55E' }} />
        </motion.div>

        {/* Gesture label */}
        <motion.div
          className="absolute px-3 py-1.5 rounded-lg text-[11px] font-bold text-white"
          style={{ background: 'rgba(34,197,94,0.8)', top: '18%', left: '30%', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          ✌ Peace Sign • 98.6%
        </motion.div>

        {/* Center hand icon */}
        <Hand size={40} className="text-white/10" />

        {/* Live indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm">
          <motion.div
            className="w-2 h-2 rounded-full bg-danger"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <span className="text-[10px] font-bold text-white">LIVE</span>
        </div>

        {/* Recording time */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm">
          <span className="text-[10px] font-mono text-white/70">00:14:32</span>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white transition-all">
            <Camera size={14} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white transition-all">
            <Maximize2 size={14} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white transition-all">
            <Volume2 size={14} />
          </motion.button>
        </div>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white transition-all">
          <Settings size={14} />
        </motion.button>
      </div>
    </motion.div>
  )
}

function Hand(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v0" />
      <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v6" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  )
}
