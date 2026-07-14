import { useState } from 'react'
import Layout from '../components/Layout'
import './aiTraining.css'

export default function AITrainingPage() {
  const [epochs, setEpochs] = useState(25)
  const [maxEpochs] = useState(50)
  const [accuracy] = useState(97.12)
  const [loss] = useState(0.048)
  const [training, setTraining] = useState(false)
  const [dataset, setDataset] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) setDataset(file.name)
  }

  const startTraining = () => setTraining(true)
  const stopTraining = () => setTraining(false)

  return (
    <Layout title="AI Model Training">
      <div className="anim-fade-up">
        <div className="page-header" style={{ marginBottom: 18 }}>
          <h1>🧠 AI Model Training</h1>
          <p>Control and train AI models</p>
        </div>

        <div className="grid-2-1">
          {/* Upload & Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Upload Dataset */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>📤 Upload Dataset</div>
              <label className="ai-upload-zone">
                <input type="file" accept=".zip,.csv,.json" onChange={handleFileChange} style={{ display: 'none' }} />
                <span className="ai-upload-icon">☁️</span>
                <span className="ai-upload-text">
                  {dataset ? `✅ ${dataset}` : 'Drag & drop dataset here'}
                </span>
                <span className="ai-upload-hint">Supports .zip, .csv, .json</span>
                <span className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>Browse Files</span>
              </label>
            </div>

            {/* Training Progress */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">📊 Training Progress</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text2)' }}>
                  Model: <span style={{ color: 'var(--purple)', fontWeight: 700 }}>SL-v2.1</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Epochs */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text2)' }}>Epochs</span>
                    <span style={{ fontWeight: 700 }}>{epochs} / {maxEpochs}</span>
                  </div>
                  <div className="db-progress-track">
                    <div className="db-progress-fill" style={{ width: `${(epochs / maxEpochs) * 100}%`, background: 'var(--purple)' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.67rem', color: 'var(--text3)', marginTop: 3 }}>
                    <span>0</span><span>{maxEpochs}</span>
                  </div>
                </div>

                {/* Accuracy */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text2)' }}>Accuracy</span>
                    <span style={{ fontWeight: 700, color: 'var(--green)' }}>{accuracy}%</span>
                  </div>
                  <div className="db-progress-track">
                    <div className="db-progress-fill" style={{ width: `${accuracy}%`, background: 'var(--green)' }}></div>
                  </div>
                </div>

                {/* Loss */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text2)' }}>Loss</span>
                  <span style={{ fontWeight: 700, color: 'var(--amber)' }}>{loss}</span>
                </div>

                {/* Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text2)' }}>Status</span>
                  {training
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontWeight: 700 }}><span className="live-dot"></span>Training...</span>
                    : <span style={{ color: 'var(--text3)' }}>Idle</span>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Model Actions */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>⚡ Model Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                className={`btn ${training ? 'btn-danger' : 'btn-primary'}`}
                style={{ justifyContent: 'center' }}
                onClick={training ? stopTraining : startTraining}
              >
                {training ? '⏹ Stop Training' : '▶ Start Training'}
              </button>
              <button className="btn btn-ghost" style={{ justifyContent: 'center' }}>
                ⬇ Download Model
              </button>
              <button className="btn btn-ghost" style={{ justifyContent: 'center' }}>
                📋 View Logs
              </button>
            </div>

            <div className="divider" style={{ margin: '18px 0' }}></div>

            <div className="card-title" style={{ marginBottom: 12 }}>📦 Model Info</div>
            {[
              { label: 'Architecture', val: 'CNN + LSTM' },
              { label: 'Input Size',   val: '224×224 px' },
              { label: 'Classes',      val: '26 Gestures' },
              { label: 'Framework',    val: 'TensorFlow.js' },
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.77rem', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text2)' }}>{m.label}</span>
                <span style={{ fontWeight: 600 }}>{m.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
