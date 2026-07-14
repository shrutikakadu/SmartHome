# 🏠 Sign Language Smart Home Automation

> **Control your entire home with hand gestures — no voice, no touch, no app.**  
> AI-powered real-time sign language recognition mapped to IoT smart home devices.

---

## 📌 Overview

**Sign Language Smart Home** is a system that uses computer vision and ASL hand gesture recognition to control smart home devices in real time. Point a camera at your hand, make a gesture, and watch your lights, fans, AC, TV, and security system respond instantly.

This project is built for:
- **Accessibility** — Enabling people with speech/motor impairments to control their home environment effortlessly
- **Innovation** — Bridging AI computer vision with IoT home automation
- **Hands-free control** — No voice assistant needed, completely gesture-driven

---

## 🧠 How It Works

```
📷 Camera Feed
    ↓
🤚 MediaPipe Hand Landmark Detection (21 keypoints)
    ↓
🧠 Gesture Classifier (recognizer.js — ASL A-Z + custom gestures)
    ↓
🎯 Gesture → Action Mapping (18 gestures → 22 devices)
    ↓
📡 MQTT / API Command
    ↓
🔌 ESP32 IoT Controller → Relay Module → Physical Device
```

---

## 🗂️ Project Structure

```
Sign-Language-SmartHome/
├── frontend/                    # React + Vite Web Dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── SmartHome.jsx   # Main gesture-controlled dashboard (22 devices)
│   │   │   └── smarthome.css   # Dashboard styles
│   │   ├── utils/
│   │   │   └── recognizer.js   # ASL gesture recognition engine (MediaPipe)
│   │   ├── App.jsx             # App entry
│   │   └── main.jsx            # React DOM mount
│   ├── index.html              # HTML entry with MediaPipe CDN
│   ├── package.json
│   └── vite.config.js
│
├── hardware/                    # IoT Hardware Code
│   ├── ESP32/                  # ESP32 microcontroller firmware
│   ├── MQTT/                   # MQTT broker configuration
│   ├── IoT-Communication/      # Communication protocols
│   └── Relay-Module/           # Relay wiring diagrams & code
│
├── backend/                    # FastAPI Python Backend
│   └── (gesture → MQTT bridge API)
│
├── .gitignore
└── README.md
```

---

## 🤚 Gesture Map (18 Gestures → 22 Devices)

| Gesture | Action | Device/Scene |
|---------|--------|-------------|
| `Hello` (wave) | All Lights ON | 💡 All rooms |
| `S` | Away / Sleep Mode | 🌙 All OFF |
| `K` | Cozy Night Scene | 🕯️ Dim lights |
| `F` | Good Morning Scene | ☀️ Wake up mode |
| `W` | Movie Mode | 🎬 TV + dim lights |
| `L` | Toggle Living Room Light | 💡 Living Room |
| `B` | Toggle Ceiling Fan | 🌀 Living Room |
| `V` | Toggle Smart TV | 📺 Living Room |
| `Y` | Toggle Bedroom AC | ❄️ Master Bedroom |
| `I` | Toggle Bedroom Light | 🛏️ Master Bedroom |
| `U` | Toggle All Curtains | 🪟 All Rooms |
| `D` | Front Door Lock | 🔒 Main Door |
| `A` | Security Alarm OFF | 🔕 System |
| `C` | Kids Room Light | 🧸 Kids Room |
| `E` | Kitchen Exhaust Fan | 💨 Kitchen |
| `G` | Gate Light | 💡 Outdoor |
| `M` | Toggle Monitor | 🖥️ Study Room |
| `N` | Night Light Toggle | 🌙 Kids Room |

---

## 🏠 Smart Devices (22 Total)

| Room | Devices |
|------|---------|
| Living Room | Light, Ceiling Fan, Smart TV, Curtains, Smart Speaker |
| Master Bedroom | Light, Air Conditioner, Curtains, Thermostat |
| Kids Room | Light, Curtains, Night Light |
| Kitchen | Light, Exhaust Fan |
| Study Room | Light, Monitor |
| Bathroom | Light, Exhaust Fan |
| Security/Outdoor | Smart Lock, Gate Light, Security Alarm, Video Doorbell |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, CSS3 |
| Gesture Recognition | MediaPipe Hands, Custom ASL Classifier |
| Backend API | FastAPI (Python) |
| IoT Protocol | MQTT (Mosquitto Broker) |
| Hardware | ESP32, Relay Module |
| Real-time | WebSocket / MQTT |

---

## 🚀 Getting Started

### Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5174
```

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Hardware Setup
1. Flash ESP32 with firmware from `hardware/ESP32/`
2. Configure MQTT broker (see `hardware/MQTT/`)
3. Wire relay module (see `hardware/Relay-Module/`)

---

## 📡 Hardware Requirements

- ESP32 Development Board
- 8-Channel Relay Module
- USB Camera (or built-in webcam)
- MQTT Broker (Mosquitto or cloud MQTT)
- Smart home devices (lights, fans, etc.)

---

## 🌐 Sister Project

This project is the Smart Home automation branch of a larger AI sign language ecosystem.

**VisiGesture** — Sign Language Recognition for non-speaking people (translation, communication)
→ [AI-Sign-Language-System](https://github.com/himanshugulhane01/AI-Sign-Language-System)

---

## 👨‍💻 Author

**Himanshu Gulhane**  
AI + IoT Sign Language Smart Home Project

---

## 📄 License

MIT License — Open source, use freely.
