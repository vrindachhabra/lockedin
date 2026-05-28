export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskSchedule = "today" | "tomorrow" | "future" | "weekend" | "recurring";
export type TaskView = "list" | "kanban" | "calendar";
export type TaskFilter = "today" | "upcoming" | "some-time" | "overdue" | "completed" | "high" | "all";
export type PlacementStatus = "shortlisted" | "applied" | "oa-scheduled" | "interview" | "offer" | "rejected";

export type User = {
  id: string;
  name: string;
  email: string;
  streak: number;
};

export type Task = {
  id: string;
  _id?: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  dueDate: string;
  deadline?: string;
  schedule: TaskSchedule;
  recurrence: "none" | "daily" | "weekly" | "monthly";
  status: TaskStatus;
  completed: boolean;
  completedAt?: string;
};

export type Placement = {
  id: string;
  _id?: string;
  companyName: string;
  role: string;
  package: string;
  oaTestDate: string;
  applicationDeadline: string;
  interviewDates: string[];
  platform: string;
  testDuration: string;
  status: PlacementStatus;
  notes: string;
  preparationProgress: number;
  dsaTopicsPrepared: string[];
  resumeVersionUsed: string;
  externalRemarks: string;
};

export type Analytics = {
  productivityScore: number;
  currentStreak: number;
  weeklyCompletion: number;
  pendingTasks: number;
  completedTasks: number;
  upcomingTests: number;
  activeApplications: number;
  averagePrepProgress: number;
};

export type Settings = {
  theme: "dark" | "system";
  browserReminders: boolean;
  dailyReviewTime: string;
  defaultTaskView: TaskView;
  categories: string[];
};

export type DashboardPayload = {
  user: User;
  tasks: Task[];
  placements: Placement[];
  analytics: Analytics;
  settings: Settings;
  workspaces?: WorkspaceConfig[];
};

export type WorkspaceWidgetType = "metric" | "progress" | "checklist" | "table" | "notes" | "chart" | "deadline" | "tags";

export type WorkspaceField = {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "checkbox" | "progress" | "tags";
  required: boolean;
  options?: string[];
};

export type WorkspaceWidget = {
  id: string;
  type: WorkspaceWidgetType;
  title: string;
  description: string;
  metricLabel?: string;
  value?: string | number | boolean;
  progress?: number;
  fields?: WorkspaceField[];
  items?: Array<Record<string, string | number | boolean | string[]>>;
  tags?: string[];
};

export type WorkspaceSection = {
  id: string;
  title: string;
  description: string;
  layout: "grid" | "table" | "board" | "timeline";
  widgets: WorkspaceWidget[];
};

export type WorkspaceConfig = {
  id: string;
  _id?: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
  tags: string[];
  sections: WorkspaceSection[];
  analytics: Array<{
    id: string;
    label: string;
    value: string | number;
    trend: string;
  }>;
  schema: {
    collectionName: string;
    fields: WorkspaceField[];
  };
  assistantHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
};
