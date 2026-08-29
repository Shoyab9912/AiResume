import express from "express";
import { generateAccessAndRefreshToken,googleLogin } from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/aurth.middleware.js";

const router = express.Router();

router.post("/google",googleLogin)
router.post("/refresh-token",verifyJwt,generateAccessAndRefreshToken)


export default router;