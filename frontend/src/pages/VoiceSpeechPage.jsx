import { useState, useRef, useEffect } from 'react'
import Layout from '../components/Layout'
import './voiceSpeech.css'

// ISL alphabet reference
const ISL_ALPHABET = [
  { letter: 'A', emoji: '🤌' }, { letter: 'B', emoji: '🖐️' },
  { letter: 'C', emoji: '🤏' }, { letter: 'D', emoji: '☝️' },
  { letter: 'E', emoji: '🤞' }, { letter: 'F', emoji: '👌' },
  { letter: 'G', emoji: '👆' }, { letter: 'H', emoji: '🫵' },
  { letter: 'I', emoji: '🤙' }, { letter: 'J', emoji: '✌️' },
  { letter: 'K', emoji: '🖖' }, { letter: 'L', emoji: '🤘' },
  { letter: 'M', emoji: '🤝' }, { letter: 'N', emoji: '👍' },
  { letter: 'O', emoji: '👌' }, { letter: 'P', emoji: '🫲' },
  { letter: 'Q', emoji: '🫳' }, { letter: 'R', emoji: '✌️' },
  { letter: 'S', emoji: '✊' }, { letter: 'T', emoji: '🤟' },
  { letter: 'U', emoji: '🫸' }, { letter: 'V', emoji: '✌️' },
  { letter: 'W', emoji: '🖖' }, { letter: 'X', emoji: '🤞' },
  { letter: 'Y', emoji: '🤙' }, { letter: 'Z', emoji: '☝️' },
]

// Random wave heights for bars
const WAVE_HEIGHTS = Array.from({ length: 32 }, (_, i) => {
  const heights = [8, 14, 20, 30, 38, 44, 36, 28, 18, 10, 12, 24, 40, 46, 38, 22, 16, 30, 42, 34, 20, 12, 8, 18, 32, 44, 38, 26, 14, 22, 36, 20]
  return heights[i] || 20
})

export default function VoiceSpeechPage() {
  const [ttsText, setTtsText] = useState('Good Morning! How are you today?')
  const [sttText, setSttText] = useState('')
  const [ttsSign, setTtsSign] = useState('Hello')
  const [speaking, setSpeaking] = useState(false)
  const [recording, setRecording] = useState(false)
  const [showSign, setShowSign] = useState(false)

  const speak = () => {
    if ('speechSynthesis' in window && ttsText) {
      window.speechSynthesis.cancel()
      setSpeaking(true)
      const utt = new SpeechSynthesisUtterance(ttsText)
      utt.onend = () => setSpeaking(false)
      utt.onerror = () => setSpeaking(false)
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
        setSttText('Hello, turn on the bedroom lights please.')
        setRecording(false)
      }, 3000)
    }
  }

  return (
    <Layout title="Voice & Speech">
      <div className="anim-fade-up">
        <div className="page-header" style={{ marginBottom: 20 }}>
          <h1>🎙️ Voice & Speech</h1>
          <p>Convert between speech, text, and sign language — bidirectional communication</p>
        </div>

        <div className="vs-layout">
          {/* Text to Speech */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 14 }}>
              <div>
                <div className="card-title">🔊 Text to Speech</div>
                <div className="card-subtitle" style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: 2 }}>Type text and convert to audio</div>
              </div>
              {speaking && <span className="badge badge-purple" style={{ animation: 'pulseBadge 1s infinite' }}>Speaking...</span>}
            </div>
            <div className="vs-input-row">
              <textarea
                className="vs-textarea"
                value={ttsText}
                onChange={e => setTtsText(e.target.value)}
                rows={4}
                placeholder="Enter text to speak..."
              />
              <div className="vs-speak-btns">
                <button
                  className={`btn btn-primary vs-speak-btn${speaking ? ' speaking' : ''}`}
                  onClick={speak}
                  disabled={speaking}
                  style={{ fontSize: '0.8rem', padding: '10px 14px' }}
                >
                  {speaking ? '🔊 Speaking' : '🔊 Speak'}
                </button>
                {speaking && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={stopSpeaking}
                    style={{ fontSize: '0.78rem' }}
                  >
                    ⏹ Stop
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Speech to Text */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 14 }}>
              <div>
                <div className="card-title">🎤 Speech to Text</div>
                <div className="card-subtitle" style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: 2 }}>Speak and see the transcription</div>
              </div>
              {recording && <span className="badge badge-danger" style={{ animation: 'pulseBadge 1s infinite' }}>REC</span>}
            </div>

            <div className="vs-stt-display">
              {/* Animated waveform */}
              <div className={`vs-waveform${recording ? ' active' : ''}`}>
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className="vs-wave-bar"
                    style={{
                      '--delay': `${(i * 0.05).toFixed(2)}s`,
                      '--wave-dur': `${0.4 + (i % 5) * 0.1}s`,
                      '--wave-h': `${WAVE_HEIGHTS[i]}px`,
                    }}
                  ></div>
                ))}
              </div>

              <div className="vs-record-row">
                <button
                  className={`btn ${recording ? 'btn-danger vs-record-btn recording' : 'btn-primary vs-record-btn'}`}
                  onClick={toggleRecording}
                >
                  {recording ? '⏹ Stop Recording' : '🎙️ Start Recording'}
                </button>
                {sttText && (
                  <div className="vs-stt-result">
                    "{sttText}"
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Text to Sign */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>✋ Text to Sign</div>
            <div className="vs-sign-row">
              <input
                type="text"
                className="vs-sign-input"
                value={ttsSign}
                onChange={e => setTtsSign(e.target.value)}
                placeholder="Enter text to convert to sign..."
              />
              <button
                className="btn btn-primary"
                onClick={() => setShowSign(true)}
                style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}
              >
                Show Sign
              </button>
            </div>

            {showSign && (
              <div className="vs-sign-display">
                <div className="vs-avatar">
                  <span>🧑</span>
                  <div className="vs-avatar-hand">✋</div>
                </div>
                <div className="vs-sign-phrase">"{ttsSign}"</div>
                <div className="vs-sign-lang">🇮🇳 ISL — Indian Sign Language</div>
              </div>
            )}
          </div>

          {/* ISL Alphabet Reference */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>📖 ISL Alphabet Reference</div>
            <div className="vs-alphabet-grid">
              {ISL_ALPHABET.map(a => (
                <div
                  key={a.letter}
                  className="vs-alpha-item"
                  onClick={() => { setTtsSign(a.letter); setShowSign(true) }}
                  title={`Show sign for ${a.letter}`}
                >
                  <span className="vs-alpha-emoji">{a.emoji}</span>
                  <span className="vs-alpha-label">{a.letter}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
