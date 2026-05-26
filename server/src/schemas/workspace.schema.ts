import { z } from "zod";

export const workspaceFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["text", "number", "date", "select", "checkbox", "progress", "tags"]),
  required: z.boolean(),
  options: z.array(z.string()).optional()
});

export const workspaceWidgetSchema = z.object({
  id: z.string(),
  type: z.enum(["metric", "progress", "checklist", "table", "notes", "chart", "deadline", "tags"]),
  title: z.string(),
  description: z.string(),
  metricLabel: z.string().optional(),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  progress: z.number().min(0).max(100).optional(),
  fields: z.array(workspaceFieldSchema).optional(),
  items: z.array(z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]))).optional(),
  tags: z.array(z.string()).optional()
});

export const workspaceSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  layout: z.enum(["grid", "table", "board", "timeline"]),
  widgets: z.array(workspaceWidgetSchema)
});

export const workspaceConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  tags: z.array(z.string()),
  sections: z.array(workspaceSectionSchema).min(2),
  analytics: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      value: z.union([z.string(), z.number()]),
      trend: z.string()
    })
  ),
  schema: z.object({
    collectionName: z.string(),
    fields: z.array(workspaceFieldSchema)
  })
});

export const createWorkspaceSchema = z.object({
  prompt: z.string().min(10)
});

export const refineWorkspaceSchema = z.object({
  instruction: z.string().min(4)
});

export const updateWorkspaceSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  sections: z.array(workspaceSectionSchema).optional(),
  analytics: workspaceConfigSchema.shape.analytics.optional(),
  tags: z.array(z.string()).optional()
});

export type WorkspaceConfigInput = z.infer<typeof workspaceConfigSchema>;
