# MongoDB Database Layer — Smart Home Backend
import os, json
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from pathlib import Path

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "smarthome")

client: AsyncIOMotorClient = None
db = None

# ── Collections ───────────────────────────────────────────────────────────────
users_col = None
devices_col = None
gesture_history_col = None
notifications_col = None
emergency_contacts_col = None
system_logs_col = None
chat_history_col = None
settings_col = None


async def connect_db():
    """Initialize MongoDB connection and collections."""
    global client, db, users_col, devices_col, gesture_history_col
    global notifications_col, emergency_contacts_col, system_logs_col
    global chat_history_col, settings_col

    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    users_col = db["users"]
    devices_col = db["devices"]
    gesture_history_col = db["gesture_history"]
    notifications_col = db["notifications"]
    emergency_contacts_col = db["emergency_contacts"]
    system_logs_col = db["system_logs"]
    chat_history_col = db["chat_history"]
    settings_col = db["settings"]

    # Create indexes
    await users_col.create_index("email", unique=True)
    await gesture_history_col.create_index("date")
    await notifications_col.create_index("read")
    await system_logs_col.create_index("time")

    print(f"[DB] Connected to MongoDB: {MONGO_URI} / {DB_NAME}")


async def close_db():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("[DB] MongoDB connection closed")


# ── Seed default data if empty ───────────────────────────────────────────────
async def seed_data():
    """Insert default data if collections are empty."""
    import hashlib

    # Default devices
    if await devices_col.count_documents({}) == 0:
        default_devices = {
            "_id": "main",
            "livingLight": True, "livingFan": True, "livingTV": False,
            "livingCurtain": True, "livingSpeaker": False,
            "bedLight": False, "bedAC": False, "bedCurtain": False, "bedThermostat": False,
            "kidsLight": False, "kidsCurtain": False, "kidsNightLight": True,
            "kitchenLight": False, "kitchenExhaust": False,
            "studyLight": False, "studyMonitor": False,
            "bathLight": False, "bathExhaust": False,
            "frontDoor": True, "gateLight": False, "alarm": True, "doorbell": True,
        }
        await devices_col.insert_one(default_devices)
        print("[DB] Default devices seeded")

    # Default admin user
    if await users_col.count_documents({}) == 0:
        admin_user = {
            "name": "Alex",
            "email": "admin@home.com",
            "password": hashlib.sha256("admin123".encode()).hexdigest(),
            "role": "admin",
            "phone": "",
            "created": datetime.now().strftime("%Y-%m-%d"),
        }
        await users_col.insert_one(admin_user)
        print("[DB] Default admin user seeded")

    # Default emergency contacts
    if await emergency_contacts_col.count_documents({}) == 0:
        contacts = [
            {"name": "Mom", "phone": "+91 98765 43210", "relation": "Family"},
            {"name": "Dad", "phone": "+91 87654 32109", "relation": "Family"},
            {"name": "Dr. Sharma", "phone": "+91 76543 21098", "relation": "Doctor"},
        ]
        await emergency_contacts_col.insert_many(contacts)
        print("[DB] Default emergency contacts seeded")

    # Default settings
    if await settings_col.count_documents({}) == 0:
        await settings_col.insert_one({
            "_id": "main",
            "notifications": True,
            "dark_mode": True,
            "sound_effects": False,
            "mqtt_auto_connect": True,
        })
        print("[DB] Default settings seeded")
