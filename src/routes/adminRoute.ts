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
router.delete('/delete:service/:id', validate(adminSchema.serviceIdSchema), adminController.deleteService)
router.put('/update-status', validate(adminSchema.updateRequestStatus), adminController.updateRequestStatus)

//user routes
router.post('/add-user', validate(adminSchema.createUserSchema), adminController.addUser),
router.patch('/update-user/:id', validate(adminSchema.updateUserSchema), adminController.updateUser),
router.get('/list-farmers', adminController.listFarmer),
router.get('/list-providers', adminController.listProviders)


export default router;