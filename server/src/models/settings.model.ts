import { Schema, model } from "mongoose";

const settingsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", unique: true, index: true },
    theme: { type: String, enum: ["dark", "system"], default: "dark" },
    browserReminders: { type: Boolean, default: true },
    dailyReviewTime: { type: String, default: "21:00" },
    defaultTaskView: { type: String, enum: ["list", "kanban", "calendar"], default: "list" },
    categories: [{ type: String }]
  },
  { timestamps: true }
);

export const SettingsModel = model("Settings", settingsSchema);
