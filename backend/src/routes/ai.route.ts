import express from "express";
import { analyzeResume } from "../controllers/ai.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.post("/analyze", verifyJwt, analyzeResume);

export default router;