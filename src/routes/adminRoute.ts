//src/routes/adminRoute.ts
import { Router } from "express";
import adminController from "../controllers/adminController";
import { validate } from "../middleware/validate";
import adminSchema from "../schemas/adminSchema";


const router = Router();


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
router.get('/list-users', adminController.listUser),
router.patch('/delete-user/:id', validate(adminSchema.userIdSchema), adminController.deleteUser),

router.get('/list-all-service-request', adminController.listAllServiceRequest)


//crop routes

router.post('/create-crop', validate(adminSchema.createCropSchema), adminController.createCrop),
router.patch('/update-crop/:id', validate(adminSchema.cropIdSchema.merge(adminSchema.updateCropSchema)), adminController.updateCrop),
router.get('/list-crop', adminController.listCrop),
router.get('/list-crop-by-id/:id', validate(adminSchema.cropIdSchema), adminController.listCropById),
router.delete('/delete-crop/:id', validate(adminSchema.cropIdSchema), adminController.deleteCrop)

export default router;