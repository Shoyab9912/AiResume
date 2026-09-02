import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  analyseResumeBodySchema,
  jobMatcherBodySchema,
} from "../validators/resume.validator.js";
import {
  ForbiddenError,
  ValidationError,
  BadRequestError,
  UnauthorizedError
} from "../utils/errors.js";
import { z } from "zod";
import { User } from "../models/user.model.js";
import { GoogleGenAI,type Part } from "@google/genai";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ResumeAnalyserPrompt,JobMatcherPrompt } from "../config/prompt.js";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY as string });

export const analyzeResume = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const { success, data, error } = analyseResumeBodySchema.safeParse(
      req.body,
    );

    if (!success) {
      throw new ValidationError(
        "Validation failed",
        z.flattenError(error).fieldErrors,
      );
    }

    const { pdfBase64 } = data;

    if (!pdfBase64) {
      throw new BadRequestError("PDF is required");
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new UnauthorizedError("User session is invalid or expired");
    }

    if (!user.canMakeRequest()) {
      throw new ForbiddenError("Upgrade Your plan to continue");
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: ResumeAnalyserPrompt },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
              },
            },
          ],
        },
      ],
    });

    const rawText = response.text?.replace(/```json|```/g, "").trim();

    if (!rawText) {
      throw new ApiError(500, "AI returned empty response");
    }

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(rawText);
    } catch (error) {
      throw new ApiError(500, "AI returned invalid JSON", [], {
        raw: response.text,
      });
    }

    if (!user.hasProAcess()) {
      await User.findByIdAndUpdate(user._id, {
        $inc: {
          freeRequestsUsed: 1,
        },
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "successfull", jsonResponse));
  },
);

export const jobMatcher = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { success, data, error } = jobMatcherBodySchema.safeParse(req.body);

    if (!success) {
      throw new ValidationError(
        "Validation failed",
        z.flattenError(error).fieldErrors,
      );
    }

    if (
      data.mode === "manual" &&
      (!data.skills?.length || !data.experience?.trim())
    ) {
      throw new BadRequestError(
        "Skills and experience are required for manual mode",
      );
    }

    if (data.mode === "resume" && !data.pdfBase64) {
      throw new BadRequestError("PDF is required for resume mode");
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new UnauthorizedError("User session is invalid or expired");
    }

    if (!user.canMakeRequest()) {
      throw new ForbiddenError("Upgrade Your plan to continue");
    }

    const parts: Part[] = [
    { 
      text: JobMatcherPrompt(data.mode, data.skills || [], data.experience || "") 
    }
  ];

  if (data.mode === "resume" && data.pdfBase64) {
    parts.push({
      inlineData: {
        mimeType: "application/pdf",
         data:data.pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: [{ role: "user", parts }],
  });

  
  const rawText = response.text?.replace(/```json|```/g, "").trim();

    if (!rawText) {
      throw new ApiError(500, "AI returned empty response");
    }
 

  let jsonResponse;
  try {
    jsonResponse = JSON.parse(rawText);
  } catch (error) {
    throw new ApiError(500,"AI returned invalid JSON formatting");
  }

  if (!user.hasProAcess()) {
    await User.findByIdAndUpdate(user._id, {
      $inc: { freeRequestsUsed: 1 }
    });
  }


  res.status(200).json(new ApiResponse(200,"successfull",jsonResponse));

  },
);
