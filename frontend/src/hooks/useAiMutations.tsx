
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { aiApi } from "../api/ai";
import type {
  Analysis,
  AnalyzeResumePayload,
  InterviewData,
  GenerateInterviewPayload,
  JobMatchResponse,
  JobMatchPayload,
  ResumeData,
  BuildResumePayload,
} from "../types";

export const AI_QUERY_KEYS = {
  resumeAnalysis: ["resumeAnalysis"] as const,
  interviewQuestions: ["interviewQuestions"] as const,
  jobMatches: ["jobMatches"] as const,
  builtResume: ["builtResume"] as const,
};

export const useAiMutations = () => {
  const queryClient = useQueryClient();

  const analyzeResumeMutation = useMutation<
    Analysis,
    unknown,
    AnalyzeResumePayload
  >({
    mutationKey: AI_QUERY_KEYS.resumeAnalysis,
    mutationFn: (payload) => aiApi.analyzeResume(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(AI_QUERY_KEYS.resumeAnalysis, data);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const interviewMutation = useMutation<
    InterviewData,
    unknown,
    GenerateInterviewPayload
  >({
    mutationKey: AI_QUERY_KEYS.interviewQuestions,
    mutationFn: (payload) => aiApi.generateInterview(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(AI_QUERY_KEYS.interviewQuestions, data);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const jobMatcherMutation = useMutation<
    JobMatchResponse,
    unknown,
    JobMatchPayload
  >({
    mutationKey: AI_QUERY_KEYS.jobMatches,
    mutationFn: (payload) => aiApi.matchJobs(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(AI_QUERY_KEYS.jobMatches, data);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const buildResumeMutation = useMutation<
    ResumeData,
    unknown,
    BuildResumePayload
  >({
    mutationKey: AI_QUERY_KEYS.builtResume,
    mutationFn: (payload) => aiApi.buildResume(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(AI_QUERY_KEYS.builtResume, data);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  return {
    analyzeResumeMutation,
    interviewMutation,
    jobMatcherMutation,
    buildResumeMutation,
  };
};