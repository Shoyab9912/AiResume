import { api } from "./axiosClient";
import type {
  Analysis,
  GenerateInterviewPayload,
  JobMatchPayload,
  JobMatchResponse,
} from "../types";

export const aiApi = {
  analyzeResume: async (pdfBase64: string): Promise<Analysis> => {
    const response = await api.post("/ai/analyze", { pdfBase64 });
    return response.data;
  },
  matchJobs: async (payload: JobMatchPayload): Promise<JobMatchResponse> => {
    const response = await api.post("/ai/job-matcher", payload);
    return response.data;
  },
  generateInterview: async (payload: GenerateInterviewPayload) => {
    const { data } = await api.post("/ai/interview", payload);
    return data;
  },
 
};
