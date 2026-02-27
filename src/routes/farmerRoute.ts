//src/routes/farmerRoute.ts
import { Router } from "express";
import farmerController from "../controllers/farmerController";
import { validate } from "../middleware/validate" 
import farmerSchema from "../schemas/farmerSchema";
import auth from "../middleware/auth";

const router = Router();

router.use(auth('FARMER'));

router.post('/create-farm', validate(farmerSchema.createFarmSchema), farmerController.createFarm),
router.get('/list-farm', farmerController.listFarm)

router.patch('/update-farm/:id', validate(farmerSchema.farmIdSchema), validate(farmerSchema.updateFarmSchema), farmerController.updateFarm);
router.get('/list-farm-by-id/:id', validate(farmerSchema.farmIdSchema), farmerController.getFarmById),
router.post('/service-request', validate(farmerSchema.serviceRequestSchema), farmerController.serviceRequest)


export default router;