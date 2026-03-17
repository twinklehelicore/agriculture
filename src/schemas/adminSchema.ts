import { z } from 'zod';

const categoryIdSchema = z.object({
  id: z.coerce.number().int().positive('Category ID must be a positive number')
});

const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120)
});

const updateCategorySchema = createCategorySchema.partial().strict();

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
    unit: z.string().trim().max(50).optional(),
    categoryId: z.coerce.number().int().positive().optional(),

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


const cropIdSchema = z.object({
  id: z.coerce.number().int().positive('Crop ID must be a positive number')
});

const createCropSchema = z.object({
    name: z.string().min(3, 'Must be atleast 3 character required')
});

const updateCropSchema = createCropSchema.partial().strict();




export default{categoryIdSchema, createCategorySchema, updateCategorySchema, serviceIdSchema, userIdSchema, providerIdSchema, createServiceSchema, updateServiceSchema, createUserSchema, updateUserSchema, cropIdSchema, createCropSchema, updateCropSchema}