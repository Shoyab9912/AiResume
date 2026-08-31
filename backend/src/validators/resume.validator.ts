
import { z } from "zod";

export const analyseResumeBodySchema = z.object({
  pdfBase64: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "PDF data is required" : "PDF data must be a string",
    })
    .min(100, "Invalid PDF: Base64 string is too short"),
});

export type AnalyseResumeBody = z.infer<typeof analyseResumeBodySchema>;