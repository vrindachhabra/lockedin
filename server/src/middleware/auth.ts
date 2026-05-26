import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { verifyToken } from "../utils/auth.js";

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return response.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = verifyToken(token);
    request.user = {
      id: payload.id,
      mongoId: Types.ObjectId.isValid(payload.id) ? new Types.ObjectId(payload.id) : undefined,
      email: payload.email
    };
    return next();
  } catch {
    return response.status(401).json({ message: "Invalid or expired token" });
  }
}
