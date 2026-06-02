import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { env } from "../config/env.js";
import { workspaceConfigSchema, type WorkspaceConfigInput } from "../schemas/workspace.schema.js";

const client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

if (!env.OPENAI_API_KEY) {
  // Helpful log to surface why AI features are falling back.
  // Keep this lightweight so it appears during server startup.
  // eslint-disable-next-line no-console
  console.warn("OPENAI_API_KEY not configured — workspace AI will use fallback generator.");
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32);
}

function inferDomain(prompt: string) {
  const text = prompt.toLowerCase();
  if (text.includes("dsa") || text.includes("coding") || text.includes("dbms") || text.includes("oop")) return "DSA Prep";
  if (text.includes("gym") || text.includes("fitness") || text.includes("workout")) return "Fitness Tracker";
  if (text.includes("finance") || text.includes("budget") || text.includes("expense")) return "Finance OS";
  if (text.includes("startup") || text.includes("founder") || text.includes("product")) return "Startup Board";
  if (text.includes("content") || text.includes("youtube") || text.includes("instagram")) return "Content Planner";
  if (text.includes("exam") || text.includes("study")) return "Exam Prep";
  return "Custom Workspace";
}

export function fallbackWorkspace(prompt: string): WorkspaceConfigInput {
  const domain = inferDomain(prompt);
  const base = slug(domain);

  return {
    name: domain,
    description: `A custom LockedIn workspace generated from: ${prompt}`,
    icon: "sparkles",
    tags: ["AI generated", "Dashboard", "Tracking"],
    analytics: [
      { id: "completion", label: "Completion", value: "64%", trend: "Up 12% this week" },
      { id: "streak", label: "Consistency streak", value: 7, trend: "Best streak this month" },
      { id: "open-items", label: "Open items", value: 9, trend: "3 high priority" }
    ],
    schema: {
      collectionName: `${base || "workspace"}_entries`,
      fields: [
        { id: "title", label: "Title", type: "text", required: true },
        { id: "category", label: "Category", type: "select", required: true, options: ["Core", "Revision", "Practice", "Admin"] },
        { id: "progress", label: "Progress", type: "progress", required: true },
        { id: "deadline", label: "Deadline", type: "date", required: false },
        { id: "tags", label: "Tags", type: "tags", required: false }
      ]
    },
    sections: [
      {
        id: "overview",
        title: "Overview",
        description: "High-level progress, streaks, and open loops.",
        layout: "grid",
        widgets: [
          { id: "metric-1", type: "metric", title: "Weekly output", description: "Completed units this week", metricLabel: "Done", value: 18 },
          { id: "progress-1", type: "progress", title: "Overall progress", description: "Across all tracked areas", progress: 64 },
          { id: "streak-1", type: "metric", title: "Streak", description: "Consecutive active days", metricLabel: "Days", value: 7 }
        ]
      },
      {
        id: "trackers",
        title: "Trackers",
        description: "Editable tracking table for the workflow.",
        layout: "table",
        widgets: [
          {
            id: "table-1",
            type: "table",
            title: "Progress table",
            description: "Track tasks, subjects, milestones, and deadlines.",
            fields: [
              { id: "item", label: "Item", type: "text", required: true },
              { id: "area", label: "Area", type: "select", required: true, options: ["Practice", "Theory", "Revision"] },
              { id: "progress", label: "Progress", type: "progress", required: true },
              { id: "deadline", label: "Deadline", type: "date", required: false }
            ],
            items: [
              { item: "Daily practice", area: "Practice", progress: 70, deadline: "This week" },
              { item: "Core concepts", area: "Theory", progress: 48, deadline: "Next week" },
              { item: "Revision loop", area: "Revision", progress: 30, deadline: "Friday" }
            ]
          }
        ]
      },
      {
        id: "execution",
        title: "Execution",
        description: "Checklists, notes, and next actions.",
        layout: "board",
        widgets: [
          {
            id: "checklist-1",
            type: "checklist",
            title: "Today checklist",
            description: "Keep the next actions visible.",
            items: [
              { title: "Complete focused session", done: false },
              { title: "Update progress numbers", done: false },
              { title: "Write revision note", done: true }
            ]
          },
          { id: "notes-1", type: "notes", title: "Notes", description: "Capture blockers, insights, and reminders.", value: "Add observations after each work block." }
        ]
      }
    ]
  };
}

export async function generateWorkspaceFromPrompt(prompt: string) {
  if (!client) return fallbackWorkspace(prompt);

  try {
    const response = await client.responses.parse({
      model: env.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content:
            "You design premium schema-based productivity workspaces for LockedIn. Return a practical, editable dashboard schema with useful analytics, sections, fields, widgets, sample entries, tags, and database schema metadata. Keep ids lowercase kebab-case."
        },
        { role: "user", content: prompt }
      ],
      text: {
        format: zodTextFormat(workspaceConfigSchema, "lockedin_workspace")
      }
    });

    return response.output_parsed ?? fallbackWorkspace(prompt);
  } catch (err) {
    // Log error and fall back gracefully so UI remains usable.
    // eslint-disable-next-line no-console
    console.error("Workspace AI generation failed:", err);
    return fallbackWorkspace(prompt);
  }
}

export async function refineWorkspaceWithPrompt(current: WorkspaceConfigInput, instruction: string) {
  if (!client) {
    return {
      ...current,
      sections: [
        ...current.sections,
        {
          id: `refinement-${Date.now()}`,
          title: instruction.slice(0, 48),
          description: "Added from the AI assistant refinement request.",
          layout: "grid" as const,
          widgets: [
            {
              id: `refinement-widget-${Date.now()}`,
              type: "checklist" as const,
              title: "Refined checklist",
              description: instruction,
              items: [{ title: instruction, done: false }]
            }
          ]
        }
      ]
    };
  }
  try {
    const response = await client.responses.parse({
      model: env.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content:
            "Modify the existing LockedIn workspace schema according to the user instruction. Preserve useful existing sections while adding or improving the requested capability. Return the full updated schema."
        },
        { role: "user", content: JSON.stringify({ current, instruction }) }
      ],
      text: {
        format: zodTextFormat(workspaceConfigSchema, "lockedin_workspace_refinement")
      }
    });

    return response.output_parsed ?? current;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Workspace AI refinement failed:", err);
    return current;
  }
}
