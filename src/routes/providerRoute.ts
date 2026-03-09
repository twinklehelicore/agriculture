//src/routes/providerRoute.ts
import { Router } from "express";
import providerControler from "../controllers/providerController";
import { validate } from "../middleware/validate" 
import auth from "../middleware/auth";
import providerSchema from "../schemas/providerSchema";


const router = Router();

router.use(auth('PROVIDER'));

router.get('/assigned-request', providerControler.listAssignedRequest)
router.patch('/approved-request/:id', validate(providerSchema.providerIdSchema), providerControler.approvedRequest),
router.patch('/inprogess-request/:id', validate(providerSchema.providerIdSchema), providerControler.inprogressRequest),
router.patch('/reject-request/:id', validate(providerSchema.providerIdSchema), providerControler.rejectRequest),
router.patch('/completed-request/:id', validate(providerSchema.providerIdSchema), providerControler.completedRequest)


export default router;