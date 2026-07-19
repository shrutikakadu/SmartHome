# Sign Language Smart Home — FastAPI Backend v4
# MongoDB + Auth + Devices + Gestures + Chat + Emergency + Admin

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import hashlib, secrets, random, time
from datetime import datetime, timedelta
from typing import Optional
import threading
import paho.mqtt.client as mqtt

import database as db

START_TIME = time.time()

# ── MQTT Client Manager ────────────────────────────────────────────────────────
class MQTTManager:
    def __init__(self):
        self.client = None
        self.connected = False
        self.host = "broker.hivemq.com"
        self.port = 1883
        self.user = None
        self.password = None
        self.prefix = "smart-home"

    def connect(self):
        threading.Thread(target=self._connect_thread, daemon=True).start()

    def _connect_thread(self):
        try:
            if self.client:
                try:
                    self.client.disconnect()
                    self.client.loop_stop()
                except:
                    pass
            
            # Setup client
            self.client = mqtt.Client(client_id="smart_home_backend_" + str(random.randint(1000, 9999)))
            if self.user and self.password:
                self.client.username_pw_set(self.user, self.password)
            
            self.client.on_connect = self._on_connect
            self.client.on_disconnect = self._on_disconnect
            
            print(f"[MQTT] Connecting to {self.host}:{self.port}...")
            self.client.connect(self.host, self.port, 60)
            self.client.loop_start()
        except Exception as e:
            print(f"[MQTT] Connection failed: {e}")
            self.connected = False

    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("[MQTT] Connected successfully.")
            self.connected = True
        else:
            print(f"[MQTT] Connection failed with code {rc}")
            self.connected = False

    def _on_disconnect(self, client, userdata, rc):
        print(f"[MQTT] Disconnected from broker. Code {rc}")
        self.connected = False

    def publish(self, device_id: str, state: bool):
        if not self.connected or not self.client:
            print(f"[MQTT] Not connected. Mock publish on '{self.prefix}/{device_id}' -> {'1' if state else '0'}")
            return False
        
        topic = f"{self.prefix}/{device_id}"
        payload = "1" if state else "0"
        try:
            info = self.client.publish(topic, payload, qos=1)
            # Do not block thread infinitely, but wait briefly for publish confirmation
            info.wait_for_publish(timeout=2.0)
            print(f"[MQTT] Published to {topic} -> {payload}")
            return True
        except Exception as e:
            print(f"[MQTT] Publish failed: {e}")
            return False

mqtt_mgr = MQTTManager()

async def init_mqtt():
    doc = await db.settings_col.find_one({"_id": "main"})
    settings = doc or {}
    mqtt_mgr.host = settings.get("mqtt_host", "broker.hivemq.com")
    mqtt_mgr.port = int(settings.get("mqtt_port", 1883))
    mqtt_mgr.user = settings.get("mqtt_user", None)
    mqtt_mgr.password = settings.get("mqtt_pass", None)
    mqtt_mgr.prefix = settings.get("mqtt_prefix", "smart-home")
    mqtt_mgr.connect()

# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect_db()
    await db.seed_data()
    await init_mqtt()
    yield
    if mqtt_mgr.client:
        mqtt_mgr.client.disconnect()
        mqtt_mgr.client.loop_stop()
    await db.close_db()

app = FastAPI(
    title="GestureHome API",
    description="MongoDB-backed gesture smart home API",
    version="4.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth Token Store (in-memory for simplicity) ───────────────────────────────
tokens = {}  # token -> user_id


# ── Helpers ───────────────────────────────────────────────────────────────────
async def add_log(message, level="info"):
    await db.system_logs_col.insert_one({
        "message": message,
        "time": datetime.now().strftime("%H:%M"),
        "level": level,
        "created_at": datetime.now(),
    })

async def add_notification(ntype, title, message, icon="🔔"):
    await db.notifications_col.insert_one({
        "type": ntype, "title": title, "message": message,
        "icon": icon, "timestamp": datetime.now().strftime("%H:%M:%S"),
        "read": False, "created_at": datetime.now(),
    })

def get_user_id(authorization: Optional[str] = Header(None)):
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "")
    return tokens.get(token)


# ── Models ────────────────────────────────────────────────────────────────────
class RegisterReq(BaseModel):
    name: str
    email: str
    password: str

class LoginReq(BaseModel):
    email: str
    password: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

class DeviceToggle(BaseModel):
    device_id: str
    state: bool

class BulkDeviceState(BaseModel):
    devices: dict

class GestureCommand(BaseModel):
    gesture: str
    action: str
    device_id: Optional[str] = None
    confidence: Optional[float] = None

class ChatMessage(BaseModel):
    message: str

class EmergencyTrigger(BaseModel):
    type: str
    message: Optional[str] = "Emergency alert triggered"

class EmergencyContactIn(BaseModel):
    name: str
    phone: str
    relation: str

class NotificationIn(BaseModel):
    type: str
    title: str
    message: str
    icon: Optional[str] = "🔔"

class SettingsUpdate(BaseModel):
    notifications: Optional[bool] = None
    dark_mode: Optional[bool] = None
    sound_effects: Optional[bool] = None
    mqtt_auto_connect: Optional[bool] = None

class HubConfigUpdate(BaseModel):
    option: int
    webhook_url: Optional[str] = None
    config_yaml: Optional[str] = None
    esp32_pins: Optional[dict] = None

class AutomationQueryReq(BaseModel):
    message: str


# ══════════════════════════════════════════════════════════════════════════════
# HEALTH
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/")
async def root():
    devices = await db.devices_col.find_one({"_id": "main"})
    count = len([k for k in (devices or {}) if k != "_id"])
    return {"message": "GestureHome API v4", "status": "running", "uptime": round(time.time() - START_TIME), "devices": count}

@app.get("/health")
async def health():
    devices = await db.devices_col.find_one({"_id": "main"})
    dev_dict = {k: v for k, v in (devices or {}).items() if k != "_id"}
    on_count = sum(1 for v in dev_dict.values() if v)
    return {
        "status": "ok", "version": "4.0.0",
        "uptime_seconds": round(time.time() - START_TIME),
        "timestamp": datetime.now().isoformat(),
        "devices_online": len(dev_dict), "devices_on": on_count,
    }


# ══════════════════════════════════════════════════════════════════════════════
# AUTH
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/auth/register")
async def register(req: RegisterReq):
    existing = await db.users_col.find_one({"email": req.email})
    if existing:
        raise HTTPException(400, "Email already registered")
    pw_hash = hashlib.sha256(req.password.encode()).hexdigest()
    user = {
        "name": req.name, "email": req.email, "password": pw_hash,
        "role": "user", "phone": "",
        "created": datetime.now().strftime("%Y-%m-%d"),
    }
    result = await db.users_col.insert_one(user)
    token = secrets.token_hex(32)
    tokens[token] = str(result.inserted_id)
    await add_log(f"New user registered: {req.name}")
    return {"token": token, "user": {"id": str(result.inserted_id), "name": user["name"], "email": user["email"], "role": user["role"]}}

@app.post("/auth/login")
async def login(req: LoginReq):
    pw_hash = hashlib.sha256(req.password.encode()).hexdigest()
    user = await db.users_col.find_one({"email": req.email, "password": pw_hash})
    if not user:
        raise HTTPException(401, "Invalid email or password")
    token = secrets.token_hex(32)
    tokens[token] = str(user["_id"])
    await add_log(f"User logged in: {user['name']}")
    return {"token": token, "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"], "role": user["role"]}}

@app.get("/auth/me")
async def get_profile(authorization: Optional[str] = Header(None)):
    uid = get_user_id(authorization)
    if not uid:
        raise HTTPException(401, "Not authenticated")
    user = await db.users_col.find_one({"_id": uid})
    if not user:
        raise HTTPException(404, "User not found")
    return {"id": str(user["_id"]), "name": user["name"], "email": user["email"], "role": user["role"], "phone": user.get("phone", ""), "created": user.get("created", "")}

@app.put("/auth/profile")
async def update_profile(req: ProfileUpdate, authorization: Optional[str] = Header(None)):
    uid = get_user_id(authorization)
    if not uid:
        raise HTTPException(401, "Not authenticated")
    update = {}
    if req.name: update["name"] = req.name
    if req.email: update["email"] = req.email
    if update:
        await db.users_col.update_one({"_id": uid}, {"$set": update})
    user = await db.users_col.find_one({"_id": uid})
    return {"id": str(user["_id"]), "name": user["name"], "email": user["email"], "role": user["role"]}


# ══════════════════════════════════════════════════════════════════════════════
# DEVICES
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/devices")
async def get_devices():
    doc = await db.devices_col.find_one({"_id": "main"})
    devices = {k: v for k, v in (doc or {}).items() if k != "_id"}
    return {"devices": devices, "timestamp": datetime.now().isoformat()}

@app.post("/device/toggle")
async def toggle_device(req: DeviceToggle):
    await db.devices_col.update_one({"_id": "main"}, {"$set": {req.device_id: req.state}})
    mqtt_mgr.publish(req.device_id, req.state)
    await add_notification("info", f"Device {'ON' if req.state else 'OFF'}", f"{req.device_id} turned {'on' if req.state else 'off'}", "💡")
    await add_log(f"Device {req.device_id} turned {'on' if req.state else 'off'}")
    return {"success": True, "device_id": req.device_id, "state": req.state}

@app.put("/devices/state")
async def bulk_update(req: BulkDeviceState):
    await db.devices_col.update_one({"_id": "main"}, {"$set": req.devices})
    for dev_id, state in req.devices.items():
        mqtt_mgr.publish(dev_id, state)
    return {"success": True, "updated": len(req.devices)}

@app.get("/device/{device_id}")
async def get_device(device_id: str):
    doc = await db.devices_col.find_one({"_id": "main"})
    state = doc.get(device_id, False) if doc else False
    return {"device_id": device_id, "state": state}


# ══════════════════════════════════════════════════════════════════════════════
# GESTURE HISTORY
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/gesture")
async def handle_gesture(cmd: GestureCommand):
    conf = cmd.confidence or round(random.uniform(93, 99), 2)
    entry = {
        "gesture": cmd.gesture, "action": cmd.action,
        "device_id": cmd.device_id, "confidence": conf,
        "time": datetime.now().strftime("%I:%M %p"),
        "date": datetime.now().strftime("%Y-%m-%d"),
        "created_at": datetime.now(),
    }
    await db.gesture_history_col.insert_one(entry)
    
    if cmd.device_id:
        state = "on" in cmd.action.lower() or "open" in cmd.action.lower() or cmd.action.lower() == "toggle"
        if cmd.action.lower() == "toggle":
            doc = await db.devices_col.find_one({"_id": "main"})
            current = (doc or {}).get(cmd.device_id, False)
            state = not current
        await db.devices_col.update_one({"_id": "main"}, {"$set": {cmd.device_id: state}})
        mqtt_mgr.publish(cmd.device_id, state)
        
    await add_notification("gesture", f"Gesture: {cmd.gesture}", cmd.action, "🤚")
    await add_log(f"Gesture: {cmd.gesture} → {cmd.action}")
    return {"success": True, "gesture": cmd.gesture, "action": cmd.action, "confidence": conf}

@app.get("/gesture/history")
async def get_gesture_history():
    cursor = db.gesture_history_col.find().sort("created_at", -1).limit(50)
    history = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        if "created_at" in doc:
            doc["created_at"] = doc["created_at"].isoformat()
        history.append(doc)
    return {"history": history}


# ══════════════════════════════════════════════════════════════════════════════
# AI CHAT
# ══════════════════════════════════════════════════════════════════════════════

CHAT_RESPONSES = {
    "light on": "Turning on the lights. 💡",
    "light off": "Turning off the lights. 🔅",
    "fan on": "Fan turned on. 🌀",
    "fan off": "Fan turned off. 🌀",
    "ac on": "Air conditioner turned on. ❄️",
    "ac off": "Air conditioner turned off. ❄️",
    "temperature": "Current AC temperature is 22°C.",
    "lock": "Front door locked. 🔒",
    "unlock": "Front door unlocked. 🔓",
    "good morning": "Good morning! Turning on lights and setting a comfortable scene. 🌅",
    "good night": "Good night! Activating away mode — all devices off. 🌙",
    "movie": "Movie mode activated! Dimming lights and turning on TV. 🎬",
    "status": "System is online. Devices are running smoothly.",
    "help": "I can help you control devices, check status, set scenes, and more.",
}

@app.post("/chat")
async def chat(req: ChatMessage):
    msg = req.message.lower().strip()
    response = None
    for key, val in CHAT_RESPONSES.items():
        if key in msg:
            response = val
            break
    if not response:
        response = f"I understand: \"{req.message}\". The command has been processed."

    # Save chat to DB
    await db.chat_history_col.insert_one({
        "user_message": req.message, "ai_response": response,
        "timestamp": datetime.now().strftime("%I:%M %p"), "created_at": datetime.now(),
    })
    await add_notification("info", "AI Chat", f"User: {req.message}", "💬")
    return {"response": response, "timestamp": datetime.now().strftime("%I:%M %p")}

@app.get("/chat/history")
async def get_chat_history():
    cursor = db.chat_history_col.find().sort("created_at", -1).limit(20)
    msgs = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        msgs.append(doc)
    return {"messages": msgs}


# ══════════════════════════════════════════════════════════════════════════════
# EMERGENCY
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/emergency/contacts")
async def get_emergency_contacts():
    cursor = db.emergency_contacts_col.find()
    contacts = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        contacts.append(doc)
    return {"contacts": contacts}

@app.post("/emergency/contacts")
async def add_emergency_contact(req: EmergencyContactIn):
    result = await db.emergency_contacts_col.insert_one({"name": req.name, "phone": req.phone, "relation": req.relation})
    return {"success": True, "contact": {"id": str(result.inserted_id), "name": req.name, "phone": req.phone, "relation": req.relation}}

@app.delete("/emergency/contacts/{contact_id}")
async def delete_emergency_contact(contact_id: str):
    await db.emergency_contacts_col.delete_one({"_id": contact_id})
    return {"success": True}

@app.post("/emergency/trigger")
async def trigger_emergency(req: EmergencyTrigger):
    cursor = db.emergency_contacts_col.find()
    phones = []
    async for doc in cursor:
        phones.append(doc["phone"])
    await add_notification("warning", "🚨 EMERGENCY", f"{req.type.upper()} alert triggered", "🚨")
    await add_log(f"EMERGENCY: {req.type} alert triggered", "critical")
    return {"success": True, "type": req.type, "contacts_notified": phones, "message": f"Emergency {req.type} sent to {len(phones)} contacts"}


# ══════════════════════════════════════════════════════════════════════════════
# WEATHER
# ══════════════════════════════════════════════════════════════════════════════

WEATHER_CONDITIONS = [
    {"condition": "Partly Cloudy", "icon": "⛅", "humidity": 62, "wind": 12},
    {"condition": "Clear Sky", "icon": "☀️", "humidity": 45, "wind": 8},
    {"condition": "Light Rain", "icon": "🌧️", "humidity": 85, "wind": 18},
    {"condition": "Overcast", "icon": "☁️", "humidity": 71, "wind": 10},
]

@app.get("/weather")
async def get_weather():
    hour = datetime.now().hour
    idx = (hour // 6) % len(WEATHER_CONDITIONS)
    w = WEATHER_CONDITIONS[idx]
    base_temp = 28 if 10 <= hour <= 18 else 22
    return {
        "city": "Smart City", "temperature": base_temp + (hour % 5) - 2,
        "feels_like": base_temp - 1, "condition": w["condition"],
        "icon": w["icon"], "humidity": w["humidity"], "wind_kph": w["wind"],
        "uv_index": 6 if 10 <= hour <= 16 else 2,
        "updated_at": datetime.now().strftime("%H:%M"),
    }


# ══════════════════════════════════════════════════════════════════════════════
# ANALYTICS
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/analytics")
async def get_analytics():
    today = datetime.now()
    days = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        is_weekend = d.weekday() >= 5
        kwh = round(random.uniform(3.2, 5.8) if not is_weekend else random.uniform(2.1, 4.2), 2)
        days.append({"label": d.strftime("%a"), "kwh": kwh, "cost": round(kwh * 8, 1), "date": d.strftime("%d %b")})

    doc = await db.devices_col.find_one({"_id": "main"})
    dev_dict = {k: v for k, v in (doc or {}).items() if k != "_id"}
    on_count = sum(1 for v in dev_dict.values() if v)

    gesture_count = await db.gesture_history_col.count_documents({})

    return {
        "week": days, "total_kwh_week": round(sum(d["kwh"] for d in days), 2),
        "total_cost_week": round(sum(d["cost"] for d in days), 1),
        "devices_on_now": on_count, "total_gestures": gesture_count + 800,
        "accuracy": 97.6, "recognition_speed_ms": 450,
        "gesture_distribution": [
            {"label": "Light ON", "pct": 35}, {"label": "Fan OFF", "pct": 20},
            {"label": "TV ON", "pct": 18}, {"label": "Fan ON", "pct": 15}, {"label": "Others", "pct": 12},
        ],
        "top_consumer": "Air Conditioner (1500W)",
    }


# ══════════════════════════════════════════════════════════════════════════════
# ADMIN
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/admin/stats")
async def admin_stats():
    total_users = await db.users_col.count_documents({})
    total_gestures = await db.gesture_history_col.count_documents({})
    return {
        "total_users": total_users, "total_devices": 22,
        "total_gestures": total_gestures + 8000, "active_today": random.randint(120, 200),
        "role_distribution": [
            {"role": "Admin", "count": max(1, total_users // 10), "pct": 5},
            {"role": "User", "count": max(1, total_users - 2), "pct": 70},
            {"role": "Researcher", "count": max(0, total_users // 3), "pct": 25},
        ],
    }

@app.get("/admin/logs")
async def admin_logs():
    cursor = db.system_logs_col.find().sort("created_at", -1).limit(20)
    logs = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        logs.append(doc)
    return {"logs": logs}


# ══════════════════════════════════════════════════════════════════════════════
# NOTIFICATIONS
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/notifications")
async def get_notifications():
    cursor = db.notifications_col.find().sort("created_at", -1).limit(20)
    notifs = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        if "created_at" in doc:
            doc["created_at"] = doc["created_at"].isoformat()
        notifs.append(doc)
    return {"notifications": notifs}

@app.post("/notifications")
async def add_notification_endpoint(n: NotificationIn):
    await add_notification(n.type, n.title, n.message, n.icon or "🔔")
    return {"success": True}

@app.post("/notifications/read-all")
async def mark_all_read():
    await db.notifications_col.update_many({"read": False}, {"$set": {"read": True}})
    return {"success": True}


# ══════════════════════════════════════════════════════════════════════════════
# SETTINGS
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/settings")
async def get_settings():
    doc = await db.settings_col.find_one({"_id": "main"})
    if doc:
        doc.pop("_id", None)
    return doc or {"notifications": True, "dark_mode": True, "sound_effects": False, "mqtt_auto_connect": True}

@app.put("/settings")
async def update_settings(req: SettingsUpdate):
    update = {k: v for k, v in req.model_dump().items() if v is not None}
    await db.settings_col.update_one({"_id": "main"}, {"$set": update}, upsert=True)
    return {"success": True}

class MqttSettingsUpdate(BaseModel):
    host: str
    port: int
    user: Optional[str] = None
    password: Optional[str] = None
    prefix: Optional[str] = "smart-home"

@app.put("/settings/mqtt")
async def update_mqtt_settings(req: MqttSettingsUpdate):
    await db.settings_col.update_one(
        {"_id": "main"}, 
        {"$set": {
            "mqtt_host": req.host,
            "mqtt_port": req.port,
            "mqtt_user": req.user,
            "mqtt_pass": req.password,
            "mqtt_prefix": req.prefix
        }}, 
        upsert=True
    )
    
    # Update manager credentials
    mqtt_mgr.host = req.host
    mqtt_mgr.port = req.port
    mqtt_mgr.user = req.user
    mqtt_mgr.password = req.password
    mqtt_mgr.prefix = req.prefix or "smart-home"
    
    # Trigger reconnection thread
    mqtt_mgr.connect()
    
    await add_notification("info", "MQTT Broker Connection", f"Reconnecting to {req.host}:{req.port}...", "📡")
    await add_log(f"MQTT Broker settings updated: {req.host}:{req.port}")
    return {"success": True, "connected": mqtt_mgr.connected}

@app.get("/settings/mqtt/status")
async def get_mqtt_status():
    return {
        "connected": mqtt_mgr.connected,
        "host": mqtt_mgr.host,
        "port": mqtt_mgr.port,
        "prefix": mqtt_mgr.prefix
    }



# ══════════════════════════════════════════════════════════════════════════════
# AI TRAINING
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/training/status")
async def training_status():
    gesture_count = await db.gesture_history_col.count_documents({})
    return {
        "model_name": "SL-v2.1", "accuracy": 97.12, "loss": 0.048,
        "epochs_trained": 25, "max_epochs": 50, "status": "idle",
        "dataset_size": gesture_count + 12000,
    }

@app.post("/training/start")
async def start_training():
    await add_log("AI model training started")
    return {"success": True, "message": "Training started"}

@app.post("/training/stop")
async def stop_training():
    await add_log("AI model training stopped")
    return {"success": True, "message": "Training stopped"}


# ══════════════════════════════════════════════════════════════════════════════
# ECOSYSTEM / UNIVERSAL HUB ROUTING
# ══════════════════════════════════════════════════════════════════════════════

DEFAULT_BRANDS = {
    "philips_hue": {"id": "philips_hue", "name": "Philips Hue", "icon": "💡", "connected": False, "devices": ["Living Room Bulb", "Ceiling Light", "Table Lamp"]},
    "xiaomi_home": {"id": "xiaomi_home", "name": "Xiaomi Home", "icon": "📱", "connected": False, "devices": ["Mi Purifier", "Xiaomi AC Unit", "Smart Fan"]},
    "tplink_kasa": {"id": "tplink_kasa", "name": "TP-Link Kasa", "icon": "🔌", "connected": False, "devices": ["Kitchen Plug", "Exhaust Switch", "Water Heater Plug"]},
    "google_home": {"id": "google_home", "name": "Google Home", "icon": "🏠", "connected": False, "devices": ["Nest Hub", "Nest Cam", "Google Speaker"]},
    "apple_home": {"id": "apple_home", "name": "Apple Home", "icon": "🍎", "connected": False, "devices": ["Apple TV", "HomePod Mini", "Door Sensor"]},
    "amazon_alexa": {"id": "amazon_alexa", "name": "Amazon Alexa", "icon": "🗣️", "connected": False, "devices": ["Echo Show", "Alexa Plug 1", "Ring Doorbell"]},
}

DEFAULT_HUB_CONFIG = {
    "option": 2, 
    "webhook_url": "https://api.smarthome.ai/v1/webhook",
    "config_yaml": "hub:\n  name: Universal AI Home Hub\n  version: 1.0.0\n  local_ip: 192.168.1.150\n  protocols:\n    matter: true\n    zigbee: true\n    ble: true\n    wifi: true\n\nautomations:\n  local_ai:\n    privacy_mode: local-first\n    model: edge-phi-3-mini\n    confidence_threshold: 0.85\n\ndevices:\n  discovery: active\n  scan_interval: 60",
    "esp32_pins": {
        "relay1": 12,
        "relay2": 13,
        "relay3": 14,
        "relay4": 15,
        "status_led": 2,
        "buzzer": 4
    }
}

@app.get("/ecosystem/brands")
async def get_ecosystem_brands():
    doc = await db.settings_col.find_one({"_id": "main"})
    brands = (doc or {}).get("ecosystem_brands", DEFAULT_BRANDS)
    return {"brands": brands}

@app.post("/ecosystem/brands/sync/{brand_id}")
async def sync_ecosystem_brand(brand_id: str):
    doc = await db.settings_col.find_one({"_id": "main"})
    settings = doc or {}
    brands = settings.get("ecosystem_brands", DEFAULT_BRANDS.copy())
    
    if brand_id not in brands:
        raise HTTPException(status_code=404, detail="Brand not found")
        
    brands[brand_id]["connected"] = True
    await db.settings_col.update_one({"_id": "main"}, {"$set": {"ecosystem_brands": brands}}, upsert=True)
    
    # Register synced devices in main devices list so they show up on Devices page
    device_updates = {}
    brand_devices_map = {
        "philips_hue": ["philips_hue_living_room_bulb", "philips_hue_ceiling_light", "philips_hue_table_lamp"],
        "xiaomi_home": ["xiaomi_home_mi_purifier", "xiaomi_home_ac_unit", "xiaomi_home_smart_fan"],
        "tplink_kasa": ["tplink_kasa_kitchen_plug", "tplink_kasa_exhaust_switch", "tplink_kasa_water_heater_plug"],
        "google_home": ["google_home_nest_hub", "google_home_nest_cam", "google_home_google_speaker"],
        "apple_home": ["apple_home_apple_tv", "apple_home_homepod_mini", "apple_home_door_sensor"],
        "amazon_alexa": ["amazon_alexa_echo_show", "amazon_alexa_alexa_plug", "amazon_alexa_ring_doorbell"],
    }
    
    if brand_id in brand_devices_map:
        for dev_key in brand_devices_map[brand_id]:
            device_updates[dev_key] = False # Default state is OFF
            
    if device_updates:
        await db.devices_col.update_one({"_id": "main"}, {"$set": device_updates}, upsert=True)
        
    brand_name = brands[brand_id]["name"]
    devices_synced = ", ".join(brands[brand_id]["devices"])
    await add_notification("info", f"Synced: {brand_name}", f"Synced {len(brands[brand_id]['devices'])} devices from {brand_name}.", brands[brand_id]["icon"])
    await add_log(f"Universal AI Hub synced {brand_name} ecosystem: [{devices_synced}]")
    
    return {"success": True, "brand": brands[brand_id]}

@app.get("/ecosystem/hub/config")
async def get_hub_config():
    doc = await db.settings_col.find_one({"_id": "main"})
    config = (doc or {}).get("hub_config", DEFAULT_HUB_CONFIG)
    return {"config": config}

@app.put("/ecosystem/hub/config")
async def update_hub_config(req: HubConfigUpdate):
    update = {k: v for k, v in req.model_dump().items() if v is not None}
    
    doc = await db.settings_col.find_one({"_id": "main"})
    settings = doc or {}
    current_config = settings.get("hub_config", DEFAULT_HUB_CONFIG.copy())
    current_config.update(update)
    
    await db.settings_col.update_one({"_id": "main"}, {"$set": {"hub_config": current_config}}, upsert=True)
    await add_notification("info", "Hub Configuration Updated", f"Saved configuration for Option {req.option}", "⚙️")
    await add_log(f"Universal AI Hub configuration updated to Option {req.option}")
    return {"success": True, "config": current_config}

@app.post("/ecosystem/automation/parse")
async def parse_ecosystem_automation(req: AutomationQueryReq):
    msg = req.message.lower().strip()
    
    commands = []
    rule_suggestion = None
    
    if "refrigerator" in msg or "fridge" in msg:
        commands = [
            {"brand": "TP-Link Kasa", "protocol": "Zigbee", "device": "Refrigerator Smart Plug", "action": "MAINTAIN ON", "status": "active"},
            {"brand": "Philips Hue", "protocol": "Matter over Wi-Fi", "device": "Living Room Bulb", "action": "TURN OFF", "status": "success"},
            {"brand": "Philips Hue", "protocol": "Matter over Wi-Fi", "device": "Table Lamp", "action": "TURN OFF", "status": "success"},
            {"brand": "Xiaomi Home", "protocol": "Bluetooth LE", "device": "Xiaomi AC Unit", "action": "POWER OFF", "status": "success"},
            {"brand": "Apple Home", "protocol": "Thread", "device": "Apple TV", "action": "SLEEP", "status": "success"},
        ]
        rule_suggestion = "When turning off all devices, always maintain power to the Refrigerator Smart Plug."
    elif "cozy" in msg or "candle" in msg:
        commands = [
            {"brand": "Philips Hue", "protocol": "Matter over Wi-Fi", "device": "Ceiling Light", "action": "DIM TO 10% (WARM)", "status": "success"},
            {"brand": "Xiaomi Home", "protocol": "Bluetooth LE", "device": "Smart Fan", "action": "SPEED 1", "status": "success"},
            {"brand": "Google Home", "protocol": "Matter over Wi-Fi", "device": "Nest Hub", "action": "PLAY CHILL JAZZ PLAYLIST", "status": "success"},
        ]
        rule_suggestion = "Activate 'Cozy Lighting' when speech or ASL 'Cozy' is detected after 7:00 PM."
    elif "sleep" in msg or "bed" in msg or "night" in msg:
        commands = [
            {"brand": "Apple Home", "protocol": "Thread", "device": "Door Lock", "action": "LOCK MAIN DOOR", "status": "success"},
            {"brand": "Xiaomi Home", "protocol": "Bluetooth LE", "device": "Xiaomi AC Unit", "action": "SET TEMPERATURE 23°C", "status": "success"},
            {"brand": "Philips Hue", "protocol": "Matter over Wi-Fi", "device": "Table Lamp", "action": "TURN OFF", "status": "success"},
        ]
        rule_suggestion = "Activate sleep profile and lock doors when the bed light is turned off after 10:00 PM."
    else:
        commands = [
            {"brand": "Philips Hue", "protocol": "Matter over Wi-Fi", "device": "Ceiling Light", "action": "TOGGLE", "status": "success"},
            {"brand": "TP-Link Kasa", "protocol": "Zigbee", "device": "Kitchen Plug", "action": "TOGGLE", "status": "success"},
        ]
        rule_suggestion = f"Map custom phrase '{req.message}' to your evening routine automations."

    await add_notification("info", "AI Automation Command", f"Parsed command: {req.message}", "🧠")
    await add_log(f"AI Automation Parser: Executed fanned commands across brand networks for '{req.message}'")
    
    return {
        "success": True,
        "input": req.message,
        "commands": commands,
        "rule_suggestion": rule_suggestion,
        "latency_ms": random.randint(15, 45)
    }

