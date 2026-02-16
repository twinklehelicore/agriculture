// src/routes/auth.routes.ts
import { Router } from 'express';
import { validate } from '../middleware/validate';
import authSchema from '../schemas/authSchema';
import authController from '../controllers/authController';

const router = Router();

// Public routes
router.post('/register', validate(authSchema.registerSchema), authController.register);
router.post('/send-otp', validate(authSchema.sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', validate(authSchema.verifyOtpSchema), authController.verifyOtp);

// Admin login only
router.post('/admin/login', validate(authSchema.adminLoginSchema), authController.adminLogin);

export default router;