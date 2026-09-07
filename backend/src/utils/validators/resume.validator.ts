
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
export const generateInterviewBodySchema = z.object({
  mode: z.enum(["manual", "resume"], {
    error: "Mode must be 'manual' or 'resume'",
  }),
  round: z.enum(["hr", "technical"], {
    error: "Round must be 'hr' or 'technical'",
  }),
  skills: z
    .string({ error: "Skills must be a string" })
    .optional(),
  experience: z
    .string({ error: "Experience must be a string" })
    .optional(),
  pdfBase64: analyseResumeBodySchema.shape.pdfBase64.optional()
});


const experienceSchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bullets: z.array(z.string()).optional(),
});

const educationSchema = z.object({
  degree: z.string().optional(),
  school: z.string().optional(),
  location: z.string().optional(),
  year: z.string().optional(),
  gpa: z.string().optional(),
});

const projectSchema = z.object({
  name: z.string().optional(),
  link: z.string().optional(),
  bullets: z.array(z.string()).optional(),
});

const skillsSchema = z.object({
  technical: z.array(z.string()).optional(),
  soft: z.array(z.string()).optional(),
});

export const resumeFormDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  summary: z.string().optional(),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: skillsSchema.optional(),
  projects: z.array(projectSchema).optional(),
  certifications: z.array(z.string()).optional(),
});

export const buildResumeBodySchema = z.object({
  mode: z.enum(["manual", "improve"], {
    error: "Mode must be 'manual' or 'improve'",
  }),
  formData: resumeFormDataSchema.optional(),
  pdfBase64: analyseResumeBodySchema.shape.pdfBase64.optional(), 
});


export type AnalyzeResumeBody = z.infer<typeof analyseResumeBodySchema>;
export type JobMatcherBody = z.infer<typeof jobMatcherBodySchema>;
export type GenerateInterviewBody = z.infer<typeof generateInterviewBodySchema>;
export type BuildResumeBody = z.infer<typeof buildResumeBodySchema>;
export type ResumeFormData = z.infer<typeof resumeFormDataSchema>;