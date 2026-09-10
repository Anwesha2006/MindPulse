import sqlite3
from pathlib import Path
from config import BASE_DIR
DATABASE_PATH=BASE_DIR/'mindpulse.db'

def get_db_connection():
    connection=sqlite3.connect(str(DATABASE_PATH))
    connection.row_factory=sqlite3.Row
    return connection

def init_db():
    conn=get_db_connection()
    cursor=conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            raw_text TEXT NOT NULL,
            mood_score INTEGER,
            tags TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    conn.commit()
    conn.close()
def add_user(name):
    conn=get_db_connection()
    cursor=conn.cursor()
    cursor.execute("INSERT INTO users (name) VALUES (?)",(name,))
    conn.commit()
    user_id=cursor.lastrowid
    conn.close()
    return user_id

def add_entries(user_id,raw_text,mood_score=None,tags=None):
    conn=get_db_connection()
    cursor=conn.cursor()
    cursor.execute("""INSERT INTO entries (user_id,raw_text,mood_score,tags) VALUES (?,?,?,?)""",(user_id,raw_text,mood_score,tags))
    conn.commit()
    entry_id=cursor.lastrowid
    conn.close()
    return user_id
def get_recent_entries(user_id,limit=5):
    conn=get_db_connection()
    cursor= conn.cursor()
    cursor.execute(""" SELECT * FROM entries
        WHERE user_id = ?
        ORDER BY timestamp DESC
        LIMIT ?""",(user_id,limit))
    rows=cursor.fetchall()
    conn.close()
    return rows
def get_entries_since(user_id,days):
    conn=get_db_connection()
    cursor= conn.cursor()
    cursor.execute("""SELECT * FROM entries
        WHERE user_id = ?
          AND timestamp >= datetime('now', ?)
        ORDER BY timestamp ASC """,(user_id,f"-{days} days"))
    rows=cursor.fetchall()
    conn.close()
    return rows