from config import MEMORY_WINDOW,CHECKIN_QUESTIONS,LLM_MODEL,LLM_TEMPERATURE,LLM_MAX_TOKENS
from database import get_recent_entries,add_entries
from mood_extractor import run_mood_extractor
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

SYSTEM_PROMPT="""You are a warm, supportive check-in companion for a mental wellness app.
You are NOT a therapist and do not give clinical advice or diagnoses.
Respond briefly and empathetically to what the user shared.
If relevant, you may gently reference their recent check-in history to show continuity.
Keep your response conversational, kind, and under 4 sentences."""

CRISIS_MESSAGE = (
    "It sounds like you might be going through something really heavy right now. "
    "I'm not able to provide crisis support myself, but please reach out to people who can help:\n\n"
    "- If you're in the US: call or text 988 (Suicide & Crisis Lifeline)\n"
    "- If you're elsewhere: please contact your local emergency number or a crisis line in your country\n\n"
    "You don't have to go through this alone."
)

def build_checkin():
    llm = ChatGroq(
    model=LLM_MODEL,
    temperature=LLM_TEMPERATURE,
    max_tokens=LLM_MAX_TOKENS,
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", "Recent history: {history}\n\nToday's check-in: {text}"),
    ])
    return prompt | llm
def format_history(entries):
    if not entries:
        return "No previous entries."
    return "\n".join([f"{row['timestamp']}: mood {row['mood_score']}, tags: {row['tags']}" for row in entries])
def process_checkin(user_id,combined_text):
    history_entries=get_recent_entries(user_id,limit=MEMORY_WINDOW)
    history_text=format_history(history_entries)
    mood_result= run_mood_extractor(combined_text)
    tags_string=", ".join(mood_result["tags"])
    add_entries(
    user_id=user_id,
    raw_text=combined_text,
    mood_score=mood_result["mood_score"],
    tags=tags_string,
    )
    if mood_result["risk_flag"]:
        return{
            "reply": CRISIS_MESSAGE,
            "mood_score": mood_result["mood_score"],
            "tags": mood_result["tags"],
            "risk_flag": True
        }
    chain=build_checkin()
    response=chain.invoke({"text":combined_text,"history":history_text})
    return {
        "reply": response.content,
        "mood_score": mood_result["mood_score"],
        "tags": mood_result["tags"],
        "risk_flag": False
    }
def run_checkin_cli(user_id):
    responses=[]
    for question in CHECKIN_QUESTIONS:
        answer=input(question+" ")
        responses.append(answer)
    combined_text=" ".join(responses)
    return process_checkin(user_id, combined_text)