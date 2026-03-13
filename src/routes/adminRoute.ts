//src/routes/adminRoute.ts
import { Router } from "express";
import adminController from "../controllers/adminController";
import { validate } from "../middleware/validate";
import adminSchema from "../schemas/adminSchema";
import auth from "../middleware/auth";
import notificationController from "../controllers/notificationController";
import authController from "../controllers/authController";

const router = Router();

router.use(auth('ADMIN'));
//service routes
router.post('/add-service', validate(adminSchema.createServiceSchema), adminController.createService),
router.patch('/update-service/:id', validate(adminSchema.serviceIdSchema.merge(adminSchema.updateServiceSchema)), adminController.updateService);
router.get('/list-service', adminController.listServices),
router.get('/list-service/:id', validate(adminSchema.serviceIdSchema), adminController.getServiceById )
router.delete('/delete-service/:id', validate(adminSchema.serviceIdSchema), adminController.deleteService),

//user routes
router.post('/add-user', validate(adminSchema.createUserSchema), adminController.addUser),
router.patch('/update-user/:id', validate(adminSchema.updateUserSchema), adminController.updateUser),
router.get('/list-farmers', adminController.listFarmer),
router.get('/list-providers', adminController.listProviders),
router.patch('/assign-provider/:id', validate(adminSchema.providerIdSchema), adminController.assignProvider),
router.patch('/reject-request/:id', adminController.rejectRequest),
router.get('/list-users', adminController.listUser),
router.patch('/delete-user/:id', validate(adminSchema.userIdSchema), adminController.deleteUser),

router.get('/list-all-service-request', adminController.listAllServiceRequest)


//crop routes

router.post('/create-crop', validate(adminSchema.createCropSchema), adminController.createCrop),
router.patch('/update-crop/:id', validate(adminSchema.cropIdSchema.merge(adminSchema.updateCropSchema)), adminController.updateCrop),
router.get('/list-crop', adminController.listCrop),
router.get('/list-crop-by-id/:id', validate(adminSchema.cropIdSchema), adminController.listCropById),
router.delete('/delete-crop/:id', validate(adminSchema.cropIdSchema), adminController.deleteCrop)


//notification
router.patch('/set-priority/:id', adminController.setPriority);
router.get('/my-notifications', notificationController.getMyNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/mark-all-read', notificationController.markAllRead);
router.patch('/mark-read/:id', notificationController.markOneRead);


//profile


router.get('/profile', authController.getProfile);
router.patch('/update-profile', authController.updateProfile);
router.patch('/change-password', authController.changePassword);
export default router;