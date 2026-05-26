import { z } from "zod";

export const createGoalSchema = z.object({
  title: z.string().min(2),
  metric: z.string().min(2),
  progress: z.number().min(0).max(100).default(0),
  targetDate: z.string().min(2)
});
