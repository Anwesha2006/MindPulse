from config import MEMORY_WINDOW,CHECKIN_QUESTIONS
from database import recent_entries,add_entries
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

def run_checkin(user_id):
    recent_entries=get_recent_entries(user_id,limit=MEMORY_WINDOW)
    responses=[]
    for question in CHECKIN_QUESTIONS:
        answer=input(question+" ")
        responses.append(answer)
    combined_text=" ".join(responses)
    mood_result= run_mood_extractor(combined_text)
    return mood_result
    if not in risk_flag:
        return add_entries(user_id,mood_result["mood_score"],mood_result["tags"],combined_text)
    else:
        return add_entries(user_id,mood_result["mood_score"],mood_result["tags"],combined_text)
llm=ChatGroq(model=LLM_MODEL,temperature=LLM_TEMPERATURE,max_tokens=LLM_MAX_TOKENS)
prompt=ChatPromptTemplate.from_messages([("system",SYSTEM_PROMPT),("human","{text}"),("ai","{mood_result}")])
return prompt|llm