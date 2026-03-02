//src/routes/farmerRoute.ts
import { Router } from "express";
import farmerController from "../controllers/farmerController";
import { validate } from "../middleware/validate" 
import farmerSchema from "../schemas/farmerSchema";
import auth from "../middleware/auth";
import adminSchema from "@/schemas/adminSchema";

const router = Router();

router.use(auth('FARMER'));

router.post('/create-farm', validate(farmerSchema.createFarmSchema), farmerController.createFarm),
router.get('/list-farm', farmerController.listFarm)
router.get('/list-farm-by-id/:id', validate(farmerSchema.farmIdSchema), farmerController.getFarmById),
router.patch('/update-farm/:id', validate(farmerSchema.farmIdSchema.merge(farmerSchema.updateFarmSchema)), farmerController.updateFarm),
router.post('/service-request', validate(farmerSchema.serviceRequestSchema), farmerController.serviceRequest),
router.get('/my-service-request', farmerController.listMyServiceRequest),
router.delete('/delete-my-service-request/:id', validate(farmerSchema.serviceIdSchema), farmerController.deleteServiceRequest)


export default router;