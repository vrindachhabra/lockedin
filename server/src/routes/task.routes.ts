import { Router } from "express";
import { createTask, deleteTask, listTasks, updateTask } from "../controllers/task.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { taskSchema, updateTaskSchema } from "../schemas/task.schema.js";

export const taskRouter = Router();

taskRouter.use(requireAuth);
taskRouter.get("/", listTasks);
taskRouter.post("/", validateBody(taskSchema), createTask);
taskRouter.patch("/:id", validateBody(updateTaskSchema), updateTask);
taskRouter.delete("/:id", deleteTask);
