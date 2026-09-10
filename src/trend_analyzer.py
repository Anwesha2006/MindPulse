import pandas as pd
from collections import Counter

from config import TREND_LOOKBACK_DAYS
from database import get_entries_since

# --- Thresholds (tweak as needed) ---
MOOD_DECLINE_THRESHOLD = 1.5   # drop in rolling average to flag as "declining"
LOW_MOOD_STREAK_LENGTH = 3     # consecutive low entries to flag a streak
LOW_MOOD_CUTOFF = 4            # score at/below this counts as "low"
RECURRING_TAG_THRESHOLD = 0.4  # tag appears in >=40% of entries to flag as recurring


def _rows_to_dataframe(rows):
    """Convert sqlite3.Row objects into a pandas DataFrame."""
    data = [dict(row) for row in rows]
    df = pd.DataFrame(data)
    if not df.empty:
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp").reset_index(drop=True)
    return df


def _tag_counts(df):
    """Count tag frequency across all entries in the window."""
    counter = Counter()
    for tags_str in df["tags"].dropna():
        tags = [t.strip() for t in tags_str.split(",") if t.strip()]
        counter.update(tags)
    return counter


def analyze_trends(user_id, days=None):
    """
    Analyze mood/tag trends for a user over the given lookback window.
    Returns a structured dict — no natural language, just facts and flags.
    """
    days = days or TREND_LOOKBACK_DAYS
    rows = get_entries_since(user_id, days)
    df = _rows_to_dataframe(rows)

    if df.empty or len(df) < 2:
        return {
            "has_enough_data": False,
            "entry_count": len(df),
        }

    # --- Mood trend ---
    midpoint = len(df) // 2
    first_half_avg = df["mood_score"].iloc[:midpoint].mean()
    second_half_avg = df["mood_score"].iloc[midpoint:].mean()
    mood_change = second_half_avg - first_half_avg

    if mood_change <= -MOOD_DECLINE_THRESHOLD:
        direction = "declining"
    elif mood_change >= MOOD_DECLINE_THRESHOLD:
        direction = "improving"
    else:
        direction = "flat"

    rolling_avg = df["mood_score"].rolling(window=min(3, len(df))).mean().iloc[-1]

    # --- Low mood streak detection ---
    low_streak = 0
    max_low_streak = 0
    for score in df["mood_score"]:
        if score <= LOW_MOOD_CUTOFF:
            low_streak += 1
            max_low_streak = max(max_low_streak, low_streak)
        else:
            low_streak = 0

    low_mood_streak_flag = max_low_streak >= LOW_MOOD_STREAK_LENGTH

    # --- Recurring tags ---
    tag_counts = _tag_counts(df)
    total_entries = len(df)
    recurring_tags = [
        tag for tag, count in tag_counts.items()
        if (count / total_entries) >= RECURRING_TAG_THRESHOLD
    ]
    top_tags = tag_counts.most_common(5)

    return {
        "has_enough_data": True,
        "entry_count": total_entries,
        "current_rolling_avg": round(rolling_avg, 2),
        "first_half_avg": round(first_half_avg, 2),
        "second_half_avg": round(second_half_avg, 2),
        "mood_direction": direction,
        "mood_declining": direction == "declining",
        "mood_improving": direction == "improving",
        "low_mood_streak_flag": low_mood_streak_flag,
        "max_low_streak_length": max_low_streak,
        "recurring_tags": recurring_tags,
        "top_tags": top_tags,
    }