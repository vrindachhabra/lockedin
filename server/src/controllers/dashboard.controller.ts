import type { Request, Response } from "express";
import mongoose from "mongoose";
import { dashboardSeed } from "../data/seed.js";
import { PlacementModel } from "../models/placement.model.js";
import { TaskModel } from "../models/task.model.js";
import { WorkspaceModel } from "../models/workspace.model.js";

export async function getDashboard(_request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1) return response.json(dashboardSeed);

  const [tasks, placements, workspaces] = await Promise.all([
    TaskModel.find().sort({ dueDate: 1 }).lean(),
    PlacementModel.find().sort({ applicationDeadline: 1 }).lean(),
    WorkspaceModel.find().sort({ updatedAt: -1 }).lean()
  ]);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const activeApplications = placements.filter((placement) => placement.status !== "rejected").length;
  const averagePrepProgress = placements.length
    ? Math.round(placements.reduce((sum, placement) => sum + placement.preparationProgress, 0) / placements.length)
    : 0;

  return response.json({
    ...dashboardSeed,
    tasks,
    placements,
    workspaces: workspaces.map((workspace) => ({ ...workspace, id: String(workspace._id) })),
    analytics: {
      ...dashboardSeed.analytics,
      pendingTasks: tasks.length - completedTasks,
      completedTasks,
      activeApplications,
      upcomingTests: placements.length,
      averagePrepProgress
    }
  });
}
