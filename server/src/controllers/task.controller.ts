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

  const tasks = await TaskModel.find(query).sort({ dueDate: 1, priority: -1 }).lean();
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

  const patch = {
    ...request.body,
    completedAt: request.body.completed ? new Date() : undefined,
    status: request.body.completed ? "done" : request.body.status
  };
  const task = await TaskModel.findOneAndUpdate(
    { _id: request.params.id, userId: request.user.mongoId },
    patch,
    { new: true }
  );
  if (!task) return response.status(404).json({ message: "Task not found" });
  return response.json(task);
}

export async function deleteTask(request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1 || !request.user?.mongoId) return response.status(204).send();
  await TaskModel.deleteOne({ _id: request.params.id, userId: request.user.mongoId });
  return response.status(204).send();
}
