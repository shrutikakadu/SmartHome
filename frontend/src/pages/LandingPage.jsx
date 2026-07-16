import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SoftAurora from '../components/SoftAurora/SoftAurora'
import './landingNew.css'

const FEATURES = [
  { icon: '🤖', title: 'Real-time Detection',    desc: 'AI-powered gesture recognition at 97.6% accuracy using MediaPipe Hands pipeline and custom TensorFlow models running directly in your browser.' },
  { icon: '🏡', title: 'Smart Home Control',     desc: 'Control 22+ devices across all rooms. Seamless integration with ESP32 microcontrollers, local relays, and smart plugs via secure MQTT connection.' },
  { icon: '💬', title: 'AI Chat Assistant',      desc: 'AI-driven natural language commands to ask questions, query system logs, troubleshoot hardware, or automate device schedules using OpenAI GPT-4.' },
  { icon: '🎙️', title: 'Voice & Speech',         desc: 'Symmetric communication interface: converts voice to sign language visuals, text-to-speech, and sign gestures into synthesized speech audio output.' },
  { icon: '🚨', title: 'Emergency Alerts',       desc: 'SOS gesture triggers immediate notifications. Auto-dials emergency contacts and sends SMS alerts with system diagnostic information.' },
  { icon: '🧠', title: 'AI Model Training',      desc: 'No-code custom dataset uploader. Train custom gesture mappings by capturing personal hand shapes using your local webcam.' },
]

const STATS = [
  { val: '98%',  label: 'Accuracy' },
  { val: '50%',  label: 'Gestures' },
  { val: '22+',  label: 'Devices' },
  { val: '10K+', label: 'Users' },
]

const STORIES = [
  { name: 'Rohan Mehta', role: 'Hearing Impaired Student', quote: 'Being able to control my study desk fan and bedroom lights without sound makes me feel extremely independent.', rating: '⭐⭐⭐⭐⭐' },
  { name: 'Dr. Sarah Jenkins', role: 'Accessibility Lead', quote: 'A significant breakthrough in AI-based home automation. The sub-50ms latency is exactly what users needed.', rating: '⭐⭐⭐⭐⭐' },
  { name: 'Meera Kapoor', role: 'Smart Home Power User', quote: 'The MQTT bridging was instant. The emergency SOS gesture gives my family absolute peace of mind.', rating: '⭐⭐⭐⭐⭐' }
]

const INTERACTIVE_GESTURES = [
  { 
    name: 'Hello', 
    emoji: '👋', 
    command: 'All Lights ON', 
    confidence: '98.5%',
    activeDevices: ['light']
  },
  { 
    name: 'Sleep', 
    emoji: '💤', 
    command: 'Away Mode (All OFF)', 
    confidence: '99.1%',
    activeDevices: ['lock']
  },
  { 
    name: 'Cozy', 
    emoji: '🕯️', 
    command: 'Cozy Night Scene', 
    confidence: '97.4%',
    activeDevices: ['light', 'ac']
  },
  { 
    name: 'Movie', 
    emoji: '🎬', 
    command: 'Movie Mode (TV ON)', 
    confidence: '96.8%',
    activeDevices: ['tv', 'light']
  }
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [selectedGesture, setSelectedGesture] = useState(INTERACTIVE_GESTURES[0])
  const heroRef = useRef(null)

  // Mouse tilt handler for the 3D visual container
  const handleMouseMove = (e) => {
    const card = e.currentTarget
    const box = card.getBoundingClientRect()
    const x = e.clientX - box.left - box.width / 2
    const y = e.clientY - box.top - box.height / 2
    
    // Scale down tilt for elegance
    const rx = -(y / (box.height / 2)) * 12
    const ry = (x / (box.width / 2)) * 12
    setTilt({ rx, ry })
  }

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 })
  }

  // Scroll reveal Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
          }
        });
      },
      { threshold: 0.15 }
    );

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing">
      {/* Background soft aurora shader */}
      <div className="landing-bg-layer">
        <SoftAurora 
          speed={0.4} 
          scale={2.2} 
          brightness={1.0} 
          color1="#6366f1" 
          color2="#2dd4bf" 
          noiseFrequency={1.4} 
          bandSpread={1.4} 
          enableMouseInteraction={true} 
        />
      </div>

      {/* Nav */}
      <nav className="land-nav">
        <div className="land-nav-logo">
          <div className="land-logo-icon">✋</div>
          <span className="land-logo-text">Smart <span>Home</span></span>
        </div>
        <div className="land-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#stats">Stats</a>
          <a href="#stories">Stories</a>
          <button className="btn btn-ghost" onClick={() => navigate('/auth')} style={{ padding: '10px 24px', fontSize: '1rem', fontWeight: 700 }}>Login</button>
          <button className="btn btn-primary" onClick={() => navigate('/auth')} style={{ padding: '10px 28px', fontSize: '1rem', fontWeight: 700 }}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="land-hero" ref={heroRef}>
        <div className="land-hero-content reveal-on-scroll fade-in-left">
          <div className="land-hero-tag">
            <span className="live-dot"></span> AI-Powered · Real-time · 3D Control
          </div>
          <h1 className="land-hero-title">
            Bridging Silence<br />
            <span>Empowering Live</span>
          </h1>
          <p className="land-hero-desc">
            AI-Powered Sign Language Recognition for Smart Home Automation. Control your entire home with just hand gestures. Click the buttons below the 3D space to test gestures! This platform bridges communication barriers by converting hand sign gestures into instant IoT commands, empowering speech and hearing-impaired users to operate lighting, appliances, media systems, and security autonomously.
          </p>
          <div className="land-hero-btns">
            <button className="btn btn-primary" onClick={() => navigate('/auth')} style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
              🚀 Get Started
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/detection')} style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
              ▶ Live Demo
            </button>
          </div>
        </div>

        {/* 3D Tilt visual wrapper */}
        <div className="land-hero-visual-wrapper reveal-on-scroll scale-up">
          <div 
            className="land-hero-visual-container"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              transition: tilt.rx === 0 ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
            }}
          >
            {/* CSS 3D Scene */}
            <div className="land-scene-3d">
              {/* Floor / Grid base */}
              <div className="land-scene-floor">
                <div className="floor-grid-lines"></div>
                <div className="floor-glow"></div>
              </div>

              {/* Node connecting paths (SVGs in 3D space) */}
              <div className="land-paths-3d">
                <div className="path-line path-to-light"></div>
                <div className="path-line path-to-ac"></div>
                <div className="path-line path-to-tv"></div>
                <div className="path-line path-to-lock"></div>
              </div>

              {/* Device Nodes floating at different translates */}
              {/* Light Node */}
              <div className={`land-3d-node node-light ${selectedGesture.activeDevices.includes('light') ? 'active' : ''}`}>
                <div className="node-icon">💡</div>
                <div className="node-label">Smart Bulb</div>
                <div className="node-status">{selectedGesture.activeDevices.includes('light') ? 'ON' : 'OFF'}</div>
              </div>

              {/* AC Climate Node */}
              <div className={`land-3d-node node-ac ${selectedGesture.activeDevices.includes('ac') ? 'active' : ''}`}>
                <div className="node-icon">❄️</div>
                <div className="node-label">AC Unit</div>
                <div className="node-status">{selectedGesture.activeDevices.includes('ac') ? '21°C' : 'OFF'}</div>
              </div>

              {/* Security Lock Node */}
              <div className={`land-3d-node node-lock ${selectedGesture.activeDevices.includes('lock') ? 'active' : ''}`}>
                <div className="node-icon">🛡️</div>
                <div className="node-label">Front Door</div>
                <div className="node-status">{selectedGesture.activeDevices.includes('lock') ? 'SECURED' : 'UNLOCKED'}</div>
              </div>

              {/* TV Entertainment Node */}
              <div className={`land-3d-node node-tv ${selectedGesture.activeDevices.includes('tv') ? 'active' : ''}`}>
                <div className="node-icon">🎬</div>
                <div className="node-label">Media TV</div>
                <div className="node-status">{selectedGesture.activeDevices.includes('tv') ? 'PLAYING' : 'OFF'}</div>
              </div>

              {/* Central Floating Gesture Node */}
              <div className="land-3d-node node-gesture-main">
                <div className="pulse-ring ring-1"></div>
                <div className="pulse-ring ring-2"></div>
                <div className="node-hand-emoji">{selectedGesture.emoji}</div>
              </div>
            </div>

            {/* Gesture Detection HUD Card */}
            <div className="land-detection-card">
              <div style={{ fontSize: '0.62rem', color: 'var(--text3)', marginBottom: 2, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>AI Inference HUD</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--teal)' }}>{selectedGesture.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text)', margin: '4px 0' }}>Command: <span style={{ color: 'var(--purple)', fontWeight: 600 }}>{selectedGesture.command}</span></div>
              <div style={{ fontSize: '0.65rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="hud-status-dot"></span> Conf: {selectedGesture.confidence}
              </div>
            </div>
          </div>

          {/* Interactive triggers under the 3D visual */}
          <div className="interactive-triggers">
            {INTERACTIVE_GESTURES.map(g => (
              <button 
                key={g.name} 
                className={`trigger-btn${selectedGesture.name === g.name ? ' active' : ''}`}
                onClick={() => setSelectedGesture(g)}
              >
                {g.emoji} {g.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="land-section">
        <div className="reveal-on-scroll fade-in-up">
          <div className="land-section-tag">FEATURES</div>
          <h2 className="land-section-title">Everything You Need</h2>
          <p className="land-section-desc">A complete ecosystem for gesture-controlled smart home automation, powered by edge intelligence and resilient hardware communication.</p>
        </div>
        
        <div className="land-features-grid">
          {FEATURES.map((f, idx) => (
            <div 
              key={f.title} 
              className="land-feature-card reveal-on-scroll fade-in-up" 
              style={{ '--delay': `${idx * 0.08}s` }}
            >
              <div className="land-feature-icon">{f.icon}</div>
              <h3 className="land-feature-title">{f.title}</h3>
              <p className="land-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="land-section">
        <div className="reveal-on-scroll fade-in-up">
          <div className="land-section-tag">workflow</div>
          <h2 className="land-section-title">How It Works</h2>
          <p className="land-section-desc">From complex sign language to immediate appliance action in milliseconds.</p>
        </div>

        <div className="land-how-grid">
          <div className="land-how-card reveal-on-scroll fade-in-up" style={{ '--delay': '0s' }}>
            <div className="land-how-step">01</div>
            <div className="land-how-icon">📹</div>
            <h3 className="land-how-title">Capture Gesture</h3>
            <p className="land-how-desc">Your webcam captures real-time video frames at 30+ FPS, passing them to the MediaPipe Hand Landmarker pipeline to extract 21 coordinates per hand.</p>
          </div>
          <div className="land-how-card reveal-on-scroll fade-in-up" style={{ '--delay': '0.15s' }}>
            <div className="land-how-step">02</div>
            <div className="land-how-icon">🧠</div>
            <h3 className="land-how-title">AI Classification</h3>
            <p className="land-how-desc">A lightweight neural network classifies hand structures into command templates in less than 30ms, running completely locally for total privacy.</p>
          </div>
          <div className="land-how-card reveal-on-scroll fade-in-up" style={{ '--delay': '0.3s' }}>
            <div className="land-how-step">03</div>
            <div className="land-how-icon">🛜</div>
            <h3 className="land-how-title">IoT Command</h3>
            <p className="land-how-desc">Once classified, the system serializes a command payload (e.g. Device: Lights, State: ON) and transmits it securely via MQTT over WebSockets.</p>
          </div>
          <div className="land-how-card reveal-on-scroll fade-in-up" style={{ '--delay': '0.45s' }}>
            <div className="land-how-step">04</div>
            <div className="land-how-icon">⚡</div>
            <h3 className="land-how-title">Instant Control</h3>
            <p className="land-how-desc">An ESP32 microcontroller or smart hub broker receives the payload and switches the high-voltage relay pins, triggering the appliance instantly.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="land-section land-stats-section">
        <div className="reveal-on-scroll fade-in-up">
          <div className="land-section-tag">metrics</div>
          <h2 className="land-section-title">Engineered for Performance</h2>
          <p className="land-section-desc">Designed with industry-standard benchmarks for daily use and emergency control.</p>
        </div>

        <div className="land-stats reveal-on-scroll fade-in-up">
          {STATS.map((s, idx) => (
            <div key={s.label} className="land-stat" style={{ '--delay': `${idx * 0.1}s` }}>
              <div className="land-stat-val">{s.val}</div>
              <div className="land-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="stats-info-box reveal-on-scroll fade-in-up">
          <p>
            <strong>Technical Benchmarks:</strong> Smart Home uses a lightweight neural network architecture deployed client-side to ensure sub-50ms round-trip latency. Communication is secured using SSL/TLS over MQTT, enabling resilient performance even in low-bandwidth network environments.
          </p>
        </div>
      </section>

      {/* Stories Section */}
      <section id="stories" className="land-section">
        <div className="reveal-on-scroll fade-in-up">
          <div className="land-section-tag">impact</div>
          <h2 className="land-section-title">Success Stories</h2>
          <p className="land-section-desc">Designed to bridge accessibility gaps, our platform is actively helping people with hearing, speech, or mobility challenges achieve autonomous home control.</p>
        </div>

        <div className="land-stories-grid">
          {STORIES.map((s, idx) => (
            <div key={s.name} className="land-story-card reveal-on-scroll fade-in-up" style={{ '--delay': `${idx * 0.12}s` }}>
              <div className="story-stars">{s.rating}</div>
              <p className="story-quote">"{s.quote}"</p>
              <div className="story-user">
                <div className="story-avatar">{s.name[0]}</div>
                <div>
                  <h4 className="story-name">{s.name}</h4>
                  <span className="story-role">{s.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="land-cta reveal-on-scroll scale-up">
        <h2>Ready to Control Your Home?</h2>
        <p>Join thousands of users who are already using Smart Home to automate their smart homes.</p>
        <button className="btn btn-primary" onClick={() => navigate('/auth')} style={{ padding: '13px 32px', fontSize: '1rem', marginTop: 16 }}>
          🚀 Start Free Today
        </button>
      </section>

      {/* Contact Section */}
      <section id="contact" className="land-section land-contact">
        <div className="reveal-on-scroll fade-in-up">
          <div className="land-section-tag">contact</div>
          <h2 className="land-section-title">Get In Touch</h2>
          <p className="land-section-desc">Have questions, feedback, or need support? Reach out to us and we'll get back to you as soon as possible.</p>
        </div>

        <div className="land-contact-grid reveal-on-scroll fade-in-up">
          <div className="land-contact-card">
            <div className="land-contact-icon">📧</div>
            <h3 className="land-contact-label">Email Us</h3>
            <p className="land-contact-info">For general inquiries and support</p>
            <a href="mailto:support@smarthome.ai" className="land-contact-link">support@smarthome.ai</a>
          </div>
          <div className="land-contact-card">
            <div className="land-contact-icon">🏢</div>
            <h3 className="land-contact-label">Head Office</h3>
            <p className="land-contact-info">Visit us at our headquarters</p>
            <a href="mailto:hello@smarthome.ai" className="land-contact-link">hello@smarthome.ai</a>
          </div>
          <div className="land-contact-card">
            <div className="land-contact-icon">🛠️</div>
            <h3 className="land-contact-label">Technical Support</h3>
            <p className="land-contact-info">Device setup and troubleshooting</p>
            <a href="mailto:tech@smarthome.ai" className="land-contact-link">tech@smarthome.ai</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="land-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="land-logo-icon" style={{ width: 28, height: 28, fontSize: '0.85rem' }}>✋</div>
          <span style={{ fontWeight: 700 }}>Smart <span style={{ color: 'var(--purple)' }}>Home</span></span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>© 2026 Smart Home Automation. All rights reserved.</span>
      </footer>


    </div>
  )
}
