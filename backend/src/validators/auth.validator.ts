import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "Name is required" : "Name must be a string",
    })
    .min(5, "Name must be at least 5 characters long")
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
    .min(8, "Password must be at least 8 characters long")
    .max(10, "Password is too long"),
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


export const verifyOtpSchema = z.object({
  email: z
    .email({
      error: (issue) =>
        issue.input === undefined ? "Email is required" : "Invalid email address format",
    })
    .trim()
    .toLowerCase(),

  otp: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "OTP is required" : "OTP must be a string",
    })
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must be numeric"),
});

export const resendOtpSchema = z.object({
  email: z
    .email({
      error: (issue) =>
        issue.input === undefined ? "Email is required" : "Invalid email address format",
    })
    .trim()
    .toLowerCase(),
});