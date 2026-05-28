import type { DashboardPayload } from "@/types";

const today = new Date();
const plusDays = (days: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const seedDashboard: DashboardPayload = {
  user: {
    id: "demo-user",
    name: "LockedIn Demo",
    email: "demo@lockedin.app",
    streak: 8
  },
  tasks: [
    {
      id: "task-1",
      title: "Solve 5 graph problems",
      description: "Focus on BFS, DFS, and shortest path variations.",
      category: "Routine",
      priority: "high",
      dueDate: plusDays(0),
      deadline: plusDays(0),
      schedule: "today",
      recurrence: "none",
      status: "in-progress",
      completed: false
    },
    {
      id: "task-2",
      title: "Update resume project impact bullets",
      description: "Rewrite metrics for LockedIn and LMS project.",
      category: "Personal",
      priority: "high",
      dueDate: plusDays(1),
      deadline: plusDays(3),
      schedule: "tomorrow",
      recurrence: "none",
      status: "todo",
      completed: false
    },
    {
      id: "task-3",
      title: "Weekly reset and calendar planning",
      description: "Plan deep work, life admin, and revision blocks.",
      category: "Routine",
      priority: "medium",
      dueDate: plusDays(6),
      schedule: "weekend",
      recurrence: "weekly",
      status: "todo",
      completed: false
    },
    {
      id: "task-4",
      title: "Read DBMS indexes notes",
      description: "Revise B+ trees and query optimization.",
      category: "Routine",
      priority: "medium",
      dueDate: plusDays(-1),
      deadline: plusDays(0),
      schedule: "future",
      recurrence: "none",
      status: "todo",
      completed: false
    },
    {
      id: "task-5",
      title: "Morning review ritual",
      description: "Check top 3 priorities and blockers.",
      category: "Routine",
      priority: "low",
      dueDate: plusDays(0),
      schedule: "recurring",
      recurrence: "daily",
      status: "done",
      completed: true,
      completedAt: plusDays(0)
    }
  ],
  placements: [
    {
      id: "placement-1",
      companyName: "Atlassian",
      role: "Software Engineer Intern",
      package: "42 LPA",
      oaTestDate: plusDays(3),
      applicationDeadline: plusDays(1),
      interviewDates: [plusDays(7)],
      platform: "HackerRank",
      testDuration: "90 minutes",
      status: "oa-scheduled",
      notes: "Practice graphs, DP, and behavioral stories.",
      preparationProgress: 68,
      dsaTopicsPrepared: ["Arrays", "Graphs", "DP"],
      resumeVersionUsed: "resume-v4-product",
      externalRemarks: "Shortlist likely based on OA score."
    },
    {
      id: "placement-2",
      companyName: "Microsoft",
      role: "SWE Intern",
      package: "51 LPA",
      oaTestDate: plusDays(10),
      applicationDeadline: plusDays(4),
      interviewDates: [],
      platform: "Codility",
      testDuration: "120 minutes",
      status: "applied",
      notes: "Revise OS, DBMS, and resume deep dive.",
      preparationProgress: 54,
      dsaTopicsPrepared: ["Trees", "Binary Search"],
      resumeVersionUsed: "resume-v4-product",
      externalRemarks: "Referral submitted."
    },
    {
      id: "placement-3",
      companyName: "Zomato",
      role: "Frontend Engineer",
      package: "28 LPA",
      oaTestDate: plusDays(14),
      applicationDeadline: plusDays(8),
      interviewDates: [plusDays(18), plusDays(20)],
      platform: "HirePro",
      testDuration: "75 minutes",
      status: "shortlisted",
      notes: "Prepare React performance and UI system questions.",
      preparationProgress: 41,
      dsaTopicsPrepared: ["Strings", "Sliding Window"],
      resumeVersionUsed: "resume-v3-ui",
      externalRemarks: "Watch careers page for opening."
    }
  ],
  analytics: {
    productivityScore: 78,
    currentStreak: 8,
    weeklyCompletion: 64,
    pendingTasks: 4,
    completedTasks: 1,
    upcomingTests: 3,
    activeApplications: 3,
    averagePrepProgress: 54
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
