import express from "express";
import { generateAccessAndRefreshToken,googleLogin } from "../controllers/auth.controller.js";

import { validateOrigin } from "../middlewares/validateorigin.middleware.js";

const router = express.Router();


router.post("/google",validateOrigin,googleLogin)
router.post("/refresh-token",validateOrigin,generateAccessAndRefreshToken)


export default router;