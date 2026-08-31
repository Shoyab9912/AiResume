import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import {analyseResumeBodySchema} from "../validators/resume.validator.js"
import { ForbiddenError, ValidationError } from "../utils/errors.js";
import {z} from "zod"
import { User } from "../models/user.model.js";
import {GoogleGenAI} from '@google/genai'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {ResumeAnalyserPrompt} from "../config/prompt.js"

const ai = new GoogleGenAI({apiKey:process.env.GOOGLE_API_KEY as string})

export const analyzeResume = asyncHandler(async (req:AuthenticatedRequest,res,next) => {
    const {success,data,error} = analyseResumeBodySchema.safeParse(req.body)
  
     if (!success) {
    throw new ValidationError( "Validation failed",
      z.flattenError(error).fieldErrors,
    );
     }
      
     const { pdfBase64 } = data;



     const user = await User.findById(req.user?._id)

     if(!user || !user.canMakeRequest()){
        throw new ForbiddenError("Upgrade  your plan to continue")
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
      throw new ApiError(500,"AI returned empty response")
    }


    let jsonResponse;
    try {
      jsonResponse = JSON.parse(rawText);
    } catch (error) {
         throw new ApiError(500,"AI returned invalid JSON",[],{raw:response.text})
    }

    if(!user.hasProAcess()) {
        await User.findByIdAndUpdate(user._id,{
            $inc : {
               freeRequestsUsed:1
            }
        })
    }
  
 return res.status(200).json(new ApiResponse(200,"successfull",jsonResponse))

})