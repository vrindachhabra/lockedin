import { Schema, model } from "mongoose";

const workspaceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String, default: "sparkles" },
    prompt: { type: String, required: true },
    tags: [{ type: String }],
    sections: { type: Schema.Types.Mixed, required: true },
    analytics: { type: Schema.Types.Mixed, default: [] },
    schema: { type: Schema.Types.Mixed, required: true },
    assistantHistory: {
      type: [
        {
          role: { type: String, enum: ["user", "assistant"], required: true },
          content: { type: String, required: true }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

export const WorkspaceModel = model("Workspace", workspaceSchema);
