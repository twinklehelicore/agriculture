// src/schemas/auth.schema.ts
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const mobileSchema = z.string()
  .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number")
  .transform(val => val.trim());

const emailSchema = z.string().email("Invalid email format").optional();

const nameSchema = z.string().min(2, "Name must be at least 2 characters").max(100);


const registerSchema = z.object({
  role: z.enum(['FARMER', 'PROVIDER', 'ADMIN']),
  name: nameSchema,
  mobile: mobileSchema.optional(),
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  address: z.string().optional(),
}).refine(
  (data) => {
    // Farmer & Provider must have mobile
    // Admin must have email + password
    if (data.role === 'ADMIN') {
      return !!data.email && !!data.password;
    }
    return !!data.mobile;
  },
  {
    message: "Admin requires email & password. Farmer/Provider require mobile.",
    path: ["role"],
  }
).transform(async (data) => {
  // Hash password only if provided (admin case)
  if (data.password) {
    const hashed = await bcrypt.hash(data.password, 10);
    return { ...data, password: hashed };
  }
  return data;
});



const sendOtpSchema = z.object({
  mobile: mobileSchema,
});


const verifyOtpSchema = z.object({
  mobile: mobileSchema,
  code: z.string().length(6, "OTP must be 6 digits"),
});



const adminLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export default {registerSchema, sendOtpSchema, verifyOtpSchema, adminLoginSchema}