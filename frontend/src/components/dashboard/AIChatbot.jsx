import { motion, AnimatePresence } from 'motion/react'
import { Bot, Send, X, MessageSquare } from 'lucide-react'
import { useState } from 'react'

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
            }}
          >
            <Bot size={22} />
            <motion.div
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-success border-2 border-bg"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[500px] flex flex-col overflow-hidden"
            style={{
              background: 'rgba(11,16,35,0.98)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '18px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                    <Bot size={18} />
                  </div>
                  <motion.div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2"
                    style={{ borderColor: 'rgba(11,16,35,0.98)' }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-white">AI Assistant</div>
                  <div className="text-[10px] text-success">Online</div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* AI Message */}
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                  <Bot size={13} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="p-3 rounded-2xl rounded-tl-md bg-white/[0.05] border border-white/[0.06]">
                    <p className="text-[12px] text-white/80 leading-relaxed">
                      Good Evening Himanshu 👋
                    </p>
                    <p className="text-[12px] text-white/60 leading-relaxed mt-2">
                      Everything looks normal in your smart home.
                    </p>
                    <p className="text-[12px] text-white/60 leading-relaxed mt-2">
                      Would you like me to turn off unused devices?
                    </p>
                  </div>
                  <div className="text-[10px] text-white/20 mt-1 ml-1">Just now</div>
                </div>
              </div>

              {/* Quick Reply Buttons */}
              <div className="flex gap-2 ml-9">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-medium text-white transition-all"
                  style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}
                >
                  Yes, Optimize
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-medium text-white/50 bg-white/[0.04] border border-white/[0.06] transition-all"
                >
                  No Thanks
                </motion.button>
              </div>
            </div>

            {/* Input */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <input
                  type="text"
                  placeholder="Ask AI anything..."
                  className="flex-1 bg-transparent text-[12px] text-white placeholder:text-white/20 focus:outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
                >
                  <Send size={12} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
