import { Request, Response } from "express";
import prisma from '../lib/prisma';
import logger from "../utils/logger";
import { Jwt } from "jsonwebtoken";
import bycrpt from 'bcryptjs';

const register = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const role = await prisma.role.findUnique({ where: { id: data.roleId } });
    if (!role || role.name === 'ADMIN') {
      return res.status(400).json({ error: 'Admin registration not allowed' });
    }

    const exists = await prisma.user.findUnique({ where: { mobile: data.mobile } });
    if (exists) {
      return res.status(400).json({ error: 'Mobile already registered' });
    }

    const user = await prisma.user.create({
      data
    });

    return res.status(200).json({
      message: 'Registered successfully',
    });
  } catch(error: any){
    logger.error('User not registered:', { errorDetails: error.message });
    return res.status(500).json({ error: 'Registration failed' });
  }
};

