import bcrypt from "bcryptjs";
import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String },
    streak: { type: Number, default: 4 },
    lastActiveAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(password: string) {
  return bcrypt.compare(password, this.passwordHash as string);
};

export type UserDocument = InferSchemaType<typeof userSchema> & {
  comparePassword: (password: string) => Promise<boolean>;
};

export const UserModel = model("User", userSchema);
