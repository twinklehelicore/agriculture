//src/routes/authRoute.ts
import { Router } from "express";
import authController from "../controllers/authController";
import { validate } from "../middleware/validate";
import authSchema from "../schemas/authSchema";


const router = Router();

router.post('/register', validate(authSchema.registerSchema), authController.register )
router.post('/send-otp', validate(authSchema.sendOtpSchema), authController.sendOtp)
router.post('/verify-otp', validate(authSchema.verifyOtpSchema), authController.verifyOtp)
router.post('/admin-login', validate(authSchema.adminLoginSchema), authController.adminlogin )

export default router;