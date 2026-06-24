import type { Request, Response } from "express";
import mongoose from "mongoose";
import { seedTasks } from "../data/seed.js";
import { TaskModel } from "../models/task.model.js";

export async function listTasks(request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1 || !request.user?.mongoId) return response.json(seedTasks);

  const { filter, q, category } = request.query;
  const now = new Date();
  const query: Record<string, unknown> = { userId: request.user.mongoId };

  if (q) query.title = { $regex: String(q), $options: "i" };
  if (category) query.category = category;
  if (filter === "completed") query.completed = true;
  if (filter === "high") query.priority = "high";
  if (filter === "overdue") query.dueDate = { $lt: now };
  if (filter === "upcoming") query.dueDate = { $gte: now };

  const rawTasks = await TaskModel.find(query).sort({ dueDate: 1, priority: -1 }).lean();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const tasksToUpdate: any[] = [];
  const tasks = rawTasks.map((task) => {
    if (task.recurrence && task.recurrence !== "none" && task.completed) {
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        completedDate.setHours(0, 0, 0, 0);
        if (completedDate.getTime() < todayStart.getTime()) {
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

  return response.json(tasks);
}

export async function createTask(request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1 || !request.user?.mongoId) {
    return response.status(201).json({ id: crypto.randomUUID(), ...request.body });
  }

  const task = await TaskModel.create({ ...request.body, userId: request.user.mongoId });
  return response.status(201).json(task);
}

export async function updateTask(request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1 || !request.user?.mongoId) {
    return response.json({ id: request.params.id, ...request.body });
  }

  const patch: Record<string, unknown> = { ...request.body };

  if (Object.prototype.hasOwnProperty.call(request.body, "completed")) {
    if (request.body.completed) {
      patch.completedAt = new Date();
      patch.status = "done";
    } else {
      patch.completedAt = null;
      if (!Object.prototype.hasOwnProperty.call(request.body, "status")) {
        delete patch.status;
      }
    }
  }

  Object.entries(patch).forEach(([key, value]) => {
    if (value === undefined) {
      delete patch[key];
    }
  });

  const task = await TaskModel.findOneAndUpdate(
    { _id: request.params.id, userId: request.user.mongoId },
    patch,
    { new: true, runValidators: true }
  );
  if (!task) return response.status(404).json({ message: "Task not found" });
  return response.json(task);
}

export async function deleteTask(request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1 || !request.user?.mongoId) return response.status(204).send();
  await TaskModel.deleteOne({ _id: request.params.id, userId: request.user.mongoId });
  return response.status(204).send();
}
