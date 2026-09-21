"use client";

import { TrendData } from "@/lib/schemas";

export function TrendSummary({ data }: { data: TrendData }) {
  if (!data.has_enough_data) return null;

  return (
    <div className="space-y-4">
      {data.mood_improving && (
        <div className="p-4 bg-accent-3/20 rounded-2xl border border-accent-3/30">
          <p className="text-lg text-ink font-medium">Your mood has been steadily improving lately. It's great to see things looking up.</p>
        </div>
      )}

      {data.mood_declining && (
        <div className="p-4 bg-muted/30 rounded-2xl border border-border">
          <p className="text-lg text-ink">Your mood has been lower this week than last.</p>
        </div>
      )}

      {data.low_mood_streak_flag && (
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-sm">
          <p className="text-lg text-ink">It looks like you've been having a tough time for a few days. Be gentle with yourself.</p>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              If things feel overwhelming, <a href="tel:988" className="underline text-ink font-medium hover:text-accent-foreground transition-colors">support is always available</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
