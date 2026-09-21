import { api } from "@/lib/api";
import { getUserId } from "../actions";
import { redirect } from "next/navigation";
import { format, parseISO } from "date-fns";
import { MoodLineChart } from "@/components/trends/mood-line-chart";
import { TagBarChart } from "@/components/trends/tag-bar-chart";
import { TrendSummary } from "@/components/trends/trend-summary";
import { getMoodColor, getMoodLabel } from "@/lib/mood";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default async function TrendsPage() {
  const userId = await getUserId();
  
  if (!userId) {
    redirect("/welcome");
  }

  // Fetch data
  const [entries, trends] = await Promise.all([
    api.getEntries(userId, 100).catch(() => []),
    api.getTrends(userId, 30).catch(() => null), // last 30 days
  ]);

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 max-w-4xl flex flex-col gap-8">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Your Trends</h1>
        <Link href="/" className={buttonVariants({ variant: "outline", className: "rounded-full" })}>
          Back to Dashboard
        </Link>
      </header>

      {(!trends || !trends.has_enough_data) ? (
        <Card className="border-dashed bg-transparent shadow-none">
          <CardContent className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🌱</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Keep checking in</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              We need a few more check-ins to start showing your mood trends and recurring themes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <TrendSummary data={trends} />
          </div>

          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Mood over time</h2>
              <MoodLineChart entries={entries} />
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-2">Frequent themes</h2>
              <p className="text-sm text-muted-foreground mb-6">Topics that come up most often in your check-ins</p>
              <TagBarChart tags={trends.top_tags || []} />
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6 mt-4">History</h2>
        {entries.length === 0 ? (
          <p className="text-muted-foreground">No entries yet.</p>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <Card key={entry.id} className="overflow-hidden">
                <CardContent className="p-0 flex flex-col sm:flex-row">
                  <div className="p-4 sm:w-48 bg-muted/20 border-r border-border flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-4">
                    <div>
                      <p className="font-semibold">{format(parseISO(entry.timestamp), 'MMM d, yyyy')}</p>
                      <p className="text-sm text-muted-foreground">{format(parseISO(entry.timestamp), 'h:mm a')}</p>
                    </div>
                    {entry.mood_score && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: getMoodColor(entry.mood_score) }}
                        />
                        <span className="font-medium text-sm">{getMoodLabel(entry.mood_score)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1">
                    <p className="text-ink mb-4 whitespace-pre-wrap leading-relaxed">{entry.raw_text}</p>
                    {entry.tags && (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                          <span key={tag} className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
