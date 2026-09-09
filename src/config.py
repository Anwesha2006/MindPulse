import os
from pathlib import Path
from dotenv import load_dotenv()

load_dotenv()
BASE_DIR=Path(__file__).resolve().parent
GROQ_API_KEY =os.getenv("GROQ_API_KEY")

LLM_PROVIDER=groq
LLM_MODEL=openai/gpt-oss-20b
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=500
 
MOOD_SCALE_MAX=1
MOOD_SCALE_MAX=10

MEMORY_WINDOW=5
TREND_LOOKBACK_DAYS=7

CHECKIN_QUESTIONS=[
    "How are you feeling today?",
    "What's been on your mind lately?",
    "Is there anything that's been stressing you out?",
    "What's one good thing that happened today?",
]
