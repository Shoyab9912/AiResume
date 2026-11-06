
import { api } from "./axiosClient";
import type {
  Analysis,
  AnalyzeResumePayload,
  GenerateInterviewPayload,
  InterviewData,
  JobMatchPayload,
  JobMatchResponse,
  BuildResumePayload,
  ResumeData,
} from "../types";

export const aiApi = {
  analyzeResume: async (payload: AnalyzeResumePayload): Promise<Analysis> => {
    const response = await api.post("/ai/analyze", payload);
    return response.data;
  },
  matchJobs: async (payload: JobMatchPayload): Promise<JobMatchResponse> => {
    const response = await api.post("/ai/job-matcher", payload);
    return response.data;
  },
  generateInterview: async (
    payload: GenerateInterviewPayload,
  ): Promise<InterviewData> => {
    const { data } = await api.post("/ai/interview", payload);
    return data;
  },
  buildResume: async (payload: BuildResumePayload): Promise<ResumeData> => {
    const { data } = await api.post("/ai/build-resume", payload);
    return data;
  },
};