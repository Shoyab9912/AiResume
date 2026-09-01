import express from "express";
import { generateAccessAndRefreshToken,googleLogin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/google",googleLogin)
router.get("/refresh-token",generateAccessAndRefreshToken)


export default router;