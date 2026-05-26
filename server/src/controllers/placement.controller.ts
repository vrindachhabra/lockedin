import type { Request, Response } from "express";
import mongoose from "mongoose";
import { seedPlacements } from "../data/seed.js";
import { PlacementModel } from "../models/placement.model.js";

export async function listPlacements(request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1 || !request.user?.mongoId) return response.json(seedPlacements);

  const { q, status, sort = "applicationDeadline" } = request.query;
  const query: Record<string, unknown> = { userId: request.user.mongoId };
  if (q) query.companyName = { $regex: String(q), $options: "i" };
  if (status) query.status = status;

  const placements = await PlacementModel.find(query).sort({ [String(sort)]: 1 }).lean();
  return response.json(placements);
}

export async function createPlacement(request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1 || !request.user?.mongoId) {
    return response.status(201).json({ id: crypto.randomUUID(), ...request.body });
  }

  const placement = await PlacementModel.create({ ...request.body, userId: request.user.mongoId });
  return response.status(201).json(placement);
}

export async function updatePlacement(request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1 || !request.user?.mongoId) {
    return response.json({ id: request.params.id, ...request.body });
  }

  const placement = await PlacementModel.findOneAndUpdate(
    { _id: request.params.id, userId: request.user.mongoId },
    request.body,
    { new: true }
  );
  if (!placement) return response.status(404).json({ message: "Placement not found" });
  return response.json(placement);
}

export async function deletePlacement(request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1 || !request.user?.mongoId) return response.status(204).send();
  await PlacementModel.deleteOne({ _id: request.params.id, userId: request.user.mongoId });
  return response.status(204).send();
}
