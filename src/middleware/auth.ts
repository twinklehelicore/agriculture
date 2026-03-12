// src/middlewares/auth.ts — absolute minimal
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export default (role?: string) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; role: string };
    (req as any).user = decoded;

    if (role && decoded.role !== role) {
      return res.status(400).json({ error: `${role} required` });
    }

    next();
  } catch (err: any) {
    return res.status(400).json({ error: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token' });
  }
};