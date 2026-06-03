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
  if (text.includes("exam") || text.includes("study") || text.includes("student") || text.includes("assignment") || text.includes("revision")) return "Study Planner";
  return "Custom Workspace";
}

function deriveTags(prompt: string) {
  return Array.from(
    new Set(
      prompt
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length > 3)
        .slice(0, 6)
    )
  ).map((tag) => tag.replace(/[^a-z0-9]/g, ""));
}

function buildFallbackSections(prompt: string, domain: string): WorkspaceConfigInput["sections"] {
  const text = prompt.toLowerCase();
  const isStudy = /study|exam|student|assignment|revision|semester|class|course/.test(text);
  const isFitness = /gym|workout|training|nutrition|hydration|body measurement|consistency/.test(text);
  const isStartup = /startup|product|investor|experiment|feedback|metrics/.test(text);

  if (isStudy) {
    return [
      {
        id: "overview",
        title: "Study Overview",
        description: "Track course progress, deadlines, and exam readiness.",
        layout: "grid" as const,
        widgets: [
          { id: "metric-1", type: "metric" as const, title: "Study progress", description: "Current learning completion", metricLabel: "%", value: 72 },
          { id: "progress-1", type: "progress" as const, title: "Weekly hours", description: "Time spent on study this week", progress: 58 },
          { id: "streak-1", type: "metric" as const, title: "Consistency", description: "Days studied in a row", metricLabel: "Days", value: 5 }
        ]
      },
      {
        id: "schedule",
        title: "Assignment Calendar",
        description: "Keep due dates, exams, and revision blocks visible.",
        layout: "table" as const,
        widgets: [
          {
            id: "table-1",
            type: "table" as const,
            title: "Study schedule",
            description: "Tasks, topics, and deadlines.",
            fields: [
              { id: "task", label: "Task", type: "text" as const, required: true },
              { id: "subject", label: "Subject", type: "select" as const, required: true, options: ["Math", "CS", "Physics", "Electives"] },
              { id: "deadline", label: "Deadline", type: "date" as const, required: false },
              { id: "status", label: "Status", type: "text" as const, required: false }
            ],
            items: [
              { task: "Finish assignment", subject: "CS", deadline: "This week", status: "In progress" },
              { task: "Review notes", subject: "Math", deadline: "Tomorrow", status: "Planned" },
              { task: "Exam revision", subject: "Physics", deadline: "Friday", status: "Pending" }
            ]
          }
        ]
      },
      {
        id: "revision",
        title: "Revision Tracker",
        description: "Capture key topics, progress, and next review dates.",
        layout: "board" as const,
        widgets: [
          {
            id: "checklist-1",
            type: "checklist" as const,
            title: "Revision checklist",
            description: "Stay on top of topics and follow-ups.",
            items: [
              { title: "Practice past papers", done: false },
              { title: "Summarize chapter notes", done: true },
              { title: "Test weak areas", done: false }
            ]
          },
          { id: "notes-1", type: "notes" as const, title: "Study notes", description: "Capture thoughts, insights, and exam strategy.", value: "Focus on problem-solving and time management." }
        ]
      }
    ];
  }

  if (isFitness) {
    return [
      {
        id: "overview",
        title: "Fitness Summary",
        description: "Track workouts, progress, and recovery.",
        layout: "grid" as const,
        widgets: [
          { id: "metric-1", type: "metric" as const, title: "Workout streak", description: "Days trained consecutively", metricLabel: "Days", value: 6 },
          { id: "progress-1", type: "progress" as const, title: "Goal completion", description: "Weekly target progress", progress: 64 },
          { id: "streak-1", type: "metric" as const, title: "Body metric trend", description: "Weight or measurement progress", metricLabel: "Trend", value: "Up" }
        ]
      },
      {
        id: "workouts",
        title: "Workout Plan",
        description: "Schedule sets, reps, and targeted muscle groups.",
        layout: "table" as const,
        widgets: [
          {
            id: "table-1",
            type: "table" as const,
            title: "Training log",
            description: "Plan and review workout sessions.",
            fields: [
              { id: "exercise", label: "Exercise", type: "text" as const, required: true },
              { id: "reps", label: "Reps", type: "text" as const, required: false },
              { id: "sets", label: "Sets", type: "text" as const, required: false },
              { id: "notes", label: "Notes", type: "text" as const, required: false }
            ],
            items: [
              { exercise: "Squats", reps: "5x5", sets: "5", notes: "Increase load" },
              { exercise: "Bench press", reps: "4x8", sets: "4", notes: "Focus on form" },
              { exercise: "Cardio", reps: "30 min", sets: "1", notes: "Steady pace" }
            ]
          }
        ]
      },
      {
        id: "nutrition",
        title: "Nutrition & Recovery",
        description: "Log meals, hydration, and body measurements.",
        layout: "board" as const,
        widgets: [
          {
            id: "checklist-1",
            type: "checklist" as const,
            title: "Daily habits",
            description: "Keep healthy routines visible.",
            items: [
              { title: "Drink 3L water", done: false },
              { title: "Eat protein-rich meals", done: true },
              { title: "Stretch after training", done: false }
            ]
          },
          { id: "notes-1", type: "notes" as const, title: "Recovery notes", description: "Track soreness, sleep, and energy.", value: "Rest well and adjust intensity as needed." }
        ]
      }
    ];
  }

  if (isStartup) {
    return [
      {
        id: "overview",
        title: "Product Dashboard",
        description: "Track progress across roadmap, metrics, and experiments.",
        layout: "grid" as const,
        widgets: [
          { id: "metric-1", type: "metric" as const, title: "Experiment wins", description: "Successful product experiments", metricLabel: "Count", value: 5 },
          { id: "progress-1", type: "progress" as const, title: "Roadmap completion", description: "Release milestones done", progress: 48 },
          { id: "streak-1", type: "metric" as const, title: "User feedback", description: "Positive feedback items", metricLabel: "Count", value: 12 }
        ]
      },
      {
        id: "execution",
        title: "Execution Tracker",
        description: "Manage tasks, experiments, and follow-ups.",
        layout: "table" as const,
        widgets: [
          {
            id: "table-1",
            type: "table" as const,
            title: "Startup tasks",
            description: "Track initiatives and next steps.",
            fields: [
              { id: "initiative", label: "Initiative", type: "text" as const, required: true },
              { id: "owner", label: "Owner", type: "text" as const, required: false },
              { id: "status", label: "Status", type: "select" as const, required: false, options: ["Planned", "In progress", "Done"] },
              { id: "notes", label: "Notes", type: "text" as const, required: false }
            ],
            items: [
              { initiative: "Run A/B test", owner: "Product", status: "In progress", notes: "Monitor conversion" },
              { initiative: "Pitch investors", owner: "Founder", status: "Planned", notes: "Follow up next week" },
              { initiative: "Collect feedback", owner: "Team", status: "Done", notes: "Summarized insights" }
            ]
          }
        ]
      },
      {
        id: "notes",
        title: "Insights",
        description: "Capture ideas, blockers, and product learnings.",
        layout: "board" as const,
        widgets: [
          { id: "notes-1", type: "notes" as const, title: "Product notes", description: "Write down important takeaways.", value: "Focus on user pain points and growth opportunities." }
        ]
      }
    ];
  }

  return [
    {
      id: "overview",
      title: "Overview",
      description: "High-level progress, streaks, and open loops.",
      layout: "grid" as const,
      widgets: [
        { id: "metric-1", type: "metric" as const, title: "Weekly output", description: "Completed units this week", metricLabel: "Done", value: 18 },
        { id: "progress-1", type: "progress" as const, title: "Overall progress", description: "Across all tracked areas", progress: 64 },
        { id: "streak-1", type: "metric" as const, title: "Streak", description: "Consecutive active days", metricLabel: "Days", value: 7 }
      ]
    },
    {
      id: "trackers",
      title: "Trackers",
      description: "Editable tracking table for the workflow.",
      layout: "table" as const,
      widgets: [
        {
          id: "table-1",
          type: "table" as const,
          title: "Progress table",
          description: "Track tasks, subjects, milestones, and deadlines.",
          fields: [
            { id: "item", label: "Item", type: "text" as const, required: true },
            { id: "area", label: "Area", type: "select" as const, required: true, options: ["Core", "Revision", "Practice", "Admin"] },
            { id: "progress", label: "Progress", type: "progress" as const, required: true },
            { id: "deadline", label: "Deadline", type: "date" as const, required: false }
          ],
          items: [
            { item: "Daily practice", area: "Practice", progress: 70, deadline: "This week" },
            { item: "Core concepts", area: "Theory", progress: 48, deadline: "Next week" },
            { item: "Revision loop", area: "Revision", progress: 30, deadline: "Friday" }
          ]
        }
      ]
    }
  ];
}

export function fallbackWorkspace(prompt: string): WorkspaceConfigInput {
  const domain = inferDomain(prompt);
  const title = prompt
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 42) || domain;
  const tags = deriveTags(prompt);

  return {
    name: title,
    description: `A workspace created from the prompt: ${prompt}`,
    icon: "sparkles",
    tags: tags.length ? tags : [domain, "AI generated", "Workspace"],
    analytics: [
      { id: "progress", label: `${domain} progress`, value: "64%", trend: "Up 12% this week" },
      { id: "streak", label: "Consistency streak", value: 7, trend: "Best streak this month" },
      { id: "open-items", label: "Open items", value: 9, trend: "3 high priority" }
    ],
    schema: {
      collectionName: `${slug(title)}_entries`,
      fields: [
        { id: "title", label: "Title", type: "text" as const, required: true },
        { id: "category", label: "Category", type: "select" as const, required: true, options: ["Core", "Revision", "Practice", "Admin"] },
        { id: "progress", label: "Progress", type: "progress" as const, required: true },
        { id: "deadline", label: "Deadline", type: "date" as const, required: false },
        { id: "tags", label: "Tags", type: "tags" as const, required: false }
      ]
    },
    sections: buildFallbackSections(prompt, domain)
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
            "You design premium schema-based productivity workspaces for LockedIn. Use the user's prompt exactly to build the workspace. Return a practical, editable dashboard schema with useful analytics, sections, fields, widgets, sample entries, tags, and database schema metadata. Keep ids lowercase kebab-case. Do not invent unrelated content or ignore the prompt." 
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
