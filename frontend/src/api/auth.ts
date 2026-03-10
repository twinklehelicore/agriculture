//src/api/auth.ts
import api from './axios';

export const registerUser = (data: object) => api.post('/auth/register', data);
export const sendOtp = (mobile: string) => api.post('/auth/send-otp', { mobile });
export const verifyOtp = (mobile: string, code: string) => api.post('/auth/verify-otp', { mobile, code });
export const adminLogin = (email: string, password: string) => api.post('/auth/admin-login', { email, password });