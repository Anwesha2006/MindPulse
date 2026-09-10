from langchain_groq import ChatGroq
from config import MOOD_SCALE_MIN,MOOD_SCALE_MAX,LLM_MODEL,LLM_TEMPERATURE,LLM_MAX_TOKENS
from typing import List
from langchain_core.prompts import ChatPromptTemplate
import json
import re
from pydantic import BaseModel,Field
SYSTEM_PROMPT=("""You are a data extraction assistant for a mental wellness check-in app. 
Your job is to analyze a user's check-in text and extract structured data. 
You do not chat, comfort, advise, or respond conversationally — you only extract data.

Given the user's check-in text, output a JSON object with exactly these fields:

1. "mood_score": an integer from {MOOD_SCALE_MIN} to {MOOD_SCALE_MAX}, 
   where {MOOD_SCALE_MIN} represents very low/negative mood and {MOOD_SCALE_MAX} represents very positive mood.
   Base this on the emotional tone of the text, not just keywords.

2. "tags": a list of 1-5 short lowercase theme labels describing what the text is about 
   (e.g., "work stress", "sleep", "relationships", "anxiety", "gratitude", "family").
   Only include themes that are clearly present in the text.

3. "risk_flag": a boolean. Set this to true ONLY if the text contains explicit or strong 
   indications of self-harm, suicidal ideation, or intent to harm oneself or others. 
   Set to false otherwise. Err on the side of true if uncertain.

Rules:
- Do not add fields beyond the three specified.
- If the text is too short or unclear to assess, use your best reasonable judgment rather than leaving fields empty.
- Never refuse to extract data, even for difficult or emotional content — your role is analysis, not response.
""").format(MOOD_SCALE_MIN=MOOD_SCALE_MIN, MOOD_SCALE_MAX=MOOD_SCALE_MAX)

class MoodExtractor(BaseModel):
    mood_score: int=Field(...,alias="mood_score")
    tags: List[str]=Field(...,alias="tags")
    risk_flag: bool=Field(...,alias="risk_flag")

def build_mood_extractor():
    llm=ChatGroq(
        model=LLM_MODEL,
        temperature=LLM_TEMPERATURE,
        max_tokens=LLM_MAX_TOKENS,
    )
    structured_llm=llm.with_structured_output(MoodExtractor)
    prompt=ChatPromptTemplate.from_messages(
        [
        ("system",SYSTEM_PROMPT),
        ("human","{text}"),
        ]
        )
    return prompt|structured_llm
def run_mood_extractor(text)->dict:
    chain=build_mood_extractor()
    try:
        response:MoodExtractor=chain.invoke({"text":text})
        return response.model_dump()
    except Exception as e:
      raise RuntimeError(f"Mood extraction failed: {e}")
