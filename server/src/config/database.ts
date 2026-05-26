import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  if (!env.MONGODB_URI) {
    console.warn("MONGODB_URI is not set. API will run without database persistence.");
    return;
  }

  await mongoose.connect(env.MONGODB_URI);
  console.log("MongoDB connected");
}
