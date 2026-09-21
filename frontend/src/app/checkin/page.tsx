import { api } from "@/lib/api";
import { getUserId } from "../actions";
import { redirect } from "next/navigation";
import { CheckinFlow } from "@/components/checkin/checkin-flow";

export default async function CheckinPage() {
  const userId = await getUserId();
  
  if (!userId) {
    redirect("/welcome");
  }

  // Fetch questions from backend
  let questions: string[] = [];
  try {
    const res = await api.questions();
    questions = res.questions;
  } catch (error) {
    // Fallback if API fails to load questions
    questions = [
      "How are you feeling today?",
      "Is there anything on your mind?",
      "What's one thing you'd like to focus on?"
    ];
  }

  return (
    <main className="flex-1 flex flex-col bg-bg min-h-screen">
      <CheckinFlow questions={questions} userId={userId} />
    </main>
  );
}
