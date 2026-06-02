import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().default(""),
  category: z.string().min(1).default("Personal"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
  schedule: z.enum(["today", "tomorrow", "future", "weekend", "recurring"]).default("today"),
  recurrence: z.enum(["none", "daily", "weekly", "monthly"]).default("none"),
  status: z.enum(["todo", "in-progress", "done"]).default("todo"),
  completed: z.boolean().default(false)
});

export const updateTaskSchema = taskSchema.partial();
