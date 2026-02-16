// src/middlewares/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';

export const validate = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      
      const data = {
        ...req.params,
        ...req.query,
        ...req.body,
      };

      // Validate
      const validated = await schema.parseAsync(data);

     
      req.body = validated;

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: err.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        });
      }
      res.status(500).json({ error: 'Internal validation error' });
    }
  };
};