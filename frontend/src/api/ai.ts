
import { api } from "./auth"; 
import type { Analysis, Job } from "../types"; 



export interface JobMatchPayload {
  mode: "manual" | "resume";
  skills?: string[];      
  experience?: string;    
  pdfBase64?: string;      
}

export interface JobMatchResponse {
  jobs: Job[];
  summary: string;
}

export const aiApi = {
  analyzeResume: async (pdfBase64: string): Promise<Analysis> => {
    const response = await api.post("/api/v1/ai/analyze", { pdfBase64 });
    return response.data;
  },
  matchJobs: async (payload: JobMatchPayload): Promise<JobMatchResponse> => {
    const response = await api.post("/api/v1/ai/job-matcher", payload);
    console.log(response)
    return response.data;
  },
};