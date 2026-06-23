import type { DashboardPayload } from "@/types";



export const seedDashboard: DashboardPayload = {
  user: {
    id: "demo-user",
    name: "LockedIn Demo",
    email: "demo@lockedin.app",
    streak: 0
  },
  tasks: [],
  placements: [],
  analytics: {
    productivityScore: 0,
    currentStreak: 0,
    weeklyCompletion: 0,
    pendingTasks: 0,
    completedTasks: 0,
    upcomingTests: 0,
    activeApplications: 0,
    averagePrepProgress: 0
  },
  settings: {
    theme: "dark",
    browserReminders: true,
    dailyReviewTime: "21:00",
    defaultTaskView: "list",
    categories: ["Personal", "Routine"]
  },
  workspaces: []
};
