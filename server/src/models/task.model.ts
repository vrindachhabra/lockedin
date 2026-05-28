import { Schema, model } from "mongoose";

const taskSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "Personal", index: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date, required: true, index: true },
    deadline: { type: Date, index: true },
    schedule: { type: String, enum: ["today", "tomorrow", "future", "weekend", "recurring"], default: "today" },
    recurrence: { type: String, enum: ["none", "daily", "weekly", "monthly"], default: "none" },
    status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo", index: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    streakContribution: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const TaskModel = model("Task", taskSchema);
