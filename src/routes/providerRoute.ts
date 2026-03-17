//src/routes/providerRoute.ts
import { Router } from "express";
import providerControler from "../controllers/providerController";
import { validate } from "../middleware/validate" 
import auth from "../middleware/auth";
import providerSchema from "../schemas/providerSchema";
import notificationController from "../controllers/notificationController";
import authController from "../controllers/authController";


const router = Router();

router.use (auth('PROVIDER'));

router.get('/assigned-request', providerControler.listAssignedRequest)
router.patch('/approved-request/:id', validate(providerSchema.providerIdSchema), providerControler.approvedRequest),
router.patch('/inprogess-request/:id', validate(providerSchema.providerIdSchema), providerControler.inprogressRequest),
router.patch('/reject-request/:id', validate(providerSchema.providerIdSchema), providerControler.rejectRequest),
router.patch('/completed-request/:id', validate(providerSchema.providerIdSchema), providerControler.completedRequest)

//notification


router.get('/my-notifications', notificationController.getMyNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/mark-all-read', notificationController.markAllRead);
router.patch('/mark-read/:id', notificationController.markOneRead);

//profile
router.get('/profile', authController.getProfile);
router.patch('/update-profile', authController.updateProfile);

//add logs
router.post('/add-log/:id', providerControler.addLog);


export default router;