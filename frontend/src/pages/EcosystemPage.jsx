import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Layout from '../components/Layout'
import { ecosystemAPI } from '../utils/api'
import './ecosystem.css'

export default function EcosystemPage({ nested = false }) {
  const [brands, setBrands] = useState({})
  const [hubConfig, setHubConfig] = useState({
    option: 2,
    webhook_url: '',
    config_yaml: '',
    esp32_pins: { relay1: 12, relay2: 13, relay3: 14, relay4: 15, status_led: 2, buzzer: 4 }
  })
  
  const [activeConfigTab, setActiveConfigTab] = useState(2) // Default: Option 2 (Matter Hub)
  const [isPulseActive, setIsPulseActive] = useState(false)
  const [flowLogs, setFlowLogs] = useState([
    { time: 'System', msg: 'Hub Engine initialized. Ready for automation protocols.' }
  ])
  
  // Brand Syncing statuses
  const [syncingBrand, setSyncingBrand] = useState(null)
  
  // Natural Language automation parser
  const [automationText, setAutomationText] = useState('')
  const [parsingResult, setParsingResult] = useState(null)
  const [isParsing, setIsParsing] = useState(false)
  
  // ESP32 dynamic config inputs
  const [pinsInput, setPinsInput] = useState({
    relay1: 12, relay2: 13, relay3: 14, relay4: 15, status_led: 2, buzzer: 4
  })
  const [webhookInput, setWebhookInput] = useState('')
  const [yamlInput, setYamlInput] = useState('')

  useEffect(() => {
    loadEcosystemData()
  }, [])

  const loadEcosystemData = async () => {
    try {
      const [brandsData, configData] = await Promise.all([
        ecosystemAPI.getBrands(),
        ecosystemAPI.getHubConfig()
      ])
      setBrands(brandsData.brands || {})
      const config = configData.config
      setHubConfig(config)
      setActiveConfigTab(config.option || 2)
      setPinsInput(config.esp32_pins || { relay1: 12, relay2: 13, relay3: 14, relay4: 15, status_led: 2, buzzer: 4 })
      setWebhookInput(config.webhook_url || '')
      setYamlInput(config.config_yaml || '')
    } catch (err) {
      console.error('Failed to load ecosystem data:', err)
    }
  }

  // Trigger animated connection pulse
  const triggerPulse = () => {
    if (isPulseActive) return
    setIsPulseActive(true)
    setFlowLogs([])
    
    const logs = [
      { delay: 100, msg: '✋ Web UI -> Captured hand sign gesture [Wave]' },
      { delay: 500, msg: '📡 WebSocket -> Serialized gesture packet, transmitting to Cloud' },
      { delay: 1000, msg: '☁️ MQTT Broker -> Message received, routing to target Home Hub' },
      { delay: 1500, msg: '🔌 Local AI Hub -> Packet signature verified locally (Offline fallback active)' },
      { delay: 2000, msg: '🛜 Matter Protocol -> Fanning command to Philips Hue Bridge & TP-Link sockets' },
      { delay: 2500, msg: '⚡ Smart Bulbs -> High-voltage relays toggled. Round trip latency: 32ms.' }
    ]
    
    logs.forEach((log) => {
      setTimeout(() => {
        setFlowLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: log.msg }])
      }, log.delay)
    })

    setTimeout(() => {
      setIsPulseActive(false)
    }, 2800)
  }

  // Sync Brand API
  const handleSyncBrand = async (brandId) => {
    setSyncingBrand(brandId)
    try {
      const res = await ecosystemAPI.syncBrand(brandId)
      if (res.success) {
        setBrands(prev => ({ ...prev, [brandId]: res.brand }))
        setFlowLogs(prev => [
          ...prev, 
          { time: 'Sync', msg: `Successfully imported ${res.brand.devices.length} devices from ${res.brand.name}.` }
        ])
      }
    } catch (err) {
      console.error('Failed to sync brand:', err)
      setFlowLogs(prev => [
        ...prev, 
        { time: 'Error', msg: `Failed to connect brand ${brandId}. Check your API keys.` }
      ])
    } finally {
      setSyncingBrand(null)
    }
  }

  // Save hub configs
  const handleSaveConfig = async (optionNum) => {
    try {
      const updated = {
        option: optionNum,
        webhook_url: webhookInput,
        config_yaml: yamlInput,
        esp32_pins: pinsInput
      }
      const res = await ecosystemAPI.updateHubConfig(updated)
      if (res.success) {
        setHubConfig(res.config)
        setFlowLogs(prev => [
          ...prev, 
          { time: 'Config', msg: `Saved Option ${optionNum} hardware configuration parameters.` }
        ])
      }
    } catch (err) {
      console.error('Failed to save config:', err)
    }
  }

  // Parse Natural Language
  const handleParseAutomation = async (e) => {
    if (e) e.preventDefault()
    if (!automationText.trim()) return
    setIsParsing(true)
    try {
      const res = await ecosystemAPI.parseAutomation(automationText)
      setParsingResult(res)
      setFlowLogs(prev => [
        ...prev, 
        { time: 'AI Parse', msg: `Parsed: "${automationText}" in ${res.latency_ms}ms.` }
      ])
    } catch (err) {
      console.error('Automation parsing failed:', err)
    } finally {
      setIsParsing(false)
    }
  }

  // Generate Arduino/ESP32 C++ Code
  const getESP32Code = () => {
    return `// ESP32 Retrofit Switch Module Firmware v2.1
// Auto-generated by SmartHome AI Hub
#include <WiFi.h>
#include <PubSubClient.h>

#define RELAY_1_PIN     ${pinsInput.relay1}
#define RELAY_2_PIN     ${pinsInput.relay2}
#define RELAY_3_PIN     ${pinsInput.relay3}
#define RELAY_4_PIN     ${pinsInput.relay4}
#define STATUS_LED_PIN  ${pinsInput.status_led}
#define BUZZER_PIN      ${pinsInput.buzzer}

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "192.168.1.150"; // Hub Local IP

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  pinMode(RELAY_1_PIN, OUTPUT);
  pinMode(RELAY_2_PIN, OUTPUT);
  pinMode(RELAY_3_PIN, OUTPUT);
  pinMode(RELAY_4_PIN, OUTPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  digitalWrite(STATUS_LED_PIN, HIGH);
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void callback(char* topic, byte* payload, unsigned int length) {
  // Parse incoming Matter/MQTT commands fanned from Hub
  Serial.print("Command arrived on topic: ");
  Serial.println(topic);
  
  if (strcmp(topic, "home/living/light") == 0) {
    digitalWrite(RELAY_1_PIN, payload[0] == '1' ? HIGH : LOW);
  }
}`
  }

  const pageContent = (
    <div className="ecosystem-container">
        
        {/* Header */}
        <div className="ecosystem-header">
          <h1>🔌 Universal AI Home Hub & Ecosystem Lab</h1>
          <p>
            Connect, configure, and automate devices from multiple manufacturers using a unified system architecture. 
            Test simulated integrations, customize local physical hardware, and test regional AI automation scripts.
          </p>
        </div>

        {/* 1. Visualizer */}
        <div className="ecosystem-card">
          <div className="card-tag">architecture</div>
          <h2 className="card-title-eco">Interactive Device Connection Flow</h2>
          <p className="card-desc-eco">
            Visualize how sign language hand gestures bypass proprietary app fragmentation to route actions locally 
            from your browser webcam direct to high-voltage hardware switches.
          </p>
          
          <div className="visualizer-stage">
            
            {/* Visual Signal Pulse */}
            <div className={`signal-beam ${isPulseActive ? 'pulse-active' : ''}`} />

            <div className={`vis-node ${isPulseActive ? 'active' : ''}`}>
              <div className="vis-icon-wrapper">🤚</div>
              <span className="vis-label">Webcam App</span>
              <span className="vis-sub-label">ASL Classifier</span>
            </div>

            <div className={`vis-node ${isPulseActive ? 'active' : ''}`}>
              <div className="vis-icon-wrapper">☁️</div>
              <span className="vis-label">MQTT / Cloud</span>
              <span className="vis-sub-label">Secure Broker</span>
            </div>

            <div className={`vis-node ${isPulseActive ? 'active-teal' : ''}`}>
              <div className="vis-icon-wrapper">📟</div>
              <span className="vis-label">Local Hub</span>
              <span className="vis-sub-label">Raspberry Pi</span>
            </div>

            <div className={`vis-node ${isPulseActive ? 'active-teal' : ''}`}>
              <div className="vis-icon-wrapper">🛜</div>
              <span className="vis-label">Matter Bridge</span>
              <span className="vis-sub-label">Zigbee / Thread</span>
            </div>

            <div className={`vis-node ${isPulseActive ? 'active-teal' : ''}`}>
              <div className="vis-icon-wrapper">💡</div>
              <span className="vis-label">Smart Devices</span>
              <span className="vis-sub-label">Relays & Bulbs</span>
            </div>

          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <button className="btn btn-primary" onClick={triggerPulse} disabled={isPulseActive} style={{ padding: '10px 24px', fontSize: '0.85rem' }}>
              ⚡ Trigger Test Connection Signal
            </button>
            
            <div className="logs-section" style={{ flex: 1, minWidth: 280 }}>
              {flowLogs.map((log, idx) => (
                <div key={idx} className="log-entry">
                  <span>[{log.time}]</span>
                  <span>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Brand Ecosystem Connectors */}
        <div className="ecosystem-card">
          <div className="card-tag">ecosystems</div>
          <h2 className="card-title-eco">Third-Party Brand APIs</h2>
          <p className="card-desc-eco">
            Simulate connecting proprietary APIs from major smart home brands into your local Universal AI Hub. 
            Once authenticated, their devices are fetched and registered automatically.
          </p>

          <div className="brands-grid">
            {Object.values(brands).map((brand) => (
              <div key={brand.id} className={`brand-card ${brand.connected ? 'connected' : ''}`}>
                <div className="brand-card-top">
                  <div className="brand-info">
                    <span className="brand-icon">{brand.icon}</span>
                    <span className="brand-name">{brand.name}</span>
                  </div>
                  <span className="brand-status-dot"></span>
                </div>

                <div className="brand-device-list">
                  {brand.connected ? (
                    <div>✓ {brand.devices.length} Devices Synced</div>
                  ) : (
                    <div>Disconnected</div>
                  )}
                </div>

                <button 
                  className="brand-sync-btn"
                  onClick={() => handleSyncBrand(brand.id)}
                  disabled={syncingBrand === brand.id}
                >
                  {syncingBrand === brand.id ? 'Syncing...' : brand.connected ? 'Re-sync API' : 'Connect Brand'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Hardware Deployment Options */}
        <div className="ecosystem-card">
          <div className="card-tag">hardware options</div>
          <h2 className="card-title-eco">Universal Hub Configurator</h2>
          <p className="card-desc-eco">
            Configure how your hub receives commands. Select the best hardware/software implementation route for your home.
          </p>

          <div className="config-options-tabs">
            <button className={`config-tab-btn ${activeConfigTab === 1 ? 'active' : ''}`} onClick={() => setActiveConfigTab(1)}>
              Option 1: Software API Bridge
            </button>
            <button className={`config-tab-btn ${activeConfigTab === 2 ? 'active' : ''}`} onClick={() => setActiveConfigTab(2)}>
              Option 2: Physical Hub (Raspberry Pi)
            </button>
            <button className={`config-tab-btn ${activeConfigTab === 3 ? 'active' : ''}`} onClick={() => setActiveConfigTab(3)}>
              Option 3: Retrofit Switch Module (ESP32)
            </button>
          </div>

          <div className="config-tab-content">
            
            {activeConfigTab === 1 && (
              <div>
                <p className="card-desc-eco" style={{ marginBottom: 12 }}>
                  Use existing standard APIs over cloud webhooks. This maps client actions to online home assistants.
                </p>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label>Cloud Webhook Gateway URL</label>
                  <input 
                    type="text" 
                    value={webhookInput} 
                    onChange={(e) => setWebhookInput(e.target.value)} 
                    placeholder="https://your-assistant.local/api/webhook"
                  />
                </div>
                <button className="btn btn-primary" onClick={() => handleSaveConfig(1)} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                  Save Webhook URL
                </button>
              </div>
            )}

            {activeConfigTab === 2 && (
              <div>
                <p className="card-desc-eco" style={{ marginBottom: 12 }}>
                  Compile configuration code for a standalone local hub (Raspberry Pi/Mini PC). Runs locally for total privacy and matter integration.
                </p>
                <div className="editor-pane">
                  <div className="editor-header">
                    <span className="editor-title">hub-config.yaml</span>
                    <button className="brand-sync-btn" onClick={() => handleSaveConfig(2)} style={{ padding: '3px 8px', fontSize: '0.7rem' }}>
                      Save YAML Config
                    </button>
                  </div>
                  <div className="editor-body">
                    <textarea 
                      className="code-textarea" 
                      value={yamlInput}
                      onChange={(e) => setYamlInput(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeConfigTab === 3 && (
              <div>
                <p className="card-desc-eco" style={{ marginBottom: 12 }}>
                  Install custom ESP32 controllers behind existing wall switches. Enter your pin assignments to automatically generate clean C++ sketch firmware.
                </p>
                
                <div className="config-form-grid" style={{ marginBottom: 20 }}>
                  <div className="form-group">
                    <label>Relay 1 (Living Light Pin)</label>
                    <input 
                      type="number" 
                      value={pinsInput.relay1} 
                      onChange={(e) => setPinsInput(prev => ({ ...prev, relay1: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Relay 2 (Fan Pin)</label>
                    <input 
                      type="number" 
                      value={pinsInput.relay2} 
                      onChange={(e) => setPinsInput(prev => ({ ...prev, relay2: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Relay 3 (TV Pin)</label>
                    <input 
                      type="number" 
                      value={pinsInput.relay3} 
                      onChange={(e) => setPinsInput(prev => ({ ...prev, relay3: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Relay 4 (AC Pin)</label>
                    <input 
                      type="number" 
                      value={pinsInput.relay4} 
                      onChange={(e) => setPinsInput(prev => ({ ...prev, relay4: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status LED Pin</label>
                    <input 
                      type="number" 
                      value={pinsInput.status_led} 
                      onChange={(e) => setPinsInput(prev => ({ ...prev, status_led: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Buzzer Alarm Pin</label>
                    <input 
                      type="number" 
                      value={pinsInput.buzzer} 
                      onChange={(e) => setPinsInput(prev => ({ ...prev, buzzer: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <button className="btn btn-primary" onClick={() => handleSaveConfig(3)} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    Generate & Save Pins
                  </button>
                </div>

                <div className="editor-pane">
                  <div className="editor-header">
                    <span className="editor-title">ESP32_Relay_Firmware.ino</span>
                  </div>
                  <div className="editor-body">
                    <pre style={{ margin: 0, overflow: 'auto', maxHeight: '180px', color: '#6ee7b7' }}>
                      {getESP32Code()}
                    </pre>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 4. AI Local Automation Parser */}
        <div className="ecosystem-card">
          <div className="card-tag">ai automation</div>
          <h2 className="card-title-eco">Local AI Command & Router Laboratory</h2>
          <p className="card-desc-eco">
            Input high-level natural language instructions to watch how local edge AI parses the query and translates it 
            into targeted MQTT commands fanning out to multi-protocol manufacturers.
          </p>

          <div className="parser-section">
            <div>
              <p className="card-desc-eco" style={{ fontStyle: 'italic', marginBottom: 10 }}>
                Type a custom command, or click one of the presets to test:
              </p>
              
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <button 
                  className="brand-sync-btn" 
                  onClick={() => setAutomationText('Turn off everything except the refrigerator.')}
                >
                  "Turn off everything except refrigerator"
                </button>
                <button 
                  className="brand-sync-btn" 
                  onClick={() => setAutomationText('Activate cozy lighting and play chill music.')}
                >
                  "Activate cozy candle night lighting"
                </button>
                <button 
                  className="brand-sync-btn" 
                  onClick={() => setAutomationText('Prepare bedroom for sleep and lock main door.')}
                >
                  "Good night sleep mode"
                </button>
              </div>

              <form onSubmit={handleParseAutomation} className="parser-input-box">
                <input 
                  type="text" 
                  value={automationText} 
                  onChange={(e) => setAutomationText(e.target.value)} 
                  placeholder="e.g. Turn off the bedroom AC and set lights to warm dim." 
                  disabled={isParsing}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.85rem' }} disabled={isParsing}>
                  {isParsing ? 'Parsing...' : 'Process AI Command'}
                </button>
              </form>
            </div>

            <div className="parser-console">
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>
                <span className="console-header-tag">Parsed Hub Router Command Log</span>
                {parsingResult && (
                  <span className="console-latency">Latency: {parsingResult.latency_ms}ms</span>
                )}
              </div>

              {!parsingResult ? (
                <div className="console-empty">
                  Enter a query and process it to simulate local router parsing.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text3)' }}>Input Text:</span> <span style={{ color: '#fff', fontWeight: 600 }}>"{parsingResult.input}"</span>
                  </div>
                  
                  <div>
                    <div className="console-header-tag" style={{ fontSize: '0.6rem', marginBottom: 6 }}>Fanned-out device payloads</div>
                    {parsingResult.commands.map((cmd, idx) => (
                      <div key={idx} className="console-command-row">
                        <span>{cmd.device}</span>
                        <span>({cmd.brand})</span>
                        <span>➔ {cmd.action}</span>
                        <span>[{cmd.protocol}]</span>
                      </div>
                    ))}
                  </div>

                  {parsingResult.rule_suggestion && (
                    <div>
                      <div className="console-header-tag" style={{ fontSize: '0.6rem', marginBottom: 4 }}>AI Suggested Automation Rule</div>
                      <div className="console-rule-suggestion">
                        💡 {parsingResult.rule_suggestion}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. Accessibility Pitch Banner */}
        <div className="ecosystem-banner">
          <div className="banner-icon">🤚</div>
          <div className="banner-text">
            <h4>Privacy-First Local AI & Accessibility Retrofitting</h4>
            <p>
              By bypassing cloud-only voice assistants and cloud manufacturer hubs, our sign language interface runs 
              100% locally on device. Non-speaking individuals gain robust, zero-latency control of lighting, TV, 
              doors, and HVAC systems offline, creating a completely secure accessibility bridge.
            </p>
          </div>
        </div>

    </div>
  )

  if (nested) {
    return pageContent
  }

  return (
    <Layout title="Universal AI Hub">
      {pageContent}
    </Layout>
  )
}
