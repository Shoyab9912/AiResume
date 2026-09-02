
import { z } from "zod";

export const analyseResumeBodySchema = z.object({
  pdfBase64: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "PDF data is required" : "PDF data must be a string",
    })
    .min(100, "Invalid PDF: Base64 string is too short"),
});

export const jobMatcherBodySchema = z.object({
  mode: z.enum(["manual", "resume"], {
    error: "Mode must be 'manual' or 'resume'",
  }),
  skills: z
    .array(z.string(), { error: "Skills must be an array of strings" })
    .optional(),
  experience: z
    .string({ error: "Experience must be a string" })
    .optional(),
  pdfBase64: analyseResumeBodySchema.shape.pdfBase64.optional()
});

export type AnalyseResumeBody = z.infer<typeof analyseResumeBodySchema>;
export type JobMatcherBody = z.infer<typeof jobMatcherBodySchema>;