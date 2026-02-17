import { z } from 'zod';


const roleIdSchema = z.object({
  id: z.coerce.number().int().positive('Role ID must be a positive number'),
});


const createRoleSchema = z.object({
  name: z.enum(['FARMER', 'PROVIDER', 'ADMIN'])
}).strict();


const updateRoleSchema = createRoleSchema.partial().strict();

export default {
  roleIdSchema,
  createRoleSchema,
  updateRoleSchema
};
