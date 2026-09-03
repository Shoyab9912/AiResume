import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

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
import { ResumeAnalyserPrompt,JobMatcherPrompt ,generateInterviewPrompt} from "../config/prompt.js";
import { AnalyzeResumeBody, GenerateInterviewBody, JobMatcherBody } from "../validators/resume.validator.js";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY as string });

export const analyzeResume = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
     const { pdfBase64 } = req.body as AnalyzeResumeBody;

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
      .json(new ApiResponse(200, "Resume analyzed successfully", jsonResponse));
  },
);

export const jobMatcher = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
     const data = req.body as JobMatcherBody;

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


  return res.status(200).json(new ApiResponse(200,"jobs fetched successfully",jsonResponse));

  },
);


export const generateInterview = asyncHandler( async (req:AuthenticatedRequest,res,next) => {
    const data = req.body as GenerateInterviewBody;

  
    if (data.mode === "manual" && (!data.skills?.trim() || !data.experience?.trim())) {
      throw new BadRequestError("Skills and experience are required for manual mode");
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
        text: generateInterviewPrompt(
          data.round, 
          data.mode, 
          data.skills || "", 
          data.experience || ""
        ) 
      }
    ];

    if (data.mode === "resume" && data.pdfBase64) {
      parts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: data.pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
        },
      });
    }

    
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ role: "user", parts }],
    });

   
    const rawText = response.text?.replace(/```json|```/g, "").trim();

    if (!rawText) {
      throw new ApiError(500,"AI returned an empty response");
    }

    let jsonResponse: Record<string, any>;
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

    
   return res.status(200).json(
      new ApiResponse(200,"Interview questions generated successfully",jsonResponse)
    );
  }
);