import { getUserId } from "./actions";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { isToday, parseISO } from "date-fns";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMoodColor, getMoodLabel } from "@/lib/mood";

export default async function Dashboard() {
  const userId = await getUserId();
  
  if (!userId) {
    redirect("/welcome");
  }

  // Fetch data
  const [entries, trends] = await Promise.all([
    api.getEntries(userId, 7).catch(() => []),
    api.getTrends(userId).catch(() => null),
  ]);

  // Determine greeting
  const hour = new Date().getHours();
  let greetingTime = "evening";
  if (hour < 12) greetingTime = "morning";
  else if (hour < 17) greetingTime = "afternoon";

  // Check if checked in today
  const todayEntry = entries.find(e => isToday(parseISO(e.timestamp)));
  
  // Format date
  const dateStr = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  }).format(new Date());

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 max-w-5xl flex flex-col gap-6">
      {/* Header */}
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Good {greetingTime}</h1>
          <p className="text-muted-foreground">{dateStr}</p>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Check-in Hero Card (Primary CTA) */}
        <Card className={`md:col-span-1 md:row-span-2 overflow-hidden flex flex-col ${todayEntry ? 'bg-secondary' : 'bg-primary'}`}>
          <CardContent className="p-6 flex-1 flex flex-col justify-center gap-6">
            {todayEntry ? (
              <>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Checked in today</h2>
                  <p className="text-secondary-foreground/80 opacity-90 line-clamp-4">
                    {/* The API doesn't store the agent reply, only user raw_text. 
                        We can show what they wrote, or just a success message */}
                    "You've logged your thoughts for today."
                  </p>
                </div>
                <div className="mt-auto pt-6 flex flex-wrap gap-2">
                  {todayEntry.tags?.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/50 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4 text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-4xl">✨</span>
                  </div>
                  <h2 className="text-2xl font-bold">How are you feeling?</h2>
                  <p className="opacity-90">Take a moment to check in with yourself today.</p>
                </div>
                <Link href="/checkin" className={buttonVariants({ size: "lg", className: "w-full mt-auto bg-black text-white hover:bg-black/80 rounded-full" })}>
                  Start Check-in
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        {/* Today's Mood */}
        <Card>
          <CardContent className="p-6 flex flex-col h-full justify-between">
            <h3 className="font-semibold text-muted-foreground mb-4">Today's mood</h3>
            {todayEntry?.mood_score ? (
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm"
                  style={{ backgroundColor: getMoodColor(todayEntry.mood_score) }}
                >
                  {todayEntry.mood_score}/10
                </div>
                <div>
                  <div className="text-xl font-bold">{getMoodLabel(todayEntry.mood_score)}</div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>No entry yet today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mood History (Last 7) */}
        <Card>
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-muted-foreground">Recent</h3>
              <Link href="/trends" className={buttonVariants({ variant: "link", className: "p-0 h-auto" })}>
                View all
              </Link>
            </div>
            
            {entries.length > 0 ? (
              <div className="flex justify-between items-end mt-auto gap-2">
                {/* Take up to 7 most recent entries, reverse to show oldest to newest left to right */}
                {entries.slice(0, 7).reverse().map((entry, i) => (
                  <div key={entry.id || i} className="flex flex-col items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: entry.mood_score ? getMoodColor(entry.mood_score) : '#EAEAEC' }}
                      title={entry.mood_score ? `${entry.mood_score}/10` : 'No score'}
                    />
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'narrow' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>No history yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recurring Themes */}
        {(trends?.recurring_tags && trends.recurring_tags.length > 0) ? (
          <Card className="md:col-span-1 bg-accent-3/30 border-transparent">
            <CardContent className="p-6 h-full flex flex-col justify-center">
              <h3 className="font-semibold text-muted-foreground mb-4">Recurring themes</h3>
              <div className="flex flex-wrap gap-2">
                {trends.recurring_tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white rounded-full text-sm font-medium shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
           <Card className="md:col-span-1 border-dashed">
            <CardContent className="p-6 h-full flex items-center justify-center text-center">
              <p className="text-muted-foreground text-sm">Themes will appear as you check in more often.</p>
            </CardContent>
          </Card>
        )}

        {/* Mood Trend Chart */}
        <Card className="md:col-span-1">
          <CardContent className="p-6 h-full flex flex-col">
            <h3 className="font-semibold text-muted-foreground mb-4">Trend</h3>
            {trends?.has_enough_data ? (
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{trends.current_rolling_avg?.toFixed(1)}</span>
                  <span className="text-muted-foreground">avg</span>
                </div>
                <p className="text-sm mt-1 text-muted-foreground">
                  {trends.mood_direction === 'improving' && "Trending up"}
                  {trends.mood_direction === 'declining' && "Trending down"}
                  {trends.mood_direction === 'flat' && "Holding steady"}
                </p>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-center">
                <p className="text-sm">More data needed for trends</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
