import type { ReactNode} from "react";
// ── 1. USER & AUTHENTICATION TYPES ──

export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  subscription: Date | null;
  freeRequestsUsed: number;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
}

// Standard backend ApiResponse wrapper
export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
  success?: boolean;
}

// ── 2. APP CONTEXT TYPES ──

export interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  LogoutUser: () => Promise<void>;
}


export interface AppProps {
  children: ReactNode;
}

// ── 3. FEATURE: JOB MATCHER ──

export interface Job {
  title: string;
  company: string;
  matchScore: number;
  location: string;
  type: string;
  skills: string[];
  whyMatch: string;
  applyTip: string;
}

// ── 4. FEATURE: INTERVIEW PREP ──

export interface Question {
  id: number;
  question: string;
  hint: string;
  category: string;
}

export interface InterviewData {
  role: string;
  round: string;
  questions: Question[];
}

// ── 5. FEATURE: RESUME BUILDER ──

export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Education {
  degree: string;
  school: string;
  location: string;
  year: string;
  gpa: string;
}

export interface Project {
  name: string;
  description: string;
  link: string;
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: { 
    technical: string[]; 
    soft: string[]; 
  };
  projects: Project[];
  certifications: string[];
}

// ── 6. FEATURE: RESUME ANALYZER & ATS SCORE ──

export interface ScoreBlock {
  score: number;
  feedback: string;
}

export interface Suggestion {
  category: string;
  issue: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
}

export interface Analysis {
  atsScore: number;
  scoreBreakdown: {
    formatting: ScoreBlock;
    keywords: ScoreBlock;
    structure: ScoreBlock;
    readability: ScoreBlock;
  };
  suggestions: Suggestion[];
  strengths: string[];
  summary: string;
}