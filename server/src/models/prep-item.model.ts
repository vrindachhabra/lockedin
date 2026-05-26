import { Schema, model } from "mongoose";

const prepItemSchema = new Schema(
  {
    topic: { type: String, required: true, trim: true },
    status: { type: String, enum: ["queued", "active", "mastered"], default: "queued" },
    confidence: { type: Number, min: 0, max: 100, default: 0 }
  },
  { timestamps: true }
);

export const PrepItemModel = model("PrepItem", prepItemSchema);
