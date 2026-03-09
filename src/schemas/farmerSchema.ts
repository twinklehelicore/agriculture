import { z } from 'zod';

const farmIdSchema = z.object({
    id: z.coerce.number().int().positive('Farm id must be positive')
});

const serviceIdSchema = z.object({
    id: z.coerce.number().int().positive('SErvide id must be positive')
});

const createFarmSchema = z.object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters').max(100),
    area: z.number().positive('Area must be positive').optional(),
    address: z.string().trim().optional(),
    surveyNo: z.string().trim().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    cropId: z.coerce.number().int().positive('Crop id must be positive').optional(),
}).strict();

const updateFarmSchema = createFarmSchema.partial().strict();

const serviceRequestSchema = z.object({
    farmId: z.coerce.number().int().positive('Farm ID is required'),
    serviceTypeId: z.coerce.number().int().positive('Service type id must be positive'),
    details: z.string().min(3,'Must be atleast 3 character').max(500),
    preferredSlot: z.enum(["MORNING", "AFTERNOON", "EVENING"]).optional(),
}).strict();


export default { farmIdSchema, createFarmSchema, updateFarmSchema,serviceRequestSchema, serviceIdSchema }