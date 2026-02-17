import { z } from 'zod';

const cropIdSchema = z.object({
  id: z.coerce.number().int().positive('Crop ID must be a positive number')
});

const createCropSchema = z.object({
    name: z.string().min(3, 'Must be atleast 3 character required')
});

const updateCropSchema = createCropSchema.partial().strict();

export default {cropIdSchema, createCropSchema, updateCropSchema}