import { Router } from "express";
import {
  createWorkspace,
  deleteWorkspace,
  listWorkspaces,
  refineWorkspace,
  updateWorkspace
} from "../controllers/workspace.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { createWorkspaceSchema, refineWorkspaceSchema, updateWorkspaceSchema } from "../schemas/workspace.schema.js";

export const workspaceRouter = Router();

workspaceRouter.use(requireAuth);
workspaceRouter.get("/", listWorkspaces);
workspaceRouter.post("/", validateBody(createWorkspaceSchema), createWorkspace);
workspaceRouter.post("/:id/refine", validateBody(refineWorkspaceSchema.extend({ current: createWorkspaceSchema.optional() }).passthrough()), refineWorkspace);
workspaceRouter.patch("/:id", validateBody(updateWorkspaceSchema), updateWorkspace);
workspaceRouter.delete("/:id", deleteWorkspace);
