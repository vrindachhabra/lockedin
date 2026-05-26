import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export function validateBody(schema: ZodSchema) {
  return (request: Request, response: Response, next: NextFunction) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      return response.status(400).json({ message: "Invalid request body", issues: result.error.flatten() });
    }

    request.body = result.data;
    return next();
  };
}
