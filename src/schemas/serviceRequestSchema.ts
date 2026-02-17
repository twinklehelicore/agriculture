import { z } from 'zod';

const serviceReqIdSchema = z.object ({
    id: z.coerce.number().int().positive('Service request ID must be a positive number')

})

const createServiceReqSchema = z.object ({
    providerId: z.coerce.number().int().positive().optional(),
    serviceCatId: z.coerce.number().int().positive().optional(),
    status: z.enum(['SUBMITTED', 'APPROVED','REJECTED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED' ]),
    detail: z.string().max(1000).optional(),
    visitReport: z.string().max(1000).optional(),
    finalnotes: z.string().max(1000).optional(),
    preferedSlot: z.enum(['MORNING', 'AFTERNOON', 'EVENING']),
    appliedAt: z.string().datetime().optional(),
    approvedAt: z.string().datetime().optional(),
    assignedAt: z.string().datetime().optional(),
    acceptedAt: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional()
});

const updateServiceReqSchema = createServiceReqSchema.partial().strict();

export default {serviceReqIdSchema, createServiceReqSchema, updateServiceReqSchema}