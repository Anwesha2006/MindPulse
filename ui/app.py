import sys
from pathlib import Path

# Allow importing from src/ when running via `streamlit run ui/app.py`
sys.path.append(str(Path(__file__).resolve().parent.parent / "src"))

import streamlit as st
import pandas as pd

from database import init_db, add_user, get_recent_entries
from checkin_agent import process_checkin
from trend_analyzer import analyze_trends

st.set_page_config(page_title="MindPulse", page_icon="🧠")

# --- Initialize DB on first run ---
init_db()

# --- Simple session state for user ---
if "user_id" not in st.session_state:
    st.session_state.user_id = None

st.title("🧠 MindPulse — Mental Wellness Check-In")

# --- User setup ---
if st.session_state.user_id is None:
    name = st.text_input("What's your name?")
    if st.button("Start") and name.strip():
        st.session_state.user_id = add_user(name.strip())
        st.rerun()
    st.stop()

tab_checkin, tab_trends = st.tabs(["Check-In", "Trends"])

# --- CHECK-IN TAB ---
with tab_checkin:
    st.subheader("How are you doing today?")

    from config import CHECKIN_QUESTIONS

    if "answers" not in st.session_state:
        st.session_state.answers = {}

    for question in CHECKIN_QUESTIONS:
        st.session_state.answers[question] = st.text_area(
            question, value=st.session_state.answers.get(question, "")
        )

    if st.button("Submit Check-In"):
        combined_text = " ".join(
            a for a in st.session_state.answers.values() if a.strip()
        )

        if not combined_text.strip():
            st.warning("Please share at least a little about how you're feeling.")
        else:
            with st.spinner("Reflecting on your check-in..."):
                result = process_checkin(st.session_state.user_id, combined_text)

            if result["risk_flag"]:
                st.error(result["reply"])
            else:
                st.success(result["reply"])
                st.caption(f"Mood score: {result['mood_score']}/10 · Tags: {', '.join(result['tags'])}")

            st.session_state.answers = {}  # reset for next time

# --- TRENDS TAB ---
with tab_trends:
    st.subheader("Your Recent Trends")

    trend_data = analyze_trends(st.session_state.user_id)

    if not trend_data["has_enough_data"]:
        st.info("Not enough check-ins yet to show trends. Keep checking in!")
    else:
        col1, col2, col3 = st.columns(3)
        col1.metric("Current Avg Mood", trend_data["current_rolling_avg"])
        col2.metric("Direction", trend_data["mood_direction"].capitalize())
        col3.metric("Entries", trend_data["entry_count"])

        if trend_data["mood_declining"]:
            st.warning("Your mood has been trending down recently.")
        elif trend_data["mood_improving"]:
            st.success("Your mood has been trending up recently!")

        if trend_data["low_mood_streak_flag"]:
            st.warning(
                f"You've had {trend_data['max_low_streak_length']} consecutive lower-mood check-ins."
            )

        if trend_data["recurring_tags"]:
            st.write("**Recurring themes:**", ", ".join(trend_data["recurring_tags"]))

        if trend_data["top_tags"]:
            tag_df = pd.DataFrame(trend_data["top_tags"], columns=["Tag", "Count"])
            st.bar_chart(tag_df.set_index("Tag"))

        # Mood history chart
        entries = get_recent_entries(st.session_state.user_id, limit=30)
        if entries:
            hist_df = pd.DataFrame([dict(e) for e in entries])
            hist_df["timestamp"] = pd.to_datetime(hist_df["timestamp"])
            hist_df = hist_df.sort_values("timestamp")
            st.line_chart(hist_df.set_index("timestamp")["mood_score"])