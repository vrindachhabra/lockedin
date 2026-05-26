import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { GoalModel } from "../models/goal.model.js";
import { createGoalSchema } from "../schemas/goal.schema.js";

export const goalRouter = Router();

goalRouter.get("/", async (_request, response, next) => {
  try {
    const goals = await GoalModel.find().sort({ createdAt: -1 }).lean();
    return response.json(goals);
  } catch (error) {
    return next(error);
  }
});

goalRouter.post("/", validateBody(createGoalSchema), async (request, response, next) => {
  try {
    const goal = await GoalModel.create(request.body);
    return response.status(201).json(goal);
  } catch (error) {
    return next(error);
  }
});
