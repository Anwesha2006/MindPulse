"use client";

import { CheckinResult } from "@/lib/schemas";

export function CrisisPanel({ result }: { result: CheckinResult }) {
  // 1. Replace the normal reply UI
  // 2. Display the reply string verbatim
  // 3. Calm, full-width panel
  // 4. Phone numbers as tel: links (we can just render the text, browsers auto-link tel, or we can use a basic regex if strictly needed)

  // Simple regex to make 988 clickable
  const renderMessage = (text: string) => {
    const parts = text.split(/(988)/);
    return parts.map((part, i) => 
      part === "988" ? <a key={i} href="tel:988" className="underline font-semibold">988</a> : part
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-surface p-8 md:p-12 rounded-3xl shadow-sm border border-border">
        <div className="whitespace-pre-wrap text-lg md:text-xl leading-relaxed text-ink">
          {renderMessage(result.reply)}
        </div>
      </div>
    </div>
  );
}
