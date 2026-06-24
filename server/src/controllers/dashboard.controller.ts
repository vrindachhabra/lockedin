import type { Request, Response } from "express";
import mongoose from "mongoose";
import { dashboardSeed } from "../data/seed.js";
import { PlacementModel } from "../models/placement.model.js";
import { TaskModel } from "../models/task.model.js";
import { WorkspaceModel } from "../models/workspace.model.js";

export async function getDashboard(request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1 || !request.user?.mongoId) return response.json(dashboardSeed);

  const userId = request.user.mongoId;

  const [rawTasks, placements, workspaces] = await Promise.all([
    TaskModel.find({ userId }).sort({ dueDate: 1 }).lean(),
    PlacementModel.find({ userId }).sort({ applicationDeadline: 1 }).lean(),
    WorkspaceModel.find({ userId }).sort({ updatedAt: -1 }).lean()
  ]);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const tasksToUpdate: any[] = [];
  const tasks = rawTasks.map((task) => {
    if (task.recurrence && task.recurrence !== "none" && task.completed) {
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        completedDate.setHours(0, 0, 0, 0);
        if (completedDate.getTime() < now.getTime()) {
          tasksToUpdate.push(task._id);
          return { ...task, completed: false, status: "todo" };
        }
      } else {
        tasksToUpdate.push(task._id);
        return { ...task, completed: false, status: "todo" };
      }
    }
    return task;
  });

  if (tasksToUpdate.length > 0) {
    TaskModel.updateMany(
      { _id: { $in: tasksToUpdate } },
      { $set: { completed: false, status: "todo" } }
    ).exec().catch(console.error);
  }

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
