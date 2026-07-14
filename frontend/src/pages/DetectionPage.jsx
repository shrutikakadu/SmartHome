import { useState, useRef, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'
import { recognizeSign } from '../utils/recognizer'
import './detection.css'

const RECENT_GESTURES = [
  { char: '👋', label: 'Hello',    time: '10:53:24 AM' },
  { char: '✌️', label: 'OK',      time: '10:53:18 AM' },
  { char: '👍', label: 'Yes',     time: '10:53:12 AM' },
  { char: '🤚', label: 'No',      time: '10:53:06 AM' },
  { char: '🙏', label: 'Thanks',  time: '10:52:58 AM' },
  { char: '🤙', label: 'Help',    time: '10:52:50 AM' },
  { char: '💡', label: 'Light ON',time: '10:52:40 AM' },
]

export default function DetectionPage() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const handsRef = useRef(null)
  const cameraRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [detected, setDetected] = useState({ char: 'OK', confidence: 96.35, lang: 'Indian Sign Language' })
  const [fps, setFps] = useState('0')
  const [handDetected, setHandDetected] = useState(false)
  const frameCountRef = useRef(0)
  const fpsIntervalRef = useRef(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraOn(true)

      if (!window.Hands) throw new Error('MediaPipe not loaded yet.')
      const hands = new window.Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` })
      hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.55, minTrackingConfidence: 0.5, selfieMode: false })

      hands.onResults(res => {
        const ctx = canvasRef.current?.getContext('2d')
        if (!ctx || !canvasRef.current || !videoRef.current) return
        const cw = videoRef.current.videoWidth || 1280, ch = videoRef.current.videoHeight || 720
        if (canvasRef.current.width !== cw) { canvasRef.current.width = cw; canvasRef.current.height = ch }
        ctx.save()
        ctx.clearRect(0, 0, cw, ch)
        ctx.translate(cw, 0)
        ctx.scale(-1, 1)

        if (res.multiHandLandmarks?.length > 0) {
          setHandDetected(true)
          for (const lm of res.multiHandLandmarks) {
            if (window.drawConnectors) window.drawConnectors(ctx, lm, window.HAND_CONNECTIONS, { color: '#2dd4bf', lineWidth: 3 })
            if (window.drawLandmarks) window.drawLandmarks(ctx, lm, { color: '#f59e0b', lineWidth: 2, radius: 3 })
          }
          const r = recognizeSign(res.multiHandLandmarks[0])
          if (r) {
            setDetected(prev => ({
              ...prev,
              char: r.letter,
              confidence: Math.round(r.confidence * 100),
            }))
          }
        } else {
          setHandDetected(false)
        }

        ctx.restore()
      })

      handsRef.current = hands

      const cam = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && handsRef.current) await handsRef.current.send({ image: videoRef.current })
        },
        width: 1280, height: 720
      })
      cam.start()
      cameraRef.current = cam
    } catch (err) {
      alert('Camera access failed: ' + err.message)
    }
  }

  // Attach stream to video element AFTER cameraOn causes it to render
  useEffect(() => {
    if (cameraOn && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraOn])

  // FPS counter using requestAnimationFrame
  useEffect(() => {
    if (!cameraOn) return
    let rafId
    const count = () => {
      frameCountRef.current++
      rafId = requestAnimationFrame(count)
    }
    rafId = requestAnimationFrame(count)
    fpsIntervalRef.current = setInterval(() => {
      setFps(String(Math.round(frameCountRef.current / 3)))
      frameCountRef.current = 0
    }, 3000)
    return () => {
      cancelAnimationFrame(rafId)
      clearInterval(fpsIntervalRef.current)
    }
  }, [cameraOn])

  const stopCamera = () => {
    if (cameraRef.current) { try { cameraRef.current.stop() } catch(e){} cameraRef.current = null }
    if (handsRef.current) { try { handsRef.current.close() } catch(e){} handsRef.current = null }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
    setFps('0')
    setHandDetected(false)
  }

  useEffect(() => {
    return () => {
      if (cameraRef.current) { try { cameraRef.current.stop() } catch(e){} }
      if (handsRef.current) { try { handsRef.current.close() } catch(e){} }
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (fpsIntervalRef.current) clearInterval(fpsIntervalRef.current)
    }
  }, [])

  return (
    <Layout title="Real-time Detection">
      <div className="anim-fade-up">
        <div className="page-header" style={{ marginBottom: 18 }}>
          <h1>🤖 Live Sign Language Detection</h1>
          <p>Real-time gesture recognition powered by AI</p>
        </div>

        <div className="det-layout">
          {/* Camera feed */}
          <div className="card det-cam-card">
            <div className="det-cam-header">
              <div className="det-cam-badge">
                <span className="live-dot"></span> LIVE
              </div>
              <div className="det-cam-header-right">
                {handDetected && (
                  <span className="det-hand-badge">✋ Hand Detected</span>
                )}
                <span className="det-fps">FPS: {fps}</span>
              </div>
            </div>

            <div className="det-video-wrap">
              <video ref={videoRef} autoPlay playsInline muted className="det-video" style={{ display: cameraOn ? 'block' : 'none' }} />
              <canvas ref={canvasRef} className="det-canvas" style={{ display: cameraOn ? 'block' : 'none' }} />
              {cameraOn && <div className="det-scan-line"></div>}
              {cameraOn && detected && (
                <div className="det-result-pill">
                  <div className="det-result-char">{detected.char}</div>
                  <div className="det-result-label">Detected</div>
                </div>
              )}
              {!cameraOn && (
                <div className="det-idle">
                  <span>📷</span>
                  <p>Camera not started</p>
                  <p className="det-idle-hint">Click "Start Livefeed" to begin</p>
                </div>
              )}
            </div>

            <button
              className={`btn btn-primary det-cam-btn`}
              onClick={cameraOn ? stopCamera : startCamera}
            >
              {cameraOn ? '⏹ Stop Livefeed' : '▶ Start Livefeed'}
            </button>
          </div>

          {/* Detection Panel */}
          <div className="det-panel">
            {/* Detected Gesture */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Detected Gesture</div>
              <div className="det-gesture-display">
                <div className="det-gesture-char">{detected.char}</div>
                <span className="badge badge-green" style={{ fontSize: '0.9rem', padding: '4px 14px' }}>{detected.char}</span>
              </div>
            </div>

            {/* Confidence */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>Confidence</div>
              <div className="det-confidence-val">{detected.confidence}%</div>
              <div className="db-progress-track" style={{ marginTop: 8 }}>
                <div className="db-progress-fill" style={{ width: `${detected.confidence}%`, background: 'var(--green)' }}></div>
              </div>
            </div>

            {/* Language */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>Language</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.5rem' }}>🇮🇳</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{detected.lang}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Gestures */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Gestures</div>
            <span className="badge badge-purple">Last 7</span>
          </div>
          <div className="det-recent-grid">
            {RECENT_GESTURES.map((g, i) => (
              <div key={i} className="det-recent-item">
                <div className="det-recent-icon">{g.char}</div>
                <div className="det-recent-label">{g.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
