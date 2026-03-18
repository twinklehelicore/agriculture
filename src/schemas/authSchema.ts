import { z } from 'zod';


const mobileSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Invalid mobile number');

const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100)
  .optional();

const emailSchema = z.string().email('Invalid email format')


const registerSchema = z.object({
  role: z.enum(['FARMER', 'PROVIDER'], { message: 'Only FARMER or PROVIDER allowed' }),
  mobile: mobileSchema,
  name: nameSchema,
  email: emailSchema,
  address: z.string().optional(),
}).strict();


const sendOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
}).strict();

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().length(6, 'OTP must be 6 digits'),
}).strict();


const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
}).strict();

export default {
  registerSchema,
  sendOtpSchema,
  verifyOtpSchema,
  adminLoginSchema,
};
