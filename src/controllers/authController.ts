// src/controllers/auth/auth.controller.ts
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import logger from '../utils/logger';
import jwt from 'jsonwebtoken';


// Register (called after validation & transform)

const register = async (req: Request, res: Response) => {
  try {
    const data = req.body; // already validated & password hashed

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          data.mobile ? { mobile: data.mobile } : {},
          data.email ? { email: data.email } : {},
        ],
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Mobile or email already registered' });
    }

    const user = await prisma.user.create({ data });

    res.status(200).json({ message: 'Registration successful' });
 } catch (err: any) {
    logger.error('Registration error', { error: err.message });
    return res.status(500).json({ error: 'Registration failed' });
  }
};

const sendOtp = async (req: Request, res: Response) => {
  try {
    const { mobile } = req.body;

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otp.upsert({
      where: { mobile },
      update: { code: otpCode, expiresAt },
      create: { mobile, code: otpCode, expiresAt },
    });

    // TODO: real SMS sending
    console.log(`OTP for ${mobile}: ${otpCode}`);

    return res.status(200).json({ message: 'OTP sent' });
  } catch (err: any) {
    logger.error('Send OTP error', { error: err.message });
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};


const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { mobile, code } = req.body;

    const otp = await prisma.otp.findUnique({ where: { mobile } });

    if (!otp || otp.code !== code || (otp.expiresAt && otp.expiresAt < new Date())) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    let user = await prisma.user.findUnique({ where: { mobile } });

    // Auto-register if new
    if (!user) {
      user = await prisma.user.create({
        data: {
          mobile,
          role: 'FARMER', // default - can be changed later by admin
        },
      });
    }

    // Clean up OTP
    await prisma.otp.delete({ where: { mobile } });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        mobile: user.mobile,
      },
    });
  } catch (err: any) {
    logger.error('Verify OTP error', { error: err.message });
    return res.status(500).json({ error: 'Login failed' });
  }
};


const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.role !== 'ADMIN') {
      return res.status(400).json({ error: 'Admin access only' });
    }


    const bcrypt = await import('bcryptjs');

    if (!user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    logger.error('Admin login error', { error: err.message });
    return res.status(500).json({ error: 'Login failed' });
  }
};

export default {register, sendOtp, verifyOtp, adminLogin}