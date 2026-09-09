import { z } from "zod";

export const ResumeAnalysisSchema = z.object({
  atsScore: z.number().min(0).max(100),
  scoreBreakdown: z.object({
    formatting: z.object({ score: z.number().min(0).max(100), feedback: z.string().max(500) }),
    keywords: z.object({ score: z.number().min(0).max(100), feedback: z.string().max(500) }),
    structure: z.object({ score: z.number().min(0).max(100), feedback: z.string().max(500) }),
    readability: z.object({ score: z.number().min(0).max(100), feedback: z.string().max(500) }),
  }),
  suggestions: z.array(z.object({
    category: z.string().max(100),
    issue: z.string().max(1000),
    recommendation: z.string().max(1000),
    priority: z.enum(["high", "medium", "low"]),
  })).max(20),
  strengths: z.array(z.string().max(300)).max(20),
  summary: z.string().max(1000),
});
export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;

export const JobMatchSchema = z.object({
  summary: z.string().max(1000),
  jobs: z.array(z.object({
    title: z.string().max(150),
    company: z.string().max(150),
    matchScore: z.number().min(0).max(100),
    location: z.enum(["Remote", "Hybrid", "On-site"]),
    type: z.enum(["Full-time", "Freelance", "Contract"]),
    skills: z.array(z.string().max(60)).max(15),
    whyMatch: z.string().max(800),
    applyTip: z.string().max(500),
  })).max(5),
});
export type JobMatch = z.infer<typeof JobMatchSchema>;

export const InterviewSchema = z.object({
  role: z.string().max(150),
  round: z.enum(["hr", "technical"]),
  questions: z.array(z.object({
    id: z.number().int().min(1),
    question: z.string().max(1000),
    hint: z.string().max(500),
    category: z.string().max(100),
  })).length(10),
});
export type Interview = z.infer<typeof InterviewSchema>;

const ExperienceEntrySchema = z.object({
  title: z.string().max(150),
  company: z.string().max(150),
  location: z.string().max(150),
  startDate: z.string().max(50),
  endDate: z.string().max(50),
  bullets: z.array(z.string().max(500)).max(15),
});

const EducationEntrySchema = z.object({
  degree: z.string().max(200),
  school: z.string().max(200),
  location: z.string().max(150),
  year: z.string().max(20),
  gpa: z.string().max(20),
});

const ProjectEntrySchema = z.object({
  name: z.string().max(150),
  link: z.string().max(500),
  bullets: z.array(z.string().max(500)).max(15),
});

export const BuiltResumeSchema = z.object({
  name: z.string().max(150),
  email: z.string().max(200),
  phone: z.string().max(50),
  location: z.string().max(150),
  linkedin: z.string().max(300),
  summary: z.string().max(1000),
  experience: z.array(ExperienceEntrySchema).max(20).optional().default([]),
  education: z.array(EducationEntrySchema).max(10).optional().default([]),
  skills: z.object({
    technical: z.array(z.string().max(60)).max(40).optional().default([]),
    soft: z.array(z.string().max(60)).max(20).optional().default([]),
  }).optional().default({ technical: [], soft: [] }),
  projects: z.array(ProjectEntrySchema).max(15).optional().default([]),
  certifications: z.array(z.string().max(200)).max(20).optional().default([]),
});
export type BuiltResume = z.infer<typeof BuiltResumeSchema>;