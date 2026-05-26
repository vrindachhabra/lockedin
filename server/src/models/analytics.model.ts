import { Schema, model } from "mongoose";

const analyticsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    date: { type: Date, required: true, index: true },
    tasksCompleted: { type: Number, default: 0 },
    tasksCreated: { type: Number, default: 0 },
    focusMinutes: { type: Number, default: 0 },
    placementApplications: { type: Number, default: 0 },
    streak: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const AnalyticsModel = model("Analytics", analyticsSchema);
