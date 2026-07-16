import { useState, useRef, useEffect } from 'react'
import Layout from '../components/Layout'
import { chatAPI } from '../utils/api'
import './aiChat.css'

const INITIAL_MSGS = [
  { role: 'assistant', text: "Hi! I'm your AI Smart Home Assistant. I can control devices, answer questions, and automate your home. How can I help you today?", ts: '10:52 AM' },
]

const ACTIVE_SUMMARY = [
  { label: 'Bedroom Light — ON',     icon: '💡' },
  { label: 'Bedroom Fan — HIGH',     icon: '🌀' },
  { label: 'Living Room Light — ON', icon: '💡' },
]

const SUGGESTIONS = [
  { icon: '💡', text: 'Turn off all lights' },
  { icon: '❄️', text: 'Set bedroom AC to 22°C' },
  { icon: '🔒', text: 'Lock the front door' },
  { icon: '🌅', text: 'Activate Good Morning scene' },
]

export default function AIChatPage() {
  const [messages, setMessages] = useState(INITIAL_MSGS)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  const user = JSON.parse(localStorage.getItem('smarthome_user') || '{}')
  const userInitial = (user.name || 'A').charAt(0).toUpperCase()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const msgText = text || input
    if (!msgText.trim()) return
    const userMsg = {
      role: 'user',
      text: msgText,
      ts: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const data = await chatAPI.send(msgText)
      setMessages(m => [...m, {
        role: 'assistant',
        text: data.response || 'No response received.',
        ts: data.timestamp || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }])
    } catch {
      setMessages(m => [...m, {
        role: 'assistant',
        text: 'Sorry, I encountered an error. Please check the connection and try again.',
        ts: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="AI Assistant">
      <div className="anim-fade-up" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>💬 AI Chat Assistant</h1>
          <p>Powered by OpenAI · Natural language home control</p>
        </div>

        <div className="chat-layout">
          {/* Chat Window */}
          <div className="card chat-card">
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-msg ${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <div className="chat-avatar ai-avatar">🤖</div>
                  )}
                  <div className="chat-bubble">
                    <div className="chat-text">{msg.text}</div>
                    <div className="chat-ts">{msg.ts}</div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="chat-avatar user-avatar">{userInitial}</div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="chat-msg assistant">
                  <div className="chat-avatar ai-avatar">🤖</div>
                  <div className="chat-bubble">
                    <div className="chat-typing">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef}></div>
            </div>

            {/* Input */}
            <div className="chat-input-row">
              <input
                type="text"
                className="chat-input"
                placeholder="Type a command or question..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
              />
              <button
                className="chat-send-btn"
                onClick={() => send()}
                disabled={loading || !input.trim()}
              >
                ➤
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="chat-sidebar">
            {/* Active Summary */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>
                <span className="live-dot" style={{ display: 'inline-block', marginRight: 6 }}></span>
                Active Devices
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ACTIVE_SUMMARY.map((s, i) => (
                  <div key={i} className="chat-summary-item">
                    <div className="chat-summary-dot"></div>
                    <span>{s.icon} {s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>💡 Quick Commands</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    className="chat-suggestion-chip"
                    onClick={() => send(s.text)}
                  >
                    <span className="chat-suggestion-icon">{s.icon}</span>
                    "{s.text}"
                  </button>
                ))}
              </div>
            </div>

            {/* AI Info */}
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))', borderColor: 'rgba(99,102,241,0.2)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text3)', lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>🤖 AI Model Info</div>
                <div>Model: <span style={{ color: '#818cf8' }}>GPT-4o</span></div>
                <div>Response: <span style={{ color: '#22c55e' }}>~0.4s avg</span></div>
                <div style={{ marginTop: 6 }}>Supports natural commands like "turn off everything" or "set a morning scene".</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
