# JSON File Database — Smart Home Backend (No MongoDB required)
# Replaces Motor/MongoDB with simple JSON file persistence.
# All collections are stored as JSON files in the /data/ directory.

import os, json, hashlib
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

# ── In-memory stores (loaded from JSON on startup) ────────────────────────────
_users              = {}   # keyed by str(id)
_devices            = {}   # single "main" doc
_gesture_history    = []
_notifications      = []
_emergency_contacts = []
_system_logs        = []
_chat_history       = []
_settings           = {}

_next_ids = {}   # collection -> next int id


# ── File paths ────────────────────────────────────────────────────────────────
def _path(name): return DATA_DIR / f"{name}.json"


def _load(name, default):
    p = _path(name)
    if p.exists():
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            pass
    return default


def _save(name, data):
    _path(name).write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")


# ── ID helpers ────────────────────────────────────────────────────────────────
def _next_id(col):
    _next_ids[col] = _next_ids.get(col, 0) + 1
    return str(_next_ids[col])


# ── Fake collection objects (mimic Motor API used in main.py) ─────────────────

class _Col:
    """Mimics a Motor async collection with a synchronous JSON back-end."""
    def __init__(self, name, store_ref):
        self._name = name
        self._ref  = store_ref          # lambda returning the live list/dict

    # helpers
    def _store(self): return self._ref()
    def _save(self):  _save(self._name, self._store())

    # ── query helpers ─────────────────────────────────────────────────────────
    @staticmethod
    def _matches(doc, query):
        for k, v in query.items():
            if doc.get(k) != v:
                return False
        return True

    # ── async interface ───────────────────────────────────────────────────────
    async def find_one(self, query=None):
        store = self._store()
        items = store if isinstance(store, list) else [store]
        for doc in items:
            if query is None or self._matches(doc, query):
                return dict(doc)
        return None

    async def insert_one(self, doc):
        doc = dict(doc)
        doc["_id"] = _next_id(self._name)
        doc["created_at"] = datetime.now().isoformat()
        store = self._store()
        if isinstance(store, list):
            store.append(doc)
        else:
            store.update(doc)
        self._save()
        return type("R", (), {"inserted_id": doc["_id"]})()

    async def insert_many(self, docs):
        store = self._store()
        ids = []
        for doc in docs:
            doc = dict(doc)
            doc["_id"] = _next_id(self._name)
            doc["created_at"] = datetime.now().isoformat()
            store.append(doc)
            ids.append(doc["_id"])
        self._save()
        return type("R", (), {"inserted_ids": ids})()

    async def update_one(self, query, update, upsert=False):
        store = self._store()
        items = store if isinstance(store, list) else [store]
        matched = False
        for doc in items:
            if self._matches(doc, query):
                if "$set" in update:
                    doc.update(update["$set"])
                matched = True
                break
        if not matched and upsert:
            new_doc = dict(query)
            if "$set" in update:
                new_doc.update(update["$set"])
            new_doc["_id"] = _next_id(self._name)
            if isinstance(store, list):
                store.append(new_doc)
            else:
                store.update(new_doc)
        self._save()

    async def update_many(self, query, update):
        store = self._store()
        items = store if isinstance(store, list) else [store]
        for doc in items:
            if self._matches(doc, query):
                if "$set" in update:
                    doc.update(update["$set"])
        self._save()

    async def delete_one(self, query):
        store = self._store()
        if isinstance(store, list):
            for i, doc in enumerate(store):
                if self._matches(doc, query):
                    store.pop(i)
                    break
        self._save()

    async def count_documents(self, query=None):
        store = self._store()
        items = store if isinstance(store, list) else [store]
        if not query:
            return len(items)
        return sum(1 for d in items if self._matches(d, query))

    async def create_index(self, *args, **kwargs):
        pass  # No-op — JSON files don't need indexes

    def find(self, query=None):
        return _Cursor(self._store(), query)


class _Cursor:
    def __init__(self, store, query=None):
        self._items = [dict(d) for d in (store if isinstance(store, list) else [store])
                       if query is None or all(d.get(k) == v for k, v in query.items())]
        self._sort_key  = None
        self._sort_dir  = 1
        self._limit_val = None

    def sort(self, key, direction=-1):
        self._sort_key = key
        self._sort_dir = direction
        return self

    def limit(self, n):
        self._limit_val = n
        return self

    def __aiter__(self):
        items = self._items
        if self._sort_key:
            items = sorted(items, key=lambda d: d.get(self._sort_key, ""), reverse=(self._sort_dir == -1))
        if self._limit_val:
            items = items[:self._limit_val]
        self._iter = iter(items)
        return self

    async def __anext__(self):
        try:
            return next(self._iter)
        except StopIteration:
            raise StopAsyncIteration


# ── Globals exposed to main.py ────────────────────────────────────────────────
users_col:              _Col = None
devices_col:            _Col = None
gesture_history_col:    _Col = None
notifications_col:      _Col = None
emergency_contacts_col: _Col = None
system_logs_col:        _Col = None
chat_history_col:       _Col = None
settings_col:           _Col = None


# ── Lifecycle ─────────────────────────────────────────────────────────────────
async def connect_db():
    global _users, _devices, _gesture_history, _notifications
    global _emergency_contacts, _system_logs, _chat_history, _settings
    global users_col, devices_col, gesture_history_col, notifications_col
    global emergency_contacts_col, system_logs_col, chat_history_col, settings_col

    raw_users = _load("users", {})
    # Migrate: old format was a list, new format is a dict keyed by _id
    if isinstance(raw_users, list):
        _users = {str(u.get("_id", i)): u for i, u in enumerate(raw_users)}
        _save("users", _users)  # save in new format
    else:
        _users = raw_users

    raw_devices = _load("devices", {})
    # Migrate: old devices may have been stored as a list
    if isinstance(raw_devices, list):
        _devices = raw_devices[0] if raw_devices else {}
    else:
        _devices = raw_devices

    _gesture_history    = _load("gesture_history",    [])
    _notifications      = _load("notifications",      [])
    _emergency_contacts = _load("emergency_contacts", [])
    _system_logs        = _load("system_logs",        [])
    _chat_history       = _load("chat_history",       [])

    raw_settings = _load("settings", {})
    _settings = raw_settings if isinstance(raw_settings, dict) else {}

    # Ensure all list stores are actually lists
    for name in ["gesture_history", "notifications", "emergency_contacts", "system_logs", "chat_history"]:
        val = globals().get(f"_{name}", [])
        if not isinstance(val, list):
            globals()[f"_{name}"] = []

    # Rebuild next_ids from existing data
    users_list = list(_users.values()) if isinstance(_users, dict) else _users
    for col_name, store in [
        ("users",               users_list),
        ("gesture_history",     _gesture_history),
        ("notifications",       _notifications),
        ("emergency_contacts",  _emergency_contacts),
        ("system_logs",         _system_logs),
        ("chat_history",        _chat_history),
    ]:
        ids = [int(d["_id"]) for d in store if str(d.get("_id", "")).isdigit()]
        if ids:
            _next_ids[col_name] = max(ids)

    # Wire up collection objects
    users_col              = _UsersCol()
    devices_col            = _DevicesCol()
    gesture_history_col    = _Col("gesture_history",    lambda: _gesture_history)
    notifications_col      = _Col("notifications",      lambda: _notifications)
    emergency_contacts_col = _Col("emergency_contacts", lambda: _emergency_contacts)
    system_logs_col        = _Col("system_logs",        lambda: _system_logs)
    chat_history_col       = _Col("chat_history",       lambda: _chat_history)
    settings_col           = _SettingsCol()

    print("[DB] JSON file database loaded from:", DATA_DIR)



async def close_db():
    print("[DB] JSON database closed (no connection to close)")


# ── Specialised collection wrappers ───────────────────────────────────────────

class _UsersCol(_Col):
    """Users are stored as dict keyed by email for fast lookup."""
    def __init__(self):
        super().__init__("users", lambda: list(_users.values()))

    def _save(self):
        _save("users", _users)

    async def find_one(self, query=None):
        for doc in _users.values():
            if query is None or self._matches(doc, query):
                return dict(doc)
        return None

    async def insert_one(self, doc):
        doc = dict(doc)
        doc["_id"] = _next_id("users")
        _users[doc["_id"]] = doc
        self._save()
        return type("R", (), {"inserted_id": doc["_id"]})()

    async def update_one(self, query, update, upsert=False):
        for doc in _users.values():
            if self._matches(doc, query):
                if "$set" in update:
                    doc.update(update["$set"])
                break
        self._save()

    async def count_documents(self, query=None):
        if not query:
            return len(_users)
        return sum(1 for d in _users.values() if self._matches(d, query))

    async def create_index(self, *args, **kwargs):
        pass

    def find(self, query=None):
        return _Cursor(list(_users.values()), query)


class _DevicesCol(_Col):
    """Devices stored as a single flat dict with _id='main'."""
    def __init__(self):
        super().__init__("devices", lambda: _devices)

    def _save(self):
        _save("devices", _devices)

    async def find_one(self, query=None):
        if not _devices:
            return None
        return dict(_devices)

    async def insert_one(self, doc):
        _devices.update(doc)
        self._save()
        return type("R", (), {"inserted_id": doc.get("_id", "main")})()

    async def update_one(self, query, update, upsert=False):
        if "$set" in update:
            _devices.update(update["$set"])
        self._save()

    async def count_documents(self, query=None):
        return 1 if _devices else 0


class _SettingsCol(_Col):
    """Settings stored as a single flat dict."""
    def __init__(self):
        super().__init__("settings", lambda: _settings)

    def _save(self):
        _save("settings", _settings)

    async def find_one(self, query=None):
        return dict(_settings) if _settings else None

    async def insert_one(self, doc):
        _settings.update(doc)
        self._save()
        return type("R", (), {"inserted_id": doc.get("_id", "main")})()

    async def update_one(self, query, update, upsert=False):
        if "$set" in update:
            _settings.update(update["$set"])
        self._save()

    async def count_documents(self, query=None):
        return 1 if _settings else 0


# ── Seed default data ─────────────────────────────────────────────────────────
async def seed_data():
    # Default devices
    if await devices_col.count_documents({}) == 0:
        await devices_col.insert_one({
            "_id": "main",
            "livingLight": True,  "livingFan": True,   "livingTV": False,
            "livingCurtain": True,"livingSpeaker": False,
            "bedLight": False,    "bedAC": False,       "bedCurtain": False, "bedThermostat": False,
            "kidsLight": False,   "kidsCurtain": False, "kidsNightLight": True,
            "kitchenLight": False,"kitchenExhaust": False,
            "studyLight": False,  "studyMonitor": False,
            "bathLight": False,   "bathExhaust": False,
            "frontDoor": True,    "gateLight": False,   "alarm": True, "doorbell": True,
        })
        print("[DB] Default devices seeded")

    # Default admin user
    if await users_col.count_documents({}) == 0:
        await users_col.insert_one({
            "name": "Alex",
            "email": "admin@home.com",
            "password": hashlib.sha256("admin123".encode()).hexdigest(),
            "role": "admin",
            "phone": "",
            "created": datetime.now().strftime("%Y-%m-%d"),
        })
        print("[DB] Default admin user seeded")

    # Default emergency contacts
    if await emergency_contacts_col.count_documents({}) == 0:
        await emergency_contacts_col.insert_many([
            {"name": "Mom",       "phone": "+91 98765 43210", "relation": "Family"},
            {"name": "Dad",       "phone": "+91 87654 32109", "relation": "Family"},
            {"name": "Dr. Sharma","phone": "+91 76543 21098", "relation": "Doctor"},
        ])
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
