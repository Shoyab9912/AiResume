import { Request, Response, NextFunction } from "express";
import { z, ZodType } from "zod";
import { ValidationError } from "../utils/errors.js";

export const validate =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error) as {
        fieldErrors: Record<string, string[]>;
        formErrors: string[];
      };
      const firstMessage = Object.values(fieldErrors)[0]?.[0] ?? "Validation failed";
      return next(new ValidationError(firstMessage, fieldErrors));
    }
    req.body = result.data;
    next();
  };