import { z } from 'zod';

const sendOtpSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
});

const verifyOtpSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

export default { sendOtpSchema, verifyOtpSchema}