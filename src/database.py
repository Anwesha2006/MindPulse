import sqlite3
from pathlib import Path
from config import BASE_DIR
DATABASE_PATH=BASE_DIR/'mindpulse.db'

def get_db_connection():
    connection=sqlite3.connect(str(DATABASE_PATH))
    connection.row_factory=sqlite3.Row
    return connection

def create_table():
    conn=get_db_connection()
    cursor=conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users
    (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS entries
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mood_score TEXT NOT NULL,
    stress_level INTEGER,
    tags TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
    )
    ''')
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

def add_entries(user_id,mood_score=None,tags=None,message):
     conn=get_db_connection()
    cursor=conn.cursor()
    cursor.execute("""INSERT INTO entries (user_id,mood_score,tags,message) VALUES (?,?,?,?)""",(user_id,mood_score,tags,message))
    conn.commit()
    entry_id=cursor.lastrowid
    conn.close()
    return user_id
def get_recent_entries(user_id,limit=5):
    conn=get_db_connection()
    cursor= conn.cursor()
    cursor.execute("""SELECT * FROM entries WHERE USER_ID=? ORDER BY timestamp DESC LIMIT=?""",(user_id,limit))
    rows=cursor.fetchall()
    conn.close()
    return rows
def get_entries_since(user_id,days):
      conn=get_db_connection()
    cursor= conn.cursor()
    cursor.execute("""SELECT * FROM entries WHERE USER_ID=> AND timestamp>=datetime('now',?) ORDER BY timestamp ASC """,(f"-{days} days",user_id))
    rows=cursor.fetchall()
    conn.close()
    return rows