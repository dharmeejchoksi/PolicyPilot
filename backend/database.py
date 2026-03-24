"""
Database module for PolicyPilot — SQLite storage for users, OTPs, and sessions.
"""
import sqlite3
import os
import time
import random
import string

DB_PATH = os.path.join(os.path.dirname(__file__), "policypilot.db")


def get_db():
    """Get a database connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    """Initialize the database schema."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT UNIQUE,
            method TEXT NOT NULL DEFAULT 'phone',
            name TEXT,
            created_at REAL NOT NULL,
            last_login REAL
        );

        CREATE TABLE IF NOT EXISTS otps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT NOT NULL,
            otp_code TEXT NOT NULL,
            created_at REAL NOT NULL,
            expires_at REAL NOT NULL,
            verified INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            token TEXT UNIQUE NOT NULL,
            method TEXT NOT NULL,
            created_at REAL NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS query_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            description TEXT NOT NULL,
            categories TEXT,
            state TEXT,
            schemes_matched INTEGER DEFAULT 0,
            conflicts_found INTEGER DEFAULT 0,
            method TEXT DEFAULT 'text',
            created_at REAL NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_otps_phone ON otps(phone);
        CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    """)

    conn.commit()
    conn.close()
    print(f"✅ Database initialized at {DB_PATH}")


def generate_otp() -> str:
    """Generate a 6-digit OTP."""
    return ''.join(random.choices(string.digits, k=6))


def generate_token() -> str:
    """Generate a random session token."""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=32))


def store_otp(phone: str, otp_code: str) -> dict:
    """Store a new OTP for the given phone number."""
    conn = get_db()
    now = time.time()
    expires_at = now + 300  # 5 minutes validity

    # Invalidate any previous OTPs for this phone
    conn.execute("DELETE FROM otps WHERE phone = ? AND verified = 0", (phone,))

    conn.execute(
        "INSERT INTO otps (phone, otp_code, created_at, expires_at) VALUES (?, ?, ?, ?)",
        (phone, otp_code, now, expires_at)
    )
    conn.commit()
    conn.close()

    return {"phone": phone, "otp_code": otp_code, "expires_at": expires_at}


def verify_otp(phone: str, otp_code: str) -> dict:
    """Verify an OTP for the given phone number."""
    conn = get_db()
    now = time.time()

    row = conn.execute(
        "SELECT * FROM otps WHERE phone = ? AND otp_code = ? AND verified = 0 AND expires_at > ? ORDER BY created_at DESC LIMIT 1",
        (phone, otp_code, now)
    ).fetchone()

    if not row:
        conn.close()
        return {"success": False, "error": "Invalid or expired OTP"}

    # Mark OTP as verified
    conn.execute("UPDATE otps SET verified = 1 WHERE id = ?", (row["id"],))

    # Create or update user
    user = conn.execute("SELECT * FROM users WHERE phone = ?", (phone,)).fetchone()
    if not user:
        conn.execute(
            "INSERT INTO users (phone, method, created_at, last_login) VALUES (?, 'phone', ?, ?)",
            (phone, now, now)
        )
        user_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    else:
        user_id = user["id"]
        conn.execute("UPDATE users SET last_login = ? WHERE id = ?", (now, user_id))

    # Create session
    token = generate_token()
    conn.execute(
        "INSERT INTO sessions (user_id, token, method, created_at) VALUES (?, ?, 'phone', ?)",
        (user_id, token, now)
    )

    conn.commit()
    conn.close()

    return {
        "success": True,
        "token": token,
        "user": {"id": user_id, "phone": phone, "method": "phone"}
    }


def create_guest_session() -> dict:
    """Create a guest session (no user record needed)."""
    conn = get_db()
    now = time.time()
    token = generate_token()

    conn.execute(
        "INSERT INTO sessions (token, method, created_at) VALUES (?, 'guest', ?)",
        (token, now)
    )
    conn.commit()
    conn.close()

    return {
        "success": True,
        "token": token,
        "user": {"id": None, "phone": "Guest", "method": "guest"}
    }


def create_digilocker_session(phone: str = "DigiLocker") -> dict:
    """Create a DigiLocker session."""
    conn = get_db()
    now = time.time()

    user = conn.execute("SELECT * FROM users WHERE phone = ?", (phone,)).fetchone()
    if not user:
        conn.execute(
            "INSERT INTO users (phone, method, created_at, last_login) VALUES (?, 'digilocker', ?, ?)",
            (phone, now, now)
        )
        user_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    else:
        user_id = user["id"]

    token = generate_token()
    conn.execute(
        "INSERT INTO sessions (user_id, token, method, created_at) VALUES (?, ?, 'digilocker', ?)",
        (user_id, token, now)
    )
    conn.commit()
    conn.close()

    return {
        "success": True,
        "token": token,
        "user": {"id": user_id, "phone": phone, "method": "digilocker"}
    }


def log_query(user_id, description, categories, state, schemes_matched, conflicts_found, method="text"):
    """Log a citizen query for analytics."""
    conn = get_db()
    conn.execute(
        "INSERT INTO query_logs (user_id, description, categories, state, schemes_matched, conflicts_found, method, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (user_id, description, categories, state, schemes_matched, conflicts_found, method, time.time())
    )
    conn.commit()
    conn.close()


def get_stats() -> dict:
    """Get dashboard stats from the database."""
    conn = get_db()
    
    total_queries = conn.execute("SELECT COUNT(*) FROM query_logs").fetchone()[0]
    total_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    total_schemes_matched = conn.execute("SELECT COALESCE(SUM(schemes_matched), 0) FROM query_logs").fetchone()[0]
    total_conflicts = conn.execute("SELECT COALESCE(SUM(conflicts_found), 0) FROM query_logs").fetchone()[0]

    recent = conn.execute(
        "SELECT * FROM query_logs ORDER BY created_at DESC LIMIT 10"
    ).fetchall()

    conn.close()

    return {
        "total_queries": total_queries,
        "total_users": total_users,
        "total_schemes_matched": total_schemes_matched,
        "total_conflicts": total_conflicts,
        "recent_queries": [dict(r) for r in recent]
    }


# Initialize database on import
init_db()
