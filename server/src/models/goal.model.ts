import { Schema, model } from "mongoose";

const goalSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    metric: { type: String, required: true, trim: true },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    targetDate: { type: String, required: true }
  },
  { timestamps: true }
);

export const GoalModel = model("Goal", goalSchema);
