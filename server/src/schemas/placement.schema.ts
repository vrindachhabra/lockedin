import { z } from "zod";

export const placementSchema = z.object({
  companyName: z.string().min(2),
  role: z.string().min(2),
  package: z.string().min(1),
  oaTestDate: z.coerce.date(),
  applicationDeadline: z.coerce.date(),
  interviewDates: z.array(z.coerce.date()).default([]),
  platform: z.string().min(1),
  testDuration: z.string().min(1),
  status: z.enum(["shortlisted", "applied", "oa-scheduled", "interview", "offer", "rejected"]).default("shortlisted"),
  notes: z.string().optional().default(""),
  preparationProgress: z.number().min(0).max(100).default(0),
  dsaTopicsPrepared: z.array(z.string()).default([]),
  resumeVersionUsed: z.string().default("v1"),
  externalRemarks: z.string().optional().default("")
});

export const updatePlacementSchema = placementSchema.partial();
