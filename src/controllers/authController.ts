//src/controllers/authController.ts
import { Request, Response } from "express";
import prisma from '../lib/prisma';
import logger from "../utils/logger";
import jwt from "jsonwebtoken";
import bycrpt from 'bcryptjs';

const register = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // Find roleId from role name
    const roleRecord = await prisma.role.findFirst({ where: { name: data.role } });
    if (!roleRecord) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (roleRecord.name === 'ADMIN') {
      return res.status(400).json({ error: 'Admin registration not allowed' });
    }

    await prisma.user.create({
      data: {
        mobile:data.mobile,
        name: data.name,
        address: data.address,
        email: data.email,
        roleId: roleRecord.id,
      },
    });

    return res.status(200).json({ message: 'Registered successfully' });
  } catch (err: any) {
    logger.error('Registration error:', err.message);
    return res.status(500).json({ error: 'Registration failed' });
    }

   
  };
const sendOtp = async (req: Request, res: Response) => {
  try {
    const { mobile } = req.body;

    const user = await prisma.user.findFirst({
      where: { mobile },
      include: { role: true },
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (user.role.name === 'ADMIN') {
      return res.status(400).json({ error: 'Admins cannot use OTP' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otp.upsert({
      where: { mobile },
      update: { code, expiresAt }, 
      create: { mobile, code, expiresAt },
    });

    console.log(`OTP for ${mobile}: ${code}`); 

    return res.json({ message: 'OTP sent' });
  } catch (err: any) {
    logger.error('Send OTP error:', err.message);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};


const verifyOtp = async (req: Request, res: Response) => {
  try{
    const { mobile, code} = req.body;
    const otp = await prisma.otp.findFirst({
      where:{
        mobile
      }
    });
    if (!otp || otp.code !== code || (otp.expiresAt && otp.expiresAt < new Date())) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    const user = await prisma.user.findFirst({
      where:{
        mobile
      },
      include:{
        role:true
      }
    });
    if(!user){
      return res.status(400).json('User not found');
    }
    if(user.role.name === 'ADMIN'){
      return res.status(400).json('Admin cannot use otp')
    }
    await prisma.otp.delete({
      where:{mobile}
    });

    const token = jwt.sign(
      { id: user.id, role: user.role.name },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );
    return res.json({token, user:{id:user.id, mobile: user.mobile, name: user.name}});
  }catch(err:any){
    logger.error('Verify OTP error:', err.message);
    return res.status(500).json({ error: 'Login failed' });
  }
};

const adminlogin = async (req: Request, res:Response) => {
  try{
  const{ email, password} = req.body;
  const user = await prisma.user.findFirst({
    where:{email},
    include:{role:true}
  });
  if(!user || user.role.name !== 'ADMIN'){
    return res.status(400).json('Admin acess only');
  }
  if(!user.password ||!(await bycrpt.compare(password, user.password))){
    return res.status(400).json('Invalid credentials')
  }
  const token = jwt.sign(
      { id: user.id, role: 'ADMIN' },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );
    return res.status(200).json({token, user:{id: user.id, email: user.email, name: user.name}})
}catch (err: any) {
    logger.error('Admin login error:', err.message);
    return res.status(500).json({ error: 'Login failed' });
  }
};
export default {register, sendOtp, verifyOtp, adminlogin}

