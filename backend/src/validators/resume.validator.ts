import { z } from "zod";

const MAX_SHORT = 200;
const MAX_MEDIUM = 2000;
const MAX_BULLET = 500;
const MAX_LIST = 30;
const MAX_RESUME_CHARS = 15000;

const resumeTextField = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Resume text is required"
        : "Resume text must be a string",
  })
  .trim()
  .min(
    100,
    "Could not read enough text from the PDF. Please upload a text-based PDF, not a scanned image.",
  )
  .max(MAX_RESUME_CHARS, "Resume text is too long (max 15,000 characters)");



export const analyseResumeBodySchema = z.object({
  resumeText: resumeTextField,
  jobDescription: z
    .string({ error: "Job description must be a string" })
    .trim()
    .max(5000, "Job description is too long (max 5,000 characters)")
    .optional(),
});



export const jobMatcherBodySchema = z
  .object({
    mode: z.enum(["manual", "resume"], {
      error: "Mode must be 'manual' or 'resume'",
    }),
    skills: z
      .array(z.string().trim().min(1).max(MAX_SHORT), {
        error: "Skills must be an array of strings",
      })
      .max(MAX_LIST, `At most ${MAX_LIST} skills`)
      .optional(),
    experience: z
      .string({ error: "Experience must be a string" })
      .trim()
      .max(MAX_MEDIUM)
      .optional(),
    resumeText: resumeTextField.optional(),
  })
  .refine(
    (d) => d.mode !== "manual" || (d.skills?.length && d.experience?.trim()),
    {
      message: "Skills and experience are required for manual mode",
      path: ["skills"],
    },
  )
  .refine((d) => d.mode !== "resume" || Boolean(d.resumeText), {
    message: "Resume text is required for resume mode",
    path: ["resumeText"],
  });

export const generateInterviewBodySchema = z
  .object({
    mode: z.enum(["manual", "resume"], {
      error: "Mode must be 'manual' or 'resume'",
    }),
    round: z.enum(["hr", "technical"], {
      error: "Round must be 'hr' or 'technical'",
    }),
    skills: z
      .string({ error: "Skills must be a string" })
      .trim()
      .max(MAX_MEDIUM)
      .optional(),
    experience: z
      .string({ error: "Experience must be a string" })
      .trim()
      .max(MAX_MEDIUM)
      .optional(),
    resumeText: resumeTextField.optional(),
  })
  .refine(
    (d) =>
      d.mode !== "manual" || (d.skills?.trim() && d.experience?.trim()),
    {
      message: "Skills and experience are required for manual mode",
      path: ["skills"],
    },
  )
  .refine((d) => d.mode !== "resume" || Boolean(d.resumeText), {
    message: "Resume text is required for resume mode",
    path: ["resumeText"],
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
  name: z.string().trim().min(1, "Name is required").max(MAX_SHORT),
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
    mode: z.enum(["manual", "improve"], {
      error: "Mode must be 'manual' or 'improve'",
    }),
    formData: resumeFormDataSchema.optional(),
    resumeText: resumeTextField.optional(),
  })
  .refine((d) => d.mode !== "manual" || Boolean(d.formData), {
    message: "Form data is required for manual mode",
    path: ["formData"],
  })
  .refine((d) => d.mode !== "improve" || Boolean(d.resumeText), {
    message: "Resume text is required for improve mode",
    path: ["resumeText"],
  });

export type AnalyzeResumeBody = z.infer<typeof analyseResumeBodySchema>;
export type JobMatcherBody = z.infer<typeof jobMatcherBodySchema>;
export type GenerateInterviewBody = z.infer<typeof generateInterviewBodySchema>;
export type BuildResumeBody = z.infer<typeof buildResumeBodySchema>;
export type ResumeFormData = z.infer<typeof resumeFormDataSchema>;