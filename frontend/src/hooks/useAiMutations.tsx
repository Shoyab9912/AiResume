import { useMutation, useQueryClient } from "@tanstack/react-query";
import { aiApi } from "../api/ai";
import type { Analysis, InterviewData, JobMatchResponse, ResumeFormData, ResumeData } from "../types";

export type InterviewPayload =
  | { mode: "manual"; round: "hr" | "technical"; skills: string; experience: string }
  | { mode: "resume"; round: "hr" | "technical"; pdfBase64: string };

export type JobMatchPayload =
  | { mode: "manual"; skills: string[]; experience: string }
  | { mode: "resume"; pdfBase64: string };

export type BuildResumePayload =
  | { mode: "manual"; formData: ResumeFormData }
  | { mode: "improve"; pdfBase64: string };

export const AI_QUERY_KEYS = {
  resumeAnalysis: ["resumeAnalysis"] as const,
  interviewQuestions: ["interviewQuestions"] as const,
  jobMatches: ["jobMatches"] as const,
  builtResume: ["builtResume"] as const,
};

export const useAiMutations = () => {
  const queryClient = useQueryClient();

  const analyzeResumeMutation = useMutation<Analysis, unknown, string>({
    mutationKey: AI_QUERY_KEYS.resumeAnalysis,
    mutationFn: (pdfBase64) => aiApi.analyzeResume(pdfBase64),
    onSuccess: (data) => {
      queryClient.setQueryData(AI_QUERY_KEYS.resumeAnalysis, data);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const interviewMutation = useMutation<InterviewData, unknown, InterviewPayload>({
    mutationKey: AI_QUERY_KEYS.interviewQuestions,
    mutationFn: (payload) => aiApi.generateInterview(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(AI_QUERY_KEYS.interviewQuestions, data);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const jobMatcherMutation = useMutation<JobMatchResponse, unknown, JobMatchPayload>({
    mutationKey: AI_QUERY_KEYS.jobMatches,
    mutationFn: (payload) => aiApi.matchJobs(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(AI_QUERY_KEYS.jobMatches, data);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const buildResumeMutation = useMutation<ResumeData, unknown, BuildResumePayload>({
    mutationKey: AI_QUERY_KEYS.builtResume,
    mutationFn: (payload) => aiApi.buildResume(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(AI_QUERY_KEYS.builtResume, data);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  return { analyzeResumeMutation, interviewMutation, jobMatcherMutation, buildResumeMutation };
};