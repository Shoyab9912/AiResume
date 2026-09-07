import { useMutation } from "@tanstack/react-query";
import { aiApi } from "../api/ai";
import type { Analysis, InterviewData, JobMatchResponse,ResumeFormData,ResumeData} from "../types";

export type InterviewPayload =
  | { mode: "manual"; round: "hr" | "technical"; skills: string; experience: string }
  | { mode: "resume"; round: "hr" | "technical"; pdfBase64: string };

export type JobMatchPayload =
  | { mode: "manual"; skills: string[]; experience: string }
  | { mode: "resume"; pdfBase64: string };


export type BuildResumePayload =
  | { mode: "manual"; formData: ResumeFormData }
  | { mode: "improve"; pdfBase64: string };

export const useAiMutations = () => {
  const analyzeResumeMutation = useMutation<Analysis, unknown, string>({
    mutationFn: (pdfBase64) => aiApi.analyzeResume(pdfBase64),
  });

  const interviewMutation = useMutation<InterviewData, unknown, InterviewPayload>({
    mutationFn: (payload) => aiApi.generateInterview(payload),
  });

  const jobMatcherMutation = useMutation<JobMatchResponse, unknown, JobMatchPayload>({
    mutationFn: (payload) => aiApi.matchJobs(payload),
  });
  const buildResumeMutation = useMutation<ResumeData, unknown, BuildResumePayload>({
    mutationFn: (payload) => aiApi.buildResume(payload),
  });

  return { analyzeResumeMutation, interviewMutation, jobMatcherMutation,buildResumeMutation };
};