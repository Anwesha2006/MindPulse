"use client";

import { useState } from "react";
import { CheckinResult } from "@/lib/schemas";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CrisisPanel } from "./crisis-panel";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMoodColor, getMoodLabel } from "@/lib/mood";

export function CheckinFlow({ questions, userId }: { questions: string[], userId: number }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(""));
  const [currentText, setCurrentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isComplete = currentIndex >= questions.length;
  
  const handleNext = async () => {
    if (!currentText.trim()) return;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = currentText;
    setAnswers(newAnswers);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentText(newAnswers[currentIndex + 1] || "");
    } else {
      // Submit
      setIsSubmitting(true);
      setError(null);
      const combinedText = newAnswers.join(" ");
      try {
        const res = await api.checkin(userId, combinedText);
        setResult(res);
      } catch (err: any) {
        setError(err.message || "Failed to process check-in.");
        // Revert index to let them try again with their text intact
        setCurrentIndex(questions.length - 1);
        setCurrentText(newAnswers[questions.length - 1]);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (result) {
    if (result.risk_flag) {
      return <CrisisPanel result={result} />;
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8 border-none shadow-sm bg-surface">
          <div className="mb-6 flex justify-center">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-sm"
              style={{ backgroundColor: getMoodColor(result.mood_score) }}
            >
              {result.mood_score}/10
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4 text-ink">
            {getMoodLabel(result.mood_score)}
          </h2>
          
          <div className="text-muted-foreground text-lg mb-8 italic">
            "{result.reply}"
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {result.tags.map(t => (
              <span key={t} className="px-3 py-1 bg-muted rounded-full text-sm">
                {t}
              </span>
            ))}
          </div>

          <Button onClick={() => router.push("/")} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
            Back to dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        <p className="text-xl text-muted-foreground animate-pulse">Thinking...</p>
      </div>
    );
  }

  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4 pt-12 md:pt-24">
      <div className="mb-8 space-y-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentIndex + 1} of {questions.length}</span>
        </div>
        <Progress value={progress} className="h-2 bg-muted/50" />
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-ink">
          {questions[currentIndex]}
        </h2>

        <textarea
          autoFocus
          className="flex-1 w-full p-4 text-lg bg-transparent border-none resize-none focus:outline-none focus:ring-0"
          placeholder="Type your thoughts here..."
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
        />

        {error && <p className="text-destructive font-medium">{error}</p>}

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => {
              if (currentIndex > 0) {
                const newAnswers = [...answers];
                newAnswers[currentIndex] = currentText;
                setAnswers(newAnswers);
                setCurrentIndex(currentIndex - 1);
                setCurrentText(newAnswers[currentIndex - 1]);
              }
            }}
            disabled={currentIndex === 0}
          >
            Back
          </Button>

          <Button 
            onClick={handleNext} 
            disabled={!currentText.trim()}
            className="bg-accent text-accent-foreground hover:bg-accent/90 px-8"
            size="lg"
          >
            {currentIndex === questions.length - 1 ? "Complete Check-in" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
