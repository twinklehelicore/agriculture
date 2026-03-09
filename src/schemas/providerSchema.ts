import { z } from 'zod';

const providerIdSchema = z.object({
    id: z.coerce.number().int().positive('Provider id must be positive')
});

export default { providerIdSchema }