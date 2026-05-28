import { Schema, model } from "mongoose";

const placementSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    companyName: { type: String, required: true, trim: true, index: true },
    role: { type: String, required: true, trim: true },
    package: { type: String, required: true },
    oaTestDate: { type: Date, required: true, index: true },
    applicationDeadline: { type: Date, required: true, index: true },
    interviewDates: [{ type: Date }],
    platform: { type: String, required: true },
    testDuration: { type: String, required: true },
    status: {
      type: String,
      enum: ["shortlisted", "applied", "oa-scheduled", "interview", "offer", "rejected"],
      default: "shortlisted",
      index: true
    },
    notes: { type: String, default: "" },
    preparationProgress: { type: Number, min: 0, max: 100, default: 0 },
    dsaTopicsPrepared: [{ type: String }],
    resumeVersionUsed: { type: String, default: "v1" },
    externalRemarks: { type: String, default: "" }
  },
  { timestamps: true }
);

export const PlacementModel = model("Placement", placementSchema);
