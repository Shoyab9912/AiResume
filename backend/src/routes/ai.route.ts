import express from "express";
import { analyzeResume,jobMatcher } from "../controllers/ai.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.post("/analyze", verifyJwt, analyzeResume);
router.post("/job-matcher",verifyJwt,jobMatcher)

export default router;