import { z } from 'zod';

const serviceIdSchema = z.object({
    id: z.coerce.number().int().positive('Service request id must be positive')
});

const providerIdSchema = z.object({
  providerId: z.coerce.number().int().positive('Providers id must be positive')

});

const userIdSchema = z.object({
    id: z.coerce.number().int().positive('User id must be posiive')
});

const createServiceSchema = z.object({
    name: z.string().trim().min(3,'Name must be atleat 3 character').max(100),
    price: z.number().positive('Price must be positive').optional(),
    image: z.string().url('Image muste be valid string').optional(),
    description: z.string().trim().optional(),
    unit: z.string().trim().max(50).optional()

});
const updateServiceSchema = createServiceSchema.partial().strict()

const createUserSchema = z.object({
  role: z.enum(['FARMER', 'PROVIDER']),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email').optional(),
  address: z.string().optional(),
}).strict();

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});



const updateRequestStatus = z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ASSSIGNED', 'IN_PROGRESS', 'COMPLETED']),
    provider_id: z.coerce.number().int().positive('Provider id must be positive')
}).strict();

export default{ serviceIdSchema, userIdSchema, providerIdSchema, createServiceSchema, updateServiceSchema, createUserSchema, updateUserSchema, updateRequestStatus}