import { z }from 'zod';

const catIdSchema = z.object({
  id: z.coerce.number().int().positive('Service category ID must be a positive number')
});

const createCatSchema = z.object({
    name: z.string().min(3, 'Name must be atleast 3 character'),
    price: z.coerce.number().int().positive('Price must be positive'),
    image: z.string().url('Image must be valid string').optional(),
    description: z.string().max(1000).optional(),
    unit: z.string().max(50)

});

const updateCatSchema = createCatSchema.partial().strict();

export default { catIdSchema, createCatSchema, updateCatSchema}