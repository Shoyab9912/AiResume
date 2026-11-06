import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  BadRequestError,
  ForbiddenError,
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

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY as string,
});

const MODEL = "gemini-3.6-flash";

async function callModel(
  systemInstruction: string,
  userText: string,
  resumeText?: string,
) {
  const combinedText = resumeText
    ? `${userText}\n\nRESUME TEXT:\n${resumeText}`
    : userText;

  const parts: Part[] = [{ text: combinedText }];

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

  if (!rawText) {
    throw new ApiError(502, "AI returned empty response");
  }

  try {
    return JSON.parse(rawText);
  } catch {
    throw new ApiError(502, "AI returned invalid JSON", [], {
      raw: response.text,
    });
  }
}

function mapGeminiError(err: unknown): ApiError {
  const raw = err instanceof Error ? err.message : String(err);

  let code: number | undefined;

  try {
    const parsed = JSON.parse(raw);
    code = parsed?.error?.code;
  } catch {
   // raw is not valid JSON.

  }

  if (code === 503) {
    return new ApiError(
      503,
      "AI service is currently busy. Please try again in a moment.",
    );
  }

  if (code === 429) {
    return new ApiError(
      429,
      "Too many requests right now. Please try again shortly.",
    );
  }

  if (code === 400) {
    return new BadRequestError(
      "The request data could not be processed. Please check your input and try again.",
    );
  }

  return new ApiError(502, "AI service failed to respond. Please try again.");
}



async function reserveQuotaOrThrow(userId?: string): Promise<{
  userId: string;
  usedFreeCredit: boolean;
}> {
  if (!userId) {
    throw new UnauthorizedError("User session is invalid or expired");
  }

  const now = new Date();


  const proUser = await User.findOne({
    _id: userId,
    subscription: { $gt: now },
  })
    .select("_id")
    .lean();

  if (proUser) {
    return { userId: proUser._id.toString(), usedFreeCredit: false };
  }

  const freeUser = await User.findOneAndUpdate(
    {
      _id: userId,
      $or: [{ subscription: null }, { subscription: { $lte: now } }],
      freeRequestsUsed: { $lt: 3 },
    },
    { $inc: { freeRequestsUsed: 1 } },
    { returnDocument: "after" },
  )
    .select("_id")
    .lean();

  if (!freeUser) {
    const exists = await User.exists({ _id: userId });
    if (!exists) {
      throw new UnauthorizedError("User session is invalid or expired");
    }
    throw new ForbiddenError("Free request limit reached");
  }

  return { userId: freeUser._id.toString(), usedFreeCredit: true };
}


async function refundFreeCreditIfUsed(
  userId: string,
  usedFreeCredit: boolean,
) {
  if (usedFreeCredit) {
    await User.findOneAndUpdate(
      { _id: userId, freeRequestsUsed: { $gt: 0 } },
      { $inc: { freeRequestsUsed: -1 } },
    );
  }
}

export const analyzeResume = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { resumeText, jobDescription } = req.body as AnalyzeResumeBody;

    const { userId, usedFreeCredit } = await reserveQuotaOrThrow(
      req.user?._id?.toString(),
    );

    try {
      const userPrompt = ResumeAnalyserUserPrompt(jobDescription);

      const parsed = await callModel(
        ResumeAnalyserSystemInstruction,
        userPrompt,
        resumeText,
      );

      const result = ResumeAnalysisSchema.safeParse(parsed);

      if (!result.success) {
        throw new ApiError(500, "AI response failed validation", [], {
          issues: result.error.issues,
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(200, "Resume analyzed successfully", result.data),
        );
    } catch (error) {
      await refundFreeCreditIfUsed(userId, usedFreeCredit);
      throw error;
    }
  },
);

export const jobMatcher = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const data = req.body as JobMatcherBody;

    const { userId, usedFreeCredit } = await reserveQuotaOrThrow(
      req.user?._id?.toString(),
    );

    try {
      const userPrompt = JobMatcherUserPrompt(
        data.mode,
        data.skills,
        data.experience,
      );

      const parsed = await callModel(
        JobMatcherSystemInstruction,
        userPrompt,
        data.mode === "resume" ? data.resumeText : undefined,
      );

      const result = JobMatchSchema.safeParse(parsed);

      if (!result.success) {
        throw new ApiError(500, "AI response failed validation", [], {
          issues: result.error.issues,
        });
      }

      return res
        .status(200)
        .json(new ApiResponse(200, "jobs fetched successfully", result.data));
    } catch (error) {
      await refundFreeCreditIfUsed(userId, usedFreeCredit);
      throw error;
    }
  },
);

export const generateInterview = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const data = req.body as GenerateInterviewBody;

    const { userId, usedFreeCredit } = await reserveQuotaOrThrow(
      req.user?._id?.toString(),
    );

    try {
      const userPrompt = InterviewUserPrompt(
        data.mode,
        data.skills,
        data.experience,
      );

      const parsed = await callModel(
        InterviewSystemInstruction(data.round),
        userPrompt,
        data.mode === "resume" ? data.resumeText : undefined,
      );

      const result = InterviewSchema.safeParse(parsed);

      if (!result.success) {
        throw new ApiError(500, "AI response failed validation", [], {
          issues: result.error.issues,
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Interview questions generated successfully",
            result.data,
          ),
        );
    } catch (error) {
      await refundFreeCreditIfUsed(userId, usedFreeCredit);
      throw error;
    }
  },
);

export const buildResume = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const data = req.body as BuildResumeBody;

    const { userId, usedFreeCredit } = await reserveQuotaOrThrow(
      req.user?._id?.toString(),
    );

    try {
      const userPrompt = BuildResumeUserPrompt(data.mode, data.formData);

      const parsed = await callModel(
        BuildResumeSystemInstruction(data.mode),
        userPrompt,
        data.mode === "improve" ? data.resumeText : undefined,
      );

      const result = BuiltResumeSchema.safeParse(parsed);

      if (!result.success) {
        throw new ApiError(500, "AI response failed validation", [], {
          issues: result.error.issues,
        });
      }

      return res
        .status(200)
        .json(new ApiResponse(200, "Resume built successfully", result.data));
    } catch (error) {
      await refundFreeCreditIfUsed(userId, usedFreeCredit);
      throw error;
    }
  },
);