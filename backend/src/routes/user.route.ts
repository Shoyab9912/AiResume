import { Router } from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";


import { verifyJwt } from "../middlewares/auth.middleware.js";
import { requireCsrf } from "../middlewares/csrf.middleware.js";

const router = Router();

router.post("/register",validate(registerSchema), registerUser);

router.post("/login",validate(loginSchema),loginUser);

router.post("/logout",verifyJwt, requireCsrf,logoutUser);

router.get("/me", verifyJwt, getMe);

export default router;