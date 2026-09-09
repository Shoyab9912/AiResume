import { z } from "zod";



const MAX_SHORT = 200;
const MAX_MEDIUM = 2000;
const MAX_BULLET = 500;
const MAX_LIST = 30;

const MAX_PDF_DECODED_BYTES = 6 * 1024 * 1024; // 6MB
const MAX_PDF_BASE64_LEN = Math.ceil(MAX_PDF_DECODED_BYTES / 3) * 4; // ~8.4M chars

const pdfBase64Field = z
  .string({
    error: (issue) =>
      issue.input === undefined ? "PDF data is required" : "PDF data must be a string",
  })
  .min(100, "Invalid PDF: Base64 string is too short")
  .max(MAX_PDF_BASE64_LEN, "PDF is too large (max 6MB)")
  .refine(
    (val) => /^data:application\/pdf;base64,[A-Za-z0-9+/=]+$/.test(val) || /^[A-Za-z0-9+/=]+$/.test(val),
    "Invalid PDF base64 format",
  );



export const analyseResumeBodySchema = z.object({
  pdfBase64: pdfBase64Field,
});

export const jobMatcherBodySchema = z
  .object({
    mode: z.enum(["manual", "resume"], { error: "Mode must be 'manual' or 'resume'" }),
    skills: z
      .array(z.string().min(1).max(MAX_SHORT), { error: "Skills must be an array of strings" })
      .max(MAX_LIST, `At most ${MAX_LIST} skills`)
      .optional(),
    experience: z.string({ error: "Experience must be a string" }).max(MAX_MEDIUM).optional(),
    pdfBase64: pdfBase64Field.optional(),
  })
  .refine((d) => d.mode !== "manual" || (d.skills?.length && d.experience?.trim()), {
    message: "Skills and experience are required for manual mode",
    path: ["skills"],
  })
  .refine((d) => d.mode !== "resume" || d.pdfBase64, {
    message: "PDF is required for resume mode",
    path: ["pdfBase64"],
  });

export const generateInterviewBodySchema = z
  .object({
    mode: z.enum(["manual", "resume"], { error: "Mode must be 'manual' or 'resume'" }),
    round: z.enum(["hr", "technical"], { error: "Round must be 'hr' or 'technical'" }),
    skills: z.string({ error: "Skills must be a string" }).max(MAX_MEDIUM).optional(),
    experience: z.string({ error: "Experience must be a string" }).max(MAX_MEDIUM).optional(),
    pdfBase64: pdfBase64Field.optional(),
  })
  .refine((d) => d.mode !== "manual" || (d.skills?.trim() && d.experience?.trim()), {
    message: "Skills and experience are required for manual mode",
    path: ["skills"],
  })
  .refine((d) => d.mode !== "resume" || d.pdfBase64, {
    message: "PDF is required for resume mode",
    path: ["pdfBase64"],
  });

const experienceSchema = z.object({
  title: z.string().max(MAX_SHORT).optional(),
  company: z.string().max(MAX_SHORT).optional(),
  location: z.string().max(MAX_SHORT).optional(),
  startDate: z.string().max(50).optional(),
  endDate: z.string().max(50).optional(),
  bullets: z.array(z.string().max(MAX_BULLET)).max(MAX_LIST).optional(),
});

const educationSchema = z.object({
  degree: z.string().max(MAX_SHORT).optional(),
  school: z.string().max(MAX_SHORT).optional(),
  location: z.string().max(MAX_SHORT).optional(),
  year: z.string().max(20).optional(),
  gpa: z.string().max(20).optional(),
});

const projectSchema = z.object({
  name: z.string().max(MAX_SHORT).optional(),
  link: z.string().max(500).optional(),
  bullets: z.array(z.string().max(MAX_BULLET)).max(MAX_LIST).optional(),
});

const skillsSchema = z.object({
  technical: z.array(z.string().max(MAX_SHORT)).max(MAX_LIST).optional(),
  soft: z.array(z.string().max(MAX_SHORT)).max(MAX_LIST).optional(),
});


export const resumeFormDataSchema = z.object({
  name: z.string().min(1, "Name is required").max(MAX_SHORT),
  email: z.string().max(MAX_SHORT).optional(),
  phone: z.string().max(50).optional(),
  location: z.string().max(MAX_SHORT).optional(),
  linkedin: z.string().max(500).optional(),
  summary: z.string().max(MAX_MEDIUM).optional(),
  experience: z.array(experienceSchema).max(MAX_LIST).optional(),
  education: z.array(educationSchema).max(MAX_LIST).optional(),
  skills: skillsSchema.optional(),
  projects: z.array(projectSchema).max(MAX_LIST).optional(),
  certifications: z.array(z.string().max(MAX_SHORT)).max(MAX_LIST).optional(),
});

export const buildResumeBodySchema = z
  .object({
    mode: z.enum(["manual", "improve"], { error: "Mode must be 'manual' or 'improve'" }),
    formData: resumeFormDataSchema.optional(),
    pdfBase64: pdfBase64Field.optional(),
  })
  .refine((d) => d.mode !== "manual" || d.formData, {
    message: "Form data is required for manual mode",
    path: ["formData"],
  })
  .refine((d) => d.mode !== "improve" || d.pdfBase64, {
    message: "PDF is required for improve mode",
    path: ["pdfBase64"],
  });

export type AnalyzeResumeBody = z.infer<typeof analyseResumeBodySchema>;
export type JobMatcherBody = z.infer<typeof jobMatcherBodySchema>;
export type GenerateInterviewBody = z.infer<typeof generateInterviewBodySchema>;
export type BuildResumeBody = z.infer<typeof buildResumeBodySchema>;
export type ResumeFormData = z.infer<typeof resumeFormDataSchema>;