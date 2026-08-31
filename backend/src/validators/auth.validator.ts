import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "Name is required" : "Name must be a string",
    })
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),

  email: z
    .email({
      error: (issue) =>
        issue.input === undefined ? "Email is required" : "Invalid email address format",
    })
    .trim()
    .toLowerCase(),

  password: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "Password is required" : "Password must be a string",
    })
    .min(4, "Password must be at least 8 characters long")
    .max(8, "Password is too long"),
});

export const loginSchema = z.object({
  email: z
    .email({
      error: (issue) =>
        issue.input === undefined ? "Email is required" : "Invalid email address format",
    })
    .trim()
    .toLowerCase(),

  password: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "Password is required" : "Password must be a string",
    })
    .min(2, "Password cannot be empty"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

