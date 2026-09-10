import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent / "src"))
from database import add_entries
from trend_analyzer import analyze_trends

uid = 11  # use your real user_id

# Insert a few fake entries so trend analysis has data to work with
add_entries(uid, "Feeling stressed about work", mood_score=4, tags="work stress, sleep")
add_entries(uid, "A bit better today", mood_score=5, tags="work stress")
add_entries(uid, "Really anxious about deadlines", mood_score=3, tags="work stress, anxiety")
add_entries(uid, "Had a good day, relaxed", mood_score=7, tags="gratitude")

print(analyze_trends(uid))