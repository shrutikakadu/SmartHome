# Sign Language Smart Home — FastAPI Backend
# Gesture → MQTT Bridge

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

app = FastAPI(
    title="Sign Language Smart Home API",
    description="FastAPI backend — bridges gesture commands to MQTT/device control",
    version="1.0.0"
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory device state (replace with real MQTT later) ─────────────────────
device_state = {}


class GestureCommand(BaseModel):
    gesture: str
    action: str
    device_id: str | None = None
    scene_id: str | None = None
    value: bool | None = None


class DeviceToggle(BaseModel):
    device_id: str
    state: bool


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Sign Language Smart Home API", "status": "running"}


@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


@app.post("/gesture")
def handle_gesture(cmd: GestureCommand):
    """Receive a recognized gesture and execute the mapped action."""
    print(f"[GESTURE] {cmd.gesture} → {cmd.action}")
    # TODO: Publish to MQTT broker here
    # mqtt_client.publish(f"smarthome/{cmd.device_id}", json.dumps({"state": cmd.value}))
    return {"success": True, "gesture": cmd.gesture, "action": cmd.action}


@app.get("/devices")
def get_devices():
    """Get current state of all devices."""
    return {"devices": device_state}


@app.post("/device/toggle")
def toggle_device(req: DeviceToggle):
    """Manually toggle a device."""
    device_state[req.device_id] = req.state
    print(f"[DEVICE] {req.device_id} → {'ON' if req.state else 'OFF'}")
    # TODO: Publish to MQTT
    return {"success": True, "device_id": req.device_id, "state": req.state}


@app.get("/device/{device_id}")
def get_device(device_id: str):
    """Get state of a specific device."""
    state = device_state.get(device_id, False)
    return {"device_id": device_id, "state": state}
