import { Router } from "express";
import {
  createPlacement,
  deletePlacement,
  listPlacements,
  updatePlacement
} from "../controllers/placement.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { placementSchema, updatePlacementSchema } from "../schemas/placement.schema.js";

export const placementRouter = Router();

placementRouter.use(requireAuth);
placementRouter.get("/", listPlacements);
placementRouter.post("/", validateBody(placementSchema), createPlacement);
placementRouter.patch("/:id", validateBody(updatePlacementSchema), updatePlacement);
placementRouter.delete("/:id", deletePlacement);

