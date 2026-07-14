# Sign Language Smart Home — FastAPI Backend v2
# Gesture → MQTT Bridge + State Persistence + Weather + Analytics

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json, os, time, random
from datetime import datetime, timedelta
from pathlib import Path

app = FastAPI(
    title="GestureHome API",
    description="FastAPI backend — gesture commands, device state, MQTT, analytics",
    version="2.0.0"
)

START_TIME = time.time()

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Persistence — JSON file ────────────────────────────────────────────────────
STATE_FILE = Path("devices.json")
NOTIF_FILE = Path("notifications.json")

DEFAULT_DEVICES = {
    "livingLight": True,  "livingFan": True,   "livingTV": False,
    "livingCurtain": True,"livingSpeaker": False,
    "bedLight": False,    "bedAC": False,       "bedCurtain": False,
    "bedThermostat": False,
    "kidsLight": False,   "kidsCurtain": False, "kidsNightLight": True,
    "kitchenLight": False,"kitchenExhaust": False,
    "studyLight": False,  "studyMonitor": False,
    "bathLight": False,   "bathExhaust": False,
    "frontDoor": True,    "gateLight": False,   "alarm": True, "doorbell": True,
}

AC_TEMP = {"bedAC": 22, "kitchenExhaust": 24}

def load_devices():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            pass
    return DEFAULT_DEVICES.copy()

def save_devices(state: dict):
    STATE_FILE.write_text(json.dumps(state, indent=2))

def load_notifications():
    if NOTIF_FILE.exists():
        try:
            return json.loads(NOTIF_FILE.read_text())
        except Exception:
            pass
    return []

def save_notifications(notifs: list):
    NOTIF_FILE.write_text(json.dumps(notifs[-50:], indent=2))  # keep last 50

device_state = load_devices()
notifications = load_notifications()


# ── Models ────────────────────────────────────────────────────────────────────
class GestureCommand(BaseModel):
    gesture: str
    action: str
    device_id: str | None = None
    scene_id: str | None = None
    value: bool | None = None

class DeviceToggle(BaseModel):
    device_id: str
    state: bool

class BulkDeviceState(BaseModel):
    devices: dict

class NotificationIn(BaseModel):
    type: str          # info | warning | success | gesture
    title: str
    message: str
    icon: str | None = "🔔"


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "message": "GestureHome API v2",
        "status": "running",
        "uptime_seconds": round(time.time() - START_TIME),
        "devices_count": len(device_state),
        "docs": "/docs"
    }

@app.get("/health")
def health():
    on_count = sum(1 for v in device_state.values() if v)
    return {
        "status": "ok",
        "version": "2.0.0",
        "uptime_seconds": round(time.time() - START_TIME),
        "timestamp": datetime.now().isoformat(),
        "devices_online": len(device_state),
        "devices_on": on_count,
    }


# ── Devices ───────────────────────────────────────────────────────────────────
@app.get("/devices")
def get_devices():
    return {"devices": device_state, "timestamp": datetime.now().isoformat()}

@app.post("/device/toggle")
def toggle_device(req: DeviceToggle):
    device_state[req.device_id] = req.state
    save_devices(device_state)
    _add_notification("info", f"Device {'ON' if req.state else 'OFF'}", f"{req.device_id} turned {'on' if req.state else 'off'}", "💡")
    return {"success": True, "device_id": req.device_id, "state": req.state}

@app.put("/devices/state")
def bulk_update(req: BulkDeviceState):
    device_state.update(req.devices)
    save_devices(device_state)
    return {"success": True, "updated": len(req.devices)}

@app.get("/device/{device_id}")
def get_device(device_id: str):
    state = device_state.get(device_id, False)
    return {"device_id": device_id, "state": state}


# ── Gesture ───────────────────────────────────────────────────────────────────
@app.post("/gesture")
def handle_gesture(cmd: GestureCommand):
    print(f"[GESTURE] {cmd.gesture} → {cmd.action}")
    _add_notification("gesture", f"Gesture: {cmd.gesture}", cmd.action, "🤚")
    return {"success": True, "gesture": cmd.gesture, "action": cmd.action}


# ── Weather (mocked — replace with real API key) ──────────────────────────────
WEATHER_CONDITIONS = [
    {"condition": "Partly Cloudy", "icon": "⛅", "humidity": 62, "wind": 12},
    {"condition": "Clear Sky",     "icon": "☀️", "humidity": 45, "wind": 8},
    {"condition": "Light Rain",    "icon": "🌧️", "humidity": 85, "wind": 18},
    {"condition": "Overcast",      "icon": "☁️", "humidity": 71, "wind": 10},
]

@app.get("/weather")
def get_weather():
    # Deterministic based on hour so it doesn't change every request
    hour = datetime.now().hour
    idx = (hour // 6) % len(WEATHER_CONDITIONS)
    w = WEATHER_CONDITIONS[idx]
    base_temp = 28 if 10 <= hour <= 18 else 22
    return {
        "city": "Smart City",
        "temperature": base_temp + (hour % 5) - 2,
        "feels_like": base_temp - 1,
        "condition": w["condition"],
        "icon": w["icon"],
        "humidity": w["humidity"],
        "wind_kph": w["wind"],
        "uv_index": 6 if 10 <= hour <= 16 else 2,
        "updated_at": datetime.now().strftime("%H:%M"),
    }


# ── Analytics ─────────────────────────────────────────────────────────────────
@app.get("/analytics")
def get_analytics():
    today = datetime.now()
    days = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        label = d.strftime("%a")
        # Simulate realistic usage — weekends lower
        is_weekend = d.weekday() >= 5
        kwh = round(random.uniform(3.2, 5.8) if not is_weekend else random.uniform(2.1, 4.2), 2)
        days.append({
            "label": label,
            "kwh": kwh,
            "cost": round(kwh * 8, 1),   # ₹8 per kWh
            "date": d.strftime("%d %b"),
        })
    on_count = sum(1 for v in device_state.values() if v)
    return {
        "week": days,
        "total_kwh_week": round(sum(d["kwh"] for d in days), 2),
        "total_cost_week": round(sum(d["cost"] for d in days), 1),
        "devices_on_now": on_count,
        "top_consumer": "Air Conditioner (1500W)",
    }


# ── Notifications ─────────────────────────────────────────────────────────────
def _add_notification(ntype: str, title: str, message: str, icon: str = "🔔"):
    notif = {
        "id": int(time.time() * 1000),
        "type": ntype,
        "title": title,
        "message": message,
        "icon": icon,
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "read": False,
    }
    notifications.insert(0, notif)
    save_notifications(notifications)

@app.get("/notifications")
def get_notifications():
    return {"notifications": notifications[:20]}

@app.post("/notifications")
def add_notification(n: NotificationIn):
    _add_notification(n.type, n.title, n.message, n.icon or "🔔")
    return {"success": True}

@app.post("/notifications/read-all")
def mark_all_read():
    for n in notifications:
        n["read"] = True
    save_notifications(notifications)
    return {"success": True}
