import { useState, useRef, useEffect } from 'react'
import Layout from '../components/Layout'
import { chatAPI } from '../utils/api'
import './aiChat.css'

const INITIAL_MSGS = [
  { role: 'assistant', text: 'Hi! I\'m your AI Smart Home Assistant powered by OpenAI. How can I help you today?', ts: '10:52 AM' },
]

const ACTIVE_SUMMARY = [
  '✅ Bedroom Light — ON',
  '✅ Bedroom Fan — Speed HIGH',
  '✅ Living Room Light — ON',
]

export default function AIChatPage() {
  const [messages, setMessages] = useState(INITIAL_MSGS)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input, ts: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const data = await chatAPI.send(userMsg.text)
      setMessages(m => [...m, {
        role: 'assistant',
        text: data.response || 'No response received.',
        ts: data.timestamp || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }])
    } catch {
      setMessages(m => [...m, {
        role: 'assistant',
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        ts: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="AI Assistant">
      <div className="anim-fade-up" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>💬 AI Chat Assistant</h1>
          <p>Powered by OpenAI</p>
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
                    <div className="chat-avatar user-avatar">A</div>
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
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
              />
              <button className="btn btn-primary" onClick={send}>Send ➤</button>
            </div>
          </div>

          {/* Summary Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>⚡ Active Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ACTIVE_SUMMARY.map((s, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text)', padding: '7px 10px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>📝 Suggestions</div>
              {[
                '"Turn off all lights"',
                '"Set bedroom AC to 22°C"',
                '"Lock the front door"',
                '"Good morning scene"',
              ].map((s, i) => (
                <button
                  key={i}
                  className="btn btn-ghost btn-sm"
                  style={{ marginBottom: 6, width: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
                  onClick={() => setInput(s.replace(/"/g, ''))}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
