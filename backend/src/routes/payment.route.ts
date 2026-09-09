import { Router } from "express";
import { checkout } from "../controllers/payment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";


const router = Router();

router.post("/checkout",verifyJwt, checkout);

export default router;

