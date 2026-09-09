import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  ForbiddenError,
  ValidationError,
  BadRequestError,
  UnauthorizedError,
} from "../utils/errors.js";
import { User } from "../models/user.model.js";
import { GoogleGenAI, type Part } from "@google/genai";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  ResumeAnalyserSystemInstruction,
  ResumeAnalyserUserPrompt,
  JobMatcherSystemInstruction,
  JobMatcherUserPrompt,
  InterviewSystemInstruction,
  InterviewUserPrompt,
  BuildResumeSystemInstruction,
  BuildResumeUserPrompt,
} from "../config/prompt.js";
import {
  AnalyzeResumeBody,
  GenerateInterviewBody,
  JobMatcherBody,
  BuildResumeBody,
} from "../validators/resume.validator.js";
import {
  ResumeAnalysisSchema,
  JobMatchSchema,
  InterviewSchema,
  BuiltResumeSchema,
} from "../validators/ai-response.validator.js";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY as string });
const MODEL = "gemini-3.6-flash";

function stripPdfPrefix(b64: string) {
  return b64.replace(/^data:application\/pdf;base64,/, "");
}
async function callModel(systemInstruction: string, userText: string, pdfBase64?: string) {
  const parts: Part[] = [{ text: userText }];
  if (pdfBase64) {
    parts.push({
      inlineData: { mimeType: "application/pdf", data: stripPdfPrefix(pdfBase64) },
    });
  }

  let response;
  try {
    response = await ai.models.generateContent({
      model: MODEL,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
      contents: [{ role: "user", parts }],
    });
  } catch (err) {
    throw mapGeminiError(err);
  }

  const rawText = response.text?.trim();
  if (!rawText) throw new ApiError(502, "AI returned empty response");

  try {
    return JSON.parse(rawText);
  } catch {
    throw new ApiError(502, "AI returned invalid JSON", [], { raw: response.text });
  }
}

function mapGeminiError(err: unknown): ApiError {
  const raw = err instanceof Error ? err.message : String(err);

  let code: number | undefined;
  let status: string | undefined;
  try {
    const parsed = JSON.parse(raw);
    code = parsed?.error?.code;
    status = parsed?.error?.status;
  } catch {
    // raw wasn't JSON, fall through with code/status undefined
  }

  if (code === 503 || status === "UNAVAILABLE") {
    return new ApiError(503, "AI service is currently busy. Please try again in a moment.");
  }
  if (code === 429 || status === "RESOURCE_EXHAUSTED") {
    return new ApiError(429, "Too many requests right now. Please try again shortly.");
  }
  if (code === 400 || status === "INVALID_ARGUMENT") {
    return new ApiError(400, "The uploaded file could not be processed. Please check the file and try again.");
  }

  return new ApiError(502, "AI service failed to respond. Please try again.");
}

async function incrementUsageIfFree(userId: string, hasProAcess: boolean) {
  if (!hasProAcess) {
    await User.findByIdAndUpdate(userId, { $inc: { freeRequestsUsed: 1 } });
  }
}

export const analyzeResume = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { pdfBase64 } = req.body as AnalyzeResumeBody;

  const user = await User.findById(req.user?._id);
  if (!user) throw new UnauthorizedError("User session is invalid or expired");
  if (!user.canMakeRequest()) throw new ForbiddenError("Upgrade Your plan to continue");

  const parsed = await callModel(ResumeAnalyserSystemInstruction, ResumeAnalyserUserPrompt, pdfBase64);

  const result = ResumeAnalysisSchema.safeParse(parsed);
  if (!result.success) {
    throw new ApiError(500, "AI response failed validation", [], { issues: result.error.issues });
  }

  await incrementUsageIfFree(user._id.toString(), user.hasProAcess());

  return res.status(200).json(new ApiResponse(200, "Resume analyzed successfully", result.data));
});

export const jobMatcher = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const data = req.body as JobMatcherBody;

  const user = await User.findById(req.user?._id);
  if (!user) throw new UnauthorizedError("User session is invalid or expired");
  if (!user.canMakeRequest()) throw new ForbiddenError("Upgrade Your plan to continue");

  const userPrompt = JobMatcherUserPrompt(data.mode, data.skills, data.experience);
  const parsed = await callModel(
    JobMatcherSystemInstruction,
    userPrompt,
    data.mode === "resume" ? data.pdfBase64 : undefined,
  );

  const result = JobMatchSchema.safeParse(parsed);
  if (!result.success) {
    throw new ApiError(500, "AI response failed validation", [], { issues: result.error.issues });
  }

  await incrementUsageIfFree(user._id.toString(), user.hasProAcess());

  return res.status(200).json(new ApiResponse(200, "jobs fetched successfully", result.data));
});

export const generateInterview = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const data = req.body as GenerateInterviewBody;

  const user = await User.findById(req.user?._id);
  if (!user) throw new UnauthorizedError("User session is invalid or expired");
  if (!user.canMakeRequest()) throw new ForbiddenError("Upgrade Your plan to continue");

  const userPrompt = InterviewUserPrompt(data.mode, data.skills, data.experience);
  const parsed = await callModel(
    InterviewSystemInstruction(data.round),
    userPrompt,
    data.mode === "resume" ? data.pdfBase64 : undefined,
  );

  const result = InterviewSchema.safeParse(parsed);
  if (!result.success) {
    throw new ApiError(500, "AI response failed validation", [], { issues: result.error.issues });
  }

  await incrementUsageIfFree(user._id.toString(), user.hasProAcess());

  return res
    .status(200)
    .json(new ApiResponse(200, "Interview questions generated successfully", result.data));
});

export const buildResume = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const data = req.body as BuildResumeBody;

  const user = await User.findById(req.user?._id);
  if (!user) throw new UnauthorizedError("User session is invalid or expired");
  if (!user.canMakeRequest()) throw new ForbiddenError("Upgrade Your plan to continue");

  const userPrompt = BuildResumeUserPrompt(data.mode, data.formData);
  const parsed = await callModel(
    BuildResumeSystemInstruction(data.mode),
    userPrompt,
    data.mode === "improve" ? data.pdfBase64 : undefined,
  );

  const result = BuiltResumeSchema.safeParse(parsed);
  if (!result.success) {
    throw new ApiError(500, "AI response failed validation", [], { issues: result.error.issues });
  }

  await incrementUsageIfFree(user._id.toString(), user.hasProAcess());

  res.status(200).json(new ApiResponse(200, "Resume built successfully", result.data));
});