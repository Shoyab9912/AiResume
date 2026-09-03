import express from "express";
import { validate } from "../middlewares/validate.middleware.js";
import {
  analyseResumeBodySchema,
  jobMatcherBodySchema,
  generateInterviewBodySchema,
} from "../validators/resume.validator.js";
import {
  analyzeResume,
  jobMatcher,
  generateInterview,
} from "../controllers/ai.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(verifyJwt);

router.post("/analyze", validate(analyseResumeBodySchema), analyzeResume);
router.post("/job-matcher", validate(jobMatcherBodySchema), jobMatcher);
router.post(
  "/interview",
  validate(generateInterviewBodySchema),
  generateInterview,
);
export default router;
