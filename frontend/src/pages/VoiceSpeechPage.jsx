import { useState } from 'react'
import Layout from '../components/Layout'
import './voiceSpeech.css'

export default function VoiceSpeechPage() {
  const [ttsText, setTtsText] = useState('Good Morning! How are you?')
  const [sttText, setSttText] = useState('')
  const [ttsSign, setTtsSign] = useState('Good Morning')
  const [speaking, setSpeaking] = useState(false)
  const [recording, setRecording] = useState(false)
  const [showSign, setShowSign] = useState(false)

  const speak = () => {
    if ('speechSynthesis' in window && ttsText) {
      setSpeaking(true)
      const utt = new SpeechSynthesisUtterance(ttsText)
      utt.onend = () => setSpeaking(false)
      window.speechSynthesis.speak(utt)
    }
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  const toggleRecording = () => {
    setRecording(r => !r)
    if (!recording) {
      setTimeout(() => {
        setSttText('Hello, turn on the bedroom lights.')
        setRecording(false)
      }, 2000)
    }
  }

  return (
    <Layout title="Voice & Speech">
      <div className="anim-fade-up">
        <div className="page-header" style={{ marginBottom: 18 }}>
          <h1>🎙️ Voice & Speech</h1>
          <p>Convert between speech, text, and sign</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Text to Speak */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>🔊 Text to Speak</div>
            <div className="vs-input-row">
              <textarea
                className="vs-textarea"
                value={ttsText}
                onChange={e => setTtsText(e.target.value)}
                rows={3}
                placeholder="Enter text to speak..."
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-primary" onClick={speak} disabled={speaking}>
                  {speaking ? '🔊 Speaking...' : '🔊 Speak'}
                </button>
                {speaking && (
                  <button className="btn btn-danger btn-sm" onClick={stopSpeaking}>⏹ Stop</button>
                )}
              </div>
            </div>
          </div>

          {/* Speech to Text */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>🎤 Speech to Text</div>
            <div className="vs-stt-display">
              {/* Waveform visual */}
              <div className={`vs-waveform${recording ? ' active' : ''}`}>
                {Array.from({ length: 32 }).map((_, i) => (
                  <div key={i} className="vs-wave-bar" style={{ '--delay': `${i * 0.05}s` }}></div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                <button
                  className={`btn ${recording ? 'btn-danger' : 'btn-primary'}`}
                  onClick={toggleRecording}
                >
                  {recording ? '⏹ Stop' : '🎙️ Start Recording'}
                </button>
                {sttText && <span style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{sttText}</span>}
              </div>
            </div>
          </div>

          {/* Text to Sign */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>✋ Text to Sign</div>
            <div className="vs-sign-row">
              <input
                type="text"
                className="chat-input"
                value={ttsSign}
                onChange={e => setTtsSign(e.target.value)}
                placeholder="Enter text to convert to sign..."
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={() => setShowSign(true)}>Show Sign</button>
            </div>

            {showSign && (
              <div className="vs-sign-display">
                {/* Avatar placeholder */}
                <div className="vs-avatar">
                  <span>🧑‍🦱</span>
                  <div className="vs-avatar-hand">✋</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                    Showing: "{ttsSign}"
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>ISL (Indian Sign Language)</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
