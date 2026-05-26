import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { seedUser } from "../data/seed.js";
import { UserModel } from "../models/user.model.js";
import { signToken } from "../utils/auth.js";

function publicUser(user: { id?: string; _id?: unknown; name: string; email: string; streak?: number }) {
  return {
    id: String(user._id ?? user.id),
    name: user.name,
    email: user.email,
    streak: user.streak ?? 0
  };
}

export async function signup(request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1) {
    const token = signToken({ id: seedUser.id, email: request.body.email });
    return response.status(201).json({
      token,
      user: { ...seedUser, name: request.body.name, email: request.body.email }
    });
  }

  const existing = await UserModel.findOne({ email: request.body.email });
  if (existing) return response.status(409).json({ message: "Email is already registered" });

  const passwordHash = await bcrypt.hash(request.body.password, 12);
  const user = await UserModel.create({ ...request.body, passwordHash });
  const token = signToken({ id: String(user._id), email: user.email });
  return response.status(201).json({ token, user: publicUser(user) });
}

export async function login(request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1) {
    const token = signToken({ id: seedUser.id, email: request.body.email });
    return response.json({ token, user: { ...seedUser, email: request.body.email } });
  }

  const user = await UserModel.findOne({ email: request.body.email });
  if (!user || !(await bcrypt.compare(request.body.password, user.passwordHash))) {
    return response.status(401).json({ message: "Invalid email or password" });
  }

  const token = signToken({ id: String(user._id), email: user.email });
  return response.json({ token, user: publicUser(user) });
}

export async function me(request: Request, response: Response) {
  if (mongoose.connection.readyState !== 1 || !request.user?.mongoId) {
    return response.json(seedUser);
  }

  const user = await UserModel.findById(request.user.mongoId).lean();
  if (!user) return response.status(404).json({ message: "User not found" });
  return response.json(publicUser(user));
}
