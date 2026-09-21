import { z } from "zod";

export const EntrySchema = z.object({
  id: z.number(),
  user_id: z.number(),
  timestamp: z.string(),
  raw_text: z.string(),
  mood_score: z.number().nullable(),
  tags: z.string().nullable(),
});
export type Entry = z.infer<typeof EntrySchema>;

export const CheckinResultSchema = z.object({
  reply: z.string(),
  mood_score: z.number(),
  tags: z.array(z.string()),
  risk_flag: z.boolean(),
});
export type CheckinResult = z.infer<typeof CheckinResultSchema>;

export const TrendDataSchema = z.object({
  has_enough_data: z.boolean(),
  entry_count: z.number(),
  current_rolling_avg: z.number().optional().nullable(),
  first_half_avg: z.number().optional().nullable(),
  second_half_avg: z.number().optional().nullable(),
  mood_direction: z.enum(["declining", "improving", "flat"]).optional().nullable(),
  mood_declining: z.boolean().optional().nullable(),
  mood_improving: z.boolean().optional().nullable(),
  low_mood_streak_flag: z.boolean().optional().nullable(),
  max_low_streak_length: z.number().optional().nullable(),
  recurring_tags: z.array(z.string()).optional().nullable(),
  top_tags: z.array(z.tuple([z.string(), z.number()])).optional().nullable(),
});
export type TrendData = z.infer<typeof TrendDataSchema>;
