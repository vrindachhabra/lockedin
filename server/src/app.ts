import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { goalRouter } from "./routes/goal.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { placementRouter } from "./routes/placement.routes.js";
import { taskRouter } from "./routes/task.routes.js";
import { workspaceRouter } from "./routes/workspace.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN }));
  app.use(express.json());
  app.use(morgan("dev"));

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/tasks", taskRouter);
  app.use("/api/placements", placementRouter);
  app.use("/api/workspaces", workspaceRouter);
  app.use("/api/goals", goalRouter);

  app.use((_request, response) => {
    response.status(404).json({ message: "Route not found" });
  });

  app.use((error: unknown, _request: express.Request, response: express.Response, next: express.NextFunction) => {
    void next;
    console.error(error);
    response.status(500).json({ message: "Internal server error" });
  });

  return app;
}
