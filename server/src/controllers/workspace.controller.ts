import type { Request, Response } from "express";
import mongoose from "mongoose";
import { WorkspaceModel } from "../models/workspace.model.js";
import { generateWorkspaceFromPrompt, refineWorkspaceWithPrompt } from "../services/workspace-ai.service.js";

const normalize = (workspace: Record<string, unknown>) => ({
  ...workspace,
  id: String(workspace._id ?? workspace.id)
});

export async function listWorkspaces(request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1 || !request.user?.mongoId) return response.json([]);
  const workspaces = await WorkspaceModel.find({ userId: request.user.mongoId }).sort({ updatedAt: -1 }).lean();
  return response.json(workspaces.map(normalize));
}

export async function createWorkspace(request: Request, response: Response) {
  const generated = await generateWorkspaceFromPrompt(request.body.prompt);

  if (mongoose.connection.readyState !== 1 || !request.user?.mongoId) {
    return response.status(201).json({
      id: crypto.randomUUID(),
      ...generated,
      prompt: request.body.prompt,
      assistantHistory: [
        { role: "user", content: request.body.prompt },
        { role: "assistant", content: `Generated ${generated.name}.` }
      ]
    });
  }

  const workspace = await WorkspaceModel.create({
    ...generated,
    prompt: request.body.prompt,
    userId: request.user.mongoId,
    assistantHistory: [
      { role: "user", content: request.body.prompt },
      { role: "assistant", content: `Generated ${generated.name}.` }
    ]
  });

  return response.status(201).json(normalize(workspace.toObject()));
}

export async function refineWorkspace(request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1 || !request.user?.mongoId) {
    const current = request.body.current;
    const refined = await refineWorkspaceWithPrompt(current, request.body.instruction);
    return response.json({
      id: request.params.id,
      ...refined,
      assistantHistory: [
        ...(current.assistantHistory ?? []),
        { role: "user", content: request.body.instruction },
        { role: "assistant", content: "Workspace refined." }
      ]
    });
  }

  const workspace = await WorkspaceModel.findOne({ _id: request.params.id, userId: request.user.mongoId });
  if (!workspace) return response.status(404).json({ message: "Workspace not found" });

  const refined = await refineWorkspaceWithPrompt(
    {
      name: workspace.name,
      description: workspace.description,
      icon: workspace.icon,
      tags: workspace.tags,
      sections: workspace.sections,
      analytics: workspace.analytics,
      schema: workspace.schema
    },
    request.body.instruction
  );

  workspace.set({
    ...refined,
    assistantHistory: [
      ...workspace.assistantHistory,
      { role: "user", content: request.body.instruction },
      { role: "assistant", content: "Workspace refined." }
    ]
  });
  await workspace.save();

  return response.json(normalize(workspace.toObject()));
}

export async function updateWorkspace(request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1 || !request.user?.mongoId) {
    return response.json({ id: request.params.id, ...request.body });
  }

  const workspace = await WorkspaceModel.findOneAndUpdate(
    { _id: request.params.id, userId: request.user.mongoId },
    request.body,
    { new: true }
  );
  if (!workspace) return response.status(404).json({ message: "Workspace not found" });
  return response.json(normalize(workspace.toObject()));
}

export async function deleteWorkspace(request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1 || !request.user?.mongoId) return response.status(204).send();
  await WorkspaceModel.deleteOne({ _id: request.params.id, userId: request.user.mongoId });
  return response.status(204).send();
}
