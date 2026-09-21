"""
MindPulse API — transport layer over the existing Python backend.

This file contains NO business logic. Mood extraction, the crisis branch,
and trend math all live in src/. This only exposes them over HTTP.

Run from the project root:
    uvicorn api.main:app --reload --port 8000
"""

import sys
from pathlib import Path
from typing import List, Optional, Tuple

# Make src/ importable (matches how the rest of the project imports)
sys.path.append(str(Path(__file__).resolve().parent.parent / "src"))

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import CHECKIN_QUESTIONS, MEMORY_WINDOW, TREND_LOOKBACK_DAYS
from database import init_db, add_user, get_recent_entries
from checkin_agent import process_checkin
from trend_analyzer import analyze_trends

app = FastAPI(title="MindPulse API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    """Ensure tables exist before serving any request."""
    init_db()


# ---------------------------------------------------------------- schemas

class CreateUserRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class CreateUserResponse(BaseModel):
    user_id: int


class CheckinRequest(BaseModel):
    user_id: int
    text: str = Field(..., min_length=1)


class CheckinResponse(BaseModel):
    reply: str
    mood_score: int
    tags: List[str]
    risk_flag: bool


class EntryResponse(BaseModel):
    id: int
    user_id: int
    timestamp: str
    raw_text: str
    mood_score: Optional[int] = None
    tags: Optional[str] = None


class TrendResponse(BaseModel):
    has_enough_data: bool
    entry_count: int
    current_rolling_avg: Optional[float] = None
    first_half_avg: Optional[float] = None
    second_half_avg: Optional[float] = None
    mood_direction: Optional[str] = None
    mood_declining: Optional[bool] = None
    mood_improving: Optional[bool] = None
    low_mood_streak_flag: Optional[bool] = None
    max_low_streak_length: Optional[int] = None
    recurring_tags: Optional[List[str]] = None
    top_tags: Optional[List[Tuple[str, int]]] = None


class QuestionsResponse(BaseModel):
    questions: List[str]


# ---------------------------------------------------------------- routes

@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/questions", response_model=QuestionsResponse)
def questions():
    """Check-in questions, so the frontend doesn't hardcode them."""
    return {"questions": CHECKIN_QUESTIONS}


@app.post("/api/users", response_model=CreateUserResponse, status_code=201)
def create_user(body: CreateUserRequest):
    try:
        user_id = add_user(body.name.strip())
    except Exception:
        raise HTTPException(status_code=500, detail="Could not create the account. Try again.")
    return {"user_id": user_id}


@app.post("/api/checkin", response_model=CheckinResponse)
def checkin(body: CheckinRequest):
    """
    Runs the full check-in pipeline. Takes 2-5s (two sequential LLM calls).

    The crisis branch is decided inside process_checkin(). This endpoint
    passes `reply` through untouched — it must not be edited or templated here.
    """
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Check-in text cannot be empty.")

    try:
        result = process_checkin(body.user_id, body.text.strip())
    except RuntimeError:
        # Raised by run_mood_extractor when the LLM call or parse fails
        raise HTTPException(
            status_code=503,
            detail="Couldn't process your check-in right now. Your entry wasn't saved — please try again.",
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong processing your check-in.")

    return result


@app.get("/api/entries", response_model=List[EntryResponse])
def entries(
    user_id: int = Query(...),
    limit: int = Query(MEMORY_WINDOW, ge=1, le=200),
):
    try:
        rows = get_recent_entries(user_id, limit=limit)
    except Exception:
        raise HTTPException(status_code=500, detail="Could not load your entries.")
    return [dict(row) for row in rows]


@app.get("/api/trends", response_model=TrendResponse)
def trends(
    user_id: int = Query(...),
    days: int = Query(TREND_LOOKBACK_DAYS, ge=1, le=365),
):
    try:
        return analyze_trends(user_id, days=days)
    except Exception:
        raise HTTPException(status_code=500, detail="Could not load your trends.")