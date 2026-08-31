
import { api } from "./auth"; 
import type { Analysis } from "../types";

export const aiApi = {
  analyzeResume: async (pdfBase64: string): Promise<Analysis> => {
    const res = await api.post("/api/v1/ai/analyze", { pdfBase64 });
    return res.data;
  },
};