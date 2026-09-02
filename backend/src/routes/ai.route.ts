import express from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { analyseResumeBodySchema, jobMatcherBodySchema } from "../validators/resume.validator.js";
import { analyzeResume, jobMatcher } from "../controllers/ai.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.post("/analyze", verifyJwt,validate(analyseResumeBodySchema), analyzeResume);
router.post("/job-matcher",verifyJwt,validate(jobMatcherBodySchema),jobMatcher)

export default router;