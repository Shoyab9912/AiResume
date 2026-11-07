// ── 1. USER & AUTHENTICATION TYPES ──

export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  subscription: Date | string | null;
  freeRequestsUsed: number;
  isVerified: boolean;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
}

// ── 2. STANDARD API WRAPPERS ──

export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
  success?: boolean;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  response?: {
    data?: ApiErrorResponse;
  };
  message?: string;
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

export interface JobMatchResponse {
  jobs: Job[];
  summary: string;
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
  gpa?: string;
}

export interface Project {
  name: string;
  link?: string;
  bullets: string[];
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

export interface ResumeFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  experience?: Experience[];
  education: Education[];
  skills: {
    technical: string[];
    soft: string[];
  };
  projects?: Project[];
  certifications?: string[];
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

// ── 7. AI API PAYLOADS (Discriminated Unions with resumeText) ──

export interface AnalyzeResumePayload {
  resumeText: string;
  jobDescription?: string;
}

export type JobMatchPayload =
  | { mode: "manual"; skills: string[]; experience: string }
  | { mode: "resume"; resumeText: string };

export type GenerateInterviewPayload =
  | {
      mode: "manual";
      round: "hr" | "technical";
      skills: string;
      experience: string;
    }
  | {
      mode: "resume";
      round: "hr" | "technical";
      resumeText: string;
    };

export type BuildResumePayload =
  | { mode: "manual"; formData: ResumeFormData }
  | { mode: "improve"; resumeText: string };

// Alias so both InterviewPayload and GenerateInterviewPayload work across imports
export type InterviewPayload = GenerateInterviewPayload;

// ── 8. PAYMENT & RAZORPAY TYPES ──

export type PaymentPlan = "monthly" | "sixmonth";

export interface CheckoutPayload {
  plan: PaymentPlan;
}

export interface CheckoutResponse {
  key: string;
  orderId: string;
  amount: number;
  currency: string;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler?: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayFailedResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  };
}

export interface RazorpayInstance {
  open(): void;
  close(): void;
  on(
    event: "payment.failed",
    handler: (response: RazorpayFailedResponse) => void,
  ): void;
}

export interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}