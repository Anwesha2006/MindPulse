"use client";

import { Entry } from "@/lib/schemas";
import { format, parseISO } from "date-fns";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function MoodLineChart({ entries }: { entries: Entry[] }) {
  // Sort oldest to newest for chart
  const data = [...entries].reverse().map(e => ({
    date: format(parseISO(e.timestamp), 'MMM d'),
    score: e.mood_score
  })).filter(d => d.score !== null);

  if (data.length < 2) return null;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEC" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B6B66', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            domain={[1, 10]} 
            ticks={[1, 5, 10]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B6B66', fontSize: 12 }}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            cursor={{ stroke: '#EAEAEC', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#1C1C1A" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#1C1C1A', strokeWidth: 0 }} 
            activeDot={{ r: 6, fill: '#C8E063' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
