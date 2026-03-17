//src/routes/farmerRoute.ts
import { Router } from "express";
import farmerController from "../controllers/farmerController";
import { validate } from "../middleware/validate" 
import farmerSchema from "../schemas/farmerSchema";
import auth from "../middleware/auth";
import notificationController from "../controllers/notificationController";
import authController from "../controllers/authController";

const router = Router();

router.use(auth('FARMER'));

router.post('/create-farm', validate(farmerSchema.createFarmSchema), farmerController.createFarm),
router.get('/list-farm', farmerController.listFarm)
router.get('/list-farm-by-id/:id', validate(farmerSchema.farmIdSchema), farmerController.getFarmById),
router.patch('/update-farm/:id', validate(farmerSchema.farmIdSchema.merge(farmerSchema.updateFarmSchema)), farmerController.updateFarm),
router.post('/service-request', validate(farmerSchema.serviceRequestSchema), farmerController.serviceRequest),
router.get('/my-service-request', farmerController.listMyServiceRequest),
router.delete('/delete-my-service-request/:id', validate(farmerSchema.serviceIdSchema), farmerController.deleteServiceRequest)
router.delete('/delete-farm/:id', validate(farmerSchema.farmIdSchema), farmerController.deleteFarm),
router.get('/list-crop', farmerController.listCrop),
router.get('/list-services', farmerController.listServices),


//notification
router.get('/my-notifications', notificationController.getMyNotifications),
router.get('/unread-count', notificationController.getUnreadCount),
router.patch('/mark-all-read', notificationController.markAllRead),
router.patch('/mark-read/:id', notificationController.markOneRead),

//profile
router.get('/profile', authController.getProfile),
router.patch('/update-profile', authController.updateProfile),

//categories

router.get('/list-categories', farmerController.listCategories);

export default router;