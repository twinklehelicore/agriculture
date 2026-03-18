//src/api/auth.ts
import api from './axios';

export const registerUser = (data: object) => api.post('/auth/register', data);
export const sendOtp = (email: string) => api.post('/auth/send-otp', { email });
export const verifyOtp = (email: string, code: string) => api.post('/auth/verify-otp', { email, code });
export const adminLogin = (email: string, password: string) => api.post('/auth/admin-login', { email, password });