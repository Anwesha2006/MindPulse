import sys
from pathlib import Path

# Add the src/ folder itself to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent / "src"))

from database import init_db, add_user, add_entries, get_recent_entries

init_db()
uid = add_user("Test User")
add_entries(uid, "Feeling okay today", mood_score=6, tags="work, sleep")
for row in get_recent_entries(uid):
    print(dict(row))