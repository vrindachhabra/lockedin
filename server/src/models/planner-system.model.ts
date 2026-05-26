import { Schema, model } from "mongoose";

const plannerSystemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    cadence: { type: String, enum: ["Daily", "Weekly", "Monthly"], required: true },
    blocks: [{ type: String, required: true }]
  },
  { timestamps: true }
);

export const PlannerSystemModel = model("PlannerSystem", plannerSystemSchema);
