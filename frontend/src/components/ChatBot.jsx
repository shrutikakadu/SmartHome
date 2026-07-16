import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { chatAPI } from '../utils/api'
import './ChatBot.css'

const WELCOME_MSG = {
  role: 'assistant',
  text: "Hi! I'm your Smart Home AI assistant. Ask me anything about your devices, rooms, or automations.",
  ts: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
}

const SUGGESTIONS = [
  'Turn off all lights',
  'Set AC to 22°C',
  'Lock the front door',
  'Good morning scene',
]

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME_MSG])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg) return

    const userMsg = {
      role: 'user',
      text: msg,
      ts: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const data = await chatAPI.send(msg)
      setMessages(m => [...m, {
        role: 'assistant',
        text: data.response || 'No response received.',
        ts: data.timestamp || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch {
      setMessages(m => [...m, {
        role: 'assistant',
        text: 'Sorry, I encountered an error. Please try again.',
        ts: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="chatbot-fab"
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Toggle AI chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              ✕
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              💬
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="chatbot-panel"
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-header-left">
                <div className="chatbot-header-avatar">🤖</div>
                <div>
                  <div className="chatbot-header-title">AI Assistant</div>
                  <div className="chatbot-header-status">
                    <span className="chatbot-status-dot"></span> Online
                  </div>
                </div>
              </div>
              <button className="chatbot-close-btn" onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* Messages */}
            <div className="chatbot-messages">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`chatbot-msg ${msg.role}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {msg.role === 'assistant' && (
                    <div className="chatbot-avatar ai">🤖</div>
                  )}
                  <div className="chatbot-bubble">
                    <div className="chatbot-text">{msg.text}</div>
                    <div className="chatbot-ts">{msg.ts}</div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="chatbot-avatar user">A</div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  className="chatbot-msg assistant"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="chatbot-avatar ai">🤖</div>
                  <div className="chatbot-bubble">
                    <div className="chatbot-typing">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef}></div>
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
              <div className="chatbot-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="chatbot-suggestion-chip"
                    onClick={() => send(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="chatbot-input-row">
              <input
                ref={inputRef}
                type="text"
                className="chatbot-input"
                placeholder="Ask something..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
              />
              <motion.button
                className="chatbot-send-btn"
                onClick={() => send()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                disabled={!input.trim()}
              >
                ➤
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
