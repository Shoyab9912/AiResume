import { Router } from "express";
import { handleRazorpayWebhook } from "../controllers/webhook.contoller.js";

const router = Router();

router.post("/", handleRazorpayWebhook);

export default router;

